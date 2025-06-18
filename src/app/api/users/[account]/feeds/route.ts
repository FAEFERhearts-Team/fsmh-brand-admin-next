import { NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

export async function GET(
  req: Request,
  context: { params: Promise<{ account: string }> }
) {
  const { account } = await context.params;
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  // member_user에서 id를 가져옴
  const [userRows] = await conn.execute<RowDataPacket[]>(
    'SELECT id, nickname FROM member_user WHERE account = ? LIMIT 1',
    [account]
  );
  if (!userRows[0]) {
    await conn.end();
    return NextResponse.json({ feeds: [] });
  }
  const memberId = userRows[0].id;
  const creatorNickname = userRows[0].nickname;

  // 기간 조건
  let dateWhere = '';
  if (startDate) dateWhere += ` AND DATE_FORMAT(f.created_at, '%Y-%m-%d') >= '${startDate}'`;
  if (endDate) dateWhere += ` AND DATE_FORMAT(f.created_at, '%Y-%m-%d') <= '${endDate}'`;

  // 메인 피드 쿼리
  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT 
      f.id AS fid, 
      ff.captured_resize_image_url AS cImage,
      f.percent AS starPoints, 
      f.review AS short_description, 
      f.title AS fTitle, 
      f.member_user_id AS fMemberId, 
      f.gender AS fGender,
      ff.image_url AS videoURL,
      ff.image_server_file_name AS videoFilename,
      f.is_deleted AS feedStatus,
      f.view_count AS f_view_counter,
      f.comment_count AS f_comment_count,
      f.like_count AS f_like_count,
      DATE_FORMAT(f.created_at, '%Y-%m-%d') AS createdDate,
      DATE_FORMAT(f.updated_at, '%Y-%m-%d') AS updatedDate
    FROM 
      feed f, 
      feed_files ff
    WHERE 
      (ff.image_url like '%m3u8%' OR ff.image_url like '%mp4%') AND 
      (f.id=ff.feed_id AND f.member_user_id=?) AND  
      ff.is_deleted=0 AND 
      f.is_deleted=0
      ${dateWhere}
    GROUP BY 
      fid 
    ORDER BY 
      f.created_at DESC
    ;`,
    [memberId]
  );

  // 각 피드별 음원정보 추가
  const feeds = await Promise.all(rows.map(async (row) => {
    // 음원정보
    const [musicRows] = await conn.execute<RowDataPacket[]>(
      `SELECT song_id, album, artist, title FROM sound_source_log WHERE feed_id=? AND is_success=1 LIMIT 1`,
      [row.fid]
    );
    const music = musicRows[0] || {};
    return {
      feedId: row.fid,
      thumbnailUrl: row.cImage,
      starPoints: row.starPoints ?? 0,
      shortDescription: row.short_description,
      title: row.fTitle,
      memberUserId: row.fMemberId,
      gender: row.fGender,
      createdDate: row.createdDate,
      updatedDate: row.updatedDate,
      view_counter: row.f_view_counter ?? 0,
      likeCount: row.f_like_count ?? 0,
      totalCommentCount: row.f_comment_count ?? 0,
      streamingURL: row.videoURL,
      videoFilename: row.videoFilename,
      creatorNickname,
      feedStatus: row.feedStatus,
      music_title: music.title ?? null,
      music_artist: music.artist ?? null,
      music_song_id: music.song_id ?? null,
      music_album: music.album ?? null,
    };
  }));

  await conn.end();
  return NextResponse.json({ feeds });
} 