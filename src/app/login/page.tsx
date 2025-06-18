'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '로그인 실패');
        setLoading(false);
        return;
      }
      // 로그인 성공: 메인페이지로 이동
      router.push('/');
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* 왼쪽 섹션 (60%) */}
      <div className="w-full md:w-[60%] flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white shadow-lg px-10 py-12">
          {/* 로고 */}
          <div className="flex flex-col items-start mb-8">
            <img src="/admin_logo_black.webp" alt="FAEFER" className="h-12 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">로그인</h2>
            <p className="text-gray-400 text-sm mb-2">Welcome to FAEFERhearts!</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-500 mb-1">유저네임</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full rounded-lg bg-blue-50 border-none focus:ring-2 focus:ring-blue-200 text-gray-800 px-4 py-3 text-base placeholder-gray-400"
                placeholder="유저네임"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-500 mb-1">비밀번호</label>
              <div className="relative mb-0">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg bg-blue-50 border-none focus:ring-2 focus:ring-blue-200 text-gray-800 px-4 py-3 text-base placeholder-gray-400 pr-10"
                  placeholder="비밀번호"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="비밀번호 보기"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M4.5 4.5A9.77 9.77 0 003 12c2.25 4.5 6.75 7.5 9 7.5 1.2 0 2.4-.3 3.6-.9M9.9 9.9a3 3 0 104.2 4.2" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 4.5-6 7.5-9 7.5S3 16.5 3 12s6-7.5 9-7.5 9 3 9 7.5z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
              <label className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                유저네임 기억하기
              </label>
              <div className="flex gap-2">
                <a href="#" className="hover:underline">유저네임 찾기</a>
                <span>/</span>
                <a href="#" className="hover:underline">비밀번호 찾기</a>
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center mt-2">{error}</div>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-lg text-white font-semibold text-lg shadow-sm transition-colors"
              style={{ backgroundColor: 'rgb(38, 191, 148)' }}
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
          <div className="mt-8 text-center text-sm text-gray-500">
            계정이 없으신가요?{' '}
            <a href="#" className="text-purple-700 font-semibold hover:underline">패퍼하츠 입점문의</a>
          </div>
        </div>
      </div>
      {/* 오른쪽 섹션 (40%) - 데스크탑에서만 표시 */}
      <div className="hidden md:block w-[40%] bg-black">
        <VideoPlayer />
      </div>
    </div>
  );
} 