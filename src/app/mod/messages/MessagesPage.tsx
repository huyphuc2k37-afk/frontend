"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useMod } from "@/components/ModLayout";
import { API_BASE_URL } from "@/lib/api";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

interface Participant {
  id: string;
  name: string;
  image: string | null;
  role: string;
}

interface ConversationSummary {
  id: string;
  subject: string | null;
  storyId: string | null;
  updatedAt: string;
  lastMessage: { id: string; content: string; sender: { id: string; name: string; role: string }; createdAt: string } | null;
  otherParticipants: Participant[];
  hasUnread: boolean;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: Participant;
}

export default function MessagesPage() {
  const { token } = useMod();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [convParticipants, setConvParticipants] = useState<Participant[]>([]);
  const [convSubject, setConvSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [searchAuthor, setSearchAuthor] = useState("");
  const [authorResults, setAuthorResults] = useState<{ id: string; name: string; email: string; image: string | null }[]>([]);
  const [allAuthors, setAllAuthors] = useState<{ id: string; name: string; email: string; image: string | null }[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [newContent, setNewContent] = useState("");
  const [selectedAuthorId, setSelectedAuthorId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMsgCount = useRef(0);

  const headers = useMemo<HeadersInit | undefined>(
    () => (token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : undefined),
    [token]
  );

  // Fetch conversations (reusable)
  const fetchConversations = useCallback(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/messages/conversations`, { headers })
      .then((r) => r.ok ? r.json() : { conversations: [] })
      .then((data) => { setConversations(data?.conversations || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token, headers]);

  // Fetch messages (reusable)
  const fetchMessages = useCallback(() => {
    if (!token || !selectedConv) return;
    fetch(`${API_BASE_URL}/api/messages/conversations/${selectedConv}`, { headers })
      .then((r) => r.ok ? r.json() : { messages: [], conversation: null })
      .then((data) => {
        setMessages(data?.messages || []);
        setConvParticipants(data?.conversation?.participants || []);
        setConvSubject(data?.conversation?.subject || "");
      })
      .catch(() => {});
  }, [token, selectedConv, headers]);

  // Initial load + polling conversations every 5s
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Initial load + polling messages every 5s
  useEffect(() => {
    fetchMessages();
    if (!selectedConv) return;
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages, selectedConv]);

  useEffect(() => {
    if (messages.length !== prevMsgCount.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      prevMsgCount.current = messages.length;
    }
  }, [messages]);

  // Load all authors when modal opens
  useEffect(() => {
    if (!token || !showNew || allAuthors.length > 0) return;
    fetch(`${API_BASE_URL}/api/messages/authors?search=`, { headers })
      .then((r) => r.ok ? r.json() : { authors: [] })
      .then((data) => setAllAuthors(data?.authors || []))
      .catch(() => {});
  }, [token, showNew, allAuthors.length, headers]);

  // Search authors
  useEffect(() => {
    if (!token || searchAuthor.length < 2) { setAuthorResults([]); return; }
    const timer = setTimeout(() => {
      fetch(`${API_BASE_URL}/api/messages/authors?search=${encodeURIComponent(searchAuthor)}`, { headers })
        .then((r) => r.ok ? r.json() : { authors: [] })
        .then((data) => setAuthorResults(data?.authors || []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [token, searchAuthor, headers]);

  const sendReply = async () => {
    if (!token || !selectedConv || !newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/conversations/${selectedConv}/reply`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
      }
    } catch {}
    setSending(false);
  };

  const createConversation = async () => {
    if (!token || !selectedAuthorId || !newContent.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/conversations`, {
        method: "POST",
        headers,
        body: JSON.stringify({ authorId: selectedAuthorId, subject: newSubject.trim(), message: newContent.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setShowNew(false);
        setNewSubject("");
        setNewContent("");
        setSelectedAuthorId("");
        setSearchAuthor("");
        // Refresh conversations
        const convRes = await fetch(`${API_BASE_URL}/api/messages/conversations`, { headers });
        if (convRes.ok) {
          const convData = await convRes.json();
          setConversations(convData?.conversations || []);
        }
        setSelectedConv(data.conversation.id);
      }
    } catch {}
    setSending(false);
  };

  const formatTime = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* Sidebar: Conversation list */}
      <div className={`w-full border-r border-gray-200 md:w-80 ${selectedConv ? "hidden md:block" : ""}`}>
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-heading-sm font-bold text-gray-900">Tin nhắn</h2>
          <button
            onClick={() => setShowNew(true)}
            className="rounded-lg bg-indigo-500 p-2 text-white hover:bg-indigo-600"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
          {conversations.length === 0 ? (
            <div className="p-6 text-center">
              <ChatBubbleLeftRightIcon className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-2 text-body-sm text-gray-500">Chưa có hội thoại nào</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv.id)}
                className={`w-full border-b border-gray-50 p-4 text-left transition-colors hover:bg-gray-50 ${
                  selectedConv === conv.id ? "bg-indigo-50" : ""
                } ${conv.hasUnread ? "bg-blue-50/50" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500">
                    <span className="text-body-sm font-bold text-white">
                      {conv.otherParticipants[0]?.name?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-body-sm font-semibold text-gray-900">
                        {conv.otherParticipants.map((p) => p.name).join(", ")}
                      </p>
                      <span className="text-[10px] text-gray-400">{formatTime(conv.updatedAt)}</span>
                    </div>
                    {conv.subject && (
                      <p className="truncate text-caption font-medium text-indigo-600">{conv.subject}</p>
                    )}
                    {conv.lastMessage && (
                      <p className="mt-0.5 truncate text-caption text-gray-500">
                        {conv.lastMessage.sender.name}: {conv.lastMessage.content}
                      </p>
                    )}
                    {conv.hasUnread && (
                      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-indigo-500" />
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main: Messages */}
      <div className={`flex flex-1 flex-col ${!selectedConv ? "hidden md:flex" : ""}`}>
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-100 p-4">
              <button onClick={() => setSelectedConv(null)} className="rounded-lg p-1.5 hover:bg-gray-100 md:hidden">
                <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500">
                <span className="text-body-sm font-bold text-white">
                  {convParticipants.find((p) => p.role === "author")?.name?.charAt(0) || "?"}
                </span>
              </div>
              <div>
                <p className="text-body-sm font-semibold text-gray-900">
                  {convParticipants.filter((p) => p.role === "author").map((p) => p.name).join(", ") || "Tác giả"}
                </p>
                {convSubject && <p className="text-caption text-indigo-600">{convSubject}</p>}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMe = msg.sender.role === "moderator" || msg.sender.role === "admin";
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      isMe ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-900"
                    }`}>
                      {!isMe && <p className="mb-1 text-[10px] font-medium text-indigo-600">{msg.sender.name}</p>}
                      <p className="whitespace-pre-wrap text-body-sm">{msg.content}</p>
                      <p className={`mt-1 text-[10px] ${isMe ? "text-indigo-200" : "text-gray-400"}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 p-4">
              <div className="flex items-end gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder="Nhập tin nhắn..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  onClick={sendReply}
                  disabled={!newMessage.trim() || sending}
                  className="rounded-xl bg-indigo-500 p-2.5 text-white hover:bg-indigo-600 disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="mx-auto h-16 w-16 text-gray-200" />
              <p className="mt-3 text-body-md text-gray-400">Chọn hội thoại hoặc tạo mới</p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-heading-sm font-bold text-gray-900">Nhắn tin cho tác giả</h3>

            {/* Search author */}
            <div className="mt-4">
              <label className="text-body-sm font-medium text-gray-700">Tìm tác giả</label>
              <div className="relative mt-1">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  value={searchAuthor}
                  onChange={(e) => setSearchAuthor(e.target.value)}
                  placeholder="Nhập tên hoặc email..."
                  className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-body-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>
              {/* Selected author badge */}
              {selectedAuthorId && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 text-[11px] font-bold text-white">
                    {searchAuthor.charAt(0)}
                  </div>
                  <span className="text-body-sm font-medium text-indigo-700">{searchAuthor}</span>
                  <button onClick={() => { setSelectedAuthorId(""); setSearchAuthor(""); }} className="ml-auto text-indigo-400 hover:text-indigo-600">&times;</button>
                </div>
              )}
              {/* Search results */}
              {authorResults.length > 0 && !selectedAuthorId && (
                <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white">
                  {authorResults.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => { setSelectedAuthorId(a.id); setSearchAuthor(a.name); setAuthorResults([]); }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50"
                    >
                      <p className="text-body-sm font-medium text-gray-900">{a.name}</p>
                      <p className="text-caption text-gray-500">{a.email}</p>
                    </button>
                  ))}
                </div>
              )}
              {/* Pre-loaded author list */}
              {!selectedAuthorId && searchAuthor.length < 2 && allAuthors.length > 0 && (
                <div className="mt-2">
                  <p className="mb-1.5 text-caption font-medium text-gray-400">Chọn nhanh</p>
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50">
                    {allAuthors.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => { setSelectedAuthorId(a.id); setSearchAuthor(a.name); }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-indigo-50"
                      >
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-[11px] font-bold text-white">
                          {a.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-body-sm font-medium text-gray-900">{a.name}</p>
                          <p className="truncate text-[11px] text-gray-400">{a.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Subject */}
            <div className="mt-3">
              <label className="text-body-sm font-medium text-gray-700">Tiêu đề (tùy chọn)</label>
              <input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="VD: Về truyện ABC..."
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-body-sm focus:border-indigo-400 focus:outline-none"
              />
            </div>

            {/* Message */}
            <div className="mt-3">
              <label className="text-body-sm font-medium text-gray-700">Nội dung tin nhắn</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Nhập nội dung..."
                rows={4}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-body-sm focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => { setShowNew(false); setSearchAuthor(""); setSelectedAuthorId(""); setNewSubject(""); setNewContent(""); }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-body-sm text-gray-600 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={createConversation}
                disabled={!selectedAuthorId || !newContent.trim() || sending}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-body-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
              >
                {sending ? "Đang gửi..." : "Gửi tin nhắn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
