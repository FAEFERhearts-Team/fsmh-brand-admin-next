import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const brand_id = url.searchParams.get('brand_id');
  const category1 = url.searchParams.get('category1');
  const category2 = url.searchParams.get('category2');
  const category3 = url.searchParams.get('category3');

  let where = 'WHERE 1=1';
  const params: (string|number)[] = [];
  if (brand_id) {
    where += ' AND m.merch_brand_id = ?';
    params.push(Number(brand_id));
  }
  if (category1) {
    where += ' AND m.category1 = ?';
    params.push(Number(category1));
  }
  if (category2) {
    where += ' AND m.category2 = ?';
    params.push(Number(category2));
  }
  if (category3) {
    where += ' AND m.category3 = ?';
    params.push(Number(category3));
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [rows] = await conn.execute(
    `SELECT m.id, m.title, b.title AS brand_name, m.price, m.image_url AS thumbnail_url
     FROM merchandise m
     LEFT JOIN merch_brand b ON m.merch_brand_id = b.id
     ${where}
     ORDER BY m.id DESC`,
    params
  );
  await conn.end();
  return NextResponse.json({ merchandises: rows });
} 