"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  UserCircleIcon,
  LockOpenIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const steps = [
  {
    icon: UserCircleIcon,
    step: "01",
    title: "Đăng nhập bằng Google",
    description: "Tạo tài khoản chỉ với 1 click — không cần điền form dài dòng.",
  },
  {
    icon: LockOpenIcon,
    step: "02",
    title: "Đọc & mở khóa chương bằng coin",
    description:
      "Đọc free hoặc mua coin để mở khóa chương premium chỉ từ 100₫.",
  },
  {
    icon: CurrencyDollarIcon,
    step: "03",
    title: "Tác giả nhận 70% doanh thu",
    description:
      "Đăng truyện, tích lũy coin từ độc giả, rút tiền về ví hoặc ngân hàng.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function HowItWorks() {
  return (
    <section
      className="relative overflow-hidden bg-gray-50 py-16 sm:py-24"
      aria-label="Cách hoạt động"
    >
      {/* Decorative */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary-500/5 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-accent-500/5 blur-[100px]" />

      <div className="section-container relative z-10">
        <motion.div
          className="mx-auto mb-12 max-w-prose text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="mb-2 inline-block rounded-full bg-primary-100 px-3 py-1 text-caption font-semibold text-primary-700">
            Đơn giản
          </span>
          <h2 className="mt-3 text-display-sm text-gray-900 sm:text-display-md">
            Cách VStory hoạt động
          </h2>
          <p className="mt-4 text-body-lg text-gray-500">
            3 bước đơn giản để bắt đầu hành trình đọc — hoặc viết — truyện.
          </p>
        </motion.div>

        <motion.div
          className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
        >
          {steps.map((s) => (
            <motion.div
              key={s.step}
              variants={item}
              className="group relative rounded-2xl bg-white p-6 text-center shadow-card transition-all hover:shadow-card-hover"
            >
              {/* Step number */}
              <div className="mb-4 text-5xl font-extrabold text-gray-100">
                {s.step}
              </div>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-glow transition-transform group-hover:scale-110">
                <s.icon className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-heading-md text-gray-900">
                {s.title}
              </h3>
              <p className="text-body-sm text-gray-500">
                {s.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="/author" className="btn-primary px-8 py-4 text-lg">
            Trở thành tác giả
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
