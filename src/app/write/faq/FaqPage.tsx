"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDownIcon,
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqItems: FaqItem[] = [
  {
    category: "Tài khoản",
    question: "Làm sao để trở thành tác giả trên VStory?",
    answer:
      "Bạn cần đăng nhập bằng Google, sau đó vào trang Tác giả và đăng ký thông qua quy trình onboarding 3 bước. Sau khi hoàn tất, bạn sẽ được nâng cấp lên vai trò tác giả và có quyền truy cập Author Studio.",
  },
  {
    category: "Tài khoản",
    question: "Tôi có thể thay đổi bút danh không?",
    answer:
      "Hiện tại bút danh được lấy từ tên tài khoản Google của bạn. Chúng tôi đang phát triển tính năng cho phép tác giả tùy chỉnh bút danh riêng.",
  },
  {
    category: "Viết truyện",
    question: "Tôi có thể đăng bao nhiêu truyện?",
    answer:
      "Không giới hạn! Bạn có thể tạo và quản lý nhiều truyện cùng lúc trên VStory. Tuy nhiên, chúng tôi khuyến khích bạn tập trung hoàn thành một tác phẩm trước khi bắt đầu tác phẩm mới.",
  },
  {
    category: "Viết truyện",
    question: "Truyện cần có ảnh bìa không?",
    answer:
      "Ảnh bìa không bắt buộc nhưng rất được khuyến khích. Truyện có ảnh bìa đẹp thường thu hút được nhiều đọc giả hơn gấp 3-5 lần so với truyện không có ảnh bìa.",
  },
  {
    category: "Viết truyện",
    question: "Tôi có thể chỉnh sửa chương đã đăng không?",
    answer:
      "Có! Bạn có thể chỉnh sửa nội dung chương bất cứ lúc nào thông qua trang quản lý truyện. Vào Tác phẩm → Chọn truyện → Tab Mục lục → Nhấn vào chương cần sửa.",
  },
  {
    category: "Viết truyện",
    question: "Làm sao để sử dụng tính năng đề cương?",
    answer:
      "Khi tạo hoặc quản lý truyện, chuyển sang tab 'Đề cương'. Tại đây bạn có thể lên kế hoạch cho chủ đề, thế giới quan, danh sách nhân vật, và các điểm nút cốt truyện. Đề cương giúp bạn viết có định hướng và tránh bế tắc.",
  },
  {
    category: "Chương & Nội dung",
    question: "Một chương nên dài bao nhiêu?",
    answer:
      "Chúng tôi khuyến nghị mỗi chương từ 1,500 – 4,000 từ. Tuy nhiên, điều quan trọng nhất là mỗi chương phải có nội dung trọn vẹn và kết thúc tại một điểm tự nhiên.",
  },
  {
    category: "Chương & Nội dung",
    question: "Tính năng khóa chương hoạt động như thế nào?",
    answer:
      "Khi viết chương, bạn có thể bật tính năng khóa chương và đặt giá (số xu). Đọc giả cần mua xu để mở khóa và đọc chương đó. Chương miễn phí sẽ giúp thu hút đọc giả ban đầu.",
  },
  {
    category: "Chương & Nội dung",
    question: "Tôi có thể đặt lịch đăng chương không?",
    answer:
      "Hiện tại bạn có thể cài đặt lịch đăng dự kiến trong phần Cài đặt truyện (ví dụ: Thứ 2, Thứ 4, Thứ 6). Thông tin này sẽ hiển thị cho đọc giả biết khi nào có chương mới.",
  },
  {
    category: "Thống kê",
    question: "Lượt đọc được tính như thế nào?",
    answer:
      "Mỗi lần một đọc giả mở và đọc một chương, hệ thống sẽ ghi nhận 1 lượt đọc. Cùng một đọc giả đọc lại chương đã đọc sẽ không tính thêm lượt đọc mới.",
  },
  {
    category: "Thống kê",
    question: "Tôi có thể xem thống kê chi tiết ở đâu?",
    answer:
      "Vào Author Studio → Thống kê. Tại đây bạn có thể xem tổng lượt đọc, lượt thích, lưu truyện, biểu đồ lượt đọc theo ngày, và so sánh hiệu suất giữa các tác phẩm.",
  },
  {
    category: "Quy định",
    question: "VStory có kiểm duyệt nội dung không?",
    answer:
      "Có, chúng tôi kiểm duyệt nội dung để đảm bảo tuân thủ quy định cộng đồng. Nội dung vi phạm bản quyền, chứa nội dung phản động, bạo lực quá mức không phù hợp sẽ bị gỡ bỏ.",
  },
  {
    category: "Quy định",
    question: "Truyện có nội dung 18+ có được phép không?",
    answer:
      "Truyện dành cho đọc giả trưởng thành cần được đánh dấu 'Nội dung người lớn' trong phần Cài đặt truyện. Truyện sẽ được ẩn khỏi đọc giả chưa đủ tuổi và có nhãn cảnh báo.",
  },
];

const categories = Array.from(new Set(faqItems.map((f) => f.category)));

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = faqItems.filter((item) => {
    if (activeCategory !== "all" && item.category !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-heading-md font-bold text-gray-900">
          Câu hỏi thường gặp
        </h2>
        <p className="mt-1 text-body-sm text-gray-500">
          Tìm câu trả lời cho những thắc mắc phổ biến
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm câu hỏi..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-body-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory("all")}
          className={`flex-shrink-0 rounded-lg px-3.5 py-2 text-caption font-medium transition-all ${
            activeCategory === "all"
              ? "bg-primary-500 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 rounded-lg px-3.5 py-2 text-caption font-medium transition-all ${
              activeCategory === cat
                ? "bg-primary-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ accordion */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white py-12 text-center shadow-sm">
            <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-gray-200" />
            <p className="mt-3 text-body-sm text-gray-500">
              Không tìm thấy câu hỏi phù hợp
            </p>
          </div>
        ) : (
          filtered.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="rounded-xl bg-white shadow-sm"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 rounded-full bg-primary-50 p-1">
                      <QuestionMarkCircleIcon className="h-4 w-4 text-primary-500" />
                    </div>
                    <div>
                      <span className="text-body-sm font-semibold text-gray-900">
                        {item.question}
                      </span>
                      <span className="ml-2 text-[10px] font-medium text-gray-400">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <ChevronDownIcon
                    className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-50 px-5 pb-4 pt-3">
                        <p className="pl-8 text-body-sm leading-relaxed text-gray-600">
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Contact */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-gradient-to-r from-primary-50 to-accent-50 p-6 text-center"
      >
        <h3 className="text-body-md font-bold text-gray-900">
          Không tìm thấy câu trả lời?
        </h3>
        <p className="mt-1 text-body-sm text-gray-600">
          Liên hệ đội ngũ hỗ trợ qua email:{" "}
          <a
            href="mailto:support@vstory.vn"
            className="font-medium text-primary-600 hover:underline"
          >
            support@vstory.vn
          </a>
        </p>
      </motion.div>
    </div>
  );
}
