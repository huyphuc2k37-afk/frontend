"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useStudio } from "@/components/StudioLayout";
import { API_BASE_URL } from "@/lib/api";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
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

export default function AuthorMessagesPage() {
  const { token } = useStudio();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [convParticipants, setConvParticipants] = useState<Participant[]>([]);
  const [convSubject, setConvSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMsgCount = useRef(0);

  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : {};

  const fetchConversations = useCallback(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/messages/conversations`, { headers })
      .then((r) => r.ok ? r.json() : { conversations: [] })
      .then((data) => { setConversations(data?.conversations || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

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
  }, [token, selectedConv]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

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

  const sendReply = async () => {
    if (!token || !selectedConv || !newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/conversations/${selectedConv}/reply`, {
        method: "POST", headers, body: JSON.stringify({ message: newMessage.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
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

  const roleLabel = (role: string) => {
    if (role === "admin") return "Admin";
    if (role === "moderator") return "Kiểm duyệt viên";
    return "";
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" /></div>;
  }

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* Sidebar */}
      <div className={`w-full border-r border-gray-200 md:w-80 ${selectedConv ? "hidden md:block" : ""}`}>
        <div className="border-b border-gray-100 p-4">
          <h2 className="text-heading-sm font-bold text-gray-900">Tin nhắn</h2>
          <p className="mt-0.5 text-caption text-gray-500">Trao đổi với admin & kiểm duyệt viên</p>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
          {conversations.length === 0 ? (
            <div className="p-6 text-center">
              <ChatBubbleLeftRightIcon className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-2 text-body-sm text-gray-500">Chưa có tin nhắn nào</p>
              <p className="mt-1 text-caption text-gray-400">Tin nhắn từ admin/kiểm duyệt viên sẽ xuất hiện ở đây</p>
            </div>
          ) : conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConv(conv.id)}
              className={`w-full border-b border-gray-50 p-4 text-left transition-colors hover:bg-gray-50 ${selectedConv === conv.id ? "bg-primary-50" : ""} ${conv.hasUnread ? "bg-blue-50/50" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500">
                  <span className="text-body-sm font-bold text-white">{conv.otherParticipants[0]?.name?.charAt(0) || "?"}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-body-sm font-semibold text-gray-900">{conv.otherParticipants[0]?.name || "Admin"}</p>
                      {conv.otherParticipants[0]?.role && (
                        <span className="inline-flex rounded-full bg-indigo-100 px-1.5 py-0.5 text-[9px] font-medium text-indigo-700">
                          {roleLabel(conv.otherParticipants[0].role)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">{formatTime(conv.updatedAt)}</span>
                  </div>
                  {conv.subject && <p className="truncate text-caption font-medium text-primary-600">{conv.subject}</p>}
                  {conv.lastMessage && <p className="mt-0.5 truncate text-caption text-gray-500">{conv.lastMessage.content}</p>}
                  {conv.hasUnread && <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500" />}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className={`flex flex-1 flex-col ${!selectedConv ? "hidden md:flex" : ""}`}>
        {selectedConv ? (
          <>
            <div className="flex items-center gap-3 border-b border-gray-100 p-4">
              <button onClick={() => setSelectedConv(null)} className="rounded-lg p-1.5 hover:bg-gray-100 md:hidden"><ArrowLeftIcon className="h-5 w-5 text-gray-500" /></button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500">
                <span className="text-body-sm font-bold text-white">
                  {convParticipants.find((p) => p.role !== "author")?.name?.charAt(0) || "A"}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-body-sm font-semibold text-gray-900">
                    {convParticipants.filter((p) => p.role !== "author").map((p) => p.name).join(", ") || "Admin"}
                  </p>
                  <span className="inline-flex rounded-full bg-indigo-100 px-1.5 py-0.5 text-[9px] font-medium text-indigo-700">
                    {roleLabel(convParticipants.find((p) => p.role !== "author")?.role || "admin")}
                  </span>
                </div>
                {convSubject && <p className="text-caption text-primary-600">{convSubject}</p>}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMe = msg.sender.role === "author";
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isMe ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-900"}`}>
                      {!isMe && (
                        <p className="mb-1 text-[10px] font-medium text-indigo-600">
                          {msg.sender.name} ({roleLabel(msg.sender.role)})
                        </p>
                      )}
                      <p className="whitespace-pre-wrap text-body-sm">{msg.content}</p>
                      <p className={`mt-1 text-[10px] ${isMe ? "text-primary-200" : "text-gray-400"}`}>{formatTime(msg.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-gray-100 p-4">
              <div className="flex items-end gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder="Nhập tin nhắn trả lời..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
                <button
                  onClick={sendReply}
                  disabled={!newMessage.trim() || sending}
                  className="rounded-xl bg-primary-500 p-2.5 text-white hover:bg-primary-600 disabled:opacity-50"
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
              <p className="mt-3 text-body-md text-gray-400">Chọn hội thoại để xem tin nhắn</p>
              <p className="mt-1 text-body-sm text-gray-300">Tin nhắn từ admin/kiểm duyệt viên sẽ xuất hiện ở đây</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
