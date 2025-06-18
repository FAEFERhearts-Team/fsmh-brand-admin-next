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
    return NextResponse.json({ comments: [], total: 0 });
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
     FROM comment c, feed f, member_user mu
     WHERE (c.feed_id=f.id AND f.member_user_id=mu.id) AND c.is_deleted=0 AND c.member_user_id=?${dateFilter}`,
    paramsArr
  );
  const total = countRows[0]?.total || 0;

  // Get paginated data
  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT 
      c.comment_id as cid,
      c.content as c_content,
      f.id as fid,
      f.title as fTitle,
      c.member_user_id as fMemberId,
      f.member_user_id as feed_owner,
      f.gender as fGender,
      mu.nickname as mu_nickname,
      mu.account as mu_account,
      DATE(c.created_at) as createdDate,
      c.updated_at as updatedDate,
      f.is_deleted as feedStatus
    FROM comment c, feed f, member_user mu
    WHERE (c.feed_id=f.id AND f.member_user_id=mu.id) AND c.is_deleted=0 AND c.member_user_id=?${dateFilter}
    ORDER BY createdDate DESC
    LIMIT ? OFFSET ?`,
    [...paramsArr, pageSize, offset]
  );

  await conn.end();
  return NextResponse.json({ comments: rows, total });
} 