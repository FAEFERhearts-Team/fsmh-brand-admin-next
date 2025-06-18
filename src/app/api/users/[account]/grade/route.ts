import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function PATCH(req: Request, { params }: { params: { account: string } }) {
  const { account } = params;
  const { grade_level } = await req.json();
  if (!account || !grade_level) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  await conn.execute(
    'UPDATE member_user SET grade_level=? WHERE account=?',
    [grade_level, account]
  );
  await conn.end();
  return NextResponse.json({ success: true });
} 