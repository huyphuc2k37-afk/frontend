"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  PencilSquareIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useWalletBalance } from "@/contexts/WalletBalanceContext";
import NotificationsDropdown from "@/components/header/NotificationsDropdown";
import UserMenuDropdown from "@/components/header/UserMenuDropdown";

interface HeaderActionsProps {
  unreadMsgCount: number;
}

export default function HeaderActions({ unreadMsgCount }: HeaderActionsProps) {
  const { data: session } = useSession();
  const { profile } = useUserProfile();
  const { balance: coinBalance } = useWalletBalance();
  const isAuthor = profile?.role === "author";
  const isAdmin = profile?.role === "admin";
  const isMod = profile?.role === "moderator";
  const canMessage = isAuthor || isMod || isAdmin;
  const messagesHref = isAdmin ? "/admin/messages" : isMod ? "/mod/messages" : "/write/messages";

  if (!session?.user) {
    return (
      <>
        <Link
          href="/login"
          className="hidden rounded-lg px-3 py-2 text-body-sm font-medium text-gray-600 hover:text-gray-900 md:block"
        >
          Đăng nhập
        </Link>
        <Link
          href="/explore"
          className="hidden items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2 text-body-sm font-semibold text-white shadow-sm hover:bg-primary-600 sm:inline-flex"
        >
          Bắt đầu đọc
        </Link>
      </>
    );
  }

  return (
    <>
      {canMessage && (
        <Link
          href={messagesHref}
          className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          aria-label={`Tin nhắn${unreadMsgCount > 0 ? ` (${unreadMsgCount} chưa đọc)` : ""}`}
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
          {unreadMsgCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadMsgCount > 9 ? "9+" : unreadMsgCount}
            </span>
          )}
        </Link>
      )}

      <NotificationsDropdown />

      {!isAdmin && (
        <Link
          href="/wallet"
          className="hidden items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-body-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-600 hover:shadow-md sm:inline-flex"
        >
          <CurrencyDollarIcon className="h-4 w-4" />
          {coinBalance !== null ? `${coinBalance.toLocaleString("vi-VN")} xu` : "... xu"}
        </Link>
      )}
      {isAdmin ? (
        <Link
          href="/admin"
          className="hidden items-center gap-1.5 rounded-full bg-red-500 px-4 py-2 text-body-sm font-semibold text-white shadow-sm transition-all hover:bg-red-600 hover:shadow-md sm:inline-flex"
        >
          <ShieldCheckIcon className="h-4 w-4" /> Admin
        </Link>
      ) : isMod ? (
        <Link
          href="/mod"
          className="hidden items-center gap-1.5 rounded-full bg-indigo-500 px-4 py-2 text-body-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-600 hover:shadow-md sm:inline-flex"
        >
          <ShieldCheckIcon className="h-4 w-4" /> Kiểm duyệt
        </Link>
      ) : isAuthor ? (
        <Link
          href="/write"
          className="hidden items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2 text-body-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-600 hover:shadow-md sm:inline-flex"
        >
          <PencilSquareIcon className="h-4 w-4" /> Studio
        </Link>
      ) : null}

      <UserMenuDropdown
        coinBalance={coinBalance}
        isAuthor={isAuthor}
        isAdmin={isAdmin}
        isMod={isMod}
      />
    </>
  );
}
