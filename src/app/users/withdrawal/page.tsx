"use client";
import React from "react";
import DataTable from "react-data-table-component";
import * as XLSX from 'xlsx';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

type WithdrawalUser = {
  uid: number;
  lid: number;
  qdate: string;
  l_member_id: number;
  u_account: string;
  l_reason: string;
  l_detail_reason: string;
  u_nickname: string;
  u_activation: number;
  u_unregister_request_at: string;
  u_unregistered_at: string;
  quit_status: string;
};

function getQuitReasonLabel(reason: string, detail: string): string {
  switch (reason) {
    case "NONE":
      return "";
    case "0":
      return "등록된 상품이 많지 않아요";
    case "1":
      return "원하는 콘텐츠가 없어요";
    case "2":
      return "패퍼하츠에서 불쾌한 일을 겪었어요";
    case "3":
      return "광고성 글이 너무 많아요";
    case "4":
      return "사용하기가 불편해요";
    case "5":
      return (!detail || detail === "") ? "기타" : `기타 - ${detail}`;
    default:
      return "기타";
  }
}

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
};

// 커스텀 하단 바 (일반회원관리와 동일)
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
  const totalPages = Math.ceil(total / pageSize);
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
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
        총 {total}개 중 {start}~{end}개 표시
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

export default function WithdrawalUserPage() {
  const [users, setUsers] = React.useState<WithdrawalUser[]>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(PAGE_SIZE_OPTIONS[0]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [keyword, setKeyword] = React.useState("");

  React.useEffect(() => {
    setLoading(true);
    fetch(`/api/users/withdrawal?keyword=${encodeURIComponent(keyword)}`)
      .then(res => res.json())
      .then(data => {
        setUsers(data.users);
        setTotal(data.users.length);
        setLoading(false);
      })
      .catch(() => {
        setUsers([]);
        setTotal(0);
        setLoading(false);
      });
  }, [keyword]);

  // 페이지네이션 적용된 데이터
  const pagedUsers = users.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    {
      name: '#',
      selector: (row: WithdrawalUser, idx?: number) =>
        total - ((page - 1) * pageSize + (idx ?? 0)),
      width: '80px',
      sortable: false,
      centered: true,
    },
    {
      name: '계정',
      selector: (row: WithdrawalUser) => row.u_account,
      sortable: false,
    },
    {
      name: '닉네임',
      selector: (row: WithdrawalUser) => row.u_nickname,
      sortable: false,
    },
    {
      name: '탈퇴 신청일',
      selector: (row: WithdrawalUser) => row.qdate,
      sortable: false,
    },
    {
      name: '탈퇴 신청상태',
      selector: (row: WithdrawalUser) => row.quit_status,
      sortable: false,
    },
    {
      name: '탈퇴 완료일',
      selector: (row: WithdrawalUser) => row.u_unregistered_at,
      sortable: false,
    },
    {
      name: '탈퇴사유',
      selector: (row: WithdrawalUser) => getQuitReasonLabel(row.l_reason, row.l_detail_reason),
      sortable: false,
    },
  ];

  // Excel(xlsx) 전체 다운로드 핸들러
  const handleExcelDownload = async () => {
    const res = await fetch('/api/users/withdrawal');
    const data = await res.json();
    const users: WithdrawalUser[] = data.users || [];
    const ws = XLSX.utils.json_to_sheet(users.map((u, idx) => ({
      번호: users.length - idx,
      계정: u.u_account,
      닉네임: u.u_nickname,
      '탈퇴 신청일': u.qdate,
      '탈퇴 신청상태': u.quit_status,
      '탈퇴 완료일': u.u_unregistered_at,
      '탈퇴사유': getQuitReasonLabel(u.l_reason, u.l_detail_reason),
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '탈퇴회원목록');
    XLSX.writeFile(wb, '탈퇴회원관리.xlsx');
  };

  return (
    <div className="w-full px-10 mt-8">
      <div className="bg-white rounded-2xl shadow p-8 border border-[#f0f0f0] w-full">
        <div className="text-lg font-bold text-gray-800 mb-6 flex items-center">
          <span className="w-1.5 h-5 rounded bg-gradient-to-b from-[#7f8fff] to-[#f5b942] mr-3" />
          탈퇴회원 관리
        </div>
        <div className="flex flex-row items-center justify-between mb-4 gap-4">
          <div className="flex flex-row items-center gap-4">
            <label className="font-semibold text-gray-700 mr-2 text-[80%]">키워드검색</label>
            <input
              className="border border-[#aaaaaa] rounded px-3 py-1 text-[80%] focus:ring-2 focus:ring-blue-200 h-9"
              style={{ height: '95%' }}
              placeholder="키워드검색"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
          <button
            className="bg-[#000000] hover:bg-[#222] text-[#ffffff] font-bold text-xs px-4 py-2 rounded shadow border border-[#e0e6ed] cursor-pointer"
            onClick={handleExcelDownload}
          >
            Excel 다운로드
          </button>
        </div>
        <DataTable
          columns={columns}
          data={pagedUsers}
          progressPending={loading}
          pagination={false}
          highlightOnHover
          striped
          noDataComponent={<div className="py-8">탈퇴회원이 없습니다.</div>}
          keyField="lid"
          customStyles={customStyles}
        />
        <CustomFooter
          page={page}
          pageSize={pageSize}
          total={total}
          setPage={setPage}
          setPageSize={ps => { setPageSize(ps); setPage(1); }}
        />
      </div>
    </div>
  );
} 