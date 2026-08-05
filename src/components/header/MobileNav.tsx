"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  UserCircleIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useWalletBalance } from "@/contexts/WalletBalanceContext";
import HeaderSearch from "@/components/header/HeaderSearch";

interface MobileNavProps {
  isOpen: boolean;
  navLinks: { label: string; href: string }[];
  isActive: (href: string) => boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, navLinks, isActive, onClose }: MobileNavProps) {
  const { data: session } = useSession();
  const { profile } = useUserProfile();
  const { balance: coinBalance } = useWalletBalance();
  const isAuthor = profile?.role === "author";
  const isAdmin = profile?.role === "admin";
  const isMod = profile?.role === "moderator";
  const token = (session as any)?.accessToken as string | undefined;

  if (!isOpen) return null;

  return (
    <div className="overflow-hidden border-t border-[#f0e6d0]/50 md:hidden animate-in fade-in slide-in-from-top-1 duration-150">
      <nav className="bg-[#fdf9f0] px-4 py-3" aria-label="Mobile navigation">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={`block rounded-lg px-3 py-2.5 text-body-sm font-medium transition-colors ${
              isActive(link.href) ? "text-primary-600" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {link.label}
          </Link>
        ))}

        {session?.user ? (
          <>
            <div className="my-2 border-t border-gray-100" />
            <div className="flex items-center gap-3 px-3 py-2">
              {session.user.image ? (
                <Image src={session.user.image} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-body-sm font-semibold text-gray-900">{session.user.name}</p>
                  {isAuthor && (
                    <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
                      Tác giả
                    </span>
                  )}
                </div>
                <p className="truncate text-caption text-gray-500">{session.user.email}</p>
              </div>
            </div>
            {coinBalance !== null && !isAdmin && (
              <Link
                href="/wallet"
                onClick={onClose}
                className="mx-3 mb-1 flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2"
              >
                <span className="flex items-center gap-1.5 text-body-sm font-medium text-amber-700">
                  <CurrencyDollarIcon className="h-4 w-4" /> Số dư
                </span>
                <span className="text-body-sm font-bold text-amber-600">
                  {coinBalance.toLocaleString("vi-VN")} xu
                </span>
              </Link>
            )}
            <Link
              href="/profile"
              onClick={onClose}
              className="block rounded-lg px-3 py-2.5 text-body-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Trang cá nhân
            </Link>
            <Link
              href="/bookshelf"
              onClick={onClose}
              className="block rounded-lg px-3 py-2.5 text-body-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Tủ truyện
            </Link>
            {isAuthor && (
              <Link
                href="/write"
                onClick={onClose}
                className="block rounded-lg px-3 py-2.5 text-body-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Studio tác giả
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={onClose}
                className="block rounded-lg px-3 py-2.5 text-body-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Quản trị Admin
              </Link>
            )}
            {(isMod || isAdmin) && (
              <Link
                href="/mod"
                onClick={onClose}
                className="block rounded-lg px-3 py-2.5 text-body-sm font-semibold text-indigo-600 hover:bg-indigo-50"
              >
                Kiểm duyệt truyện
              </Link>
            )}
            {!isAdmin && (
              <Link
                href="/wallet"
                onClick={onClose}
                className="block rounded-lg px-3 py-2.5 text-body-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Nạp xu
              </Link>
            )}
            {!isAdmin && !isMod && (
              <Link
                href="/quests"
                onClick={onClose}
                className="block rounded-lg px-3 py-2.5 text-body-sm font-medium text-amber-600 hover:bg-amber-50"
              >
                🎁 Nhiệm vụ nhận xu
              </Link>
            )}
            {!isAuthor && !isAdmin && (
              <>
                <Link
                  href="/bookshelf"
                  onClick={onClose}
                  className="block rounded-lg px-3 py-2.5 text-body-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Lịch sử đọc
                </Link>
                <Link
                  href="/author/register"
                  onClick={onClose}
                  className="block rounded-lg px-3 py-2.5 text-body-sm font-medium text-primary-600 hover:bg-primary-50"
                >
                  Trở thành tác giả
                </Link>
              </>
            )}
            <button
              onClick={() => {
                onClose();
                signOut({ callbackUrl: "/" });
              }}
              className="block w-full rounded-lg px-3 py-2.5 text-left text-body-sm font-medium text-red-600 hover:bg-red-50"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <Link
            href="/login"
            onClick={onClose}
            className="block rounded-lg px-3 py-2.5 text-body-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Đăng nhập
          </Link>
        )}
      </nav>
    </div>
  );
}
