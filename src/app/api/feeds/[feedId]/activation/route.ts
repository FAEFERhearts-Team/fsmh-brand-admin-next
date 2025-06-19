import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function PUT(
  req: Request,
  context: { params: { feedId: string } }
): Promise<ReturnType<typeof NextResponse.json>> {
  const params = await context.params;
  const feedId = params?.feedId;
  const { is_deleted } = await req.json();
  console.log('Received is_deleted from client:', is_deleted);

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const updateQuery = 'UPDATE feed SET is_deleted = ? WHERE id = ?';
    console.log('Executing UPDATE:', updateQuery, [is_deleted, feedId]);
    const [updateResult] = await conn.execute(
      updateQuery,
      [is_deleted, feedId]
    );
    console.log('updateResult:', updateResult);
    await conn.end();
    return NextResponse.json({ 
      success: true, 
      newStatus: is_deleted 
    });
  } catch {
    await conn.end();
    return NextResponse.json(
      { error: 'Failed to update activation status' },
      { status: 500 }
    );
  }
} 