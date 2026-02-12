"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

type PolicySection = {
  number: number;
  title: string;
  content: React.ReactNode;
};

const effectiveFrom = "12/02/2026";
const version = "1.0";

const sections: PolicySection[] = [
  {
    number: 1,
    title: "Mục đích & phạm vi",
    content: (
      <>
        <p>
          Chính sách này quy định quyền và nghĩa vụ của Người dùng khi sử dụng
          VStory (website, app). Nếu bạn đồng thời là tác giả đăng tải nội dung,
          vui lòng đọc cả Chính sách Tác giả.
        </p>
      </>
    ),
  },
  {
    number: 2,
    title: "Điều kiện sử dụng & độ tuổi",
    content: (
      <>
        <p>
          Người dùng phải đủ 13 tuổi trở lên (hoặc theo quy định pháp luật áp
          dụng). Người chưa đủ tuổi cần có sự đồng ý của phụ huynh/người giám hộ.
        </p>
        <p>Khi đăng ký, cung cấp thông tin chính xác và cập nhật khi cần.</p>
      </>
    ),
  },
  {
    number: 3,
    title: "Tài khoản & bảo mật",
    content: (
      <>
        <ul className="list-disc pl-5">
          <li>Bảo mật thông tin đăng nhập là trách nhiệm của bạn.</li>
          <li>Mọi hoạt động từ tài khoản được coi là do bạn thực hiện.</li>
          <li>
            Báo ngay cho support nếu phát hiện truy cập trái phép:{" "}
            <a className="underline" href="mailto:support@vstory.vn">
              support@vstory.vn
            </a>
            .
          </li>
        </ul>
      </>
    ),
  },
  {
    number: 4,
    title: "Hành vi bị cấm",
    content: (
      <>
        <p>Người dùng không được:</p>
        <ul className="list-disc pl-5">
          <li>
            Đăng nội dung vi phạm pháp luật, xâm phạm bản quyền, khiêu dâm, kích
            động thù hằn, bạo lực cực đoan.
          </li>
          <li>Mạo danh, lừa đảo, quấy rối hoặc công kích cá nhân.</li>
          <li>Mua/bán Xu, mua/bán tài khoản, trao đổi giá trị ngoài hệ thống.</li>
          <li>Lợi dụng nền tảng để gây thiệt hại cho người khác.</li>
        </ul>
      </>
    ),
  },
  {
    number: 5,
    title: "Nội dung do người dùng đăng",
    content: (
      <>
        <ul className="list-disc pl-5">
          <li>
            Người dùng giữ quyền tác giả đối với nội dung do mình sở hữu (xem
            Author Policy nếu bạn là tác giả).
          </li>
          <li>
            Khi đăng, bạn cấp cho VStory quyền không độc quyền, toàn cầu, miễn phí
            để hiển thị, sao lưu, cache và phân phối nội dung trong phạm vi vận
            hành nền tảng.
          </li>
          <li>
            VStory có quyền tạm ẩn hoặc gỡ nội dung khi có khiếu nại hợp lệ hoặc
            phát hiện vi phạm.
          </li>
        </ul>
      </>
    ),
  },
  {
    number: 6,
    title: "Hệ thống Xu (coin)",
    content: (
      <>
        <ul className="list-disc pl-5">
          <li>
            Xu là đơn vị ảo trong VStory dùng để mở khóa chương, ủng hộ tác giả,
            mua tính năng.
          </li>
          <li>Xu không phải tiền pháp định và không được quy đổi ra tiền mặt bên ngoài nền tảng.</li>
          <li>Mua Xu phải thực hiện qua kênh thanh toán chính thức của VStory.</li>
        </ul>
      </>
    ),
  },
  {
    number: 7,
    title: "Mở khóa chương",
    content: (
      <>
        <ul className="list-disc pl-5">
          <li>Một số chương là trả phí; giá hiển thị bằng Xu.</li>
          <li>Khi mở khóa, giao dịch được ghi nhận trên hệ thống.</li>
        </ul>
      </>
    ),
  },
  {
    number: 8,
    title: "Giao dịch ngoài nền tảng",
    content: (
      <>
        <p>
          Mua bán Xu, mua bán tài khoản, trao đổi Xu ngoài hệ thống bị nghiêm cấm.
          VStory không chịu trách nhiệm cho rủi ro phát sinh từ giao dịch ngoài hệ thống.
        </p>
      </>
    ),
  },
  {
    number: 9,
    title: "Khiếu nại & báo cáo vi phạm",
    content: (
      <>
        <p>
          Gửi báo cáo/bằng chứng về nội dung vi phạm tới{" "}
          <a className="underline" href="mailto:support@vstory.vn">
            support@vstory.vn
          </a>
          .
        </p>
        <p>
          VStory sẽ xác minh; có thể tạm ẩn nội dung trong quá trình xử lý.
        </p>
      </>
    ),
  },
  {
    number: 10,
    title: "Quyền riêng tư",
    content: (
      <>
        <ul className="list-disc pl-5">
          <li>
            VStory thu thập dữ liệu cơ bản (email, lịch sử đọc, tương tác) để vận
            hành dịch vụ.
          </li>
          <li>
            VStory không bán dữ liệu cá nhân cho bên thứ ba. Chi tiết trong Privacy Policy.
          </li>
        </ul>
      </>
    ),
  },
  {
    number: 11,
    title: "Giới hạn trách nhiệm",
    content: (
      <>
        <p>
          VStory không chịu trách nhiệm cho nội dung do người dùng đăng tải hoặc thiệt hại phát sinh từ giao dịch ngoài hệ thống.
        </p>
        <p>
          Trách nhiệm bồi thường tối đa của VStory không vượt quá số tiền người dùng thực tế đã trả cho nền tảng trong 12 tháng gần nhất (hoặc giới hạn khác theo quy định).
        </p>
      </>
    ),
  },
  {
    number: 12,
    title: "Thay đổi chính sách & thông báo",
    content: (
      <>
        <p>
          VStory có thể cập nhật chính sách. Sẽ thông báo trên website hoặc email.
          Việc bạn tiếp tục sử dụng nền tảng = bạn đồng ý chính sách mới.
        </p>
      </>
    ),
  },
  {
    number: 13,
    title: "Liên hệ",
    content: (
      <>
        <p>
          Mọi thắc mắc/hỗ trợ:{" "}
          <a className="underline" href="mailto:support@vstory.vn">
            support@vstory.vn
          </a>
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <>
      <Header />

      <main className="section-container py-10 sm:py-14">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-[#f0e6d0]/80 bg-white p-6 shadow-card sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-heading-lg font-bold text-gray-900 sm:text-display-sm">
                  CHÍNH SÁCH NGƯỜI DÙNG
                </h1>
                <p className="mt-1 text-body-md font-medium text-gray-700">
                  (User Policy) — TOÀN VĂN
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-caption text-gray-600">
                <span className="rounded-full border border-[#f0e6d0]/80 bg-[#fdf9f0] px-3 py-1">
                  Hiệu lực từ: {effectiveFrom}
                </span>
                <span className="rounded-full border border-[#f0e6d0]/80 bg-[#fdf9f0] px-3 py-1">
                  Phiên bản: {version}
                </span>
              </div>
            </div>

            <p className="mt-4 text-body-sm leading-relaxed text-gray-500">
              Tài liệu này quy định quyền và nghĩa vụ của Người dùng khi sử dụng
              VStory. Vui lòng đọc kỹ trước khi tiếp tục.
            </p>
          </div>

          <div className="mt-6 grid gap-4">
            {sections.map((section) => (
              <section
                key={section.number}
                className="rounded-3xl border border-[#f0e6d0]/80 bg-white p-6 shadow-card sm:p-8"
                aria-label={`${section.number}. ${section.title}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#fdf9f0] text-body-sm font-bold text-gray-800">
                    {section.number}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-heading-md font-semibold text-gray-900">
                      {section.title}
                    </h2>
                    <div className="mt-3 space-y-3 text-body-md leading-relaxed text-gray-700">
                      {section.content}
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
