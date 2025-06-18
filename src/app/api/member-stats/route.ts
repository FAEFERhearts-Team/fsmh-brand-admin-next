import { NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

export async function GET() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // 오늘 날짜 (YYYY-MM-DD)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    // 어제 날짜 (YYYY-MM-DD)
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yyyy2 = yesterday.getFullYear();
    const mm2 = String(yesterday.getMonth() + 1).padStart(2, '0');
    const dd2 = String(yesterday.getDate()).padStart(2, '0');
    const yesterdayStr = `${yyyy2}-${mm2}-${dd2}`;

    // 누적 멤버수 (activation=1)
    const [totalRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM member_user WHERE activation=1"
    );
    // 어제까지 누적 멤버수
    const [yesterdayRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM member_user WHERE activation=1 AND created_at < ?", [todayStr]
    );
    // 오늘 생성된 멤버수
    const [todayRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM member_user WHERE activation=1 AND DATE(created_at) = ?", [todayStr]
    );

    // 탈퇴 회원수 (unregister_request_at이 5일 이상 지난 회원)
    const [leaveRows] = await conn.execute<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT u.id) as leaveCount
       FROM member_unregister_log l, member_user u
       WHERE l.member_id=u.id
         AND u.unregister_request_at IS NOT NULL
         AND DATE(DATE_ADD(u.unregister_request_at, interval +5 day)) < DATE(?)`, [todayStr]
    );
    // 어제까지 탈퇴 회원수
    const [leaveRowsYesterday] = await conn.execute<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT u.id) as leaveCountYesterday
       FROM member_unregister_log l, member_user u
       WHERE l.member_id=u.id
         AND u.unregister_request_at IS NOT NULL
         AND DATE(DATE_ADD(u.unregister_request_at, interval +5 day)) < DATE(?)`, [yesterdayStr]
    );

    // DAU (오늘 접속자 수)
    const [dauRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(DISTINCT log_id) as dau FROM member_access_log WHERE DATE(access_at)=DATE(CURDATE())"
    );
    // MAU (최근 1개월 접속자 수)
    const [mauRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(DISTINCT log_id) as mau FROM member_access_log WHERE DATE(access_at)>=DATE(DATE_ADD(now(), interval -1 month))"
    );

    // 남자 회원 수
    const [maleRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(id) as male FROM member_user WHERE gender='M' AND activation='1' AND (DATE(DATE_ADD(unregister_request_at, interval +5 day)) >= DATE(now()) OR unregister_request_at IS NULL)"
    );
    // 여자 회원 수
    const [femaleRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(id) as female FROM member_user WHERE gender='F' AND activation='1' AND (DATE(DATE_ADD(unregister_request_at, interval +5 day)) >= DATE(now()) OR unregister_request_at IS NULL)"
    );
    // 미지정 회원 수
    const [etcRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(id) as etc FROM member_user WHERE gender IS NULL AND activation='1' AND (DATE(DATE_ADD(unregister_request_at, interval +5 day)) >= DATE(now()) OR unregister_request_at IS NULL)"
    );

    // 연령대별 회원 수
    const [teenRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(id) as teen FROM member_user WHERE age='TEEN' AND activation='1' AND (DATE(DATE_ADD(unregister_request_at, interval +5 day)) >= DATE(now()) OR unregister_request_at IS NULL)"
    );
    const [twentyRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(id) as twenty FROM member_user WHERE age='TWENTY' AND activation='1' AND (DATE(DATE_ADD(unregister_request_at, interval +5 day)) >= DATE(now()) OR unregister_request_at IS NULL)"
    );
    const [thirtyRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(id) as thirty FROM member_user WHERE age='THIRTY' AND activation='1' AND (DATE(DATE_ADD(unregister_request_at, interval +5 day)) >= DATE(now()) OR unregister_request_at IS NULL)"
    );
    const [fortyRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(id) as forty FROM member_user WHERE age='FORTY' AND activation='1' AND (DATE(DATE_ADD(unregister_request_at, interval +5 day)) >= DATE(now()) OR unregister_request_at IS NULL)"
    );
    const [fiftyRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(id) as fifty FROM member_user WHERE age='FIFTY' AND activation='1' AND (DATE(DATE_ADD(unregister_request_at, interval +5 day)) >= DATE(now()) OR unregister_request_at IS NULL)"
    );

    // 멤버 레벨별 회원 수
    const [newbieRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(id) as newbie FROM member_user WHERE grade_level='1' AND activation='1' AND (DATE(DATE_ADD(unregister_request_at, interval +5 day)) >= DATE(now()) OR unregister_request_at IS NULL)"
    );
    const [rookieRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(id) as rookie FROM member_user WHERE grade_level='2' AND activation='1' AND (DATE(DATE_ADD(unregister_request_at, interval +5 day)) >= DATE(now()) OR unregister_request_at IS NULL)"
    );
    const [creatorRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(id) as creator FROM member_user WHERE grade_level='3' AND activation='1' AND (DATE(DATE_ADD(unregister_request_at, interval +5 day)) >= DATE(now()) OR unregister_request_at IS NULL)"
    );
    const [loverRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(id) as lover FROM member_user WHERE grade_level='4' AND activation='1' AND (DATE(DATE_ADD(unregister_request_at, interval +5 day)) >= DATE(now()) OR unregister_request_at IS NULL)"
    );
    const [fanRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(id) as fan FROM member_user WHERE grade_level='5' AND activation='1' AND (DATE(DATE_ADD(unregister_request_at, interval +5 day)) >= DATE(now()) OR unregister_request_at IS NULL)"
    );
    const [holicRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(id) as holic FROM member_user WHERE grade_level='6' AND activation='1' AND (DATE(DATE_ADD(unregister_request_at, interval +5 day)) >= DATE(now()) OR unregister_request_at IS NULL)"
    );
    const [fpeopleRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(id) as fpeople FROM member_user WHERE grade_level='7' AND activation='1' AND (DATE(DATE_ADD(unregister_request_at, interval +5 day)) >= DATE(now()) OR unregister_request_at IS NULL)"
    );
    const [vipRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(id) as vip FROM member_user WHERE grade_level='8' AND activation='1' AND (DATE(DATE_ADD(unregister_request_at, interval +5 day)) >= DATE(now()) OR unregister_request_at IS NULL)"
    );
    const [primeRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(id) as prime FROM member_user WHERE grade_level='9' AND activation='1' AND (DATE(DATE_ADD(unregister_request_at, interval +5 day)) >= DATE(now()) OR unregister_request_at IS NULL)"
    );
    const [trendsetterRows] = await conn.execute<RowDataPacket[]>(
      "SELECT COUNT(id) as trendsetter FROM member_user WHERE grade_level='10' AND activation='1' AND (DATE(DATE_ADD(unregister_request_at, interval +5 day)) >= DATE(now()) OR unregister_request_at IS NULL)"
    );

    await conn.end();

    const total = totalRows[0]?.total ?? 0;
    const yesterdayTotal = yesterdayRows[0]?.total ?? 0;
    const todayCount = todayRows[0]?.total ?? 0;
    const diff = total - yesterdayTotal;
    const percent = yesterdayTotal > 0 ? ((diff / yesterdayTotal) * 100).toFixed(1) : '0';
    const leaveCount = leaveRows[0]?.leaveCount ?? 0;
    const leaveCountYesterday = leaveRowsYesterday[0]?.leaveCountYesterday ?? 0;
    const dau = dauRows[0]?.dau ?? 0;
    const mau = mauRows[0]?.mau ?? 0;
    const male = maleRows[0]?.male ?? 0;
    const female = femaleRows[0]?.female ?? 0;
    const etc = etcRows[0]?.etc ?? 0;
    const totalForGender = total > 0 ? total : 1; // 0 division 방지
    const maleRate = ((male / totalForGender) * 100).toFixed(1);
    const femaleRate = ((female / totalForGender) * 100).toFixed(1);
    const etcRate = ((etc / totalForGender) * 100).toFixed(1);

    const teen = teenRows[0]?.teen ?? 0;
    const twenty = twentyRows[0]?.twenty ?? 0;
    const thirty = thirtyRows[0]?.thirty ?? 0;
    const forty = fortyRows[0]?.forty ?? 0;
    const fifty = fiftyRows[0]?.fifty ?? 0;
    const teenRate = ((teen / totalForGender) * 100).toFixed(1);
    const twentyRate = ((twenty / totalForGender) * 100).toFixed(1);
    const thirtyRate = ((thirty / totalForGender) * 100).toFixed(1);
    const fortyRate = ((forty / totalForGender) * 100).toFixed(1);
    const fiftyRate = ((fifty / totalForGender) * 100).toFixed(1);

    const newbie = newbieRows[0]?.newbie ?? 0;
    const rookie = rookieRows[0]?.rookie ?? 0;
    const creator = creatorRows[0]?.creator ?? 0;
    const lover = loverRows[0]?.lover ?? 0;
    const fan = fanRows[0]?.fan ?? 0;
    const holic = holicRows[0]?.holic ?? 0;
    const fpeople = fpeopleRows[0]?.fpeople ?? 0;
    const vip = vipRows[0]?.vip ?? 0;
    const prime = primeRows[0]?.prime ?? 0;
    const trendsetter = trendsetterRows[0]?.trendsetter ?? 0;
    const newbieRate = ((newbie / totalForGender) * 100).toFixed(1);
    const rookieRate = ((rookie / totalForGender) * 100).toFixed(1);
    const creatorRate = ((creator / totalForGender) * 100).toFixed(1);
    const loverRate = ((lover / totalForGender) * 100).toFixed(1);
    const fanRate = ((fan / totalForGender) * 100).toFixed(1);
    const holicRate = ((holic / totalForGender) * 100).toFixed(1);
    const fpeopleRate = ((fpeople / totalForGender) * 100).toFixed(1);
    const vipRate = ((vip / totalForGender) * 100).toFixed(1);
    const primeRate = ((prime / totalForGender) * 100).toFixed(1);
    const trendsetterRate = ((trendsetter / totalForGender) * 100).toFixed(1);

    return NextResponse.json({
      total,
      yesterdayTotal,
      todayCount,
      percent,
      diff,
      leaveCount,
      leaveCountYesterday,
      dau,
      mau,
      male,
      female,
      etc,
      maleRate,
      femaleRate,
      etcRate,
      teen,
      twenty,
      thirty,
      forty,
      fifty,
      teenRate,
      twentyRate,
      thirtyRate,
      fortyRate,
      fiftyRate,
      newbie,
      rookie,
      creator,
      lover,
      fan,
      holic,
      fpeople,
      vip,
      prime,
      trendsetter,
      newbieRate,
      rookieRate,
      creatorRate,
      loverRate,
      fanRate,
      holicRate,
      fpeopleRate,
      vipRate,
      primeRate,
      trendsetterRate,
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
} 