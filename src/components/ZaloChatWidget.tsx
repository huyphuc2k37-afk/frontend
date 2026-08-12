"use client";

import { useState } from "react";
import { ChatBubbleLeftRightIcon, XMarkIcon } from "@heroicons/react/24/solid";

const ZALO_PHONE = "0584375253";
const ZALO_LINK = `https://zalo.me/${ZALO_PHONE}`;

export default function ZaloChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {/* Popup */}
      {open && (
        <div className="mb-3 w-72 rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-[#0068FF] px-4 py-3">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none">
                <circle cx="24" cy="24" r="24" fill="white" />
                <path
                  d="M24 8C15.16 8 8 14.54 8 22.62c0 4.86 2.64 9.16 6.74 11.92-.18 1.7-.98 4.18-2.84 5.88 0 0 4.1-.36 7.06-2.9.94.16 1.94.28 2.98.28 8.84 0 16.06-6.54 16.06-14.62S32.84 8 24 8z"
                  fill="#0068FF"
                />
                <path
                  d="M15.5 20.5h3.5v7h-3.5v-7zm6.5-3h3.5v10H22v-10zm6.5 1.5H32v8.5h-3.5V19z"
                  fill="white"
                />
              </svg>
              <span className="text-body-sm font-semibold text-white">Hỗ trợ VStory</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-white/80 hover:bg-white/20 hover:text-white"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <div className="mb-3 rounded-xl bg-gray-50 p-3">
              <p className="text-body-sm text-gray-700">
                Chào bạn! 👋
              </p>
              <p className="mt-1 text-body-sm text-gray-600">
                Bạn cần hỗ trợ về truyện, tài khoản hay nạp xu? Nhắn tin cho mình qua Zalo nhé!
              </p>
            </div>

            <a
              href={ZALO_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0068FF] py-3 text-body-sm font-semibold text-white transition-colors hover:bg-[#0055DD]"
            >
              <svg viewBox="0 0 48 48" className="h-5 w-5" fill="none">
                <circle cx="24" cy="24" r="24" fill="white" />
                <path
                  d="M24 8C15.16 8 8 14.54 8 22.62c0 4.86 2.64 9.16 6.74 11.92-.18 1.7-.98 4.18-2.84 5.88 0 0 4.1-.36 7.06-2.9.94.16 1.94.28 2.98.28 8.84 0 16.06-6.54 16.06-14.62S32.84 8 24 8z"
                  fill="#0068FF"
                />
              </svg>
              Chat qua Zalo
            </a>

            <p className="mt-3 text-center text-[11px] text-gray-400">
              Thời gian hỗ trợ: 8:00 - 22:00 hàng ngày
            </p>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setOpen(!open)}
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95"
        title="Chat với Admin qua Zalo"
      >
        {open ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <>
            <ChatBubbleLeftRightIcon className="h-6 w-6" />
            {/* Ping animation */}
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500" />
            </span>
          </>
        )}
      </button>
    </div>
  );
}
