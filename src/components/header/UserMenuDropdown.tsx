"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  XMarkIcon,
  BookOpenIcon,
  ArrowRightOnRectangleIcon,
  PencilSquareIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  GiftIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { authFetch } from "@/lib/api";

interface Props {
  coinBalance: number | null;
  isAuthor: boolean;
  isAdmin: boolean;
  isMod: boolean;
}

export default function UserMenuDropdown({ coinBalance, isAuthor, isAdmin, isMod }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const { profile } = useUserProfile();

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  if (!session?.user) return null;

  const avatar = (profile?.image || session.user.image) as string | undefined;

  return (
    <div className="relative hidden md:block" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center rounded-full transition-opacity hover:opacity-80"
        aria-label="Menu tài khoản"
      >
        {avatar ? (
          <Image
            src={avatar}
            alt=""
            width={34}
            height={34}
            className="h-[34px] w-[34px] rounded-full object-cover ring-2 ring-gray-100"
          />
        ) : (
          <UserCircleIcon className="h-9 w-9 text-gray-400" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <p className="text-body-sm font-semibold text-gray-900">{session.user.name}</p>
              {isAuthor && (
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
                  Tác giả
                </span>
              )}
            </div>
            <p className="truncate text-caption text-gray-500">{session.user.email}</p>
            {coinBalance !== null && !isAdmin && (
              <div className="mt-1.5 flex items-center gap-1 text-caption font-medium text-amber-600">
                <CurrencyDollarIcon className="h-3.5 w-3.5" />
                {coinBalance.toLocaleString("vi-VN")} xu
              </div>
            )}
          </div>
          <div className="py-1">
            <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-gray-700 hover:bg-gray-50">
              <UserCircleIcon className="h-4 w-4" /> Trang cá nhân
            </Link>
            <Link href="/bookshelf" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-gray-700 hover:bg-gray-50">
              <BookOpenIcon className="h-4 w-4" /> Tủ truyện
            </Link>
            {isAuthor && (
              <Link href="/write" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-gray-700 hover:bg-gray-50">
                <PencilSquareIcon className="h-4 w-4" /> Studio tác giả
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-red-600 hover:bg-red-50">
                <ShieldCheckIcon className="h-4 w-4" /> Quản trị Admin
              </Link>
            )}
            {(isMod || isAdmin) && (
              <Link href="/mod" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-indigo-600 hover:bg-indigo-50">
                <ShieldCheckIcon className="h-4 w-4" /> Kiểm duyệt truyện
              </Link>
            )}
            {!isAdmin && (
              <Link href="/wallet" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-gray-700 hover:bg-gray-50">
                <CurrencyDollarIcon className="h-4 w-4" /> Nạp xu
              </Link>
            )}
            {!isAdmin && !isMod && (
              <Link href="/quests" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-amber-600 hover:bg-amber-50">
                <GiftIcon className="h-4 w-4" /> Nhiệm vụ nhận xu
              </Link>
            )}
            {!isAuthor && !isAdmin && (
              <>
                <Link href="/bookshelf" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-gray-700 hover:bg-gray-50">
                  <ClockIcon className="h-4 w-4" /> Lịch sử đọc
                </Link>
                <Link href="/author/register" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-primary-600 hover:bg-primary-50">
                  <PencilSquareIcon className="h-4 w-4" /> Trở thành tác giả
                </Link>
              </>
            )}
          </div>
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-body-sm text-red-600 hover:bg-red-50"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" /> Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
