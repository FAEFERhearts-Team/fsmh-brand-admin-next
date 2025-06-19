interface CommentListProps {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  showFeedInfo?: boolean;
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