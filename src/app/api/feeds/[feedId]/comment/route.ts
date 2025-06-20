console.log('라우트 파일 로드됨');
import { NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

type CommentTree = {
  comment_id: number;
  content: string;
  parent_comment_id: number | null;
  created_at: string;
  member_user_id: number;
  nickname: string;
  image_url: string | null;
  replies: CommentTree[];
  feed_id: number;
  is_deleted: number;
};

export async function GET(
  req: Request,
  { params }: { params: { feedId: string } }
): Promise<ReturnType<typeof NextResponse.json>> {
  const { feedId } = await params;
  const url = new URL(req.url);
  const tab = url.searchParams.get('tab') || 'live';
  let conn;

  try {
    console.log('API 호출: /api/feeds/[feedId]/comment, feedId:', feedId);
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // 피드 존재 여부 확인
    const [feedRows] = await conn.execute<RowDataPacket[]>(
      'SELECT id FROM feed WHERE id = ?',
      [feedId]
    );

    if (!feedRows.length) {
      return NextResponse.json({ error: '피드를 찾을 수 없습니다.' }, { status: 404 });
    }

    let rows;
    console.log('Comment API called with tab:', tab);
    if (tab === 'deleted') {
      // 삭제된 댓글 (is_deleted=1 또는 부모가 삭제된 경우)
      [rows] = await conn.execute<RowDataPacket[]>(
        `SELECT 
          c.comment_id,
          c.content,
          c.parent_comment_id,
          DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
          c.member_user_id,
          mu.nickname,
          mu.image_url,
          c.is_deleted,
          p.is_deleted as parent_is_deleted,
          c.feed_id as feed_id
        FROM comment c
        LEFT JOIN member_user mu ON c.member_user_id = mu.id
        LEFT JOIN comment p ON c.parent_comment_id = p.comment_id
        WHERE 
          c.feed_id = ?
          AND (
            c.is_deleted = 1
            OR (c.parent_comment_id IS NOT NULL AND p.is_deleted = 1)
          )
        ORDER BY c.created_at ASC`,
        [feedId]
      );
    } else {
      // 라이브 댓글 (is_deleted=0, 부모도 is_deleted=0)
      [rows] = await conn.execute<RowDataPacket[]>(
        `SELECT 
          c.comment_id,
          c.content,
          c.parent_comment_id,
          DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
          c.member_user_id,
          mu.nickname,
          mu.image_url,
          c.is_deleted,
          p.is_deleted as parent_is_deleted,
          c.feed_id as feed_id
        FROM comment c
        LEFT JOIN member_user mu ON c.member_user_id = mu.id
        LEFT JOIN comment p ON c.parent_comment_id = p.comment_id
        WHERE 
          c.feed_id = ?
          AND c.is_deleted = 0
          AND (
            c.parent_comment_id IS NULL
            OR (p.is_deleted = 0)
          )
        ORDER BY 
          CASE 
            WHEN c.parent_comment_id IS NULL THEN c.created_at
            ELSE (
              SELECT created_at 
              FROM comment p2 
              WHERE p2.comment_id = c.parent_comment_id
            )
          END ASC,
          c.parent_comment_id IS NULL DESC,
          c.created_at ASC`,
        [feedId]
      );
    }
    console.log('댓글 쿼리 rows:', JSON.stringify(rows, null, 2));

    // 트리 구조로 변환
    const commentMap: Record<string, CommentTree> = {};
    const rootComments: CommentTree[] = [];

    (rows as CommentTree[]).forEach(row => {
      const comment = {
        ...row,
        replies: [],
        created_at: row.created_at || new Date().toISOString(),
        nickname: row.nickname || '알 수 없음',
        image_url: row.image_url || null,
        is_deleted: row.is_deleted
      };
      commentMap[comment.comment_id] = comment;
    });

    (rows as CommentTree[]).forEach(row => {
      if (row.parent_comment_id) {
        const parent = commentMap[row.parent_comment_id];
        if (parent) {
          parent.replies.push(commentMap[row.comment_id]);
        } else {
          rootComments.push(commentMap[row.comment_id]);
        }
      } else {
        rootComments.push(commentMap[row.comment_id]);
      }
    });

    return NextResponse.json({ comments: rootComments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: '댓글을 불러오는 중 오류가 발생했습니다.', details: String(error) },
      { status: 500 }
    );
  } finally {
    if (conn) {
      await conn.end().catch(console.error);
    }
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { feedId: string } }
): Promise<ReturnType<typeof NextResponse.json>> {
  const { feedId } = params;
  let conn;
  try {
    const { comment_id, content, is_deleted } = await req.json();
    if (!comment_id || (content === undefined && is_deleted === undefined)) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    // 실제로 해당 피드에 속한 댓글인지 확인(보안)
    const [rows] = await conn.execute<RowDataPacket[]>(
      'SELECT comment_id FROM comment WHERE comment_id = ? AND feed_id = ?',
      [comment_id, feedId]
    );
    if (!rows[0]) {
      await conn.end();
      return NextResponse.json({ success: false, error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (content !== undefined) {
      // 댓글 내용 수정
      await conn.execute(
        'UPDATE comment SET content = ? WHERE comment_id = ?',
        [content, comment_id]
      );
    }

    if (is_deleted !== undefined) {
      // 댓글 복구 또는 삭제
      await conn.execute(
        'UPDATE comment SET is_deleted = ? WHERE comment_id = ? OR parent_comment_id = ?',
        [is_deleted, comment_id, comment_id]
      );
    }

    await conn.end();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (conn) await conn.end().catch(() => {});
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { feedId: string } }
): Promise<ReturnType<typeof NextResponse.json>> {
  const { feedId } = params;
  let conn;
  try {
    const { comment_id } = await req.json();
    if (!comment_id) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    // 해당 피드에 속한 댓글인지 확인
    const [rows] = await conn.execute<RowDataPacket[]>(
      'SELECT comment_id FROM comment WHERE comment_id = ? AND feed_id = ?',
      [comment_id, feedId]
    );
    if (!rows[0]) {
      await conn.end();
      return NextResponse.json({ success: false, error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    }
    // 자식댓글까지 모두 삭제 (is_deleted=1)
    await conn.execute(
      'UPDATE comment SET is_deleted = 1 WHERE comment_id = ? OR parent_comment_id = ?',
      [comment_id, comment_id]
    );
    await conn.end();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (conn) await conn.end().catch(() => {});
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
} 