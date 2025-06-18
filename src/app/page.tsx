"use client";

import { useState, useEffect } from "react";

export default function Home() {
  // const [dropdownOpen, setDropdownOpen] = useState(false);
  // const dropdownRef = useRef<HTMLDivElement>(null);
  // const usernameRef = useRef<HTMLSpanElement>(null);
  // const username = 'jaykaysm';
  const [memberStats, setMemberStats] = useState<{
    total: number;
    percent: string;
    diff: number;
    leaveCount?: number;
    leaveCountYesterday?: number;
    dau?: number;
    mau?: number;
    male?: number;
    female?: number;
    etc?: number;
    maleRate?: string;
    femaleRate?: string;
    etcRate?: string;
    teen?: number;
    twenty?: number;
    thirty?: number;
    forty?: number;
    fifty?: number;
    teenRate?: string;
    twentyRate?: string;
    thirtyRate?: string;
    fortyRate?: string;
    fiftyRate?: string;
    newbie?: number;
    rookie?: number;
    creator?: number;
    lover?: number;
    fan?: number;
    newbieRate?: string;
    rookieRate?: string;
    creatorRate?: string;
    loverRate?: string;
    fanRate?: string;
    holic?: number;
    fpeople?: number;
    vip?: number;
    prime?: number;
    trendsetter?: number;
    holicRate?: string;
    fpeopleRate?: string;
    vipRate?: string;
    primeRate?: string;
    trendsetterRate?: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/member-stats')
      .then(res => res.json())
      .then(data => setMemberStats(data));
  }, []);

  // 바깥 클릭 시 드롭다운 닫기
  // (간단하게 window 클릭 이벤트로 처리)
  // if (typeof window !== 'undefined') {
  //   window.onclick = (e) => {
  //     // if (
  //     //   dropdownRef.current &&
  //     //   !dropdownRef.current.contains(e.target as Node)
  //     // ) {
  //     //   setDropdownOpen(false);
  //     // }
  //   };
  // }

  // const handleLogout = async () => {
  //   await fetch('/api/logout', { method: 'POST' });
  //   router.replace('/login');
  // };

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      {/* 대시보드 */}
      <main className="flex-1 flex flex-col p-10">
        {/* 멤버현황 대시보드 전체 박스 */}
        <div className="bg-white rounded-2xl p-8 mb-8 w-full shadow-sm border border-[#f0f0f0]">
          {/* 헤더 */}
          <div className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-1.5 h-5 rounded bg-gradient-to-b from-[#7f8fff] to-[#f5b942] mr-3" />
            멤버현황
          </div>
          {/* 내부 작은 박스들 */}
          <div className="flex flex-row gap-6 w-full">
            {/* 왼쪽: 현재 멤버수 + 탈퇴 회원수 (세로) */}
            <div className="flex flex-col gap-4 w-full max-w-[224px]">
              {/* 현재 멤버수 박스 */}
              <div className="bg-[#eeeeee] rounded-xl shadow p-6 min-h-[140px] flex flex-col justify-between w-full">
                <span className="text-3xl font-bold text-gray-900">{memberStats ? memberStats.total : '-'}</span>
                <span className="text-gray-500 text-base mt-1 font-bold">멤버수</span>
                {memberStats && (
                  <span
                    className="mt-2 bg-[#fdf6ec] text-[#f5b942] text-xs font-semibold rounded px-2 py-0.5"
                    style={{ transform: 'scale(0.9)', transformOrigin: 'left' }}
                  >
                    어제보다 {memberStats.percent}% -
                  </span>
                )}
              </div>
              {/* 탈퇴 회원수 박스 */}
              <div className="bg-[#eeeeee] rounded-xl shadow p-6 min-h-[140px] flex flex-col justify-between w-full">
                <span className="text-3xl font-bold text-gray-900">{memberStats && typeof memberStats.leaveCount !== 'undefined' ? memberStats.leaveCount : '-'}</span>
                <span className="text-gray-500 text-base mt-1 font-bold">탈퇴 회원수</span>
                {memberStats && typeof memberStats.leaveCount !== 'undefined' && typeof memberStats.leaveCountYesterday !== 'undefined' && (
                  <span
                    className="mt-2 bg-[#fdf6ec] text-[#f5b942] text-xs font-semibold rounded px-2 py-0.5"
                    style={{ transform: 'scale(0.9)', transformOrigin: 'left' }}
                  >
                    어제보다 {memberStats.leaveCountYesterday > 0 ? (((memberStats.leaveCount - memberStats.leaveCountYesterday) / memberStats.leaveCountYesterday) * 100).toFixed(1) : '0'}% -
                  </span>
                )}
              </div>
            </div>
            {/* 오른쪽: DAU/MAU + 성별 박스 */}
            <div className="flex flex-col gap-4 w-full max-w-[224px]">
              {/* DAU/MAU 박스 */}
              <div className="bg-[#eeeeee] rounded-xl shadow p-6 min-h-[140px] flex flex-col justify-between w-full">
                <div className="flex flex-col justify-between h-full">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-bold text-gray-800">DAU</span>
                    <span className="text-lg font-bold text-gray-900">{memberStats && typeof memberStats.dau !== 'undefined' ? memberStats.dau : '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">MAU</span>
                    <span className="text-lg font-bold text-gray-900">{memberStats && typeof memberStats.mau !== 'undefined' ? memberStats.mau : '-'}</span>
                  </div>
                </div>
              </div>
              {/* 성별별 인원수 박스 */}
              <div className="bg-[#eeeeee] rounded-xl shadow p-6 min-h-[140px] flex flex-col gap-3 w-full">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-800">남자</span>
                  <span className="text-base font-bold text-gray-900">{memberStats ? memberStats.male : '-'} <span className="text-xs text-gray-500 font-normal ml-1">{memberStats ? memberStats.maleRate : '-'}%</span></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-800">여자</span>
                  <span className="text-base font-bold text-gray-900">{memberStats ? memberStats.female : '-'} <span className="text-xs text-gray-500 font-normal ml-1">{memberStats ? memberStats.femaleRate : '-'}%</span></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-800">미지정</span>
                  <span className="text-base font-bold text-gray-900">{memberStats ? memberStats.etc : '-'} <span className="text-xs text-gray-500 font-normal ml-1">{memberStats ? memberStats.etcRate : '-'}%</span></span>
                </div>
              </div>
            </div>
            {/* 연령대별 멤버수 박스 */}
            <div className="bg-[#eeeeee] rounded-xl shadow p-4 min-h-[140px] flex flex-col gap-5 w-full max-w-[224px]">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-[#232936] text-left w-16">10대</span>
                <span className="flex items-baseline justify-end min-w-[70px]">
                  <span className="text-lg font-bold text-[#232936]">{memberStats ? memberStats.teen : '-'}</span>
                  <span className="text-base font-bold text-[#6c7280] ml-2">{memberStats ? memberStats.teenRate : '-'}%</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-[#232936] text-left w-16">20대</span>
                <span className="flex items-baseline justify-end min-w-[70px]">
                  <span className="text-lg font-bold text-[#232936]">{memberStats ? memberStats.twenty : '-'}</span>
                  <span className="text-base font-bold text-[#6c7280] ml-2">{memberStats ? memberStats.twentyRate : '-'}%</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-[#232936] text-left w-16">30대</span>
                <span className="flex items-baseline justify-end min-w-[70px]">
                  <span className="text-lg font-bold text-[#232936]">{memberStats ? memberStats.thirty : '-'}</span>
                  <span className="text-base font-bold text-[#6c7280] ml-2">{memberStats ? memberStats.thirtyRate : '-'}%</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-[#232936] text-left w-16">40대</span>
                <span className="flex items-baseline justify-end min-w-[70px]">
                  <span className="text-lg font-bold text-[#232936]">{memberStats ? memberStats.forty : '-'}</span>
                  <span className="text-base font-bold text-[#6c7280] ml-2">{memberStats ? memberStats.fortyRate : '-'}%</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-[#232936] text-left w-16">50대</span>
                <span className="flex items-baseline justify-end min-w-[70px]">
                  <span className="text-lg font-bold text-[#232936]">{memberStats ? memberStats.fifty : '-'}</span>
                  <span className="text-base font-bold text-[#6c7280] ml-2">{memberStats ? memberStats.fiftyRate : '-'}%</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-[#232936] text-left w-16">미지정</span>
                <span className="flex items-baseline justify-end min-w-[70px]">
                  <span className="text-lg font-bold text-[#232936]">{memberStats ? memberStats.etc : '-'}</span>
                  <span className="text-base font-bold text-[#6c7280] ml-2">{memberStats ? memberStats.etcRate : '-'}%</span>
                </span>
              </div>
            </div>
            {/* 멤버 레벨별 유저수 박스 (오른쪽, 꽉차게) */}
            <div className="bg-[#f7f7f7] rounded-xl shadow p-4 min-h-[140px] flex flex-col gap-5 flex-1 min-w-0 justify-center">
              <div className="grid grid-cols-2 gap-x-8">
                <div className="flex flex-col gap-5">
                  {/* 왼쪽 5개 */}
                  {[
                    { label: 'NEWBIE', value: memberStats?.newbie, rate: memberStats?.newbieRate },
                    { label: 'ROOKIE', value: memberStats?.rookie, rate: memberStats?.rookieRate },
                    { label: 'CREATOR', value: memberStats?.creator, rate: memberStats?.creatorRate },
                    { label: 'LOVER', value: memberStats?.lover, rate: memberStats?.loverRate },
                    { label: 'FAN', value: memberStats?.fan, rate: memberStats?.fanRate },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#39393c]">{item.label}</span>
                      <span className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-[#232936]">{typeof item.value !== 'undefined' ? item.value : '-'}</span>
                        <span className="text-sm font-bold text-[#b0b0b8]">{typeof item.rate !== 'undefined' ? item.rate : '-'}%</span>
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-5">
                  {/* 오른쪽 5개 */}
                  {[
                    { label: 'HOLIC', value: memberStats?.holic, rate: memberStats?.holicRate },
                    { label: 'F-PEOPLE', value: memberStats?.fpeople, rate: memberStats?.fpeopleRate },
                    { label: 'VIP', value: memberStats?.vip, rate: memberStats?.vipRate },
                    { label: 'PRIME', value: memberStats?.prime, rate: memberStats?.primeRate },
                    { label: 'TRENDSETTER', value: memberStats?.trendsetter, rate: memberStats?.trendsetterRate },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#39393c]">{item.label}</span>
                      <span className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-[#232936]">{typeof item.value !== 'undefined' ? item.value : '-'}</span>
                        <span className="text-sm font-bold text-[#b0b0b8]">{typeof item.rate !== 'undefined' ? item.rate : '-'}%</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 하단 박스 */}
        <div className="bg-white rounded-xl shadow p-8 flex-1 min-h-[300px]" />
      </main>
    </div>
  );
}
