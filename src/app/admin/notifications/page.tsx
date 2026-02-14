"use client";

import { useState, useEffect, useRef } from "react";
import { useAdmin } from "@/components/AdminLayout";
import { API_BASE_URL } from "@/lib/api";
import {
  PaperAirplaneIcon,
  MegaphoneIcon,
  UserIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface UserResult {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
}

interface SendResult {
  type: "success" | "error";
  msg: string;
}

export default function AdminNotificationsPage() {
  const { token } = useAdmin();

  // Tab: "personal" | "broadcast"
  const [tab, setTab] = useState<"personal" | "broadcast">("personal");

  // Personal notification
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Broadcast
  const [bTitle, setBTitle] = useState("");
  const [bMessage, setBMessage] = useState("");
  const [bSending, setBSending] = useState(false);
  const [bResult, setBResult] = useState<SendResult | null>(null);

  // History
  const [history, setHistory] = useState<{ userName: string; title: string; time: string }[]>([]);

  // User search with debounce
  useEffect(() => {
    if (!token || searchQuery.length < 1) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/admin/users/search?q=${encodeURIComponent(searchQuery)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, token]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectUser = (user: UserResult) => {
    setSelectedUser(user);
    setSearchQuery("");
    setShowDropdown(false);
    setResult(null);
  };

  const sendPersonal = async () => {
    if (!token || !selectedUser || !title.trim() || !message.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/notifications/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          title: title.trim(),
          message: message.trim(),
          link: link.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ type: "success", msg: `Đã gửi thông báo đến "${selectedUser.name}"` });
        setHistory((prev) => [
          { userName: selectedUser.name, title: title.trim(), time: new Date().toLocaleTimeString("vi-VN") },
          ...prev.slice(0, 9),
        ]);
        setTitle("");
        setMessage("");
        setLink("");
        setSelectedUser(null);
      } else {
        setResult({ type: "error", msg: data.error || "Lỗi gửi thông báo" });
      }
    } catch {
      setResult({ type: "error", msg: "Lỗi kết nối server" });
    }
    setSending(false);
  };

  const sendBroadcast = async () => {
    if (!token || !bTitle.trim() || !bMessage.trim()) return;
    setBSending(true);
    setBResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/notifications/broadcast`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: bTitle.trim(), message: bMessage.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setBResult({ type: "success", msg: `Đã gửi thông báo đến ${data.count} người dùng` });
        setBTitle("");
        setBMessage("");
      } else {
        setBResult({ type: "error", msg: data.error || "Lỗi gửi" });
      }
    } catch {
      setBResult({ type: "error", msg: "Lỗi kết nối server" });
    }
    setBSending(false);
  };

  const roleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Admin";
      case "moderator": return "Mod";
      case "author": return "Tác giả";
      default: return "Đọc giả";
    }
  };

  const roleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-700";
      case "moderator": return "bg-purple-100 text-purple-700";
      case "author": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-heading-md font-bold text-gray-900">Gửi thông báo</h2>
        <p className="mt-1 text-body-sm text-gray-500">
          Gửi thông báo cá nhân đến người dùng hoặc gửi cho tất cả.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
        <button
          onClick={() => { setTab("personal"); setResult(null); }}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-body-sm font-medium transition-all ${
            tab === "personal" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <UserIcon className="h-4 w-4" />
          Gửi cá nhân
        </button>
        <button
          onClick={() => { setTab("broadcast"); setBResult(null); }}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-body-sm font-medium transition-all ${
            tab === "broadcast" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <MegaphoneIcon className="h-4 w-4" />
          Gửi tất cả
        </button>
      </div>

      {/* Personal tab */}
      {tab === "personal" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              {/* User search */}
              <div ref={searchRef} className="relative mb-5">
                <label className="mb-2 block text-body-sm font-semibold text-gray-700">
                  Chọn người nhận <span className="text-red-500">*</span>
                </label>
                {selectedUser ? (
                  <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-200 text-body-sm font-bold text-indigo-700">
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-body-sm font-semibold text-gray-900">{selectedUser.name}</p>
                        <p className="text-[11px] text-gray-500">{selectedUser.email}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${roleColor(selectedUser.role)}`}>
                        {roleLabel(selectedUser.role)}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="text-body-sm text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm theo tên hoặc email..."
                        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-body-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                      />
                      {searching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                        </div>
                      )}
                    </div>
                    {showDropdown && searchResults.length > 0 && (
                      <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => selectUser(user)}
                            className="flex w-full items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-[12px] font-bold text-gray-600">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-body-sm font-medium text-gray-900 truncate">{user.name}</p>
                              <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${roleColor(user.role)}`}>
                              {roleLabel(user.role)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {showDropdown && searchResults.length === 0 && searchQuery.length >= 1 && !searching && (
                      <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white p-4 text-center text-body-sm text-gray-400 shadow-lg">
                        Không tìm thấy người dùng
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="mb-2 block text-body-sm font-semibold text-gray-700">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Thông báo từ Admin"
                  maxLength={100}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                />
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className="mb-2 block text-body-sm font-semibold text-gray-700">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập nội dung thông báo..."
                  rows={4}
                  maxLength={500}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-body-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                />
                <p className="mt-1 text-right text-[11px] text-gray-400">{message.length}/500</p>
              </div>

              {/* Link (optional) */}
              <div className="mb-5">
                <label className="mb-2 block text-body-sm font-semibold text-gray-700">
                  Link đính kèm <span className="text-[11px] text-gray-400">(tuỳ chọn)</span>
                </label>
                <input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="VD: /wallet hoặc /story/ten-truyen"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                />
              </div>

              {/* Result */}
              {result && (
                <div className={`mb-4 flex items-center gap-2 rounded-xl p-3 text-body-sm font-medium ${
                  result.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                }`}>
                  {result.type === "success" ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5" />
                  )}
                  {result.msg}
                </div>
              )}

              {/* Send button */}
              <button
                onClick={sendPersonal}
                disabled={!selectedUser || !title.trim() || !message.trim() || sending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-body-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                {sending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <PaperAirplaneIcon className="h-4 w-4" />
                )}
                {sending ? "Đang gửi..." : "Gửi thông báo"}
              </button>
            </div>
          </div>

          {/* History sidebar */}
          <div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-body-sm font-semibold text-gray-700">Đã gửi gần đây</h3>
              {history.length === 0 ? (
                <p className="mt-3 text-[12px] text-gray-400">Chưa gửi thông báo nào trong phiên này.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {history.map((item, i) => (
                    <div key={i} className="rounded-lg bg-gray-50 px-3 py-2">
                      <p className="text-[12px] font-medium text-gray-700">{item.title}</p>
                      <p className="text-[11px] text-gray-400">
                        → {item.userName} • {item.time}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Broadcast tab */}
      {tab === "broadcast" && (
        <div className="max-w-2xl">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 p-3">
              <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-amber-600" />
              <p className="text-body-sm text-amber-700">
                Thông báo sẽ được gửi đến <strong>tất cả</strong> người dùng trên hệ thống.
              </p>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-body-sm font-semibold text-gray-700">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                value={bTitle}
                onChange={(e) => setBTitle(e.target.value)}
                placeholder="VD: Thông báo bảo trì hệ thống"
                maxLength={100}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
              />
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-body-sm font-semibold text-gray-700">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <textarea
                value={bMessage}
                onChange={(e) => setBMessage(e.target.value)}
                placeholder="Nhập nội dung thông báo..."
                rows={4}
                maxLength={500}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-body-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
              />
              <p className="mt-1 text-right text-[11px] text-gray-400">{bMessage.length}/500</p>
            </div>

            {bResult && (
              <div className={`mb-4 flex items-center gap-2 rounded-xl p-3 text-body-sm font-medium ${
                bResult.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}>
                {bResult.type === "success" ? <CheckCircleIcon className="h-5 w-5" /> : <ExclamationTriangleIcon className="h-5 w-5" />}
                {bResult.msg}
              </div>
            )}

            <button
              onClick={sendBroadcast}
              disabled={!bTitle.trim() || !bMessage.trim() || bSending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-body-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
            >
              {bSending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <MegaphoneIcon className="h-4 w-4" />
              )}
              {bSending ? "Đang gửi..." : "Gửi cho tất cả"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
