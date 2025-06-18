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

  let where = 'bu.brand_id=b.id';
  const params: string[] = [];
  if (keyword) {
    where += ' AND (bu.username LIKE ? OR bu.full_name LIKE ? OR b.title_kor LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }

  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT 
        bu.id AS bu_id,
        bu.username AS bu_username,
        bu.full_name AS bu_full_name,
        b.title_kor AS b_title_kor
    FROM 
        brand_admin_user bu,
        merch_brand b
    WHERE 
        ${where}
    ORDER BY 
        b.title_kor ASC;`,
    params
  );

  await conn.end();
  return NextResponse.json({ users: rows });
} 