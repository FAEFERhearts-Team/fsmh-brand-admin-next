'use client';
import { useState } from 'react';
import {
  HomeIcon,
  UserIcon,
  FilmIcon,
  BuildingStorefrontIcon,
  CubeIcon,
  ArrowDownTrayIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
  MegaphoneIcon,
  WrenchScrewdriverIcon,
  ExclamationCircleIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import Image from "next/image";
import React from 'react';
import Link from "next/link";

const sidebarMenus = [
  {
    label: '대시보드',
    icon: <HomeIcon className="w-4 h-4 text-[#b0b0b8]" />,
    path: '/',
    isDashboard: true,
  },
  {
    label: '사용자 관리',
    icon: <UserIcon className="w-6 h-6 text-[#b0b0b8]" />,
    children: [
      { label: '일반회원 관리', path: '/users' },
      { label: '탈퇴회원 관리', path: '/users/withdrawal' },
      { label: '브랜드회원 관리', path: '/users/brand' },
    ],
  },
  {
    label: '컨텐츠 관리',
    icon: <FilmIcon className="w-6 h-6 text-[#b0b0b8]" />,
    children: [
      { label: '피드 관리', path: '/content/feed' },
      { label: '피드 추가', path: '/content/feed/add' },
      { label: '관심스타일 관리', path: '/content/style' },
      { label: '체형 관리', path: '/content/body' },
      { label: '검색 인기 키워드 관리', path: '/content/keyword' },
    ],
  },
  {
    label: '브랜드 관리',
    icon: <BuildingStorefrontIcon className="w-6 h-6 text-[#b0b0b8]" />,
    children: [
      { label: '브랜드 리스트', path: '/brand/list' },
      { label: '브랜드 추가', path: '/brand/add' },
      { label: '브랜드 신청 관리', path: '/brand/request' },
    ],
  },
  {
    label: '상품 관리',
    icon: <CubeIcon className="w-6 h-6 text-[#b0b0b8]" />,
    children: [
      { label: '상품 관리', path: '/product' },
      { label: '피드 연결상품 관리', path: '/product/feed-link' },
      { label: '카테고리 정보', path: '/product/category' },
    ],
  },
  {
    label: '상품 등록',
    icon: <ArrowDownTrayIcon className="w-6 h-6 text-[#b0b0b8]" />,
    children: [
      { label: '상품 등록', path: '/product/add' },
    ],
  },
  {
    label: '주문 관리',
    icon: <CurrencyDollarIcon className="w-6 h-6 text-[#b0b0b8]" />,
    children: [
      { label: '전체', path: '/order/all' },
      { label: '새로운 주문', path: '/order/new' },
      { label: '준비중', path: '/order/ready' },
      { label: '배송중', path: '/order/shipping' },
      { label: '배송완료', path: '/order/done' },
      { label: '취소/반품/교환', path: '/order/cancel' },
    ],
  },
  {
    label: '정산 관리',
    icon: <CalculatorIcon className="w-6 h-6 text-[#b0b0b8]" />,
    children: [
      { label: '패퍼하츠 정산', path: '/settle/paperhearts' },
      { label: '브랜드 정산', path: '/settle/brand' },
      { label: '사용자 정산', path: '/settle/user' },
    ],
  },
  {
    label: '마케팅/이벤트',
    icon: <MegaphoneIcon className="w-6 h-6 text-[#b0b0b8]" />,
    children: [
      { label: '배너 관리', path: '/marketing/banner' },
      { label: '패퍼하츠 이벤트', path: '/marketing/event' },
      { label: '브랜드 스토리', path: '/marketing/story' },
      { label: '브랜드 이벤트', path: '/marketing/brand-event' },
    ],
  },
  {
    label: '서비스 관리',
    icon: <WrenchScrewdriverIcon className="w-6 h-6 text-[#b0b0b8]" />,
    children: [
      { label: 'FAQ 관리', path: '/service/faq' },
      { label: '공지사항관리', path: '/service/notice' },
      { label: '1:1문의 관리', path: '/service/qna' },
      { label: '약관/정책 관리', path: '/service/policy' },
      { label: '서비스 이용안내 관리', path: '/service/guide' },
      { label: '검색창 Placeholder', path: '/service/placeholder' },
    ],
  },
  {
    label: '신고 관리',
    icon: <ExclamationCircleIcon className="w-6 h-6 text-[#b0b0b8]" />,
    children: [
      { label: '전체', path: '/report/all' },
      { label: '미처리', path: '/report/pending' },
      { label: '처리중', path: '/report/processing' },
      { label: '처리완료', path: '/report/done' },
    ],
  },
  {
    label: '환경설정',
    icon: <Cog6ToothIcon className="w-6 h-6 text-[#b0b0b8]" />,
    children: [
      { label: '기본설정', path: '/setting/basic' },
      { label: '관리자 회원 관리', path: '/setting/admin' },
    ],
  },
  {
    label: '약관, 정책, 이용안내',
    icon: <InformationCircleIcon className="w-6 h-6 text-[#b0b0b8]" />,
    children: [
      { label: '판매자 약관', path: '/policy/seller' },
      { label: '개인정보 처리방침', path: '/policy/privacy' },
      { label: '서비스 이용약관', path: '/policy/terms' },
      { label: '서비스 등급/수수료 안내', path: '/policy/fee' },
    ],
  },
];

const devMenu = {
  label: '개발서버로 이동',
  icon: <ArrowTopRightOnSquareIcon className="w-4 h-4 text-[#b0b0b8]" />,
  path: 'https://dev.fsmh.co.kr',
  isExternal: true,
};

export default function Sidebar() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activePath, setActivePath] = useState<string | null>(null);

  const handleToggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <aside className="w-56 bg-[#111216] text-white flex flex-col py-8 px-3 min-h-screen">
      {/* 로고 */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <Image src="/admin_logo.webp" alt="FAEFER" width={120} height={32} className="bg-[#000000] rounded" />
      </div>
      <nav className="flex flex-col gap-1">
        {/* 대시보드 메뉴 */}
        <div className="mb-1">
          <a
            href={sidebarMenus[0].path}
            className="flex items-center w-full px-4 py-3 rounded-xl transition font-bold text-[13px] text-[#a3aed1] hover:bg-[#18191d]"
          >
            <span className="mr-3">{sidebarMenus[0].icon}</span>
            <span className="flex-1 text-left">{sidebarMenus[0].label}</span>
          </a>
        </div>
        {/* 나머지 메뉴 */}
        {sidebarMenus.slice(1).map((menu, idx) => (
          <div key={menu.label} className="mb-1">
            <button
              className={`flex items-center w-full px-4 py-3 rounded-xl transition font-bold text-[13px] text-[#a3aed1] ${openIndex === idx ? 'bg-[#18191d]' : 'bg-transparent'} hover:bg-[#18191d]'}`}
              onClick={() => handleToggle(idx)}
              type="button"
            >
              <span className="mr-3">{menu.icon && React.cloneElement(menu.icon, { className: 'w-4 h-4 text-[#b0b0b8]' })}</span>
              <span className="flex-1 text-left">{menu.label}</span>
              <span className="ml-2">
                {openIndex === idx ? (
                  <ChevronUpIcon className="w-4 h-4 text-[#b0b0b8]" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 text-[#b0b0b8]" />
                )}
              </span>
            </button>
            {/* 서브메뉴 */}
            {menu.children && (
              <div
                className={`overflow-hidden transition-all duration-300 ${openIndex === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <ul className="pl-7 py-2 flex flex-col gap-1">
                  {menu.children.map((child) => (
                    <li key={child.label}>
                      <Link
                        href={child.path}
                        className={`flex items-center w-full text-left px-2 py-2 rounded-lg text-[#a3aed1] hover:text-white hover:bg-[#18191d] transition text-[13px] font-semibold ${activePath === child.path ? 'bg-[#18191d] text-white' : ''}`}
                        onClick={() => setActivePath(child.path)}
                      >
                        <span className="mr-2 text-xs">●</span>
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        {/* 구분선 */}
        <div className="border-t border-[#23242a] mt-auto mb-2" />
        {/* 하단 개발서버로 이동 */}
        <div>
          <a
            href={devMenu.path}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full px-4 py-3 rounded-xl transition font-bold text-[13px] text-[#a3aed1] hover:bg-[#18191d]"
          >
            <span className="mr-3">{devMenu.icon}</span>
            <span className="flex-1 text-left">{devMenu.label}</span>
          </a>
        </div>
      </nav>
    </aside>
  );
} 