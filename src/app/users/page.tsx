"use client";
import React from "react";
import DataTable from "react-data-table-component";
import * as XLSX from 'xlsx';
import { useRouter } from "next/navigation";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

type User = {
  account: string;
  nickname: string;
  created_at: string;
  id: number;
};

// DataTable 커스텀 스타일
const customStyles = {
  pagination: {
    style: {
      justifyContent: 'flex-end',
      padding: '16px 0 0 0',
    },
  },
  rowsPerPage: {
    style: {
      justifyContent: 'flex-start', // 왼쪽 정렬 보장
    },
  },
  headRow: {
    style: {
      backgroundColor: '#eeeeee',
    },
  },
};

// 완전 커스텀 하단 바 (rows-per-page, 총 row 수, 페이지네이션)
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
      {/* 왼쪽: rows-per-page */}
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
      {/* 오른쪽: 총 row 수 */}
      <div className="text-sm text-gray-500">
        총 {total}개 중 {start}~{end}개 표시
      </div>
      {/* 중앙/오른쪽: 페이지네이션 */}
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

export default function UserListPage() {
  const [users, setUsers] = React.useState<(User & { number: number })[]>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(PAGE_SIZE_OPTIONS[0]);
  const [total, setTotal] = React.useState(0);
  const [keyword, setKeyword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  // 데이터 fetch 함수 (API 연동)
  React.useEffect(() => {
    setLoading(true);
    fetch(`/api/users?page=${page}&pageSize=${pageSize}&keyword=${encodeURIComponent(keyword)}`)
      .then(res => res.json())
      .then(data => {
        // 번호(역순) 필드 추가
        const numbered = data.users.map((user: User, idx: number) => ({
          ...user,
          id: (page - 1) * pageSize + idx + 1,
          number: data.total - ((page - 1) * pageSize + idx),
        }));
        setUsers(numbered);
        setTotal(data.total);
        setLoading(false);
      })
      .catch(() => {
        setUsers([]);
        setTotal(0);
        setLoading(false);
      });
  }, [page, pageSize, keyword]);

  const columns = [
    {
      name: '#',
      selector: (row: User & { number: number }) => row.number,
      width: '80px',
      sortable: false,
      centered: true,
    },
    {
      name: '계정',
      selector: (row: User & { number: number }) => row.account,
      sortable: false,
    },
    {
      name: '닉네임',
      selector: (row: User & { number: number }) => row.nickname,
      sortable: false,
    },
    {
      name: '가입일',
      selector: (row: User & { number: number }) => row.created_at?.slice(0, 10),
      sortable: false,
    },
  ];

  // Excel(xlsx) 전체 다운로드 핸들러
  const handleExcelDownload = async () => {
    const res = await fetch('/api/users?all=true');
    const data = await res.json();
    const users: User[] = data.users || [];
    const ws = XLSX.utils.json_to_sheet(users.map((u, idx) => ({
      번호: users.length - idx,
      계정: u.account,
      닉네임: u.nickname,
      가입일: u.created_at?.slice(0, 10),
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '회원목록');
    XLSX.writeFile(wb, '일반회원관리.xlsx');
  };

  return (
    <div className="w-full px-10 mt-8">
      <div className="bg-white rounded-2xl shadow p-8 border border-[#f0f0f0] w-full">
        <div className="text-lg font-bold text-gray-800 mb-6 flex items-center">
          <span className="w-1.5 h-5 rounded bg-gradient-to-b from-[#7f8fff] to-[#f5b942] mr-3" />
          일반회원 관리
        </div>
        {/* 상단 컨트롤 바: 검색+엑셀다운로드 한 줄, 수직 가운데 정렬 */}
        <div className="flex flex-row items-center justify-between mb-4 gap-4">
          <div className="flex flex-row items-center gap-4">
            <label className="font-semibold text-gray-700 mr-2 text-[80%]">키워드검색</label>
            <input
              className="border border-[#aaaaaa] rounded px-3 py-1 text-[80%] focus:ring-2 focus:ring-blue-200 h-9"
              style={{ height: '95%' }}
              placeholder="키워드검색"
              value={keyword}
              onChange={e => { setKeyword(e.target.value); setPage(1); }}
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
          data={users}
          progressPending={loading}
          pagination={false}
          highlightOnHover
          striped
          noDataComponent={<div className="py-8">회원이 없습니다.</div>}
          keyField="id"
          customStyles={customStyles}
          onRowClicked={row => router.push(`/users/${row.account}`)}
          pointerOnHover
        />
        {/* 커스텀 하단 바 */}
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