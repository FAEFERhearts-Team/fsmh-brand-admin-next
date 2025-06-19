import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

type Comment = {
  comment_id: number;
  content: string;
  parent_comment_id: number | null;
  created_at: string;
  member_user_id: number;
  nickname: string;
  image_url: string | null;
  replies: Comment[];
  feed_title?: string;
  feed_id?: number;
  is_deleted: number;
};

interface CommentListProps {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  showFeedInfo?: boolean;
  onDelete?: (commentId: number) => void;
  onRestore?: (commentId: number) => void;
  currentTab?: 'live' | 'deleted';
}

function CommentLoadingState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-400 text-sm">댓글을 불러오는 중...</div>
    </div>
  );
}

function CommentErrorState({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-red-500 text-sm">{error}</div>
    </div>
  );
}

function CommentItemView({ comment, depth = 0, showFeedInfo = false, onDelete, onRestore, currentTab }: { comment: Comment, depth?: number, showFeedInfo?: boolean, onDelete?: (commentId: number) => void, onRestore?: (commentId: number) => void, currentTab?: 'live' | 'deleted' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [editValue, setEditValue] = useState(comment.content);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleEdit = async () => {
    try {
      const res = await fetch(`/api/feeds/${comment.feed_id}/comment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_id: comment.comment_id, content: editValue })
      });
      const data = await res.json();
      if (data.success) {
        setEditModalOpen(false);
        // Optimistically update UI
        comment.content = editValue;
      } else {
        alert(data.error || '댓글 수정에 실패했습니다.');
      }
    } catch {
      alert('댓글 수정 중 오류 발생');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/feeds/${comment.feed_id}/comment`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_id: comment.comment_id }),
      });
      const data = await res.json();
      if (data.success) {
        setDeleteModalOpen(false);
        if (onDelete) onDelete(comment.comment_id);
      } else {
        alert(data.error || '댓글 삭제에 실패했습니다.');
      }
    } catch {
      alert('댓글 삭제 중 오류 발생');
    }
  };

  const handleRestore = async () => {
    try {
      const res = await fetch(`/api/feeds/${comment.feed_id}/comment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_id: comment.comment_id, is_deleted: 0 }),
      });
      const data = await res.json();
      if (data.success) {
        if (onRestore) onRestore(comment.comment_id);
        setRestoreModalOpen(false);
      } else {
        alert(data.error || '댓글 복구에 실패했습니다.');
      }
    } catch {
      alert('댓글 복구 중 오류 발생');
    }
  };

  useEffect(() => {
    if (menuOpen) {
      console.log('Restore button conditions:', { currentTab, is_deleted: comment.is_deleted });
    }
  }, [menuOpen, currentTab, comment.is_deleted]);

  return (
    <div className="flex flex-col" style={{ marginLeft: `${depth * 20}px` }}>
      <div className="flex items-start gap-3 py-3 relative group">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
          <Image
            src={comment.image_url || '/defaultProfilePicture.webp'}
            alt={comment.nickname}
            width={32}
            height={32}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm text-gray-900">{comment.nickname}</span>
            <span className="text-xs text-gray-500">{comment.created_at.slice(0, 10)}</span>
          </div>
          {showFeedInfo && comment.feed_title && !comment.parent_comment_id && (
            <div className="text-xs text-gray-500 mb-1">
              피드: {comment.feed_title}
            </div>
          )}
          <p className="text-sm text-gray-700 whitespace-pre-line break-words">{comment.content}</p>
        </div>
        {/* 3-dot menu icon */}
        <div className="ml-auto flex items-center" ref={menuRef}>
          <button
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none cursor-pointer"
            onClick={() => {
              console.log('Restore button conditions:', { currentTab, is_deleted: comment.is_deleted });
              setMenuOpen((v) => !v);
            }}
            tabIndex={0}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="2" fill="#888" />
              <circle cx="12" cy="12" r="2" fill="#888" />
              <circle cx="19" cy="12" r="2" fill="#888" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-28 flex flex-col">
              <button
                className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 text-left cursor-pointer"
                onClick={() => { setEditModalOpen(true); setMenuOpen(false); }}
              >수정하기</button>
              <button
                className="px-4 py-2 text-sm text-red-500 hover:bg-gray-100 text-left cursor-pointer"
                onClick={() => { setDeleteModalOpen(true); setMenuOpen(false); }}
              >삭제하기</button>
              {currentTab === 'deleted' && comment.is_deleted === 1 && (
                <button
                  className="px-4 py-2 text-sm text-green-600 hover:bg-gray-100 text-left cursor-pointer"
                  onClick={() => { 
                    console.log('Restore button clicked:', { currentTab, is_deleted: comment.is_deleted });
                    setRestoreModalOpen(true); 
                    setMenuOpen(false); 
                  }}
                >되살리기</button>
              )}
            </div>
          )}
        </div>
        {/* Edit Modal */}
        {editModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setEditModalOpen(false)}>
            <div className="bg-white rounded-xl p-6 min-w-[480px] shadow-xl relative" onClick={e => e.stopPropagation()}>
              <div className="font-bold text-lg mb-2">댓글 수정</div>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 text-base focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded-lg font-bold text-white bg-[#7c3aed] hover:bg-[#5b21b6] cursor-pointer"
                  onClick={handleEdit}
                >수정</button>
                <button
                  className="px-4 py-2 rounded-lg font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                  onClick={() => setEditModalOpen(false)}
                >취소</button>
              </div>
            </div>
          </div>
        )}
        {/* Delete Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setDeleteModalOpen(false)}>
            <div className="bg-white rounded-xl p-6 min-w-[480px] shadow-xl relative" onClick={e => e.stopPropagation()}>
              <div className="font-bold text-lg mb-4">댓글을 삭제하시겠습니까?</div>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 cursor-pointer"
                  onClick={handleDelete}
                >삭제</button>
                <button
                  className="px-4 py-2 rounded-lg font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                  onClick={() => setDeleteModalOpen(false)}
                >취소</button>
              </div>
            </div>
          </div>
        )}
        {/* Restore Modal */}
        {restoreModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setRestoreModalOpen(false)}>
            <div className="bg-white rounded-xl p-6 min-w-[480px] shadow-xl relative" onClick={e => e.stopPropagation()}>
              <div className="font-bold text-lg mb-4">댓글을 되살리시겠습니까?</div>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 cursor-pointer"
                  onClick={handleRestore}
                >되살리기</button>
                <button
                  className="px-4 py-2 rounded-lg font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                  onClick={() => setRestoreModalOpen(false)}
                >취소</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {comment.replies?.map(reply => (
        <CommentItemView key={reply.comment_id} comment={reply} depth={(depth || 0) + 1} showFeedInfo={showFeedInfo} onDelete={onDelete} onRestore={onRestore} currentTab={currentTab} />
      ))}
    </div>
  );
}

export default function CommentList({
  comments,
  loading,
  error,
  showFeedInfo = false,
  onDelete,
  onRestore,
  currentTab,
}: CommentListProps) {
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  useEffect(() => { setLocalComments(comments); }, [comments]);
  const handleDelete = (commentId: number) => {
    // 삭제된 댓글 및 자식 댓글을 모두 제거
    const removeComment = (list: Comment[]): Comment[] =>
      list.filter(c => c.comment_id !== commentId)
        .map(c => ({ ...c, replies: removeComment(c.replies) }));
    setLocalComments(prev => removeComment(prev));
    if (onDelete) onDelete(commentId);
  };
  const handleRestore = (commentId: number) => {
    // 복구된 댓글을 삭제 리스트에서 제거 (상위에서 라이브 리스트로 옮기는 로직 필요)
    if (onRestore) onRestore(commentId);
  };
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      {loading ? (
        <CommentLoadingState />
      ) : error ? (
        <CommentErrorState error={error} />
      ) : localComments.length === 0 ? (
        <div className="flex items-center justify-center text-gray-400 h-full text-sm">
          아직 댓글이 없습니다
        </div>
      ) : (
        <div className="flex flex-col">
          {localComments.map(comment => (
            <CommentItemView key={comment.comment_id} comment={comment} showFeedInfo={showFeedInfo} onDelete={handleDelete} onRestore={handleRestore} currentTab={currentTab} />
          ))}
        </div>
      )}
    </div>
  );
} 