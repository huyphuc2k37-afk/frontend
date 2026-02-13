"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  ChatBubbleLeftRightIcon,
  HandThumbUpIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { HandThumbUpIcon as HandThumbUpSolidIcon } from "@heroicons/react/24/solid";
import { API_BASE_URL, authFetch } from "@/lib/api";

/* ─── Types ──────────────────────────────────── */
interface CommentUser {
  id: string;
  name: string;
  image: string | null;
  role: string;
}

interface CommentData {
  id: string;
  content: string;
  likes: number;
  createdAt: string;
  parentId: string | null;
  user: CommentUser;
  _count: { commentLikes: number };
  replies?: CommentData[];
}

interface Props {
  storyId?: string;
  chapterId?: string;
  session: any;
  token?: string;
}

/* ─── Badges ─────────────────────────────────── */
function AdminBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900 shadow-sm ring-1 ring-amber-400/50 animate-shimmer">
      <ShieldCheckIcon className="h-3 w-3" />
      Admin
    </span>
  );
}

function AuthorBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-200">
      <CheckBadgeIcon className="h-3 w-3" />
      Tác giả
    </span>
  );
}

/* ─── Single Comment ─────────────────────────── */
function CommentItem({
  comment,
  storyAuthorId,
  currentUserId,
  isAdmin,
  token,
  likedIds,
  onLikeToggle,
  onDelete,
  onReply,
  depth = 0,
}: {
  comment: CommentData;
  storyAuthorId: string | null;
  currentUserId: string | null;
  isAdmin: boolean;
  token?: string;
  likedIds: Set<string>;
  onLikeToggle: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onReply: (parentId: string, parentName: string) => void;
  depth?: number;
}) {
  const isAuthor = comment.user.id === storyAuthorId;
  const isAdminUser = comment.user.role === "admin";
  const isOwn = comment.user.id === currentUserId;
  const canDelete = isOwn || isAdmin;
  const liked = likedIds.has(comment.id);
  const likeCount = comment._count?.commentLikes ?? comment.likes ?? 0;

  const isAdminComment = isAdminUser;
  const avatarRing = isAdminComment
    ? "ring-2 ring-amber-400 shadow-lg shadow-amber-200/50"
    : isAuthor
    ? "ring-2 ring-blue-400"
    : "";

  return (
    <div className={`${depth > 0 ? "ml-10 border-l-2 border-gray-100 pl-4" : ""}`}>
      <div className="flex gap-3 group">
        {/* Avatar */}
        <div className="flex-shrink-0 relative">
          {comment.user.image ? (
            <Image
              src={comment.user.image}
              alt={comment.user.name}
              width={depth > 0 ? 32 : 36}
              height={depth > 0 ? 32 : 36}
              className={`rounded-full ${avatarRing}`}
              unoptimized
            />
          ) : (
            <div
              className={`flex items-center justify-center rounded-full text-caption font-bold ${
                isAdminComment
                  ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white ring-2 ring-amber-400 shadow-lg shadow-amber-200/50"
                  : isAuthor
                  ? "bg-blue-100 text-blue-600 ring-2 ring-blue-400"
                  : "bg-primary-100 text-primary-600"
              }`}
              style={{
                width: depth > 0 ? 32 : 36,
                height: depth > 0 ? 32 : 36,
              }}
            >
              {isAdminComment ? "★" : comment.user.name.charAt(0)}
            </div>
          )}
          {/* Admin crown overlay */}
          {isAdminComment && (
            <span className="absolute -top-1.5 -right-1.5 text-sm" title="Admin">
              👑
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name + badges + time */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`text-body-sm font-semibold ${
                isAdminComment
                  ? "bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent"
                  : isAuthor
                  ? "text-blue-700"
                  : "text-gray-900"
              }`}
            >
              {comment.user.name}
            </span>
            {isAdminComment && <AdminBadge />}
            {isAuthor && !isAdminComment && <AuthorBadge />}
            <span className="text-caption text-gray-400">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Comment text */}
          <p className="mt-1 text-body-sm text-gray-700 whitespace-pre-line">{comment.content}</p>

          {/* Actions: like, reply, delete */}
          <div className="mt-1.5 flex items-center gap-4">
            {/* Like */}
            <button
              onClick={() => token && onLikeToggle(comment.id)}
              className={`inline-flex items-center gap-1 text-caption transition-colors ${
                liked
                  ? "text-primary-600 font-semibold"
                  : "text-gray-400 hover:text-primary-500"
              } ${!token ? "cursor-default" : "cursor-pointer"}`}
              disabled={!token}
            >
              {liked ? (
                <HandThumbUpSolidIcon className="h-3.5 w-3.5" />
              ) : (
                <HandThumbUpIcon className="h-3.5 w-3.5" />
              )}
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>

            {/* Reply */}
            {token && depth === 0 && (
              <button
                onClick={() => onReply(comment.id, comment.user.name)}
                className="inline-flex items-center gap-1 text-caption text-gray-400 hover:text-primary-500 transition-colors"
              >
                <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
                Trả lời
              </button>
            )}

            {/* Delete */}
            {canDelete && (
              <button
                onClick={() => onDelete(comment.id)}
                className="inline-flex items-center gap-1 text-caption text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              storyAuthorId={storyAuthorId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              token={token}
              likedIds={likedIds}
              onLikeToggle={onLikeToggle}
              onDelete={onDelete}
              onReply={onReply}
              depth={1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Time format ────────────────────────────── */
function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

/* ─── Main Component ─────────────────────────── */
export default function CommentSection({ storyId, chapterId, session, token }: Props) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [text, setText] = useState("");
  const [storyAuthorId, setStoryAuthorId] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);

  const currentUserId = (session?.user as any)?.id || null;
  const isAdmin = (session?.user as any)?.role === "admin";

  // Fetch comments
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const param = chapterId
        ? `chapterId=${chapterId}`
        : `storyId=${storyId}`;
      const res = await fetch(`${API_BASE_URL}/api/comments?${param}`);
      const data = await res.json();
      setComments(data.comments || []);
      setTotal(data.total || 0);
      setStoryAuthorId(data.storyAuthorId || null);
    } catch {}
    setLoading(false);
  }, [storyId, chapterId]);

  useEffect(() => {
    if (storyId || chapterId) fetchComments();
  }, [fetchComments, storyId, chapterId]);

  // Fetch liked IDs
  useEffect(() => {
    if (!token || comments.length === 0) return;
    const allIds: string[] = [];
    comments.forEach((c) => {
      allIds.push(c.id);
      c.replies?.forEach((r) => allIds.push(r.id));
    });
    if (allIds.length === 0) return;

    authFetch(`/api/comments/liked?ids=${allIds.join(",")}`, token)
      .then((r) => r.json())
      .then((data) => setLikedIds(new Set(data.likedIds || [])))
      .catch(() => {});
  }, [comments, token]);

  // Post comment / reply
  const postComment = async () => {
    if (!token || !text.trim() || posting) return;
    setPosting(true);
    try {
      const body: any = { content: text.trim() };
      if (replyTo) {
        body.parentId = replyTo.id;
      } else if (chapterId) {
        body.chapterId = chapterId;
      } else {
        body.storyId = storyId;
      }

      const res = await authFetch("/api/comments", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setText("");
        setReplyTo(null);
        fetchComments(); // refresh to get nested structure
      }
    } catch {}
    setPosting(false);
  };

  // Toggle like
  const handleLikeToggle = async (commentId: string) => {
    if (!token) return;
    try {
      const res = await authFetch(`/api/comments/${commentId}/like`, token, {
        method: "POST",
      });
      const data = await res.json();
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (data.liked) next.add(commentId);
        else next.delete(commentId);
        return next;
      });
      // Update count in local state
      const updateCount = (list: CommentData[]): CommentData[] =>
        list.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              _count: {
                ...c._count,
                commentLikes: c._count.commentLikes + (data.liked ? 1 : -1),
              },
            };
          }
          if (c.replies) {
            return { ...c, replies: updateCount(c.replies) };
          }
          return c;
        });
      setComments(updateCount);
    } catch {}
  };

  // Delete comment
  const handleDelete = async (commentId: string) => {
    if (!token || !confirm("Xóa bình luận này?")) return;
    try {
      const res = await authFetch(`/api/comments/${commentId}`, token, {
        method: "DELETE",
      });
      if (res.ok) fetchComments();
    } catch {}
  };

  // Reply handler
  const handleReply = (parentId: string, parentName: string) => {
    setReplyTo({ id: parentId, name: parentName });
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-heading-sm font-bold text-gray-900">
        <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary-500" />
        {chapterId ? `Bình luận chương (${total})` : `Bình luận (${total})`}
      </h2>

      {/* Comment form */}
      {session ? (
        <div className="mb-6">
          {replyTo && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-caption text-gray-600">
              <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
              Đang trả lời <span className="font-semibold">{replyTo.name}</span>
              <button
                onClick={() => setReplyTo(null)}
                className="ml-auto text-gray-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={replyTo ? `Trả lời ${replyTo.name}...` : "Viết bình luận..."}
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-body-sm text-gray-900 placeholder-gray-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) postComment();
            }}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-caption text-gray-400">Ctrl+Enter để gửi</span>
            <button
              onClick={postComment}
              disabled={!text.trim() || posting}
              className="rounded-xl bg-primary-500 px-5 py-2 text-body-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {posting ? "Đang gửi..." : replyTo ? "Trả lời" : "Gửi bình luận"}
            </button>
          </div>
        </div>
      ) : (
        <p className="mb-6 text-body-sm text-gray-500">
          <a href="/login" className="text-primary-600 hover:underline">
            Đăng nhập
          </a>{" "}
          để bình luận.
        </p>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : comments.length === 0 ? (
        <p className="py-8 text-center text-body-sm text-gray-400">
          Chưa có bình luận nào. Hãy là người đầu tiên! 🎉
        </p>
      ) : (
        <div className="space-y-5">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              storyAuthorId={storyAuthorId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              token={token}
              likedIds={likedIds}
              onLikeToggle={handleLikeToggle}
              onDelete={handleDelete}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
