"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  HandThumbUpIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  PaperAirplaneIcon,
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
  isOpen: boolean;
  onClose: () => void;
  chapterId: string;
  paragraphIndex: number;
  paragraphText: string;
  session: any;
  token?: string;
}

/* ─── Badges ─────────────────────────────────── */
function AdminBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-900 shadow-sm ring-1 ring-amber-400/50">
      <ShieldCheckIcon className="h-2.5 w-2.5" />
      Admin
    </span>
  );
}

function AuthorBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700 ring-1 ring-blue-200">
      <CheckBadgeIcon className="h-2.5 w-2.5" />
      Tác giả
    </span>
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

/* ─── Comment Item ───────────────────────────── */
function InlineCommentItem({
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

  return (
    <div className={`${depth > 0 ? "ml-8 border-l-2 border-gray-100 pl-3" : ""}`}>
      <div className="flex gap-2.5 group">
        {/* Avatar */}
        <div className="flex-shrink-0 relative">
          {comment.user.image ? (
            <Image
              src={comment.user.image}
              alt={comment.user.name}
              width={depth > 0 ? 28 : 32}
              height={depth > 0 ? 28 : 32}
              className={`rounded-full object-cover ${
                isAdminUser ? "ring-2 ring-amber-400" : isAuthor ? "ring-2 ring-blue-400" : ""
              }`}
              style={{ width: depth > 0 ? 28 : 32, height: depth > 0 ? 28 : 32 }}
              unoptimized
            />
          ) : (
            <div
              className={`flex items-center justify-center rounded-full text-[10px] font-bold ${
                isAdminUser
                  ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white ring-2 ring-amber-400"
                  : isAuthor
                  ? "bg-blue-100 text-blue-600 ring-2 ring-blue-400"
                  : "bg-primary-100 text-primary-600"
              }`}
              style={{ width: depth > 0 ? 28 : 32, height: depth > 0 ? 28 : 32 }}
            >
              {isAdminUser ? "★" : comment.user.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1">
            <span
              className={`text-caption font-semibold ${
                isAdminUser
                  ? "bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent"
                  : isAuthor
                  ? "text-blue-700"
                  : "text-gray-900"
              }`}
            >
              {comment.user.name}
            </span>
            {isAdminUser && <AdminBadge />}
            {isAuthor && !isAdminUser && <AuthorBadge />}
            <span className="text-[10px] text-gray-400">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>

          <p className="mt-0.5 text-caption text-gray-700 whitespace-pre-line break-words">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="mt-1 flex items-center gap-3">
            <button
              onClick={() => token && onLikeToggle(comment.id)}
              className={`inline-flex items-center gap-0.5 text-[10px] transition-colors ${
                liked ? "text-primary-600 font-semibold" : "text-gray-400 hover:text-primary-500"
              } ${!token ? "cursor-default" : "cursor-pointer"}`}
              disabled={!token}
            >
              {liked ? <HandThumbUpSolidIcon className="h-3 w-3" /> : <HandThumbUpIcon className="h-3 w-3" />}
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>

            {token && depth === 0 && (
              <button
                onClick={() => onReply(comment.id, comment.user.name)}
                className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-primary-500 transition-colors"
              >
                <ArrowUturnLeftIcon className="h-3 w-3" />
                Trả lời
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => onDelete(comment.id)}
                className="inline-flex items-center gap-0.5 text-[10px] text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <TrashIcon className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <InlineCommentItem
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

/* ─── Main Drawer Component ──────────────────── */
export default function ParagraphCommentDrawer({
  isOpen,
  onClose,
  chapterId,
  paragraphIndex,
  paragraphText,
  session,
  token,
}: Props) {
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

  // Fetch paragraph comments
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/comments?chapterId=${chapterId}&paragraphIndex=${paragraphIndex}`
      );
      const data = await res.json();
      setComments(data.comments || []);
      setTotal(data.total || 0);
      setStoryAuthorId(data.storyAuthorId || null);
    } catch {}
    setLoading(false);
  }, [chapterId, paragraphIndex]);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
      setText("");
      setReplyTo(null);
    }
  }, [isOpen, fetchComments]);

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

  // Post comment
  const postComment = async () => {
    if (!token || !text.trim() || posting) return;
    setPosting(true);
    try {
      const body: any = { content: text.trim() };
      if (replyTo) {
        body.parentId = replyTo.id;
      } else {
        body.chapterId = chapterId;
        body.paragraphIndex = paragraphIndex;
      }

      const res = await authFetch("/api/comments", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setText("");
        setReplyTo(null);
        fetchComments();
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
      const updateCount = (list: CommentData[]): CommentData[] =>
        list.map((c) => {
          if (c.id === commentId) {
            return { ...c, _count: { ...c._count, commentLikes: c._count.commentLikes + (data.liked ? 1 : -1) } };
          }
          if (c.replies) return { ...c, replies: updateCount(c.replies) };
          return c;
        });
      setComments(updateCount);
    } catch {}
  };

  // Delete comment
  const handleDelete = async (commentId: string) => {
    if (!token || !confirm("Xóa bình luận này?")) return;
    try {
      const res = await authFetch(`/api/comments/${commentId}`, token, { method: "DELETE" });
      if (res.ok) fetchComments();
    } catch {}
  };

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="flex items-center gap-2 text-body-sm font-bold text-gray-900">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary-500" />
            Bình luận đoạn văn ({total})
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Quoted paragraph */}
        <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
          <p className="text-caption text-gray-600 line-clamp-4 leading-relaxed border-l-3 border-primary-400 pl-3 italic">
            {paragraphText}
          </p>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-7 w-7 animate-spin rounded-full border-3 border-primary-500 border-t-transparent" />
            </div>
          ) : comments.length === 0 ? (
            <p className="py-8 text-center text-caption text-gray-400">
              Chưa có bình luận nào cho đoạn này.
              <br />
              Hãy là người đầu tiên! 💬
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <InlineCommentItem
                  key={c.id}
                  comment={c}
                  storyAuthorId={storyAuthorId}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  token={token}
                  likedIds={likedIds}
                  onLikeToggle={handleLikeToggle}
                  onDelete={handleDelete}
                  onReply={(id, name) => setReplyTo({ id, name })}
                />
              ))}
            </div>
          )}
        </div>

        {/* Comment input */}
        <div className="border-t border-gray-100 bg-white px-5 py-4">
          {session ? (
            <div>
              {replyTo && (
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-[10px] text-gray-600">
                  <ArrowUturnLeftIcon className="h-3 w-3" />
                  Đang trả lời <span className="font-semibold">{replyTo.name}</span>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="ml-auto text-gray-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="flex items-end gap-2">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={replyTo ? `Trả lời ${replyTo.name}...` : "Viết bình luận..."}
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-caption text-gray-900 placeholder-gray-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) postComment();
                  }}
                />
                <button
                  onClick={postComment}
                  disabled={!text.trim() || posting}
                  className="flex-shrink-0 rounded-xl bg-primary-500 p-2.5 text-white hover:bg-primary-600 disabled:opacity-50 transition-colors"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-caption text-gray-500">
              <a href="/login" className="text-primary-600 hover:underline">
                Đăng nhập
              </a>{" "}
              để bình luận.
            </p>
          )}
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
