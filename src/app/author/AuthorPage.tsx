"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  PencilSquareIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* ─────────── data ─────────── */

const benefits = [
  {
    icon: CurrencyDollarIcon,
    title: "Thu nhập 70%",
    description:
      "Nhận 70% doanh thu từ mỗi chương trả phí. Thanh toán minh bạch, rút tiền nhanh chóng.",
    color: "text-green-500 bg-green-50",
  },
  {
    icon: PencilSquareIcon,
    title: "Công cụ viết mạnh mẽ",
    description:
      "Trình soạn thảo chuyên nghiệp, lưu nháp tự động, hẹn giờ đăng chương và quản lý tác phẩm dễ dàng.",
    color: "text-primary-500 bg-primary-50",
  },
  {
    icon: ChartBarIcon,
    title: "Dashboard chi tiết",
    description:
      "Theo dõi lượt đọc, doanh thu, tăng trưởng theo ngày/tuần/tháng với biểu đồ trực quan.",
    color: "text-accent-500 bg-accent-50",
  },
  {
    icon: UserGroupIcon,
    title: "Cộng đồng độc giả lớn",
    description:
      "Tiếp cận hàng trăm nghìn độc giả Việt đang tìm kiếm câu chuyện hay mỗi ngày.",
    color: "text-orange-500 bg-orange-50",
  },
  {
    icon: ShieldCheckIcon,
    title: "Bảo vệ bản quyền",
    description:
      "Chống sao chép nội dung, watermark chương trả phí, hỗ trợ báo cáo vi phạm nhanh.",
    color: "text-red-500 bg-red-50",
  },
  {
    icon: SparklesIcon,
    title: "Hỗ trợ quảng bá",
    description:
      "Truyện chất lượng được đề xuất trên trang chủ, bảng xếp hạng và thông báo đến độc giả.",
    color: "text-yellow-500 bg-yellow-50",
  },
];

const steps = [
  {
    step: 1,
    title: "Đăng ký tài khoản",
    description: "Đăng nhập nhanh bằng Google chỉ trong vài giây — không cần tạo mật khẩu.",
  },
  {
    step: 2,
    title: "Tạo tác phẩm",
    description: "Điền thông tin truyện, bìa, mô tả và bắt đầu viết chương đầu tiên.",
  },
  {
    step: 3,
    title: "Đăng & kiếm thu nhập",
    description:
      "Xuất bản chương miễn phí hoặc trả phí. Nhận thu nhập ngay khi có người mua.",
  },
];

const faqs = [
  {
    q: "Tôi cần điều kiện gì để trở thành tác giả?",
    a: "Bất kỳ ai đủ 16 tuổi đều có thể đăng ký. Bạn chỉ cần tài khoản VStory và ý tưởng sáng tạo!",
  },
  {
    q: "Doanh thu được tính như thế nào?",
    a: "Bạn nhận 70% mỗi khi độc giả mua chương trả phí. Ví dụ: chương giá 200₫ → bạn nhận 140₫. Doanh thu cập nhật realtime trên dashboard.",
  },
  {
    q: "Khi nào tôi có thể rút tiền?",
    a: "Rút tiền khi đạt tối thiểu 100.000₫. Hỗ trợ chuyển khoản ngân hàng, xử lý trong 1-3 ngày làm việc.",
  },
  {
    q: "Truyện của tôi có bị sao chép không?",
    a: "VStory có hệ thống chống copy nội dung, watermark cho chương trả phí, và đội ngũ xử lý vi phạm bản quyền nhanh chóng.",
  },
  {
    q: "Tôi có thể viết thể loại nào?",
    a: "Tất cả thể loại truyện chữ đều được hoan nghênh: Ngôn tình, Tiên hiệp, Trinh thám, Kinh dị, Đô thị, v.v. Nội dung cần tuân thủ quy định cộng đồng.",
  },
];

/* ─────────── helpers ─────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

/* ─────────── component ─────────── */

export default function AuthorPage() {
  return (
    <>
      <Header />

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 py-20 sm:py-28">
          {/* decorative blobs */}
          <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-accent-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-primary-400/10 blur-3xl" />

          <div className="section-container relative z-10 text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 inline-block rounded-full border border-primary-400/30 bg-primary-800/60 px-4 py-1.5 text-body-sm font-medium text-primary-200"
            >
              ✍️ Dành cho tác giả
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mx-auto max-w-3xl text-display-md font-bold text-white sm:text-display-lg"
            >
              Biến đam mê viết lách thành{" "}
              <span className="text-gradient">thu nhập thực</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mx-auto mt-6 max-w-xl text-body-lg text-primary-200/90"
            >
              Chia sẻ câu chuyện với hàng trăm nghìn độc giả Việt. Nhận 70%
              doanh thu, công cụ viết chuyên nghiệp, và cộng đồng hỗ trợ.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Link
                href="/author/register"
                className="btn-primary flex items-center gap-2 px-8 py-4 text-lg"
              >
                Đăng ký làm tác giả
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link
                href="#how"
                className="btn-secondary px-8 py-4 text-lg text-white hover:text-white"
              >
                Tìm hiểu thêm
              </Link>
            </motion.div>

            {/* quick stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mx-auto mt-14 grid max-w-md grid-cols-3 gap-6"
            >
              {[
                { value: "2K+", label: "Tác giả" },
                { value: "70%", label: "Doanh thu" },
                { value: "5M+", label: "Lượt đọc/tháng" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-heading-lg font-bold text-white">
                    {s.value}
                  </div>
                  <div className="text-body-sm text-primary-300">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Benefits ── */}
        <section className="py-16 sm:py-24">
          <div className="section-container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-heading-lg text-gray-900 sm:text-display-sm">
                Tại sao chọn VStory?
              </h2>
              <p className="mt-3 text-body-lg text-gray-500">
                Nền tảng được thiết kế dành riêng cho tác giả Việt
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((b, i) => (
                <motion.div
                  key={b.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={fadeUp}
                  className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover"
                >
                  <div
                    className={`mb-4 inline-flex rounded-xl p-3 ${b.color}`}
                  >
                    <b.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-heading-sm font-semibold text-gray-900">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-body-md text-gray-500">
                    {b.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section
          id="how"
          className="bg-gray-50 py-16 sm:py-24"
        >
          <div className="section-container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-heading-lg text-gray-900 sm:text-display-sm">
                Bắt đầu chỉ trong 3 bước
              </h2>
              <p className="mt-3 text-body-lg text-gray-500">
                Đơn giản, nhanh chóng, không cần kỹ thuật
              </p>
            </div>

            <div className="mx-auto mt-14 max-w-3xl">
              {steps.map((s, i) => (
                <motion.div
                  key={s.step}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="relative flex gap-6 pb-12 last:pb-0"
                >
                  {/* timeline line */}
                  {i < steps.length - 1 && (
                    <div className="absolute left-5 top-12 h-[calc(100%-2rem)] w-0.5 bg-primary-200" />
                  )}
                  {/* step number */}
                  <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-body-md font-bold text-white shadow-lg">
                    {s.step}
                  </div>
                  <div className="pt-1">
                    <h3 className="text-heading-sm font-semibold text-gray-900">
                      {s.title}
                    </h3>
                    <p className="mt-1.5 text-body-md text-gray-500">
                      {s.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/author/register"
                className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg"
              >
                Bắt đầu viết truyện ngay
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="bg-gray-50 py-16 sm:py-24">
          <div className="section-container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-heading-lg text-gray-900 sm:text-display-sm">
                Câu hỏi thường gặp
              </h2>
            </div>

            <div className="mx-auto mt-12 max-w-2xl divide-y divide-gray-200">
              {faqs.map((faq, i) => (
                <motion.details
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="group py-5"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-body-md font-semibold text-gray-900 marker:content-none">
                    {faq.q}
                    <span className="ml-4 flex-shrink-0 text-gray-400 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-body-md leading-relaxed text-gray-500">
                    {faq.a}
                  </p>
                </motion.details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 sm:py-24">
          <div className="section-container">
            <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-10 text-center shadow-glow sm:p-14">
              <h2 className="text-heading-lg font-bold text-white sm:text-display-sm">
                Sẵn sàng chia sẻ câu chuyện?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-body-lg text-primary-100/90">
                Tham gia cùng 2.000+ tác giả đang kiếm thu nhập từ đam mê viết
                lách trên VStory.
              </p>
              <Link
                href="/author/register"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-body-md font-semibold text-primary-700 shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
              >
                Đăng ký ngay — Miễn phí
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
