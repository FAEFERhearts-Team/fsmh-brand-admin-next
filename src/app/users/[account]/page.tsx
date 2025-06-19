"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import CommentList from "@/components/CommentList";
import DataTable from "react-data-table-component";

type UserDetail = {
  m_id: number;
  m_account: string;
  m_phone_number: string;
  m_nickname: string;
  m_join_type: string;
  m_intro: string | null;
  m_name: string;
  gender: string | null;
  age: string | null;
  favorite_fit: string | null;
  m_image_url: string | null;
  m_birth: string | null;
  m_activation: number;
  m_height: number;
  m_weight: number;
  m_chest: number;
  m_shoulder: number;
  m_waist: number;
  m_hip: number;
  m_top: number;
  m_bottom: number;
  m_body_type: string | null;
  m_agree_to_email: number;
  m_agree_to_sms: number;
  m_agree_to_service: number;
  m_agree_to_ad: number;
  m_cdate: string;
  styles: string[];
  grade_level: number | null;
};

type FeedItem = {
  feedId: number;
  thumbnailUrl: string | null;
  starPoints: number;
  shortDescription: string | null;
  title: string | null;
  memberUserId: number;
  gender: string | null;
  createdDate: string;
  updatedDate: string;
  view_counter: number;
  likeCount: number;
  totalCommentCount: number;
  streamingURL: string | null;
  videoFilename: string | null;
  creatorNickname: string;
  feedStatus: number;
  is_deleted: number;
  music_title: string | null;
  music_artist: string | null;
  music_song_id: string | null;
  music_album: string | null;
  image_server_file_name?: string | null;
  creatorImageUrl?: string | null;
};

const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"), { ssr: false });

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const customStyles = {
  pagination: {
    style: {
      justifyContent: 'flex-end',
      padding: '16px 0 0 0',
    },
  },
  rowsPerPage: {
    style: {
      justifyContent: 'flex-start',
    },
  },
  headRow: {
    style: {
      backgroundColor: '#eeeeee',
    },
  },
  cells: {
    style: {
      justifyContent: 'center',
      textAlign: 'center' as const,
    },
  },
  headCells: {
    style: {
      justifyContent: 'center',
      textAlign: 'center' as const,
    },
  },
};

function CustomFooter({
  page,
  pageSize,
  total,
  setPage,
  setPageSize,
}: {
  page: number;
  pageSize: number;
  total: number;
  setPage: (p: number) => void;
  setPageSize: (ps: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const displayStart = total === 0 || start > end ? 0 : start;
  const displayEnd = total === 0 || start > end ? 0 : end;
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages, setPage]);

  return (
    <div className="flex flex-row items-center justify-between w-full mt-4 px-2">
      <div className="flex items-center gap-2">
        <select
          className="border border-[#e0e6ed] rounded px-2 py-1 text-sm focus:outline-none"
          value={pageSize}
          onChange={e => setPageSize(Number(e.target.value))}
        >
          {[10, 25, 50].map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <span className="text-sm text-gray-700">개의 게시물 보기</span>
      </div>
      <div className="text-sm text-gray-500">
        총 {total}개 중 {displayStart}~{displayEnd}개 표시
      </div>
      <div className="flex items-center gap-2">
        <button
          className={`px-3 py-1 rounded border border-[#e0e6ed] font-bold text-xs ${page === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-[#232936] cursor-pointer'}`}
          onClick={() => page > 1 && setPage(page - 1)}
          disabled={page === 1}
        >
          &laquo;
        </button>
        {pageNumbers.map((num) => (
          <button
            key={num}
            className={`px-3 py-1 rounded border border-[#e0e6ed] font-bold text-xs ${num === page ? 'bg-[#000000] text-[#ffffff]' : 'bg-white text-[#232936]'} cursor-pointer`}
            onClick={() => setPage(num)}
          >
            {num}
          </button>
        ))}
        <button
          className={`px-3 py-1 rounded border border-[#e0e6ed] font-bold text-xs ${page === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-[#232936] cursor-pointer'}`}
          onClick={() => page < totalPages && setPage(page + 1)}
          disabled={page === totalPages}
        >
          &raquo;
        </button>
      </div>
    </div>
  );
}

function getAgeLabel(age: string | null): string {
  switch (age) {
    case "TEEN": return "10대";
    case "TWENTY": return "20대";
    case "THIRTY": return "30대";
    case "FORTY": return "40대";
    case "FIFTY": return "50대";
    case "0": return "";
    default: return age ? "에러" : "";
  }
}
function getFitLabel(fit: string | null): string {
  switch (fit) {
    case "SLIM": return "슬림핏";
    case "SEMI_SLIM": return "세미슬림핏";
    case "REGULAR": return "정핏";
    case "SEMI_OVER": return "세미오버핏";
    case "OVER": return "오버핏";
    case null: return "";
    default: return fit ? "에러" : "";
  }
}
function getGenderLabel(gender: string | null): string {
  if (gender === "M") return "남성";
  if (gender === "F") return "여성";
  if (gender === null) return "";
  return "에러";
}

function displayValueWithUnit(val: number | null, unit: string) {
  if (!val || val === 0) return '-';
  return `${val}${unit}`;
}
function displaySize(val: number | string | null) {
  if (!val || val === 0) return '-';
  if (typeof val === 'string') return val.replace(/^SIZE/i, '');
  return val;
}

function getBodyTypeLabel(type: string | null): string {
  if (type === "RECTANGLE") return "#직사각형";
  if (type === "HOURGLASS") return "#모래시계형";
  if (type === "INVERTED_TRIANGLE") return "#역삼각형";
  if (type === "TRIANGLE") return "#삼각형";
  if (type === "ROUND") return "#둥근형";
  return "N/A";
}

function isValidDate(str: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str);
  return d instanceof Date && !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === str;
}

// 좋아요 데이터 타입 정의
interface LikeItem {
  feed_id: number;
  title: string;
  nickname: string;
  account: string;
  created_at: string;
  like_count: number;
}

// 저장 데이터 타입 정의
// interface SaveItem { ... } // 이 부분 전체 삭제

// 댓글 데이터 타입 정의

// 조회수 데이터 타입 정의
interface ViewItem {
  f_id: number;
  f_title: string;
  createdDate: string;
  f_view_count: number | null;
}


type ModalComment = {
  comment_id: number;
  content: string;
  parent_comment_id: number | null;
  created_at: string;
  member_user_id: number;
  nickname: string;
  image_url: string | null; // ensure this field exists for compatibility with CommentList
  replies: ModalComment[];
};

export default function UserDetailPage() {
  const { account } = useParams();
  const [activeTab, setActiveTab] = React.useState(0);
  const [user, setUser] = React.useState<UserDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  // 피드 관련 상태
  const [feeds, setFeeds] = React.useState<FeedItem[]>([]);
  const [feedsLoading, setFeedsLoading] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalFeed, setModalFeed] = React.useState<FeedItem | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [gradeList, setGradeList] = React.useState<{grade_id:number, name:string}[]>([]);
  const [gradeModalOpen, setGradeModalOpen] = React.useState(false);
  const [selectedGrade, setSelectedGrade] = React.useState<number | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [likes, setLikes] = React.useState<LikeItem[]>([]);
  const [likesLoading, setLikesLoading] = React.useState(false);
  const [likesPage, setLikesPage] = React.useState(1);
  const [likesPageSize, setLikesPageSize] = React.useState(PAGE_SIZE_OPTIONS[0]);
  const [likesTotal, setLikesTotal] = React.useState(0);
  const [views, setViews] = React.useState<ViewItem[]>([]);
  const [viewsLoading, setViewsLoading] = React.useState(false);
  const [viewsPage, setViewsPage] = React.useState(1);
  const [viewsPageSize, setViewsPageSize] = React.useState(PAGE_SIZE_OPTIONS[0]);
  const [viewsTotal, setViewsTotal] = React.useState(0);
  const [blockModalOpen, setBlockModalOpen] = React.useState(false);
  const [blockReason, setBlockReason] = React.useState('');
  const [blockLoading, setBlockLoading] = React.useState(false);
  const [blockSuccessModal, setBlockSuccessModal] = React.useState(false);
  const [blockModalClosing, setBlockModalClosing] = React.useState(false);
  const [blockSuccessModalClosing, setBlockSuccessModalClosing] = React.useState(false);
  const [showBlockReasonError, setShowBlockReasonError] = React.useState(false);
  const [unblockModalOpen, setUnblockModalOpen] = React.useState(false);
  const [unblockReason, setUnblockReason] = React.useState("");
  const [showUnblockReasonError, setShowUnblockReasonError] = React.useState(false);
  const [activationModalOpen, setActivationModalOpen] = useState(false);

  // 댓글 관련 상태 통합 관리
  const [comments, setComments] = React.useState<ModalComment[]>([]);
  const [commentsLoading, setCommentsLoading] = React.useState(false);
  const [commentsError, setCommentsError] = React.useState<string | null>(null);
  const [commentsPage, setCommentsPage] = React.useState(1);
  const [commentsTotal, setCommentsTotal] = React.useState(0);

  // 1. 모달 내 댓글 영역 위에 탭 UI 추가
  // 2. 탭 상태 관리 및 fetchComments 호출 시 tab 파라미터 반영
  const [commentTab, setCommentTab] = React.useState<'live' | 'deleted'>('live');

  // Add effect to handle body scroll
  React.useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modalOpen]);

  const fetchFeeds = React.useCallback(() => {
    if (activeTab !== 0 || !account) return;
    if (feeds.length === 0) setFeedsLoading(true);
    const params = [];
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    const query = params.length ? `?${params.join('&')}` : '';
    fetch(`/api/users/${account}/feeds${query}`)
      .then(res => res.json())
      .then(data => {
        setFeeds(data.feeds || []);
        setFeedsLoading(false);
      })
      .catch(() => setFeeds([]));
  }, [activeTab, account, startDate, endDate, feeds.length]);

  React.useEffect(() => {
    if (activeTab !== 0 || !account) return;
    fetchFeeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, account]);

  const handlePeriodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate && !isValidDate(startDate)) {
      alert("시작 날짜가 올바르지 않습니다. (YYYY-MM-DD)");
      return;
    }
    if (endDate && !isValidDate(endDate)) {
      alert("종료 날짜가 올바르지 않습니다. (YYYY-MM-DD)");
      return;
    }
    fetchFeeds();
  };

  React.useEffect(() => {
    if (!account) return;
    fetch(`/api/users/${account}`)
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [account]);

  React.useEffect(() => {
    fetch('/api/member-grades')
      .then(res => res.json())
      .then(data => setGradeList(data.grades || []));
  }, []);

  React.useEffect(() => {
    if (gradeModalOpen && user) {
      setSelectedGrade(user.grade_level ?? null);
      setErrorMsg(null);
    }
  }, [gradeModalOpen, user]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/[^0-9]/g, '');
    if (v.length > 4) v = v.slice(0,4) + '-' + v.slice(4);
    if (v.length > 7) v = v.slice(0,7) + '-' + v.slice(7);
    v = v.slice(0,10);
    setStartDate(v);
  };
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/[^0-9]/g, '');
    if (v.length > 4) v = v.slice(0,4) + '-' + v.slice(4);
    if (v.length > 7) v = v.slice(0,7) + '-' + v.slice(7);
    v = v.slice(0,10);
    setEndDate(v);
  };



  // 댓글 페이지 보정
  React.useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(commentsTotal / PAGE_SIZE_OPTIONS[0]));
    if (commentsPage > totalPages) {
      setCommentsPage(1);
    }
  }, [commentsPage, commentsTotal]);

  function getGradeName(grade_level: number | null | undefined) {
    if (!grade_level) return '-';
    const found = gradeList.find(g => g.grade_id === Number(grade_level));
    return found ? found.name : '-';
  }

  async function handleSaveGrade() {
    if (!user || !selectedGrade) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/users/${user.m_account}/grade`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade_level: selectedGrade }),
      });
      if (!res.ok) throw new Error('등급 변경 실패');
      setUser(prev => prev ? { ...prev, grade_level: selectedGrade } : prev);
      setGradeModalOpen(false);
    } catch {
      setErrorMsg('등급 변경에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  // 좋아요 데이터 fetch 함수
  const fetchLikes = React.useCallback((): void => {
    if (activeTab !== 1 || !account) return;
    setLikesLoading(true);
    const params = [];
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    params.push(`page=${likesPage}`);
    params.push(`pageSize=${likesPageSize}`);
    const query = params.length ? `?${params.join('&')}` : '';
    fetch(`/api/users/${account}/likes${query}`)
      .then(res => res.json())
      .then(data => {
        setLikes(data.likes || []);
        setLikesTotal(data.total || 0);
        setLikesLoading(false);
      })
      .catch(() => {
        setLikes([]);
        setLikesTotal(0);
        setLikesLoading(false);
      });
  }, [activeTab, account, startDate, endDate, likesPage, likesPageSize]);

  React.useEffect(() => {
    if (activeTab !== 1 || !account) return;
    fetchLikes();
  }, [activeTab, account, startDate, endDate, likesPage, likesPageSize, fetchLikes]);

  // 좋아요 페이지 보정
  React.useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(likesTotal / likesPageSize));
    if (likesPage > totalPages) {
      setLikesPage(1);
    }
  }, [likesPage, likesTotal, likesPageSize]);

  const likeColumns = [
    {
      name: '#',
      selector: (row: LikeItem, idx?: number) => likesTotal - ((likesPage - 1) * likesPageSize + (idx ?? 0)),
      width: '80px',
      centered: true,
    },
    {
      name: '제목',
      selector: (row: LikeItem) => row.title,
      wrap: true,
      grow: 2,
      centered: true,
    },
    {
      name: '피드주인',
      cell: (row: LikeItem) => (
        <div style={{ minWidth: '120px' }}>
          <div style={{ fontWeight: 700 }}>{row.nickname}</div>
          <div style={{ color: '#888', fontSize: 12 }}>{row.account}</div>
        </div>
      ),
      centered: true,
    },
    {
      name: '날짜',
      selector: (row: LikeItem) => row.created_at?.slice(0, 10),
      width: '150px',
      centered: true,
    },
    {
      name: '좋아요 수',
      selector: (row: LikeItem) => row.like_count,
      width: '100px',
      centered: true,
    },
  ];

  // 댓글 데이터 fetch 함수
  const fetchComments = React.useCallback(async (feedId: number, tab: 'live' | 'deleted' = 'live') => {
    try {
      setCommentsLoading(true);
      setCommentsError(null);
      const url = `/api/feeds/${feedId}/comment?tab=${tab}`;
      console.log('fetch URL:', url);
      const response = await fetch(url);
      const data = await response.json();
      setComments(data.comments || []);
      setCommentsTotal(data.total || 0);
    } catch (error) {
      setCommentsError(error instanceof Error ? error.message : '댓글을 불러오는데 실패했습니다.');
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  // 탭 변경 시 댓글 새로 fetch
  React.useEffect(() => {
    if (modalOpen && modalFeed?.feedId) {
      fetchComments(modalFeed.feedId, commentTab);
    }
  }, [modalOpen, modalFeed, commentTab, fetchComments]);

  // 댓글 페이지 보정
  React.useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(commentsTotal / PAGE_SIZE_OPTIONS[0]));
    if (commentsPage > totalPages) {
      setCommentsPage(1);
    }
  }, [commentsPage, commentsTotal]);



  React.useEffect(() => {
    if (activeTab === 3) {
      console.log('DataTable에 전달되는 comments:', comments);
      if (comments.length > 0) {
        console.log('첫번째 row:', comments[0]);
      }
    }
  }, [activeTab, comments]);

  // 조회수 데이터 fetch 함수
  const fetchViews = React.useCallback((): void => {
    if (activeTab !== 4 || !account) return;
    setViewsLoading(true);
    const params = [];
    params.push(`account=${account}`);
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    params.push(`page=${viewsPage}`);
    params.push(`pageSize=${viewsPageSize}`);
    const query = params.length ? `?${params.join('&')}` : '';
    fetch(`/api/users/views${query}`)
      .then(res => res.json())
      .then(data => {
        setViews(data.views || []);
        setViewsTotal(data.total || 0);
        setViewsLoading(false);
      })
      .catch(() => {
        setViews([]);
        setViewsTotal(0);
        setViewsLoading(false);
      });
  }, [activeTab, account, startDate, endDate, viewsPage, viewsPageSize]);

  React.useEffect(() => {
    if (activeTab !== 4 || !account) return;
    fetchViews();
  }, [activeTab, account, startDate, endDate, viewsPage, viewsPageSize, fetchViews]);

  // 조회수 페이지 보정
  React.useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(viewsTotal / viewsPageSize));
    if (viewsPage > totalPages) {
      setViewsPage(1);
    }
  }, [viewsPage, viewsTotal, viewsPageSize]);

  const viewColumns = [
    {
      name: '#',
      selector: (row: ViewItem, idx?: number) => viewsTotal - ((viewsPage - 1) * viewsPageSize + (idx ?? 0)),
      width: '80px',
      centered: true,
    },
    {
      name: '제목',
      selector: (row: ViewItem) => row.f_title,
      wrap: true,
      grow: 2,
      centered: true,
    },
    {
      name: '날짜',
      selector: (row: ViewItem) => row.createdDate?.slice(0, 10),
      width: '150px',
      centered: true,
    },
    {
      name: '조회수',
      selector: (row: ViewItem) => (row.f_view_count ? row.f_view_count : 0),
      width: '100px',
      centered: true,
    },
  ];

  async function handleBlockAccount() {
    if (!user || !blockReason.trim()) return;
    setBlockLoading(true);
    try {
      const res = await fetch(`/api/users/${user.m_account}/block`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: blockReason, blocked_by: 1 }), // TODO: blocked_by는 실제 로그인 유저 id로 교체
      });
      const data = await res.json();
      if (data.success) {
        setBlockModalOpen(false);
        setBlockSuccessModal(true);
      } else {
        alert('차단에 실패했습니다: ' + (data.error || '')); // 필요시 UX 개선
      }
    } catch (e) {
      alert('차단 중 오류 발생: ' + e);
    } finally {
      setBlockLoading(false);
    }
  }

  // 모달 닫기 애니메이션 핸들러
  function closeBlockModalWithAnim() {
    setBlockModalClosing(true);
    setTimeout(() => {
      setBlockModalOpen(false);
      setBlockModalClosing(false);
    }, 400);
  }
  function closeBlockSuccessModalWithAnim() {
    setBlockSuccessModalClosing(true);
    setTimeout(() => {
      setBlockSuccessModal(false);
      setBlockSuccessModalClosing(false);
    }, 400);
  }

  // 모달이 열릴 때 image_server_file_name 콘솔 출력
  React.useEffect(() => {
    if (modalOpen && modalFeed) {
      console.log('image_server_file_name:', modalFeed.image_server_file_name);
    }
  }, [modalOpen, modalFeed]);

  if (loading) return <div className="p-10">로딩중...</div>;
  if (!user) return <div className="p-10">회원 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="w-full px-4 mt-4 mb-8">
      <div className="text-lg font-bold text-gray-800 mb-6 flex items-center">
        <span className="w-1.5 h-5 rounded bg-gradient-to-b from-[#7f8fff] to-[#f5b942] mr-3" />
        회원정보
      </div>
      <div className="w-full bg-white rounded-xl p-4 border border-[#f0f0f0] flex flex-row items-center gap-8">
        {/* 프로필사진 */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#e0e6ed] bg-gray-100 flex items-center justify-center">
            <Image
              src={typeof user.m_image_url === 'string' && user.m_image_url ? user.m_image_url : "/defaultProfilePicture.png"}
              alt="프로필사진"
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
        {/* 정보 */}
        <div className="flex flex-col flex-1 max-h-[128px]">
          <div className="flex flex-row items-center gap-2">
            <div className="text-xl font-bold text-gray-800">{user.m_nickname} / {user.m_name} /</div>
            <button
              className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-base font-semibold hover:bg-gray-200 transition cursor-pointer"
              onClick={() => setGradeModalOpen(true)}
            >
              #{getGradeName(user.grade_level)}
            </button>
          </div>
          <div className="text-gray-500 text-sm mb-1">{user.m_account}</div>
          {user.m_intro && (
            <>
              <div className="text-sm font-bold text-gray-700">자기소개</div>
              <div className="text-sm text-gray-700 whitespace-pre-line min-h-[40px]">{user.m_intro}</div>
            </>
          )}
        </div>
        {/* 계정차단 버튼 */}
        <div className="flex flex-col items-center justify-center h-full">
          {user.m_activation === 0 ? (
            <button
              className="bg-[rgb(34,197,139)] hover:bg-[rgb(20,160,110)] text-white font-bold px-5 py-2.5 rounded-md shadow text-[90%] cursor-pointer flex items-center gap-2"
              onClick={() => setUnblockModalOpen(true)}
            >
              <span className="font-bold text-lg">O</span> 차단해제
            </button>
          ) : (
            <button
              className="bg-[rgb(230,83,60)] hover:bg-[rgb(200,60,40)] text-white font-bold px-5 py-2.5 rounded-md shadow text-[90%] cursor-pointer"
              onClick={() => setBlockModalOpen(true)}
            >
              X 계정차단
            </button>
          )}
        </div>
      </div>
      {/* 80%/20% 카드 섹션 */}
      <div className="flex flex-row gap-6 mt-8">
        {/* 왼쪽 75% 카드 */}
        <div className="bg-white rounded-xl py-4 border border-[#f0f0f0] flex-1 min-w-0" style={{ flexBasis: '75%' }}>
          <div className="flex flex-col">
            <div className="font-bold text-lg text-gray-800 px-4">활동내역</div>
            <div className="border-b border-[#eeeeee] w-full mt-2" />
          </div>
          {/* 활동내역 탭 & 기간설정 */}
          <div className="flex flex-row items-center justify-between px-4 mt-4">
            {/* 탭 */}
            <div className="flex flex-row gap-2">
              {['게시물','좋아요','저장','댓글','조회 수','수익 정보'].map((tab, idx) => (
                <button
                  key={tab}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition
                    ${activeTab === idx ? 'bg-[#000000] text-white border-[#000000]' : 'bg-white text-gray-600 border-[#e0e6ed] hover:bg-[#f5f6fa]'} cursor-pointer`}
                  onClick={() => setActiveTab(idx)}
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* 기간설정 */}
            <form className="flex flex-row items-center gap-2" onSubmit={handlePeriodSubmit}>
              <label className="text-sm text-gray-700 font-semibold mr-1">기간</label>
              <input
                type="text"
                value={startDate}
                onChange={handleStartDateChange}
                placeholder="YYYY-MM-DD"
                className="border border-[#e0e6ed] rounded px-2 py-1 w-[110px] text-sm focus:outline-none focus:ring-2 focus:ring-[#7f8fff] placeholder-[#999999]"
              />
              <span className="mx-1 text-gray-400">~</span>
              <input
                type="text"
                value={endDate}
                onChange={handleEndDateChange}
                placeholder="YYYY-MM-DD"
                className="border border-[#e0e6ed] rounded px-2 py-1 w-[110px] text-sm focus:outline-none focus:ring-2 focus:ring-[#7f8fff] placeholder-[#999999]"
              />
              <button
                type="submit"
                className={`ml-2 px-4 py-1.5 rounded bg-[#7f8fff] text-white font-semibold text-sm shadow transition disabled:bg-[#e0e6ed] disabled:text-gray-400 cursor-pointer`}
                disabled={!startDate && !endDate}
              >
                적용
              </button>
            </form>
          </div>
          <hr className="my-4 border-[#eeeeee]" />
          {/* 탭별 컨텐츠 영역 */}
          <div className="px-4 min-h-[120px]">
            {/* 게시물 탭 */}
            {activeTab === 0 && (
              feedsLoading && feeds.length === 0 ? (
                <div className="text-gray-400 text-center py-8">로딩중...</div>
              ) : feeds.length === 0 ? (
                <div className="text-gray-400 text-center py-8">게시물이 없습니다.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {feeds.map(feed => {
                    console.log('Feed status:', { feedId: feed.feedId, is_deleted: feed.is_deleted });
                    return (
                    <div key={feed.feedId} className="bg-white rounded-xl border border-[#f0f0f0] flex flex-col overflow-hidden">
                      {/* 상단 바 */}
                      <div className="flex flex-row items-center justify-between px-4 pt-4 pb-4">
                        <div className="flex items-center gap-2">
                          <span className="w-1 h-4 rounded bg-gradient-to-b from-[#7f8fff] to-[#f5b942] mr-2" />
                          <span className="text-md font-extrabold text-[#000000]">{feed.creatorNickname}</span>
                        </div>
                        <span className="text-sm text-gray-500 font-semibold">{feed.createdDate.slice(0, 10)}</span>
                      </div>
                      {/* 썸네일 */}
                      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                        {feed.thumbnailUrl ? (
                          <Image
                            src={feed.thumbnailUrl}
                            alt="썸네일"
                            width={400}
                            height={400}
                            className="object-cover w-full h-full cursor-pointer"
                            onClick={() => {
                              fetch(`/api/feeds/${feed.feedId}/video`)
                                .then(res => res.json())
                                .then(data => {
                                  setModalFeed(data.feed || feed);
                                  setModalOpen(true);
                                })
                                .catch(() => {
                                  setModalFeed(feed);
                                  setModalOpen(true);
                                });
                            }}
                          />
                        ) : (
                          <span className="text-gray-300">No Image</span>
                        )}
                      </div>
                      {/* 본문 */}
                      <div className="flex flex-col gap-1 px-4 py-2">
                        <div className="font-bold text-base text-gray-900 truncate">{feed.title || '-'}</div>
                        {feed.shortDescription && (
                          <div className="text-sm text-gray-600 truncate">{feed.shortDescription}</div>
                        )}
                        {/* 활성화 상태 표시 */}
                        <div className={`mt-2 inline-block px-2 py-1 rounded-full text-white text-xs font-bold ${
                          Number(feed.is_deleted) === 1 
                            ? 'bg-[#e6533c]' 
                            : 'bg-[#22c58b]'
                        }`}>
                          {Number(feed.is_deleted) === 1 ? '비활성화' : '활성화'}
                        </div>
                      </div>
                      {/* 음원정보 */}
                      <div className="px-4 pb-2 text-xs">
                        <div className="font-semibold text-gray-700">음원정보(Song ID / 앨범명)</div>
                        <div className="text-[13px]">
                          <span className={feed.music_song_id ? '' : 'text-[#fc0000]'}>{feed.music_song_id || '추출안됨'}</span>
                          <span> / </span>
                          <span className={feed.music_album ? '' : 'text-[#fc0000]'}>{feed.music_album || '추출안됨'}</span>
                        </div>
                        <div className="font-semibold text-gray-700 mt-1">음원정보(곡 / 가수)</div>
                        <div className="text-[13px]">
                          <span className={feed.music_title ? '' : 'text-[#fc0000]'}>{feed.music_title || '추출안됨'}</span>
                          <span> / </span>
                          <span className={feed.music_artist ? '' : 'text-[#fc0000]'}>{feed.music_artist || '추출안됨'}</span>
                        </div>
                      </div>
                      {/* 통계 */}
                      <div className="flex flex-row items-center gap-4 px-4 pb-3 pt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> {feed.view_counter}</span>
                        <span className="flex items-center gap-1 text-[#e6533c]"><svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.293l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.035l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg> {feed.likeCount}</span>
                        <span className="flex items-center gap-1"><svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2h2m10-4v4m0 0V4m0 4H7m10 0H7" /></svg> {feed.totalCommentCount}</span>
                        {/* 저장(북마크) 카운트는 예시, 실제 데이터 연동 필요 */}
                        {/* <span className="flex items-center gap-1"><svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" /></svg> 0</span> */}
                      </div>
                    </div>
                  );
                })}
                </div>
              )
            )}
            {activeTab === 1 && (
              <div className="w-full">
                <DataTable
                  columns={likeColumns}
                  data={likes}
                  progressPending={likesLoading}
                  pagination={false}
                  highlightOnHover
                  striped
                  noDataComponent={<div className="py-8">좋아요 내역이 없습니다.</div>}
                  keyField="feed_id"
                  customStyles={customStyles}
                  className="text-center"
                />
                <CustomFooter
                  page={likesPage}
                  pageSize={likesPageSize}
                  total={likesTotal}
                  setPage={setLikesPage}
                  setPageSize={ps => { setLikesPageSize(ps); setLikesPage(1); }}
                />
              </div>
            )}
            {activeTab === 2 && (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">댓글 목록</h2>
                  <form onSubmit={handlePeriodSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={startDate}
                      onChange={handleStartDateChange}
                      placeholder="YYYY-MM-DD"
                      className="border rounded px-2 py-1"
                    />
                    <span>~</span>
                    <input
                      type="text"
                      value={endDate}
                      onChange={handleEndDateChange}
                      placeholder="YYYY-MM-DD"
                      className="border rounded px-2 py-1"
                    />
                    <button
                      type="submit"
                      className="bg-black text-white px-4 py-1 rounded hover:bg-gray-800"
                    >
                      조회
                    </button>
                  </form>
                </div>

                <CommentList
                  comments={comments}
                  loading={commentsLoading}
                  error={commentsError}
                />
              </div>
            )}
            {activeTab === 3 && (
              <div className="w-full">
                <CommentList
                  comments={comments}
                  loading={commentsLoading}
                  error={commentsError}
                />
              </div>
            )}
            {activeTab === 4 && (
              <div className="w-full">
                <DataTable
                  columns={viewColumns}
                  data={views}
                  progressPending={viewsLoading}
                  pagination={false}
                  highlightOnHover
                  striped
                  noDataComponent={<div className="py-8">조회수 내역이 없습니다.</div>}
                  keyField="f_id"
                  customStyles={customStyles}
                  className="text-center"
                />
                <CustomFooter
                  page={viewsPage}
                  pageSize={viewsPageSize}
                  total={viewsTotal}
                  setPage={setViewsPage}
                  setPageSize={ps => { setViewsPageSize(ps); setViewsPage(1); }}
                />
              </div>
            )}
          </div>
        </div>
        {/* 오른쪽 25% 카드 + 추가 카드들 */}
        <div className="flex flex-col gap-4" style={{ flexBasis: '25%', minWidth: 0 }}>
          <div className="bg-white rounded-xl py-4 border border-[#f0f0f0]">
            <div className="flex flex-col">
              <div className="font-bold text-lg text-gray-800 px-4">기본정보</div>
              <div className="border-b border-[#eeeeee] w-full mt-2 mb-4" />
            </div>
            <div className="px-4">
              <div className="flex flex-row gap-4 mb-2 text-[90%]">
                <div className="flex-1">
                  <span className="text-gray-500">성별: </span>
                  <span className="font-medium text-gray-800">{getGenderLabel(user.gender) || '-'}</span>
                </div>
                <div className="flex-1">
                  <span className="text-gray-500">연령대: </span>
                  <span className="font-medium text-gray-800">{getAgeLabel(user.age)}</span>
                </div>
              </div>
              <div className="flex flex-row gap-4 text-[90%]">
                <div className="flex-1">
                  <span className="text-gray-500">선호하는 핏: </span>
                  <span className="font-medium text-gray-800">{getFitLabel(user.favorite_fit)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl py-4 border border-[#f0f0f0]">
            <div className="flex flex-col">
              <div className="font-bold text-lg text-gray-800 px-4">신체정보</div>
              <div className="border-b border-[#eeeeee] w-full mt-2 mb-4" />
            </div>
            <div className="px-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[90%]">
                <div><span className="text-gray-500">키: </span><span className="font-medium text-gray-800">{displayValueWithUnit(user.m_height, 'cm')}</span></div>
                <div><span className="text-gray-500">몸무게: </span><span className="font-medium text-gray-800">{displayValueWithUnit(user.m_weight, 'kg')}</span></div>
                <div><span className="text-gray-500">상의 사이즈: </span><span className="font-medium text-gray-800">{displaySize(user.m_top)}</span></div>
                <div><span className="text-gray-500">하의 사이즈: </span><span className="font-medium text-gray-800">{displaySize(user.m_bottom)}</span></div>
                <div><span className="text-gray-500">어깨너비: </span><span className="font-medium text-gray-800">{displayValueWithUnit(user.m_shoulder, 'cm')}</span></div>
                <div><span className="text-gray-500">가슴둘레: </span><span className="font-medium text-gray-800">{displayValueWithUnit(user.m_chest, 'cm')}</span></div>
                <div><span className="text-gray-500">허리둘레: </span><span className="font-medium text-gray-800">{displayValueWithUnit(user.m_waist, 'cm')}</span></div>
                <div><span className="text-gray-500">엉덩이둘레: </span><span className="font-medium text-gray-800">{displayValueWithUnit(user.m_hip, 'cm')}</span></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl py-4 border border-[#f0f0f0]">
            <div className="flex flex-col">
              <div className="font-bold text-lg text-gray-800 px-4">체형</div>
              <div className="border-b border-[#eeeeee] w-full mt-2" />
            </div>
            <div className="px-4">
              <div className="text-[90%] py-2 mt-4 text-gray-800">
                {getBodyTypeLabel(user.m_body_type)}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl py-4 border border-[#f0f0f0]">
            <div className="flex flex-col">
              <div className="font-bold text-lg text-gray-800 px-4">관심 스타일</div>
              <div className="border-b border-[#eeeeee] w-full mt-2" />
            </div>
            <div className="px-4">
              <div className="text-[90%] py-2 mt-4 text-gray-800">
                {user.styles && user.styles.length > 0
                  ? user.styles.map(s => `#${s}`).join(' ')
                  : '-'}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl py-4 border border-[#f0f0f0]">
            <div className="flex flex-col">
              <div className="font-bold text-lg text-gray-800 px-4">마케팅/푸시알람/성인인증 동의</div>
              <div className="border-b border-[#eeeeee] w-full mt-2" />
            </div>
            <div className="px-4">
              <div className="flex flex-col text-[90%] py-2 text-gray-800">
                <label className="flex items-center gap-2 select-none">
                  <input type="checkbox" checked={user.m_agree_to_email === 1} readOnly className="w-3 h-3 accent-[#b0b0b8]" />
                  <span>이메일 수신 동의</span>
                </label>
                <label className="flex items-center gap-2 select-none">
                  <input type="checkbox" checked={user.m_agree_to_sms === 1} readOnly className="w-3 h-3 accent-[#b0b0b8]" />
                  <span>SMS 수신 동의</span>
                </label>
                <label className="flex items-center gap-2 select-none">
                  <input type="checkbox" checked={user.m_agree_to_service === 1} readOnly className="w-3 h-3 accent-[#b0b0b8]" />
                  <span>서비스 푸시 알람 동의</span>
                </label>
                <label className="flex items-center gap-2 select-none">
                  <input type="checkbox" checked={user.m_agree_to_ad === 1} readOnly className="w-3 h-3 accent-[#b0b0b8]" />
                  <span>광고성 푸시 알람 동의</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      {modalOpen && modalFeed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }} onClick={() => { setModalOpen(false); setModalFeed(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-[80vw] h-[843px] flex flex-col overflow-hidden relative" style={{ height: 843 }} onClick={e => e.stopPropagation()}>
            {/* 상단 초록색 바 */}
            <div className={`w-full h-12 ${Number(modalFeed.is_deleted) === 1 ? 'bg-[#e6533c]' : 'bg-[#22c58b]'} flex items-center justify-center text-white font-bold text-xl tracking-wide`}>
              {Number(modalFeed.is_deleted) === 1 ? '비활성화된 피드' : '활성화된 피드'}
            </div>
            {/* 본문: 좌(비디오+음원) / 중(상세) / 우(댓글) */}
            <div className="flex flex-1 min-h-0">
              {/* 좌측: 영상 플레이어 + 음원정보 */}
              <div className="flex flex-col items-center bg-white min-w-[370px] max-w-[370px] w-[370px] h-full relative">
                {modalFeed?.streamingURL ? (
                  <div className="flex flex-col w-full">
                    <div className="w-[370px] h-[659px] overflow-hidden bg-black">
                      <VideoPlayer src={modalFeed.streamingURL} isMuted={isMuted} />
                    </div>
                    <button
                      className="absolute bottom-[180px] right-6 bg-black bg-opacity-60 rounded-full p-2 text-white hover:bg-opacity-90"
                      onClick={() => setIsMuted(m => !m)}
                    >
                      {isMuted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="3 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9v6h4l5 5V4l-5 5H9z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="3 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9v6h4l5 5V4l-5 5H9z" />
                          <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                    {/* 음원정보 */}
                    <div className="w-full bg-[#ffffff] p-4">
                      <div className="text-xs text-gray-700 mb-1 font-bold">음원정보(Song ID / 앨범)</div>
                      <div className="text-xs mb-2">
                        <span className={modalFeed.music_song_id ? '' : 'text-[#fc0000]'}>{modalFeed.music_song_id || '추출안됨'}</span>
                        <span> / </span>
                        <span className={modalFeed.music_album ? '' : 'text-[#fc0000]'}>{modalFeed.music_album || '추출안됨'}</span>
                      </div>
                      <div className="text-xs text-gray-700 mb-1 font-bold">음원정보(곡 / 가수)</div>
                      <div className="text-xs">
                        <span className={modalFeed.music_title ? '' : 'text-[#fc0000]'}>{modalFeed.music_title || '추출안됨'}</span>
                        <span> / </span>
                        <span className={modalFeed.music_artist ? '' : 'text-[#fc0000]'}>{modalFeed.music_artist || '추출안됨'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-white">영상 없음</div>
                )}
              </div>
              {/* 중앙: 상세 정보 */}
              <div className="flex-[1.2] flex flex-col p-10 border-l border-[#e0e0e0] bg-white min-w-[350px] max-w-[40%] relative">
                {/* <button className="absolute top-6 right-6 text-3xl text-gray-400 hover:text-gray-700 z-10" onClick={() => { setModalOpen(false); setModalFeed(null); }}>&times;</button> */}
                {/* 프로필/날짜 */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden text-gray-500 font-bold text-xl">
                    {modalFeed.creatorImageUrl ? (
                      <Image
                        src={modalFeed.creatorImageUrl}
                        alt={modalFeed.creatorNickname}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Image
                        src={'/defaultProfilePicture.webp'}
                        alt={modalFeed.creatorNickname}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-lg">{modalFeed.creatorNickname}</div>
                    <div className="text-xs text-gray-400">업로드 날짜 {modalFeed.createdDate.slice(0, 10)}</div>
                  </div>
                </div>
                {/* 제목 */}
                <div className="font-bold text-xl mb-2 text-gray-900">{modalFeed.title || '-'}</div>
                {/* 본문 */}
                <div className="text-gray-700 whitespace-pre-line mb-6 text-base leading-relaxed">{modalFeed.shortDescription || '-'}</div>
                {/* 구분선 */}
                <div className="border-b border-[#e0e0e0] my-4" />

                {/* 하단 버튼 */}
                <div className="mt-auto flex justify-end gap-3">
                  <button
                    onClick={() => {
                      if (modalFeed.image_server_file_name) {
                        const fileUrl = `https://d8ym2gq01w74.cloudfront.net/vod/prod/feed/${modalFeed.image_server_file_name}`;
                        const link = document.createElement('a');
                        link.href = fileUrl;
                        link.download = modalFeed.image_server_file_name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    }}
                    className="bg-[#22c58b] hover:bg-[#1ba576] text-white font-bold py-2 px-6 rounded-lg text-sm transition-colors cursor-pointer"
                    disabled={!modalFeed.image_server_file_name}
                  >
                    영상 다운로드
                  </button>
                  {Number(modalFeed.is_deleted) === 1 ? (
                    <button
                      className="font-bold px-8 py-3 rounded-lg shadow text-base cursor-pointer text-white bg-[rgb(35,183,229)] hover:bg-[rgb(28,146,183)]"
                      onClick={async () => {
                        // 활성화로 변경: 무조건 0
                        console.log('활성화로 변경 클릭, is_deleted: 0');
                        try {
                          const res = await fetch(`/api/feeds/${modalFeed.feedId}/activation`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ is_deleted: 0 })
                          });
                          const data = await res.json();
                          if (data.success) {
                            setActivationModalOpen(false);
                            setModalFeed(prev => prev ? { ...prev, is_deleted: data.newStatus } : prev);
                            fetchFeeds();
                          } else {
                            alert('상태 변경에 실패했습니다.');
                          }
                        } catch {
                          alert('상태 변경 중 오류가 발생했습니다.');
                        }
                      }}
                    >
                      활성화로 변경
                    </button>
                  ) : (
                    <button
                      className="font-bold px-8 py-3 rounded-lg shadow text-base cursor-pointer text-white bg-[#e6533c] hover:bg-[#d13c1a]"
                      onClick={async () => {
                        // 비활성화로 변경: 무조건 1
                        console.log('비활성화로 변경 클릭, is_deleted: 1');
                        try {
                          const res = await fetch(`/api/feeds/${modalFeed.feedId}/activation`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ is_deleted: 1 })
                          });
                          const data = await res.json();
                          if (data.success) {
                            setActivationModalOpen(false);
                            setModalFeed(prev => prev ? { ...prev, is_deleted: data.newStatus } : prev);
                            fetchFeeds();
                          } else {
                            alert('상태 변경에 실패했습니다.');
                          }
                        } catch {
                          alert('상태 변경 중 오류가 발생했습니다.');
                        }
                      }}
                    >
                      비활성화로 변경
                    </button>
                  )}
                </div>
              </div>
              {/* 우측: Comments 영역 */}
              <div className="flex-[0.9] border-l border-[#eeeeee] bg-white flex flex-col min-w-[300px] max-w-[35%]">
                {/* 댓글 헤더 + 탭 */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#eeeeee]">
                  <span className="font-bold text-[15px] text-gray-900">댓글</span>
                  <div className="flex gap-2">
                    <button
                      className={`px-3 py-1 rounded-lg font-bold text-sm ${commentTab === 'live' ? 'bg-[#ede7f6] text-[#7c3aed]' : 'bg-transparent text-gray-700'} cursor-pointer`}
                      onClick={() => setCommentTab('live')}
                    >라이브</button>
                    <button
                      className={`px-3 py-1 rounded-lg font-bold text-sm ${commentTab === 'deleted' ? 'bg-[#ede7f6] text-[#7c3aed]' : 'bg-transparent text-gray-700'} cursor-pointer`}
                      onClick={() => setCommentTab('deleted')}
                    >삭제</button>
                  </div>
                </div>
                {/* 댓글 목록 */}
                <CommentList
                  comments={comments}
                  loading={commentsLoading}
                  error={commentsError}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {gradeModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setGradeModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-0 min-w-[400px] min-h-[220px] shadow-xl relative border border-gray-200 transition-all duration-400 ease-out transform opacity-0 translate-y-[-40px] animate-blockModalIn"
            onClick={e => e.stopPropagation()}
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="text-xl font-bold text-gray-800">유저등급 변경</div>
              <button className="text-2xl text-gray-400 hover:text-gray-700" onClick={() => setGradeModalOpen(false)} disabled={saving}>&times;</button>
            </div>
            {/* 내용 */}
            <div className="px-6 py-6">
              <label className="block mb-2 text-gray-700 font-bold">등급</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#2eccaa] bg-white font-medium text-gray-800"
                value={selectedGrade ?? ''}
                onChange={e => setSelectedGrade(Number(e.target.value))}
                disabled={saving}
              >
                <option value="" disabled>등급을 선택하세요</option>
                {gradeList.map(g => (
                  <option key={g.grade_id} value={g.grade_id}>{g.name}</option>
                ))}
              </select>
              {errorMsg && <div className="text-red-500 text-sm mt-2">{errorMsg}</div>}
            </div>
            {/* 버튼 */}
            <div className="flex justify-end gap-3 px-6 pb-4 pt-4 border-t border-gray-200">
              <button
                className="px-6 py-2 rounded-lg font-bold text-white cursor-pointer"
                style={{ background: '#2eccaa' }}
                onClick={handleSaveGrade}
                disabled={saving || !selectedGrade || selectedGrade === user?.grade_level}
              >{saving ? '변경 중...' : '변경'}</button>
              <button
                className="px-6 py-2 rounded-lg font-bold text-white cursor-pointer"
                style={{ background: '#f25c4c' }}
                onClick={() => setGradeModalOpen(false)}
                disabled={saving}
              >취소</button>
            </div>
          </div>
        </div>
      )}
      {blockModalOpen && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-400 ease-out ${blockModalClosing ? 'animate-blockModalBgOut' : 'animate-blockModalBgIn'}`}
          onClick={closeBlockModalWithAnim}
        >
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
          <div
            className={`bg-white rounded-lg p-0 min-w-[420px] min-h-[220px] shadow-xl relative border border-gray-200 transition-all duration-400 ease-out ${blockModalClosing ? 'animate-blockModalOut' : 'animate-blockModalIn'}`}
            onClick={e => e.stopPropagation()}
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="text-xl font-bold text-gray-800">계정 차단</div>
              <button className="text-2xl text-gray-400 hover:text-gray-700" onClick={closeBlockModalWithAnim}>&times;</button>
            </div>
            {/* 설명 */}
            <div className="px-6 pt-4 pb-2 text-gray-700 text-[14px]">선택한 계정을 정말로 차단하시겠습니까? 추후에 다시 차단해제가 가능합니다.</div>
            {/* 차단 사유 */}
            <div className="px-6 pb-2">
              <label className="block mt-4 mb-2 text-gray-700 font-bold text-[14px]">차단 사유 <span className="text-red-500">*</span></label>
              <textarea
                className="w-full border border-gray-200 rounded-md px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#e6533c] bg-white font-medium text-gray-800 min-h-[120px] resize-none"
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
                placeholder="차단 이유를 입력하세요"
              />
              {showBlockReasonError && (
                <div className="text-red-500 text-sm mt-1">차단 이유를 입력하세요</div>
              )}
            </div>
            {/* 버튼 */}
            <div className="flex justify-end gap-3 px-6 pb-6 pt-4">
              <button
                className="px-8 py-2.5 rounded-lg font-bold text-white text-base cursor-pointer hover:opacity-90"
                style={{ background: '#e6533c' }}
                onClick={() => {
                  if (!blockReason.trim()) {
                    setShowBlockReasonError(true);
                    return;
                  }
                  setShowBlockReasonError(false);
                  handleBlockAccount();
                }}
                disabled={blockLoading}
              >{blockLoading ? '차단 중...' : '차단'}</button>
              <button
                className="px-8 py-2.5 rounded-lg font-bold text-white text-base cursor-pointer hover:opacity-90"
                style={{ background: '#22c58b' }}
                onClick={closeBlockModalWithAnim}
              >취소</button>
            </div>
          </div>
        </div>
      )}
      {unblockModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 transition-all duration-400 ease-out animate-blockModalBgIn"
          onClick={() => setUnblockModalOpen(false)}
        >
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
          <div
            className="bg-white rounded-lg p-0 min-w-[420px] min-h-[220px] shadow-xl relative border border-gray-200 transition-all duration-400 ease-out animate-blockModalIn"
            onClick={e => e.stopPropagation()}
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="text-xl font-bold text-gray-800">차단 해제</div>
              <button className="text-2xl text-gray-400 hover:text-gray-700" onClick={() => setUnblockModalOpen(false)}>&times;</button>
            </div>
            {/* 설명 */}
            <div className="px-6 pt-4 pb-2 text-gray-700 text-[14px]">선택한 계정의 차단을 해제하시겠습니까?</div>
            {/* 차단 해제 사유 */}
            <div className="px-6 pb-2">
              <label className="block mt-4 mb-2 text-gray-700 font-bold text-[14px]">차단 해제 사유 <span className="text-red-500">*</span></label>
              <textarea
                className="w-full border border-gray-200 rounded-md px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#22c58b] bg-white font-medium text-gray-800 min-h-[120px] resize-none"
                value={unblockReason}
                onChange={e => setUnblockReason(e.target.value)}
                placeholder="차단 해제 이유를 입력하세요"
              />
              {showUnblockReasonError && (
                <div className="text-red-500 text-sm mt-1">차단 해제 이유를 입력하세요</div>
              )}
            </div>
            {/* 버튼 */}
            <div className="flex justify-end gap-3 px-6 pb-6 pt-4">
              <button
                className="px-8 py-2.5 rounded-lg font-bold text-white text-base cursor-pointer hover:opacity-90"
                style={{ background: '#22c58b' }}
                onClick={() => {
                  if (!unblockReason.trim()) {
                    setShowUnblockReasonError(true);
                    return;
                  }
                  setShowUnblockReasonError(false);
                  // handleUnblockAccount(); // TODO: 차단해제 API 연동
                }}
              >차단 해제</button>
              <button
                className="px-8 py-2.5 rounded-lg font-bold text-white text-base cursor-pointer hover:opacity-90"
                style={{ background: '#e6533c' }}
                onClick={() => setUnblockModalOpen(false)}
              >취소</button>
            </div>
          </div>
        </div>
      )}
      {blockSuccessModal && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-400 ease-out ${blockSuccessModalClosing ? 'animate-blockModalBgOut' : 'animate-blockModalBgIn'}`}
          onClick={closeBlockSuccessModalWithAnim}
        >
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
          <div
            className={`bg-white rounded-lg p-0 min-w-[340px] min-h-[120px] shadow-xl relative border border-gray-200 transition-all duration-400 ease-out ${blockSuccessModalClosing ? 'animate-blockModalOut' : 'animate-blockModalIn'}`}
            onClick={e => e.stopPropagation()}
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="text-xl font-bold text-gray-800">계정 차단</div>
              <button className="text-2xl text-gray-400 hover:text-gray-700" onClick={closeBlockSuccessModalWithAnim}>&times;</button>
            </div>
            <div className="px-6 py-8 text-center text-gray-800 text-lg font-semibold">해당 유저가 차단되었습니다</div>
            <div className="flex justify-center gap-3 px-6 pb-6 pt-2">
              <button
                className="px-8 py-2.5 rounded-lg font-bold text-white text-base cursor-pointer"
                style={{ background: '#22c58b' }}
                onClick={closeBlockSuccessModalWithAnim}
              >확인</button>
            </div>
          </div>
        </div>
      )}
      {/* 활성화 상태 변경 확인 모달 */}
      {activationModalOpen && modalFeed && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setActivationModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-0 min-w-[400px] min-h-[180px] shadow-xl relative border border-gray-200 transition-all duration-400 ease-out transform animate-blockModalIn"
            onClick={e => e.stopPropagation()}
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="text-xl font-bold text-gray-800">{Number(modalFeed.is_deleted) === 1 ? '피드 활성화' : '피드 비활성화'}</div>
              <button className="text-2xl text-gray-400 hover:text-gray-700" onClick={() => setActivationModalOpen(false)}>&times;</button>
            </div>
            {/* 안내 문구 */}
            <div className="px-6 py-6 text-gray-700 text-base">
              {Number(modalFeed.is_deleted) === 1
                ? '정말 활성화로 변경하시겠습니까?'
                : '정말 비활성화로 변경하시겠습니까?'}
            </div>
            {/* 버튼 */}
            <div className="flex justify-end gap-3 px-6 pb-4 pt-2 border-t border-gray-200">
              <button
                className="px-6 py-2 rounded-lg font-bold text-white cursor-pointer"
                style={{ background: '#2eccaa' }}
                onClick={async () => {
                  // 버튼 라벨과 실제 토글 동작을 확실히 맞춤
                  // is_deleted === 1 (비활성화)일 때만 0(활성화)로 변경
                  if (Number(modalFeed.is_deleted) !== 1) {
                    alert('이미 활성화 상태입니다.');
                    return;
                  }
                  const newStatus = 0;
                  console.log('modalFeed.is_deleted:', modalFeed.is_deleted, 'newStatus:', newStatus);
                  try {
                    const res = await fetch(`/api/feeds/${modalFeed.feedId}/activation`, {
                      method: 'PUT'
                    });
                    const data = await res.json();
                    if (data.success) {
                      setActivationModalOpen(false);
                      setModalFeed(prev => prev ? { ...prev, is_deleted: data.newStatus } : prev);
                      fetchFeeds();
                    } else {
                      alert('상태 변경에 실패했습니다.');
                    }
                  } catch {
                    alert('상태 변경 중 오류가 발생했습니다.');
                  }
                }}
              >변경</button>
              <button
                className="px-6 py-2 rounded-lg font-bold text-white cursor-pointer"
                style={{ background: '#f25c4c' }}
                onClick={() => setActivationModalOpen(false)}
              >취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

