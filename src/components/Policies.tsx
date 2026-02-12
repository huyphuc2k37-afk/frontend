"use client";

import { motion } from "framer-motion";
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  EyeIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

const policies = [
  {
    icon: ShieldCheckIcon,
    title: "Bảo mật thông tin",
    description:
      "Dữ liệu cá nhân của bạn được mã hóa và bảo vệ. Chúng tôi không bán hay chia sẻ thông tin cho bên thứ ba.",
  },
  {
    icon: DocumentTextIcon,
    title: "Điều khoản minh bạch",
    description:
      "Mọi quy định về đăng truyện, bản quyền và thanh toán đều công khai, rõ ràng — không có điều khoản ẩn.",
  },
  {
    icon: EyeIcon,
    title: "Kiểm duyệt nội dung",
    description:
      "Truyện được kiểm duyệt để đảm bảo không có nội dung vi phạm pháp luật, đạo văn hoặc gây hại.",
  },
  {
    icon: BanknotesIcon,
    title: "Chia sẻ doanh thu công bằng",
    description:
      "Tác giả nhận 70% doanh thu từ chương trả phí. Báo cáo thu nhập realtime trên dashboard.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Policies() {
  return (
    <section
      className="py-16 sm:py-24"
      aria-label="Chính sách và cam kết"
    >
      <div className="section-container">
        <motion.div
          className="mx-auto mb-12 max-w-prose text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="mb-2 inline-block rounded-full bg-accent-100 px-3 py-1 text-caption font-semibold text-accent-700">
            Cam kết
          </span>
          <h2 className="mt-3 text-display-sm text-gray-900 sm:text-display-md">
            Chính sách & cam kết của VStory
          </h2>
          <p className="mt-4 text-body-lg text-gray-500">
            Chúng tôi xây dựng nền tảng dựa trên sự minh bạch, công bằng và tôn trọng cộng đồng.
          </p>
        </motion.div>

        <motion.div
          className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
        >
          {policies.map((p) => (
            <motion.div
              key={p.title}
              variants={item}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-card transition-all hover:shadow-card-hover"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 text-primary-600 transition-transform group-hover:scale-110">
                <p.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-heading-md text-gray-900">
                {p.title}
              </h3>
              <p className="text-body-sm leading-relaxed text-gray-500">
                {p.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
