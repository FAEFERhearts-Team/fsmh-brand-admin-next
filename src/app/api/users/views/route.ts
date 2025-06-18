import { NextRequest, NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const account = searchParams.get('account');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const startDate = searchParams.get('start_date') || '';
  const endDate = searchParams.get('end_date') || '';
  const offset = (page - 1) * pageSize;

  if (!account) {
    return NextResponse.json({ views: [], total: 0 });
  }

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
    return NextResponse.json({ views: [], total: 0 });
  }
  const memberId = userRows[0].id;

  // Build date filter
  let dateFilter = '';
  const paramsArr: Array<string | number> = [memberId];
  if (startDate) {
    dateFilter += ' AND DATE(f.created_at) >= ?';
    paramsArr.push(startDate);
  }
  if (endDate) {
    dateFilter += ' AND DATE(f.created_at) <= ?';
    paramsArr.push(endDate);
  }

  // Get total count
  const [countRows] = await conn.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as total
     FROM feed f, feed_files ff
     WHERE f.id=ff.feed_id AND f.member_user_id=? AND ff.file_type='1'${dateFilter}`,
    paramsArr
  );
  const total = countRows[0]?.total || 0;

  // Get paginated data
  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT 
      f.id AS f_id,
      f.title AS f_title,
      DATE(f.created_at) AS createdDate,
      f.view_count AS f_view_count
    FROM feed f, feed_files ff
    WHERE f.id=ff.feed_id AND f.member_user_id=? AND ff.file_type='1'${dateFilter}
    ORDER BY f.id DESC
    LIMIT ? OFFSET ?`,
    [...paramsArr, pageSize, offset]
  );

  await conn.end();
  return NextResponse.json({ views: rows, total });
} 