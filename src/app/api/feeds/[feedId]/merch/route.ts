import { NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

// GET: 피드에 연결된 모든 상품(및 옵션) 리스트 반환
export async function GET(
  req: Request,
  context: { params: { feedId: string } }
): Promise<ReturnType<typeof NextResponse.json>> {
  const { feedId } = context.params;
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  // feed_merchs + merchandise + merch_option + merch_brand 조인
  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT 
      fm.merchandise_id, 
      fm.merch_option_id, 
      m.title AS name, 
      m.title AS name_kr, 
      m.price, 
      m.image_url AS thumbnail_url,
      mo.value AS option_name,
      b.title AS brand_name
    FROM feed_merchs fm
    JOIN merchandise m ON fm.merchandise_id = m.id
    LEFT JOIN merch_option mo ON fm.merch_option_id = mo.id
    LEFT JOIN merch_brand b ON m.merch_brand_id = b.id
    WHERE fm.feed_id = ?`,
    [feedId]
  );
  await conn.end();
  return NextResponse.json({ merchs: rows });
}

// DELETE: 피드-상품 연결 해제
export async function DELETE(
  req: Request,
  context: { params: { feedId: string } }
): Promise<ReturnType<typeof NextResponse.json>> {
  const { feedId } = context.params;
  const { merchandise_id, merch_option_id } = await req.json();
  if (!merchandise_id) return NextResponse.json({ success: false, error: 'merchandise_id required' }, { status: 400 });
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  await conn.execute(
    'DELETE FROM feed_merchs WHERE feed_id = ? AND merchandise_id = ? AND merch_option_id = ?',
    [feedId, merchandise_id, merch_option_id]
  );
  await conn.end();
  return NextResponse.json({ success: true });
}

// POST: 피드-상품 연결 추가
export async function POST(
  req: Request,
  context: { params: { feedId: string } }
): Promise<ReturnType<typeof NextResponse.json>> {
  const { feedId } = context.params;
  const { merchandise_id, merch_option_id } = await req.json();
  if (!merchandise_id) return NextResponse.json({ success: false, error: 'merchandise_id required' }, { status: 400 });
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  await conn.execute(
    'INSERT INTO feed_merchs (feed_id, merchandise_id, merch_option_id) VALUES (?, ?, ?)',
    [feedId, merchandise_id, merch_option_id]
  );
  await conn.end();
  return NextResponse.json({ success: true });
} 