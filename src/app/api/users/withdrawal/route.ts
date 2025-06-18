import { NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword') || '';

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  let where = `l.member_id=u.id AND u.unregister_request_at IS NOT NULL`;
  const params: string[] = [];
  if (keyword) {
    where += ` AND (u.account LIKE ? OR u.nickname LIKE ?)`;
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT 
        u.id AS uid,
        l.member_unregister_log_id AS lid, 
        DATE(l.created_at) AS qdate, 
        l.member_id AS l_member_id, 
        u.account AS u_account,
        l.reason AS l_reason, 
        l.detail_reason AS l_detail_reason, 
        u.nickname AS u_nickname,
        u.activation AS u_activation,
        DATE(u.unregister_request_at) AS u_unregister_request_at,
        DATE(DATE_ADD(u.unregister_request_at, interval +5 day)) AS u_unregistered_at,
        if(u.unregister_request_at IS NULL, '탈퇴신청취소',if(DATE(DATE_ADD(u.unregister_request_at, interval +5 day)) < DATE(now()), '탈퇴완료', '탈퇴신청중')) AS quit_status
    FROM 
        member_unregister_log l, member_user u 
    WHERE 
        ${where}
    GROUP BY u.id
    ORDER BY l.created_at DESC;`,
    params
  );

  await conn.end();
  return NextResponse.json({ users: rows });
}