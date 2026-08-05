"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PencilSquareIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { API_BASE_URL } from "@/lib/api";
import { useUserProfile } from "@/contexts/UserProfileContext";

const benefits = [
  {
    icon: PencilSquareIcon,
    title: "Công cụ viết chuyên nghiệp",
    desc: "Trình soạn thảo trực tuyến, quản lý chương, lưu nháp tự động.",
  },
  {
    icon: CurrencyDollarIcon,
    title: "Nhận 70% doanh thu",
    desc: "Kiếm tiền từ chương trả phí. Thanh toán minh bạch hàng tháng.",
  },
  {
    icon: ChartBarIcon,
    title: "Thống kê chi tiết",
    desc: "Theo dõi lượt đọc, tương tác, và thu nhập theo thời gian thực.",
  },
  {
    icon: UserGroupIcon,
    title: "Cộng đồng hỗ trợ",
    desc: "Kết nối với cộng đồng tác giả và nhận phản hồi từ độc giả.",
  },
];

const genres = [
  "Tiên hiệp", "Kiếm hiệp", "Huyền huyễn", "Đô thị",
  "Ngôn tình", "Xuyên không", "Game", "Khoa huyễn",
  "Kinh dị", "Lịch sử", "Trinh thám", "Đam mỹ",
  "Hài hước", "Phiêu lưu",
];

export default function AuthorRegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { profile, loading: profileLoading, refresh } = useUserProfile();
  const [step, setStep] = useState(1); // 1: intro, 2: form, 3: success
  const [penName, setPenName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (profileLoading) return;
    if (!profile) return;

    if (profile.role === "admin") {
      router.replace("/admin");
      return;
    }
    if (profile.role === "author") {
      router.replace("/write");
    }
  }, [status, profileLoading, profile, router]);

  // Move "redirect if not logged in" into useEffect to avoid setState in render
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/author/register");
    }
  }, [status, router]);

  if (status === "loading" || (status === "authenticated" && profileLoading)) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      </>
    );
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      </>
    );
  }

  const handleToggleGenre = (g: string) => {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : prev.length < 5 ? [...prev, g] : prev
    );
  };

  const openPolicyToAccept = () => {
    setPolicyOpen(true);
  };

  const acceptPolicy = () => {
    setAgreed(true);
    setPolicyOpen(false);
  };

  const declinePolicy = () => {
    setAgreed(false);
    setPolicyOpen(false);
  };

  const handleSubmit = async () => {
    if (!penName || !agreed) return;
    setSubmitting(true);

    try {
      const token = (session as any).accessToken;
      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: penName,
          bio: bio || `Tác giả chuyên viết ${selectedGenres.join(", ")}`,
          role: "author",
        }),
      });

      if (!res.ok) {
        try {
          const data = await res.json();
          if (data?.error === "Already an author") {
            router.replace("/write");
            return;
          }
          if (data?.error === "Already an admin") {
            router.replace("/admin");
            return;
          }
        } catch {
          // ignore
        }
        // Fallback for other non-OK responses — reset submitting so user can retry
        setSubmitting(false);
        return;
      }

      refresh();
      setStep(3);
    } catch {
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Step 1: Introduction */}
        {step === 1 && (
          <div>
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 py-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(6,182,212,0.15),transparent_50%)]" />
              <div className="section-container relative text-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-body-sm text-white/90 backdrop-blur-sm">
                    <SparklesIcon className="h-4 w-4 text-accent-400" />
                    Chào mừng bạn đến với VStory
                  </span>

                  <h1 className="mt-6 text-display-md font-bold text-white md:text-display-lg">
                    Trở thành tác giả
                  </h1>
                  <p className="mx-auto mt-4 max-w-xl text-body-lg text-primary-100/80">
                    Biến đam mê viết lách thành sự nghiệp. Chia sẻ câu chuyện
                    với nhiều độc giả trên VStory.
                  </p>
                </motion.div>

                {/* Benefits */}
                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {benefits.map((b, i) => (
                    <motion.div
                      key={b.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="rounded-2xl bg-white/10 p-6 text-left backdrop-blur-sm"
                    >
                      <b.icon className="h-8 w-8 text-accent-400" />
                      <h3 className="mt-3 text-body-md font-semibold text-white">
                        {b.title}
                      </h3>
                      <p className="mt-2 text-body-sm text-primary-100/70">
                        {b.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-10"
                >
                  <button
                    onClick={() => setStep(2)}
                    className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-lg shadow-xl"
                  >
                    Bắt đầu đăng ký
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                  <p className="mt-4 text-body-sm text-primary-200/60">
                    Miễn phí · Chỉ mất 1 phút
                  </p>
                </motion.div>
              </div>
            </section>

            {/* Testimonial / social proof */}
            <section className="section-container py-16 text-center">
              <h2 className="text-heading-lg font-bold text-gray-900">
                Trải nghiệm từ cộng đồng tác giả
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-body-md text-gray-500">
                Một vài chia sẻ thực tế về quá trình đăng truyện, cập nhật chương và tương tác với độc giả.
              </p>
              <div className="mt-10 grid gap-6 sm:grid-cols-3">
                {[
                  { name: "Tác giả N.", genre: "Tiên hiệp", quote: "Mình thích chỗ đăng chương nhanh và quản lý bản thảo gọn. Đợt đầu cũng hơi bỡ ngỡ nhưng dùng quen là ổn." },
                  { name: "Tác giả Ẩn danh", genre: "Ngôn tình", quote: "Có phản hồi từ độc giả giúp mình chỉnh nhịp truyện tốt hơn. Thu nhập thì tùy từng tác phẩm, nhưng cơ chế khá rõ ràng." },
                  { name: "Tác giả T.Q.", genre: "Kiếm hiệp", quote: "Editor online đủ dùng, nhất là khi viết trên máy tính. Mình ưu tiên đều đặn cập nhật để giữ tương tác." },
                ].map((t, i) => (
                  <motion.div
                    key={t.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-2xl bg-white p-6 shadow-card"
                  >
                    <p className="text-body-md italic text-gray-600">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="mt-4">
                      <p className="text-body-sm font-semibold text-gray-900">
                        {t.name}
                      </p>
                      <p className="text-caption text-gray-500">
                        Tác giả {t.genre}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Step 2: Registration Form */}
        {step === 2 && (
          <div>
            <div className="section-container max-w-2xl py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Back button */}
                <button
                  onClick={() => setStep(1)}
                  className="mb-6 text-body-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  ← Quay lại
                </button>

                {/* User info card */}
                <div className="mb-8 flex items-center gap-4 rounded-2xl bg-primary-50 p-4">
                  {session?.user?.image && (
                    <Image
                      src={session.user.image}
                      alt=""
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="text-body-md font-semibold text-gray-900">
                      {session?.user?.name}
                    </p>
                    <p className="text-body-sm text-gray-500">{session?.user?.email}</p>
                  </div>
                  <CheckCircleIcon className="ml-auto h-6 w-6 text-green-500" />
                </div>

                <div className="rounded-2xl bg-white p-8 shadow-card">
                  <h2 className="text-heading-lg font-bold text-gray-900">
                    Thiết lập hồ sơ tác giả
                  </h2>
                  <p className="mt-2 text-body-md text-gray-500">
                    Cho độc giả biết thêm về bạn
                  </p>

                  <div className="mt-8 space-y-6">
                    {/* Pen Name */}
                    <div>
                      <label className="text-body-sm font-semibold text-gray-700">
                        Bút danh *
                      </label>
                      <p className="text-caption text-gray-400">
                        Tên hiển thị trên truyện của bạn
                      </p>
                      <input
                        value={penName}
                        onChange={(e) => setPenName(e.target.value)}
                        placeholder={session?.user?.name || "Nhập bút danh..."}
                        className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-body-md transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="text-body-sm font-semibold text-gray-700">
                        Giới thiệu bản thân
                      </label>
                      <p className="text-caption text-gray-400">
                        Chia sẻ đôi điều về bạn và phong cách viết
                      </p>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        placeholder="VD: Mình là tác giả trẻ yêu thích thể loại tiên hiệp và kiếm hiệp..."
                        className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-body-md transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>

                    {/* Genre preferences */}
                    <div>
                      <label className="text-body-sm font-semibold text-gray-700">
                        Thể loại bạn muốn viết
                      </label>
                      <p className="text-caption text-gray-400">
                        Chọn tối đa 5 thể loại yêu thích
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {genres.map((g) => (
                          <button
                            key={g}
                            onClick={() => handleToggleGenre(g)}
                            className={`rounded-full px-4 py-2 text-body-sm font-medium transition-all ${
                              selectedGenres.includes(g)
                                ? "bg-primary-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Agreement */}
                    <div className="rounded-xl bg-gray-50 p-4">
                      <label
                        className="flex cursor-pointer items-start gap-3"
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          const clickedLink = target.closest("a");
                          if (clickedLink) return;
                          if (!agreed) openPolicyToAccept();
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={agreed}
                          onChange={(e) => {
                            if (e.target.checked) {
                              openPolicyToAccept();
                            } else {
                              setAgreed(false);
                            }
                          }}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-body-sm text-gray-600">
                          Tôi đồng ý với{" "}
                          <Link
                            href="/author-policy"
                            className="text-primary-600 underline hover:text-primary-500"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Điều khoản dành cho tác giả
                          </Link>{" "}
                          của VStory, bao gồm quy định về nội dung, bản quyền và
                          chia sẻ doanh thu.
                        </span>
                      </label>
                    </div>

                    {/* Submit */}
                    <button
                      onClick={handleSubmit}
                      disabled={!penName || !agreed || submitting}
                      className="btn-primary w-full py-4 text-body-md font-semibold disabled:opacity-50"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Đang xử lý...
                        </span>
                      ) : (
                        "Xác nhận đăng ký tác giả"
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="flex min-h-screen items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-4 max-w-lg rounded-3xl bg-white p-10 text-center shadow-2xl"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircleIcon className="h-12 w-12 text-green-500" />
              </div>

              <h1 className="mt-6 text-heading-lg font-bold text-gray-900">
                Chào mừng tác giả {penName}!
              </h1>
              <p className="mt-3 text-body-md text-gray-500">
                Bạn đã chính thức trở thành tác giả trên VStory.
                Hãy bắt đầu viết tác phẩm đầu tiên ngay bây giờ!
              </p>

              <div className="mt-8 space-y-3">
                <Link
                  href="/write"
                  className="btn-primary flex w-full items-center justify-center gap-2 py-4 text-body-md font-semibold"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                  Viết truyện đầu tiên
                </Link>
                <Link
                  href="/profile"
                  className="block w-full rounded-xl border border-gray-200 py-3 text-body-md font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Xem hồ sơ tác giả
                </Link>
              </div>
            </motion.div>
          </div>
        )}

        {/* Author policy modal */}
        {policyOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Chính sách dành cho tác giả"
          >
            <div className="absolute inset-0 bg-black/30" onClick={declinePolicy} />

            <div className="relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[#f0e6d0]/80 bg-white shadow-2xl" style={{ maxHeight: "calc(100vh - 2rem)" }}>
              <div className="flex-shrink-0 border-b border-[#f0e6d0]/60 bg-[#fdf9f0] p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-heading-md font-bold text-gray-900">
                      CHÍNH SÁCH DÀNH CHO TÁC GIẢ (AUTHOR POLICY) — VSTORY
                    </h3>
                    <p className="mt-1 text-caption text-gray-600">
                      Hiệu lực từ: 12/02/2026 — Phiên bản: 1.0
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={declinePolicy}
                    className="rounded-xl border border-[#f0e6d0]/80 bg-white px-4 py-2 text-body-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Đóng
                  </button>
                </div>

                <p className="mt-3 text-body-sm leading-relaxed text-gray-600">
                  Chính sách này áp dụng cho mọi người dùng đăng ký và hoạt động với tư cách Tác giả trên nền tảng VStory.
                  Việc đăng tải nội dung và tham gia kiếm tiền trên VStory đồng nghĩa với việc bạn đồng ý tuân thủ các điều khoản dưới đây.
                </p>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="space-y-4 text-body-md leading-relaxed text-gray-700">
                  <section className="rounded-2xl border border-[#f0e6d0]/60 bg-white p-4">
                    <h4 className="text-body-md font-semibold text-gray-900">1. Tư cách Tác giả</h4>
                    <ul className="mt-2 list-disc pl-5">
                      <li>Người dùng có thể đăng ký trở thành Tác giả thông qua hệ thống của VStory.</li>
                      <li>Tác giả phải cung cấp thông tin chính xác và đầy đủ khi yêu cầu rút tiền.</li>
                      <li>VStory có quyền từ chối hoặc hủy tư cách Tác giả nếu phát hiện vi phạm.</li>
                    </ul>
                  </section>

                  <section className="rounded-2xl border border-[#f0e6d0]/60 bg-white p-4">
                    <h4 className="text-body-md font-semibold text-gray-900">2. Quyền sở hữu tác phẩm</h4>
                    <p className="mt-2">
                      Tác giả giữ toàn bộ quyền sở hữu trí tuệ đối với tác phẩm của mình, trừ khi có thỏa thuận độc quyền riêng bằng văn bản.
                    </p>
                    <p className="mt-2">Khi đăng tải nội dung lên VStory, Tác giả cấp cho VStory quyền:</p>
                    <ul className="mt-2 list-disc pl-5">
                      <li>Hiển thị nội dung trên nền tảng</li>
                      <li>Lưu trữ, sao lưu và xử lý kỹ thuật phục vụ vận hành</li>
                      <li>Phân phối nội dung đến người dùng trong phạm vi hệ thống</li>
                    </ul>
                    <p className="mt-2">Quyền này là không độc quyền và không làm mất quyền sở hữu của Tác giả.</p>
                  </section>

                  <section className="rounded-2xl border border-[#f0e6d0]/60 bg-white p-4">
                    <h4 className="text-body-md font-semibold text-gray-900">3. Trách nhiệm về nội dung</h4>
                    <p className="mt-2">Tác giả cam kết:</p>
                    <ul className="mt-2 list-disc pl-5">
                      <li>Nội dung do mình sáng tạo hoặc có quyền sử dụng hợp pháp</li>
                      <li>Không sao chép trái phép</li>
                      <li>Không vi phạm pháp luật</li>
                      <li>Không chứa nội dung bị cấm theo quy định của VStory</li>
                    </ul>
                    <p className="mt-3">VStory có quyền:</p>
                    <ul className="mt-2 list-disc pl-5">
                      <li>Gỡ bỏ nội dung vi phạm</li>
                      <li>Tạm ẩn nội dung khi có khiếu nại</li>
                      <li>Tạm giữ doanh thu liên quan đến nội dung đang tranh chấp</li>
                    </ul>
                  </section>

                  <section className="rounded-2xl border border-[#f0e6d0]/60 bg-white p-4">
                    <h4 className="text-body-md font-semibold text-gray-900">4. Cơ chế kiếm tiền</h4>
                    <p className="mt-2 font-semibold text-gray-900">4.1 Mở khóa chương bằng Xu</p>
                    <ul className="mt-2 list-disc pl-5">
                      <li>Tác giả có thể thiết lập chương truyện là miễn phí hoặc trả phí.</li>
                      <li>Người đọc sử dụng Xu để mở khóa chương trả phí.</li>
                      <li>Xu là đơn vị ảo chỉ có giá trị trong hệ thống VStory.</li>
                    </ul>
                    <p className="mt-3 font-semibold text-gray-900">4.2 Chia doanh thu</p>
                    <p className="mt-2">Khi một chương trả phí được mở khóa:</p>
                    <ul className="mt-2 list-disc pl-5">
                      <li>70% doanh thu thuộc về Tác giả</li>
                      <li>30% thuộc về VStory (phí nền tảng)</li>
                      <li>Doanh thu được ghi nhận minh bạch trong Dashboard của Tác giả.</li>
                    </ul>
                  </section>

                  <section className="rounded-2xl border border-[#f0e6d0]/60 bg-white p-4">
                    <h4 className="text-body-md font-semibold text-gray-900">5. Rút tiền và thanh toán</h4>
                    <p className="mt-2 font-semibold text-gray-900">5.1 Điều kiện rút tiền</p>
                    <ul className="mt-2 list-disc pl-5">
                      <li>Ngưỡng rút tối thiểu: 50.000 VNĐ</li>
                      <li>Chỉ số dư khả dụng (không tranh chấp, không bị tạm giữ) mới được rút.</li>
                    </ul>
                    <p className="mt-3 font-semibold text-gray-900">5.2 Quy trình rút tiền</p>
                    <p className="mt-2">Tác giả gửi yêu cầu rút tiền qua Dashboard. Cung cấp:</p>
                    <ul className="mt-2 list-disc pl-5">
                      <li>Họ và tên chủ tài khoản</li>
                      <li>Số tài khoản ngân hàng</li>
                      <li>Tên ngân hàng</li>
                      <li>Thông tin cá nhân cần thiết (CMND/CCCD hoặc mã số thuế nếu có)</li>
                    </ul>
                    <p className="mt-3">VStory tiến hành kiểm tra:</p>
                    <ul className="mt-2 list-disc pl-5">
                      <li>Xác minh tính hợp lệ</li>
                      <li>Kiểm tra gian lận</li>
                      <li>Kiểm tra tranh chấp bản quyền</li>
                    </ul>
                    <p className="mt-3">Sau khi xác nhận hợp lệ, VStory xử lý thanh toán trong vòng 4–8 giờ làm việc.</p>
                  </section>

                  <section className="rounded-2xl border border-[#f0e6d0]/60 bg-white p-4">
                    <h4 className="text-body-md font-semibold text-gray-900">6. Khấu trừ thuế thu nhập cá nhân (TNCN)</h4>
                    <p className="mt-2">Khi thực hiện rút tiền, VStory sẽ khấu trừ 5% thuế thu nhập cá nhân trên phần doanh thu của Tác giả theo quy định.</p>
                    <p className="mt-2 font-semibold text-gray-900">Cách tính:</p>
                    <ul className="mt-2 list-disc pl-5">
                      <li>Doanh thu Tác giả được hưởng = Tổng doanh thu × 70%</li>
                      <li>Thuế TNCN = 5% × Doanh thu Tác giả</li>
                      <li>Số tiền thực nhận = Doanh thu Tác giả − Thuế TNCN − (phí chuyển khoản nếu có)</li>
                    </ul>
                    <p className="mt-3">Hệ thống sẽ hiển thị rõ tổng tiền được hưởng, số thuế bị khấu trừ, phí (nếu có), số tiền thực nhận, thời gian xử lý dự kiến. Tác giả cần xác nhận trước khi hoàn tất yêu cầu rút tiền.</p>
                  </section>

                  <section className="rounded-2xl border border-[#f0e6d0]/60 bg-white p-4">
                    <h4 className="text-body-md font-semibold text-gray-900">7. Tạm giữ và từ chối thanh toán</h4>
                    <p className="mt-2">VStory có quyền tạm giữ hoặc từ chối thanh toán trong các trường hợp: phát hiện gian lận, nội dung bị khiếu nại bản quyền, vi phạm điều khoản, cung cấp thông tin sai lệch. VStory sẽ thông báo lý do nếu có tạm giữ.</p>
                  </section>

                  <section className="rounded-2xl border border-[#f0e6d0]/60 bg-white p-4">
                    <h4 className="text-body-md font-semibold text-gray-900">8. Nghĩa vụ thuế của Tác giả</h4>
                    <p className="mt-2">Việc khấu trừ 5% chỉ nhằm hỗ trợ thực hiện nghĩa vụ thuế theo quy định. Tác giả vẫn chịu trách nhiệm tự kê khai và hoàn thành nghĩa vụ thuế cá nhân theo pháp luật Việt Nam.</p>
                  </section>

                  <section className="rounded-2xl border border-[#f0e6d0]/60 bg-white p-4">
                    <h4 className="text-body-md font-semibold text-gray-900">9. Chấm dứt hợp tác</h4>
                    <p className="mt-2">VStory có quyền tạm khóa hoặc khóa vĩnh viễn tài khoản Tác giả, gỡ bỏ nội dung vi phạm, ngừng hợp tác nếu Tác giả vi phạm nghiêm trọng. Trong trường hợp chấm dứt, doanh thu hợp lệ còn lại sẽ được xử lý theo quy định.</p>
                  </section>

                  <section className="rounded-2xl border border-[#f0e6d0]/60 bg-white p-4">
                    <h4 className="text-body-md font-semibold text-gray-900">10. Trách nhiệm pháp lý</h4>
                    <p className="mt-2">VStory là nền tảng trung gian cung cấp dịch vụ phân phối nội dung. Tác giả chịu trách nhiệm pháp lý đối với nội dung do mình đăng tải.</p>
                  </section>

                  <section className="rounded-2xl border border-[#f0e6d0]/60 bg-white p-4">
                    <h4 className="text-body-md font-semibold text-gray-900">11. Thay đổi chính sách</h4>
                    <p className="mt-2">VStory có thể cập nhật chính sách này khi cần thiết. Việc tiếp tục sử dụng nền tảng đồng nghĩa với việc Tác giả chấp nhận các thay đổi.</p>
                  </section>

                  <section className="rounded-2xl border border-[#f0e6d0]/60 bg-white p-4">
                    <h4 className="text-body-md font-semibold text-gray-900">12. Liên hệ</h4>
                    <p className="mt-2">Mọi thắc mắc liên quan đến Doanh thu, Rút tiền, Bản quyền, Hỗ trợ kỹ thuật:</p>
                    <p className="mt-2">
                      📧{" "}
                      <a className="underline" href="mailto:support@vstory.vn">
                        support@vstory.vn
                      </a>
                    </p>
                  </section>
                </div>
              </div>

              <div className="flex flex-shrink-0 flex-col gap-3 border-t border-[#f0e6d0]/60 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <p className="text-caption text-gray-500">
                  Bằng việc bấm “Tôi đồng ý”, bạn xác nhận đã đọc và chấp nhận chính sách.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={declinePolicy}
                    className="rounded-2xl border border-[#f0e6d0]/80 bg-white px-5 py-3 text-body-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Không đồng ý
                  </button>
                  <button
                    type="button"
                    onClick={acceptPolicy}
                    className="btn-primary px-5 py-3 text-body-sm font-semibold"
                  >
                    Tôi đồng ý
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
