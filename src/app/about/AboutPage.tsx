"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  HeartIcon,
  BookOpenIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  SparklesIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* ─────────── data ─────────── */

const values = [
  {
    icon: HeartIcon,
    title: "Đam mê văn chương",
    description:
      "VStory sinh ra từ tình yêu với truyện chữ — nơi mỗi câu chuyện đều xứng đáng được kể và được đọc.",
    color: "text-red-500 bg-red-50",
  },
  {
    icon: UserGroupIcon,
    title: "Cộng đồng là trọng tâm",
    description:
      "Kết nối tác giả và độc giả Việt trên cùng một nền tảng, xây dựng hệ sinh thái truyện chữ bền vững.",
    color: "text-primary-500 bg-primary-50",
  },
  {
    icon: ShieldCheckIcon,
    title: "Minh bạch & công bằng",
    description:
      "Tác giả nhận 70% doanh thu. Mọi giao dịch đều rõ ràng, doanh thu theo dõi realtime.",
    color: "text-green-500 bg-green-50",
  },
  {
    icon: SparklesIcon,
    title: "Chất lượng nội dung",
    description:
      "Hệ thống kiểm duyệt giúp đảm bảo nội dung chất lượng, tạo trải nghiệm đọc tốt nhất.",
    color: "text-yellow-500 bg-yellow-50",
  },
  {
    icon: BookOpenIcon,
    title: "Đa dạng thể loại",
    description:
      "Từ Ngôn tình, Tiên hiệp đến Trinh thám, Kinh dị — hơn 14 thể loại phục vụ mọi sở thích.",
    color: "text-accent-500 bg-accent-50",
  },
  {
    icon: GlobeAltIcon,
    title: "Dành cho người Việt",
    description:
      "Giao diện hoàn toàn tiếng Việt, thanh toán nội địa, nội dung phù hợp văn hóa Việt Nam.",
    color: "text-orange-500 bg-orange-50",
  },
];

const milestones = [
  { year: "2025", event: "Ý tưởng VStory được hình thành" },
  { year: "2025", event: "Phát triển nền tảng & thiết kế giao diện" },
  { year: "2026", event: "Ra mắt phiên bản beta" },
  { year: "2026", event: "Mở đăng ký cho tác giả & độc giả" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

/* ─────────── component ─────────── */

export default function AboutPage() {
  return (
    <>
      <Header />

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 py-20 sm:py-28">
          <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-primary-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl" />

          <div className="section-container relative z-10 text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 inline-block rounded-full border border-gray-600/30 bg-gray-800/60 px-4 py-1.5 text-body-sm font-medium text-gray-300"
            >
              Về chúng tôi
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mx-auto max-w-3xl text-display-md font-bold text-white sm:text-display-lg"
            >
              Câu chuyện đằng sau{" "}
              <span className="text-gradient">VStory</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mx-auto mt-6 max-w-2xl text-body-lg leading-relaxed text-gray-300/90"
            >
              VStory là nền tảng đọc và viết truyện chữ dành riêng cho người
              Việt. Chúng tôi tin rằng mỗi người đều có một câu chuyện đáng
              được kể — và mỗi độc giả xứng đáng có một nơi để tìm thấy câu
              chuyện yêu thích của mình.
            </motion.p>
          </div>
        </section>

        {/* ── Founder ── */}
        <section className="py-16 sm:py-24">
          <div className="section-container">
            <div className="mx-auto max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-3xl border border-gray-100 bg-white p-8 shadow-card sm:p-10"
              >
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  {/* Avatar placeholder */}
                  <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-display-sm font-bold text-white shadow-lg">
                    P
                  </div>
                  <div>
                    <h2 className="text-heading-lg font-bold text-gray-900">
                      Nguyễn Huy Phúc
                    </h2>
                    <p className="mt-1 text-body-md font-medium text-primary-600">
                      Người sáng lập VStory
                    </p>
                    <div className="mt-4 space-y-3 text-body-md leading-relaxed text-gray-600">
                      <p>
                        &ldquo;Tôi lớn lên cùng những trang truyện chữ — từ
                        tiểu thuyết kiếm hiệp đến ngôn tình, mỗi thể loại đều
                        mang đến cho tôi những thế giới mới. VStory ra đời từ
                        mong muốn tạo ra một nền tảng nơi tác giả Việt có thể
                        chia sẻ sáng tạo của mình và được đền đáp xứng đáng.&rdquo;
                      </p>
                      <p>
                        Với niềm tin rằng công nghệ có thể kết nối người kể
                        chuyện và người nghe chuyện, tôi xây dựng VStory để trở
                        thành ngôi nhà chung cho cộng đồng truyện chữ Việt Nam.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Values ── */}
        <section className="bg-gray-50 py-16 sm:py-24">
          <div className="section-container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-heading-lg text-gray-900 sm:text-display-sm">
                Giá trị cốt lõi
              </h2>
              <p className="mt-3 text-body-lg text-gray-500">
                Những nguyên tắc định hướng mọi quyết định của VStory
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={fadeUp}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover"
                >
                  <div
                    className={`mb-4 inline-flex rounded-xl p-3 ${v.color}`}
                  >
                    <v.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-heading-sm font-semibold text-gray-900">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-body-md text-gray-500">
                    {v.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="py-16 sm:py-24">
          <div className="section-container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-heading-lg text-gray-900 sm:text-display-sm">
                Hành trình phát triển
              </h2>
            </div>

            <div className="mx-auto mt-12 max-w-2xl">
              {milestones.map((m, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="relative flex gap-6 pb-10 last:pb-0"
                >
                  {i < milestones.length - 1 && (
                    <div className="absolute left-[19px] top-10 h-[calc(100%-1.5rem)] w-0.5 bg-primary-200" />
                  )}
                  <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 shadow-lg">
                    <span className="text-caption font-bold text-white">
                      {m.year.slice(-2)}
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className="text-body-sm font-medium text-primary-600">
                      {m.year}
                    </span>
                    <p className="mt-1 text-body-md font-medium text-gray-900">
                      {m.event}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mission ── */}
        <section className="bg-gray-50 py-16 sm:py-24">
          <div className="section-container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-heading-lg text-gray-900 sm:text-display-sm">
                Sứ mệnh
              </h2>
              <p className="mt-6 text-body-lg leading-relaxed text-gray-600">
                Xây dựng nền tảng truyện chữ số 1 Việt Nam — nơi bất kỳ ai cũng
                có thể đọc truyện hay với chi phí hợp lý, và bất kỳ tác giả nào
                cũng có thể biến đam mê viết lách thành sự nghiệp. Chúng tôi
                cam kết mang đến trải nghiệm đọc tuyệt vời, bảo vệ quyền lợi
                tác giả, và phát triển cộng đồng văn học Việt Nam.
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 sm:py-24">
          <div className="section-container">
            <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-10 text-center shadow-glow sm:p-14">
              <h2 className="text-heading-lg font-bold text-white sm:text-display-sm">
                Cùng viết nên câu chuyện
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-body-lg text-primary-100/90">
                Dù bạn là độc giả hay tác giả, VStory luôn chào đón bạn.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/explore"
                  className="rounded-full bg-white px-8 py-4 text-body-md font-semibold text-primary-700 shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
                >
                  Khám phá truyện
                </Link>
                <Link
                  href="/author"
                  className="rounded-full border-2 border-white/30 px-8 py-4 text-body-md font-semibold text-white transition-all hover:border-white/60 hover:bg-white/10"
                >
                  Trở thành tác giả
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
