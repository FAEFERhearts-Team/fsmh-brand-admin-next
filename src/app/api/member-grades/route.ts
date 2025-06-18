import { NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

export async function GET() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  const [rows] = await conn.execute<RowDataPacket[]>(
    'SELECT grade_id, name FROM member_grade WHERE is_deleted=0 ORDER BY grade_id ASC'
  );
  await conn.end();
  return NextResponse.json({ grades: rows });
} 