import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { RowDataPacket } from 'mysql2';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: '유저네임과 비밀번호를 입력하세요.' }, { status: 400 });
    }

    // DB에서 유저 정보 조회
    const [rows] = await pool.execute<[
      RowDataPacket[]
    ]>(
      'SELECT * FROM brand_admin_user WHERE username = ? LIMIT 1',
      [username]
    );
    const user = Array.isArray(rows) ? (rows[0] as RowDataPacket) : undefined;
    if (!user) {
      return NextResponse.json({ error: '존재하지 않는 유저입니다.' }, { status: 401 });
    }

    // PHP bcrypt hash와 비교
    const isMatch = await bcrypt.compare(password, user.passwd);
    if (!isMatch) {
      return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
    }

    // JWT 발급
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // httpOnly 쿠키로 JWT 설정
    const response = NextResponse.json({ success: true });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 2, // 2시간
    });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: '로그인 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 