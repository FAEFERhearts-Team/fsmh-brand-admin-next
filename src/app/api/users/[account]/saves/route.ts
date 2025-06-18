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
    return NextResponse.json({ saves: [], total: 0 });
  }
  const memberId = userRows[0].id;

  // Build date filter
  let dateFilter = '';
  const paramsArr: Array<string | number> = [memberId];
  if (startDate) {
    dateFilter += ' AND DATE(fs.created_at) >= ?';
    paramsArr.push(startDate);
  }
  if (endDate) {
    dateFilter += ' AND DATE(fs.created_at) <= ?';
    paramsArr.push(endDate);
  }

  // Get total count
  const [countRows] = await conn.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as total
     FROM feed_store fs
     WHERE fs.is_deleted = 0 AND fs.member_user_id = ?${dateFilter}`,
    paramsArr
  );
  const total = countRows[0]?.total || 0;

  // Get paginated data
  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT 
      fs.id as fsid,
      f.id as fid,
      f.review as short_description,
      f.title as fTitle,
      f.member_user_id as fMemberId,
      f.member_user_id as feed_owner,
      f.gender as fGender,
      mu.nickname as mu_nickname,
      mu.account as mu_account,
      DATE(fs.created_at) as createdDate,
      fs.updated_at as updatedDate,
      f.is_deleted as feedStatus
    FROM feed_store fs
    JOIN feed f ON fs.feed_id = f.id
    JOIN member_user mu ON f.member_user_id = mu.id
    WHERE fs.is_deleted = 0 AND fs.member_user_id = ?${dateFilter}
    ORDER BY fs.created_at DESC
    LIMIT ? OFFSET ?`,
    [...paramsArr, pageSize, offset]
  );

  await conn.end();
  return NextResponse.json({ saves: rows, total });
} 