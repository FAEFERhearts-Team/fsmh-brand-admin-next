import { NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

function bufferToBit(val: Buffer | number | null): number | null {
  if (val === null) return null;
  if (Buffer.isBuffer(val)) return val[0];
  if (typeof val === 'number') return val;
  return null;
}

export async function GET(
  req: Request,
  context: { params: Promise<{ account: string }> }
) {
  const { account } = await context.params;
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT 
        m.id as m_id,
        m.account as m_account,
        m.phone_number as m_phone_number,
        m.nickname as m_nickname,
        m.join_type as m_join_type,
        m.intro as m_intro,
        m.name as m_name,
        gender,
        age,
        favorite_fit,
        m.image_url as m_image_url,
        m.birth as m_birth,
        m.activation as m_activation,
        IFNULL(m.height,0) as m_height,
        IFNULL(m.weight,0) as m_weight,
        IFNULL(m.chest,0) as m_chest,
        IFNULL(m.shoulder,0) as m_shoulder,
        IFNULL(m.waist,0) as m_waist,
        IFNULL(m.hip,0) as m_hip,
        IFNULL(m.top,0) as m_top,
        IFNULL(m.bottom,0) as m_bottom,
        m.body_type as m_body_type,
        m.agree_to_email as m_agree_to_email,
        m.agree_to_sms as m_agree_to_sms,
        m.agree_to_service as m_agree_to_service,
        m.agree_to_ad as m_agree_to_ad,
        m.grade_level as grade_level,
        DATE(m.created_at) as m_cdate 
    FROM 
        member_user m 
    WHERE 
        m.account = ?
    LIMIT 1;`,
    [account]
  );
  const user = rows[0] || null;
  let styles: string[] = [];
  if (user) {
    user.m_activation = bufferToBit(user.m_activation);
    user.m_agree_to_email = bufferToBit(user.m_agree_to_email);
    user.m_agree_to_sms = bufferToBit(user.m_agree_to_sms);
    user.m_agree_to_service = bufferToBit(user.m_agree_to_service);
    user.m_agree_to_ad = bufferToBit(user.m_agree_to_ad);
    const [styleRows] = await conn.execute<RowDataPacket[]>(
      `SELECT style_title FROM member_styles WHERE member_user_id = ?`,
      [user.m_id]
    );
    styles = (styleRows as RowDataPacket[]).map((row) => row.style_title);
  }
  await conn.end();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 404 });
  }
  return NextResponse.json({ user: { ...user, styles } });
} 