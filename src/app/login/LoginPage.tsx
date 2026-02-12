"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { signIn } from "next-auth/react";

/* ─────────── Google icon SVG (inline) ─────────── */

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
        fill="#EA4335"
      />
    </svg>
  );
}

/* ─────────── component ─────────── */

export default function LoginPage() {
  const handleGoogle = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — branding panel (hidden on mobile) */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 lg:flex lg:flex-col lg:items-center lg:justify-center">
        {/* decorative */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-primary-400/10 blur-3xl" />

        <div className="relative z-10 px-12 text-center">
          <Link href="/" className="mb-8 inline-block">
            <span className="text-display-md font-bold text-white">
              V<span className="text-gradient">Story</span>
            </span>
          </Link>
          <p className="mx-auto max-w-md text-body-lg leading-relaxed text-primary-200/80">
            Nền tảng đọc và viết truyện chữ dành cho người Việt. Đăng nhập để
            khám phá hàng nghìn câu chuyện hấp dẫn.
          </p>

          {/* stats */}
          <div className="mt-12 grid grid-cols-3 gap-8">
            {[
              { value: "10K+", label: "Truyện" },
              { value: "2K+", label: "Tác giả" },
              { value: "500K+", label: "Độc giả" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-heading-md font-bold text-white">
                  {s.value}
                </div>
                <div className="text-body-sm text-primary-300">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — login */}
      <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm text-center"
        >
          {/* Mobile logo */}
          <div className="mb-10 lg:hidden">
            <Link href="/">
              <span className="text-display-sm font-bold text-gray-900">
                V<span className="text-gradient">Story</span>
              </span>
            </Link>
          </div>

          <h1 className="text-heading-lg font-bold text-gray-900">
            Đăng nhập
          </h1>
          <p className="mt-2 text-body-md text-gray-500">
            Đăng nhập nhanh bằng tài khoản Google của bạn.
          </p>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            className="mt-10 flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-4 text-body-md font-semibold text-gray-700 shadow-card transition-all hover:shadow-card-hover hover:scale-[1.02] active:scale-[0.98]"
          >
            <GoogleIcon className="h-6 w-6" />
            Tiếp tục với Google
          </button>

          {/* Trust note */}
          <div className="mt-8 flex items-center justify-center gap-2 text-body-sm text-gray-400">
            <ShieldCheckIcon className="h-4 w-4" />
            <span>Bảo mật bởi Google OAuth 2.0</span>
          </div>

          {/* Terms */}
          <p className="mt-6 text-caption leading-relaxed text-gray-400">
            Bằng việc đăng nhập, bạn đồng ý với{" "}
            <Link href="/terms" className="underline hover:text-gray-600">
              Điều khoản sử dụng
            </Link>{" "}
            và{" "}
            <Link href="/privacy" className="underline hover:text-gray-600">
              Chính sách bảo mật
            </Link>{" "}
            của VStory.
          </p>

          {/* Back home */}
          <p className="mt-8">
            <Link
              href="/"
              className="text-body-sm text-gray-400 hover:text-gray-600"
            >
              ← Về trang chủ
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
