import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get('all') === 'true';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const keyword = searchParams.get('keyword') || '';
  const offset = (page - 1) * pageSize;

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  if (all) {
    // 전체 리스트 반환 (activation=1)
    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT id, account, nickname, created_at FROM member_user WHERE activation=1 ORDER BY id DESC`
    );
    await conn.end();
    return NextResponse.json({ users: rows });
  }

  let where = "WHERE activation=1";
  const params: string[] = [];
  if (keyword) {
    where += " AND (account LIKE ? OR nickname LIKE ?)";
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  // total count
  const [countRows] = await conn.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM member_user ${where}`,
    params
  );
  const total = countRows[0]?.total || 0;

  // data
  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT id, account, nickname, created_at FROM member_user ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  await conn.end();

  return NextResponse.json({ users: rows, total });
} 