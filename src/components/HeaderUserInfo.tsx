'use client';
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HeaderUserInfo() {
  // 실제 서비스라면 props/context로 유저정보를 받아야 하지만, 현재는 고정값 사용
  const username = "jaykaysm";
  const company = "FSMH Headquarter";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      window.addEventListener("mousedown", handleClick);
      return () => window.removeEventListener("mousedown", handleClick);
    }
  }, [dropdownOpen]);

  // 로그아웃 동작
  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.replace('/login');
    } catch {
      alert('로그아웃에 실패했습니다.');
    }
  };

  return (
    <header className="w-full flex items-center justify-end h-[65px] bg-white border-b border-[#e0e6ed] px-6" style={{minWidth:0}}>
      <div className="relative">
        <button
          ref={buttonRef}
          className="flex flex-col items-end text-gray-600 font-semibold focus:outline-none cursor-pointer group"
          onClick={() => setDropdownOpen((v) => !v)}
          type="button"
        >
          <span className="flex flex-row items-center cursor-pointer group-hover:underline">
            <span className="text-base font-bold text-[#3b4252] cursor-pointer group-hover:underline mr-1">{username}</span>
            {/* 상하방향 아이콘 (∨) */}
            <svg className="w-4 h-4 text-[#a3aed1]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
          <span className="text-xs text-[#a3aed1] font-semibold text-right w-full">{company}</span>
        </button>
        {dropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute right-0 min-w-[160px] bg-white rounded-none shadow-xl z-50 flex flex-col py-2 border border-[#e0e6ed]"
            style={{ top: 'calc(100% - 12px)' }}
          >
            <button
              className="w-full text-left px-5 py-2 text-[#6c7280] text-sm font-semibold hover:bg-[#f5f6fa] cursor-pointer transition"
              onClick={() => { setDropdownOpen(false); alert('비밀번호 변경 기능은 추후 구현 예정입니다.'); }}
            >
              비밀번호 변경
            </button>
            <button
              className="w-full text-left px-5 py-2 text-[#6c7280] text-sm font-semibold hover:bg-[#f5f6fa] cursor-pointer transition"
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
} 