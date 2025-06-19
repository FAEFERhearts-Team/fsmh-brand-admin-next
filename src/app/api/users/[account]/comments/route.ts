export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

export async function GET(request: NextRequest, context: { params: { account: string } }) {
  const { account } = context.params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const startDate = searchParams.get('start_date') || '';
  const endDate = searchParams.get('end_date') || '';
  const offset = (page - 1) * pageSize;

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // Get member_user.id from account
    const [userRows] = await conn.execute<RowDataPacket[]>(
      'SELECT id FROM member_user WHERE account = ? LIMIT 1',
      [account]
    );
    if (!userRows[0]) {
      return NextResponse.json({ comments: [], total: 0 });
    }
    const memberId = userRows[0].id;

    // Build date filter
    let dateFilter = '';
    const paramsArr: Array<string | number> = [memberId];
    if (startDate) {
      dateFilter += ' AND DATE(c.created_at) >= ?';
      paramsArr.push(startDate);
    }
    if (endDate) {
      dateFilter += ' AND DATE(c.created_at) <= ?';
      paramsArr.push(endDate);
    }

    // Get total count
    const [countRows] = await conn.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total 
      FROM comment c
      WHERE c.is_deleted=0 AND c.member_user_id=?${dateFilter}`,
      paramsArr
    );
    const total = countRows[0]?.total || 0;

    // Get comments with feed info
    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT 
        c.id as comment_id,
        c.content,
        c.parent_comment_id,
        c.created_at,
        c.member_user_id,
        mu.nickname,
        mu.profile_image_url as m_image_url,
        f.title as feed_title,
        f.id as feed_id
      FROM comment c
      LEFT JOIN member_user mu ON c.member_user_id = mu.id
      LEFT JOIN feed f ON c.feed_id = f.id
      WHERE c.is_deleted=0 AND c.member_user_id=?${dateFilter}
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?`,
      [...paramsArr, pageSize, offset]
    );

    // Get replies for each comment
    const comments = await Promise.all(rows.map(async (comment) => {
      if (comment.parent_comment_id) return comment;

      const [replies] = await conn.execute<RowDataPacket[]>(
        `SELECT 
          c.id as comment_id,
          c.content,
          c.parent_comment_id,
          c.created_at,
          c.member_user_id,
          mu.nickname,
          mu.profile_image_url as m_image_url
        FROM comment c
        LEFT JOIN member_user mu ON c.member_user_id = mu.id
        WHERE c.is_deleted=0 AND c.parent_comment_id=?
        ORDER BY c.created_at ASC`,
        [comment.comment_id]
      );

      return { ...comment, replies };
    }));

    return NextResponse.json({ comments, total });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: '댓글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  } finally {
    await conn.end();
  }
} 