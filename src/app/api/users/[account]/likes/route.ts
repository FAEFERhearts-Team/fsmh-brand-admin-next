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

  // Get member_user.id from account
  const [userRows] = await conn.execute<RowDataPacket[]>(
    'SELECT id FROM member_user WHERE account = ? LIMIT 1',
    [account]
  );
  if (!userRows[0]) {
    await conn.end();
    return NextResponse.json({ likes: [], total: 0 });
  }
  const memberId = userRows[0].id;

  // Build date filter
  let dateFilter = '';
  const paramsArr: Array<string | number> = [memberId];
  if (startDate) {
    dateFilter += ' AND DATE(fl.created_at) >= ?';
    paramsArr.push(startDate);
  }
  if (endDate) {
    dateFilter += ' AND DATE(fl.created_at) <= ?';
    paramsArr.push(endDate);
  }

  // Get total count
  const [countRows] = await conn.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as total
     FROM feed_likes fl
     WHERE fl.is_deleted = 0 AND fl.member_user_id = ?${dateFilter}`,
    paramsArr
  );
  const total = countRows[0]?.total || 0;

  // Get paginated data
  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT 
      f.id AS feed_id,
      f.title,
      mu.nickname,
      mu.account,
      DATE(fl.created_at) as created_at,
      (SELECT COUNT(*) FROM feed_likes WHERE feed_id = f.id AND is_deleted = 0) AS like_count
    FROM feed_likes fl
    JOIN feed f ON fl.feed_id = f.id
    JOIN member_user mu ON f.member_user_id = mu.id
    WHERE fl.is_deleted = 0 AND fl.member_user_id = ?${dateFilter}
    ORDER BY fl.created_at DESC
    LIMIT ? OFFSET ?`,
    [...paramsArr, pageSize, offset]
  );

  await conn.end();
  return NextResponse.json({ likes: rows, total });
} 