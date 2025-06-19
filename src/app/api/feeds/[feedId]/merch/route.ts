import { NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

export async function GET(
  req: Request,
  { params }: { params: { feedId: string } }
): Promise<ReturnType<typeof NextResponse.json>> {
  const { feedId } = await params;
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  // feed_merchs와 merchandise 조인하여 상품 정보 조회
  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT m.id, m.title, m.price, m.image_url, m.store_price, m.short_description
     FROM feed_merchs fm
     JOIN merchandise m ON fm.merchandise_id = m.id
     WHERE fm.feed_id = ?
     LIMIT 1`,
    [feedId]
  );
  await conn.end();

  if (Array.isArray(rows) && rows.length > 0) {
    return NextResponse.json({ merch: rows[0] });
  } else {
    return NextResponse.json({ merch: null });
  }
} 