"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheckIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { signIn } from "next-auth/react";
import { API_BASE_URL } from "@/lib/api";

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

type AuthMode = "login" | "register" | "verify";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGoogle = () => {
    signIn("google", { callbackUrl });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Check if it's an email verification issue
        if (result.error.includes("chưa được xác nhận")) {
          setMode("verify");
          setError(null);
        } else {
          setError(result.error);
        }
      } else if (result?.ok) {
        window.location.href = callbackUrl;
      }
    } catch {
      setError("Không thể kết nối server");
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Vui lòng nhập tên hiển thị");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Đăng ký thất bại");
      } else {
        setMode("verify");
        setSuccess("Mã xác nhận đã được gửi đến email của bạn");
      }
    } catch {
      setError("Không thể kết nối server");
    }
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Xác nhận thất bại");
      } else {
        setSuccess("Xác nhận thành công! Đang đăng nhập...");
        // Auto login after verification
        setTimeout(async () => {
          const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });
          if (result?.ok) {
            window.location.href = callbackUrl;
          } else {
            setMode("login");
            setSuccess("Email đã xác nhận. Vui lòng đăng nhập.");
          }
        }, 1000);
      }
    } catch {
      setError("Không thể kết nối server");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Đã gửi lại mã xác nhận");
      } else {
        setError(data.error || "Không thể gửi lại mã");
      }
    } catch {
      setError("Không thể kết nối server");
    }
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

      {/* Right — auth form */}
      <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <Link href="/">
              <span className="text-display-sm font-bold text-gray-900">
                V<span className="text-gradient">Story</span>
              </span>
            </Link>
          </div>

          {/* ======= VERIFY MODE ======= */}
          {mode === "verify" && (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
                <EnvelopeIcon className="h-8 w-8 text-primary-500" />
              </div>
              <h1 className="mt-4 text-heading-lg font-bold text-gray-900">
                Xác nhận email
              </h1>
              <p className="mt-2 text-body-sm text-gray-500">
                Nhập mã xác nhận đã gửi đến <span className="font-medium text-gray-700">{email}</span>
              </p>

              {error && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-body-sm text-red-600">
                  {error}
                </div>
              )}
              {success && (
                <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-body-sm text-green-600">
                  {success}
                </div>
              )}

              <form onSubmit={handleVerify} className="mt-6 space-y-4">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Nhập mã 6 số"
                  maxLength={6}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-heading-sm font-bold tracking-[0.5em] text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="w-full rounded-xl bg-primary-500 px-6 py-3 text-body-md font-semibold text-white shadow-sm hover:bg-primary-600 disabled:opacity-60"
                >
                  {loading ? "Đang xác nhận..." : "Xác nhận"}
                </button>
              </form>

              <button
                onClick={handleResend}
                className="mt-4 text-body-sm text-primary-600 hover:text-primary-700"
              >
                Gửi lại mã xác nhận
              </button>

              <p className="mt-4">
                <button
                  onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
                  className="text-body-sm text-gray-400 hover:text-gray-600"
                >
                  ← Quay lại đăng nhập
                </button>
              </p>
            </div>
          )}

          {/* ======= LOGIN MODE ======= */}
          {mode === "login" && (
            <div>
              <h1 className="text-center text-heading-lg font-bold text-gray-900">
                Đăng nhập
              </h1>
              <p className="mt-2 text-center text-body-md text-gray-500">
                Chào mừng bạn trở lại VStory
              </p>

              {error && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-body-sm text-red-600">
                  {error}
                </div>
              )}
              {success && (
                <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-body-sm text-green-600">
                  {success}
                </div>
              )}

              {/* Google button */}
              <button
                onClick={handleGoogle}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-body-sm font-semibold text-gray-700 shadow-sm transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
              >
                <GoogleIcon className="h-5 w-5" />
                Tiếp tục với Google
              </button>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-caption text-gray-400">hoặc</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Email/password form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-body-sm text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu"
                    required
                    className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-11 text-body-sm text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-primary-500 px-6 py-3 text-body-md font-semibold text-white shadow-sm transition-all hover:bg-primary-600 disabled:opacity-60"
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
              </form>

              {/* Switch to register */}
              <p className="mt-6 text-center text-body-sm text-gray-500">
                Chưa có tài khoản?{" "}
                <button
                  onClick={() => { setMode("register"); setError(null); setSuccess(null); }}
                  className="font-semibold text-primary-600 hover:text-primary-700"
                >
                  Đăng ký ngay
                </button>
              </p>
            </div>
          )}

          {/* ======= REGISTER MODE ======= */}
          {mode === "register" && (
            <div>
              <h1 className="text-center text-heading-lg font-bold text-gray-900">
                Đăng ký
              </h1>
              <p className="mt-2 text-center text-body-md text-gray-500">
                Tạo tài khoản VStory miễn phí
              </p>

              {error && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-body-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Google button */}
              <button
                onClick={handleGoogle}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-body-sm font-semibold text-gray-700 shadow-sm transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
              >
                <GoogleIcon className="h-5 w-5" />
                Đăng ký bằng Google
              </button>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-caption text-gray-400">hoặc đăng ký bằng email</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Register form */}
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tên hiển thị"
                    required
                    className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-body-sm text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-body-sm text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                    required
                    className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-11 text-body-sm text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>

                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu"
                    required
                    className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-body-sm text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-primary-500 px-6 py-3 text-body-md font-semibold text-white shadow-sm transition-all hover:bg-primary-600 disabled:opacity-60"
                >
                  {loading ? "Đang đăng ký..." : "Đăng ký"}
                </button>
              </form>

              {/* Switch to login */}
              <p className="mt-6 text-center text-body-sm text-gray-500">
                Đã có tài khoản?{" "}
                <button
                  onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
                  className="font-semibold text-primary-600 hover:text-primary-700"
                >
                  Đăng nhập
                </button>
              </p>
            </div>
          )}

          {/* Trust + Terms (shared) */}
          {mode !== "verify" && (
            <>
              <div className="mt-6 flex items-center justify-center gap-2 text-body-sm text-gray-400">
                <ShieldCheckIcon className="h-4 w-4" />
                <span>Bảo mật & an toàn</span>
              </div>

              <p className="mt-4 text-center text-caption leading-relaxed text-gray-400">
                Bằng việc đăng nhập/đăng ký, bạn đồng ý với{" "}
                <Link href="/terms" className="underline hover:text-gray-600">
                  Điều khoản sử dụng
                </Link>{" "}
                và{" "}
                <Link href="/privacy" className="underline hover:text-gray-600">
                  Chính sách bảo mật
                </Link>{" "}
                của VStory.
              </p>
            </>
          )}

          {/* Back home */}
          <p className="mt-6 text-center">
            <Link
              href="/"
              className="text-body-sm text-gray-400 hover:text-gray-600"
            >
              ← Về trang chủ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
