"use client";
import React from "react";
import DataTable from "react-data-table-component";
import * as XLSX from 'xlsx';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

type BrandUser = {
  bu_id: number;
  bu_username: string;
  bu_full_name: string;
  b_title_kor: string;
};

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

export default function BrandUserPage() {
  const [users, setUsers] = React.useState<BrandUser[]>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(PAGE_SIZE_OPTIONS[0]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [keyword, setKeyword] = React.useState("");

  React.useEffect(() => {
    setLoading(true);
    fetch(`/api/users/brand?keyword=${encodeURIComponent(keyword)}`)
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

  const pagedUsers = users.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    {
      name: '#',
      selector: (row: BrandUser, idx?: number) => total - ((page - 1) * pageSize + (idx ?? 0)),
      width: '80px',
      sortable: false,
      centered: true,
    },
    {
      name: '브랜드 이름',
      selector: (row: BrandUser) => row.b_title_kor,
      sortable: false,
    },
    {
      name: '이름',
      selector: (row: BrandUser) => row.bu_full_name,
      sortable: false,
    },
    {
      name: 'Username',
      selector: (row: BrandUser) => row.bu_username,
      sortable: false,
    },
  ];

  const handleExcelDownload = async () => {
    const res = await fetch('/api/users/brand');
    const data = await res.json();
    const users: BrandUser[] = data.users || [];
    const ws = XLSX.utils.json_to_sheet(users.map((u, idx) => ({
      번호: users.length - idx,
      '브랜드 이름': u.b_title_kor,
      '이름': u.bu_full_name,
      'Username': u.bu_username,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '브랜드회원목록');
    XLSX.writeFile(wb, '브랜드회원관리.xlsx');
  };

  return (
    <div className="w-full px-10 mt-8">
      <div className="bg-white rounded-2xl shadow p-8 border border-[#f0f0f0] w-full">
        <div className="text-lg font-bold text-gray-800 mb-6 flex items-center">
          <span className="w-1.5 h-5 rounded bg-gradient-to-b from-[#7f8fff] to-[#f5b942] mr-3" />
          브랜드회원 관리
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
          noDataComponent={<div className="py-8">브랜드회원이 없습니다.</div>}
          keyField="bu_id"
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