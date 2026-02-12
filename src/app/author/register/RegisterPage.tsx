"use client";

import { useState } from "react";
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
    desc: "Kết nối với 2.000+ tác giả, nhận feedback từ độc giả.",
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
  const [step, setStep] = useState(1); // 1: intro, 2: form, 3: success
  const [penName, setPenName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (status === "loading") {
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
    router.push("/login?callbackUrl=/author/register");
    return null;
  }

  const handleToggleGenre = (g: string) => {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : prev.length < 5 ? [...prev, g] : prev
    );
  };

  const handleSubmit = async () => {
    if (!penName || !agreed) return;
    setSubmitting(true);

    try {
      const token = (session as any).accessToken;
      await fetch(`${API_BASE_URL}/api/profile`, {
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
      setStep(3);
    } catch {
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
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
                    với hàng trăm nghìn độc giả trên VStory.
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
                2.000+ tác giả đã tin tưởng VStory
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-body-md text-gray-500">
                Hàng nghìn tác giả đã biến đam mê viết lách thành nguồn thu
                nhập ổn định trên nền tảng của chúng tôi.
              </p>
              <div className="mt-10 grid gap-6 sm:grid-cols-3">
                {[
                  { name: "Nguyễn Văn A", genre: "Tiên hiệp", quote: "VStory giúp tôi tiếp cận hàng nghìn độc giả mỗi ngày." },
                  { name: "Trần Thị B", genre: "Ngôn tình", quote: "Thu nhập từ VStory đã thay đổi cuộc sống của tôi." },
                  { name: "Lê Quang C", genre: "Kiếm hiệp", quote: "Công cụ viết tuyệt vời, cộng đồng thân thiện." },
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
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-body-sm text-gray-600">
                          Tôi đồng ý với{" "}
                          <Link href="/about" className="text-primary-600 underline hover:text-primary-500">
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
      </main>
      <Footer />
    </>
  );
}
