'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  src: string;
  isMuted?: boolean;
}

export default function VideoPlayer({ src, isMuted = true }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current || !src) return;
    const video = videoRef.current;
    let hls: Hls | null = null;

    if (Hls.isSupported() && src.endsWith('.m3u8')) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else {
      video.src = src;
    }

    video.muted = isMuted;
    video.autoplay = true;
    video.playsInline = true;

    return () => {
      if (hls) hls.destroy();
    };
  }, [src, isMuted]);

  return (
    <div className="w-[350px] flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        style={{ width: '350px', height: 'auto', background: 'black' }}
        controls={false}
        muted={isMuted}
        autoPlay
        playsInline
      />
    </div>
  );
} 