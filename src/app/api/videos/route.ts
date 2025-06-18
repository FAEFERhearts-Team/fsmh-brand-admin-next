import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

export async function GET() {
  try {
    const [rows] = await pool.execute(
      `SELECT id, image_url FROM feed_files WHERE image_url IS NOT NULL AND image_url LIKE '%.m3u8' ORDER BY RAND()`
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('MySQL Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 