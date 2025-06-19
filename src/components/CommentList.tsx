import React from 'react';
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
};

interface CommentListProps {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  showFeedInfo?: boolean;
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

function CommentItemView({ comment, depth = 0, showFeedInfo = false }: { comment: Comment, depth?: number, showFeedInfo?: boolean }) {
  return (
    <div className="flex flex-col" style={{ marginLeft: `${depth * 20}px` }}>
      <div className="flex items-start gap-3 py-3">
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
      </div>
      {comment.replies?.map(reply => (
        <CommentItemView key={reply.comment_id} comment={reply} depth={(depth || 0) + 1} showFeedInfo={showFeedInfo} />
      ))}
    </div>
  );
}

export default function CommentList({
  comments,
  loading,
  error,
  showFeedInfo = false,
}: CommentListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      {loading ? (
        <CommentLoadingState />
      ) : error ? (
        <CommentErrorState error={error} />
      ) : comments.length === 0 ? (
        <div className="flex items-center justify-center text-gray-400 h-full text-sm">
          아직 댓글이 없습니다
        </div>
      ) : (
        <div className="flex flex-col">
          {comments.map(comment => (
            <CommentItemView key={comment.comment_id} comment={comment} showFeedInfo={showFeedInfo} />
          ))}
        </div>
      )}
    </div>
  );
} 