import { NextRequest, NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

export async function PATCH(request: NextRequest, { params }: { params: { account: string } }) {
  try {
    const { reason, blocked_by } = await request.json();
    const { account } = params;
    if (!account || !reason || !blocked_by) {
      return NextResponse.json({ success: false, error: '필수값 누락' }, { status: 400 });
    }
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    // 유저 id 조회
    const [userRows] = await conn.execute<RowDataPacket[]>(
      'SELECT id FROM member_user WHERE account = ? LIMIT 1',
      [account]
    );
    if (!userRows[0]) {
      await conn.end();
      return NextResponse.json({ success: false, error: '유저 없음' }, { status: 404 });
    }
    const userId = userRows[0].id;
    // member_user 업데이트
    await conn.execute(
      'UPDATE member_user SET activation=0, reason_for_account_block=?, account_blocked_by=? WHERE id=?',
      [reason, blocked_by, userId]
    );
    // feed 업데이트
    await conn.execute(
      'UPDATE feed SET is_deleted=1 WHERE member_user_id=?',
      [userId]
    );
    // feed_likes 업데이트
    await conn.execute(
      'UPDATE feed_likes SET is_deleted=1 WHERE member_user_id=?',
      [userId]
    );
    // comment parent_comment_id, comment_id 모두 해당 유저 id인 row is_deleted=1
    await conn.execute(
      'UPDATE comment SET is_deleted=1 WHERE parent_comment_id=? OR comment_id=?',
      [userId, userId]
    );
    await conn.end();
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
} 