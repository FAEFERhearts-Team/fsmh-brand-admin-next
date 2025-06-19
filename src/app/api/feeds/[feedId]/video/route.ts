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

  // 피드 + 작성자 정보 조회
  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT 
      f.id AS feedId,
      f.title,
      f.review AS shortDescription,
      f.member_user_id AS memberUserId,
      f.gender,
      f.created_at AS createdDate,
      f.updated_at AS updatedDate,
      f.view_count AS view_counter,
      f.like_count AS likeCount,
      f.comment_count AS totalCommentCount,
      f.is_deleted,
      mu.nickname AS creatorNickname,
      mu.image_url AS creatorImageUrl
    FROM feed f
    LEFT JOIN member_user mu ON f.member_user_id = mu.id
    WHERE f.id = ?
    LIMIT 1`,
    [feedId]
  );

  if (!rows[0]) {
    await conn.end();
    return NextResponse.json({ feed: null }, { status: 404 });
  }
  const feed = rows[0];

  // 음원정보
  const [musicRows] = await conn.execute<RowDataPacket[]>(
    `SELECT song_id, album, artist, title FROM sound_source_log WHERE feed_id=? AND is_success=1 LIMIT 1`,
    [feedId]
  );
  const music = musicRows[0] || {};

  // 썸네일/비디오 파일 정보
  const [fileRows] = await conn.execute<RowDataPacket[]>(
    'SELECT captured_resize_image_url AS thumbnailUrl, image_url AS streamingURL, image_server_file_name FROM feed_files WHERE feed_id = ? AND is_deleted = 0 LIMIT 1',
    [feedId]
  );
  const file = fileRows[0] || {};

  await conn.end();

  return NextResponse.json({
    feed: {
      ...feed,
      thumbnailUrl: file.thumbnailUrl || null,
      streamingURL: file.streamingURL || null,
      image_server_file_name: file.image_server_file_name || null,
      music_title: music.title ?? null,
      music_artist: music.artist ?? null,
      music_song_id: music.song_id ?? null,
      music_album: music.album ?? null,
    }
  });
} 