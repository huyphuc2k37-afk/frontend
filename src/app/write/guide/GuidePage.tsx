"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpenIcon,
  PencilSquareIcon,
  LightBulbIcon,
  UserGroupIcon,
  DocumentTextIcon,
  SparklesIcon,
  CheckCircleIcon,
  StarIcon,
  ChartBarIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

interface GuideSection {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  items: { title: string; content: string }[];
}

const guideSections: GuideSection[] = [
  {
    id: "start",
    title: "Bắt đầu viết truyện",
    icon: PencilSquareIcon,
    color: "text-primary-500",
    items: [
      {
        title: "Lên ý tưởng",
        content:
          "Bắt đầu với một ý tưởng cốt lõi rõ ràng. Hãy tự hỏi: Câu chuyện này nói về điều gì? Nhân vật chính muốn gì? Xung đột chính là gì? Viết tóm tắt câu chuyện trong 2-3 câu trước khi bắt đầu.",
      },
      {
        title: "Xây dựng đề cương",
        content:
          "Lập đề cương giúp bạn có lộ trình rõ ràng. VStory cung cấp công cụ đề cương ngay trong trang quản lý truyện — hãy tận dụng để lên kế hoạch cho thế giới quan, nhân vật và cốt truyện.",
      },
      {
        title: "Chọn thể loại phù hợp",
        content:
          "VStory hỗ trợ 14 thể loại truyện. Chọn thể loại phù hợp nhất với nội dung câu chuyện. Điều này giúp đọc giả dễ tìm thấy truyện của bạn hơn.",
      },
    ],
  },
  {
    id: "writing",
    title: "Kỹ năng viết",
    icon: LightBulbIcon,
    color: "text-amber-500",
    items: [
      {
        title: "Viết đều đặn",
        content:
          "Đặt mục tiêu viết mỗi ngày — dù chỉ 300-500 từ. Sự kiên trì quan trọng hơn số lượng. Nhiều tác giả nổi tiếng chỉ viết 1000 từ/ngày nhưng duy trì suốt nhiều năm.",
      },
      {
        title: "Hook ngay từ chương đầu",
        content:
          "Chương đầu tiên quyết định 80% đọc giả có tiếp tục đọc hay không. Bắt đầu bằng một tình huống hấp dẫn, đặt ra câu hỏi, hoặc giới thiệu xung đột ngay lập tức.",
      },
      {
        title: "Show, don't tell",
        content:
          'Thay vì viết "Anh ta rất tức giận", hãy viết "Nắm tay siết chặt, hàm nghiến, từng thớ cơ trên mặt anh ta co giật". Để hành động và chi tiết kể câu chuyện thay cho lời trần thuật.',
      },
      {
        title: "Kết chương hấp dẫn",
        content:
          "Mỗi chương nên kết thúc bằng một cliffhanger nhỏ hoặc mở ra câu hỏi mới. Điều này khiến đọc giả háo hức đọc chương tiếp theo.",
      },
    ],
  },
  {
    id: "characters",
    title: "Xây dựng nhân vật",
    icon: UserGroupIcon,
    color: "text-blue-500",
    items: [
      {
        title: "Nhân vật phải có chiều sâu",
        content:
          "Mỗi nhân vật cần có động cơ, sợ hãi, và điểm yếu riêng. Đừng tạo nhân vật hoàn hảo — những khuyết điểm khiến nhân vật trở nên thực tế và đáng nhớ.",
      },
      {
        title: "Đối thoại tự nhiên",
        content:
          "Mỗi nhân vật nên có cách nói chuyện riêng phù hợp với tính cách, tuổi tác, và hoàn cảnh. Đọc to đoạn đối thoại — nếu nghe không tự nhiên, hãy viết lại.",
      },
      {
        title: "Arc phát triển",
        content:
          "Nhân vật chính cần có sự thay đổi rõ rệt từ đầu đến cuối truyện. Sự phát triển này phải hợp lý và xuất phát từ những trải nghiệm trong câu chuyện.",
      },
    ],
  },
  {
    id: "publish",
    title: "Đăng truyện & Xây dựng đọc giả",
    icon: ChartBarIcon,
    color: "text-emerald-500",
    items: [
      {
        title: "Lịch đăng đều đặn",
        content:
          "Đọc giả thích sự nhất quán. Hãy chọn lịch đăng (ví dụ: 3 chương/tuần) và tuân thủ. Thông báo lịch đăng trong phần mô tả truyện để đọc giả biết khi nào quay lại.",
      },
      {
        title: "Tương tác với đọc giả",
        content:
          "Trả lời bình luận, lắng nghe phản hồi, và tạo không khí cộng đồng xung quanh truyện. Đọc giả trung thành là tài sản quý nhất của tác giả.",
      },
      {
        title: "Tối ưu thông tin truyện",
        content:
          "Ảnh bìa đẹp, mô tả hấp dẫn, và tag chính xác giúp truyện của bạn dễ được tìm thấy. Dành thời gian chau chuốt phần giới thiệu trước khi đăng.",
      },
    ],
  },
  {
    id: "format",
    title: "Quy tắc trình bày",
    icon: DocumentTextIcon,
    color: "text-violet-500",
    items: [
      {
        title: "Độ dài chương",
        content:
          "Mỗi chương nên từ 1,500 – 4,000 từ. Quá ngắn khiến đọc giả không thỏa mãn, quá dài lại khó tập trung. Tìm điểm cân bằng phù hợp với phong cách của bạn.",
      },
      {
        title: "Phân đoạn rõ ràng",
        content:
          "Chia nội dung thành các đoạn ngắn, mỗi đoạn 3-5 câu. Sử dụng dấu *** hoặc — để phân cách các cảnh khác nhau trong cùng một chương.",
      },
      {
        title: "Kiểm tra chính tả",
        content:
          "Đọc lại ít nhất một lần trước khi đăng. Lỗi chính tả và ngữ pháp làm giảm trải nghiệm đọc và sự chuyên nghiệp. Nhờ bạn bè đọc beta nếu có thể.",
      },
    ],
  },
];

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState("start");

  const currentSection = guideSections.find((s) => s.id === activeSection) || guideSections[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-heading-md font-bold text-gray-900">
          Hướng dẫn viết truyện
        </h2>
        <p className="mt-1 text-body-sm text-gray-500">
          Những kiến thức và mẹo hữu ích giúp bạn trở thành tác giả tốt hơn
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {guideSections.map((section) => {
          const active = section.id === activeSection;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-body-sm font-medium transition-all ${
                active
                  ? "bg-primary-500 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <section.icon className="h-4 w-4" />
              {section.title}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-sm">
          <div className={`rounded-xl bg-gray-50 p-3`}>
            <currentSection.icon className={`h-6 w-6 ${currentSection.color}`} />
          </div>
          <div>
            <h3 className="text-body-lg font-bold text-gray-900">
              {currentSection.title}
            </h3>
            <p className="text-caption text-gray-500">
              {currentSection.items.length} bài hướng dẫn
            </p>
          </div>
        </div>

        {currentSection.items.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl bg-white p-6 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0 rounded-full bg-primary-50 p-1.5">
                <CheckCircleIcon className="h-4 w-4 text-primary-500" />
              </div>
              <div>
                <h4 className="text-body-md font-bold text-gray-900">
                  {item.title}
                </h4>
                <p className="mt-2 leading-relaxed text-body-sm text-gray-600">
                  {item.content}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Pro tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-amber-100 p-2">
            <StarIcon className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h4 className="text-body-sm font-bold text-gray-900">
              ⭐ Mẹo vàng
            </h4>
            <p className="mt-1 text-body-sm text-gray-600">
              Đọc nhiều truyện trong thể loại bạn đang viết. Phân tích cách các tác giả khác xây dựng cốt truyện, 
              phát triển nhân vật, và giữ sự hấp dẫn. Đọc là cách học viết hiệu quả nhất!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
