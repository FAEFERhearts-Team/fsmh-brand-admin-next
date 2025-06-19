import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parent_first = url.searchParams.get('parent_first');
  const parent_second = url.searchParams.get('parent_second');
  let where = '';
  const params: number[] = [];

  if (parent_first !== null && parent_second === 'null') {
    where = 'WHERE parent_first = ? AND parent_second IS NULL';
    params.push(Number(parent_first));
  } else if (parent_first !== null) {
    if (parent_first === 'null') {
      where = 'WHERE parent_first IS NULL';
    } else {
      where = 'WHERE parent_first = ?';
      params.push(Number(parent_first));
    }
  } else if (parent_second !== null) {
    where = 'WHERE parent_second = ?';
    params.push(Number(parent_second));
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [rows] = await conn.execute(
    `SELECT id, title FROM merch_category ${where} ORDER BY sorting ASC`,
    params
  );
  await conn.end();
  return NextResponse.json({ categories: rows });
} 