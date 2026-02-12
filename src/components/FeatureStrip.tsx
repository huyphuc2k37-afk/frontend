"use client";

import { motion } from "framer-motion";
import {
  PencilSquareIcon,
  CreditCardIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    icon: PencilSquareIcon,
    title: "Đăng truyện miễn phí",
    description: "Bất kỳ ai cũng có thể trở thành tác giả và chia sẻ câu chuyện.",
  },
  {
    icon: CreditCardIcon,
    title: "Thanh toán dễ ở VN",
    description: "Hỗ trợ MoMo, ZaloPay, ngân hàng nội địa — không cần thẻ quốc tế.",
  },
  {
    icon: ChartBarIcon,
    title: "Chia lợi nhuận minh bạch",
    description: "Tác giả nhận 70% doanh thu — theo dõi realtime trên dashboard.",
  },
  {
    icon: DevicePhoneMobileIcon,
    title: "UI đọc mượt, mobile-first",
    description: "Thiết kế tối ưu cho điện thoại, đọc offline, chế độ tối.",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function FeatureStrip() {
  return (
    <section className="relative py-16 sm:py-20" aria-label="Tính năng nổi bật">
      <div className="section-container">
        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className="card-hover group rounded-2xl border border-gray-100 bg-white p-6 shadow-card"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 text-primary-600 transition-transform group-hover:scale-110">
                <f.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-heading-md text-gray-900">
                {f.title}
              </h3>
              <p className="text-body-sm text-gray-500">
                {f.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
