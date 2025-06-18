import { NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

export async function GET(
  req: Request,
  { params }: { params: { feedId: string } }
): Promise<ReturnType<typeof NextResponse.json>> {
  const feedId = params.feedId;
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [rows] = await conn.execute<RowDataPacket[]>(
    'SELECT image_url FROM feed_files WHERE feed_id = ? AND file_type = 1 LIMIT 1',
    [feedId]
  );
  await conn.end();

  if (Array.isArray(rows) && rows.length > 0 && rows[0].image_url) {
    return NextResponse.json({ url: rows[0].image_url });
  } else {
    return NextResponse.json({ url: null });
  }
} 