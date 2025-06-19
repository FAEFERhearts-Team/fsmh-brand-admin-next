import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderBy = url.searchParams.get('orderBy') || 'title';
  const order = (url.searchParams.get('order') || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [rows] = await conn.execute(
    `SELECT id, title FROM merch_brand ORDER BY ${orderBy} ${order}`
  );
  await conn.end();
  return NextResponse.json({ brands: rows });
} 