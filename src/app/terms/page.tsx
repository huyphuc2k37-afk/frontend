"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <>
      <Header />

      <main className="section-container py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-heading-lg font-bold text-gray-900 sm:text-display-sm">
            CHÍNH SÁCH NGƯỜI DÙNG (User Policy) — TOÀN VĂN
          </h1>
          <p className="mt-3 text-body-sm text-gray-500">
            Hiệu lực từ: 12/02/2026 — Phiên bản: 1.0
          </p>

          <div className="mt-8 rounded-3xl border border-[#f0e6d0]/80 bg-white p-6 shadow-card sm:p-8">
            <div className="prose prose-gray max-w-none">
              <h2>1. Mục đích &amp; phạm vi</h2>
              <p>
                Chính sách này quy định quyền và nghĩa vụ của Người dùng khi sử
                dụng VStory (website, app). Nếu bạn đồng thời là tác giả đăng tải
                nội dung, vui lòng đọc cả Chính sách Tác giả.
              </p>

              <h2>2. Điều kiện sử dụng &amp; độ tuổi</h2>
              <p>
                Người dùng phải đủ 13 tuổi trở lên (hoặc theo quy định pháp luật
                áp dụng). Người chưa đủ tuổi cần có sự đồng ý của phụ huynh/người
                giám hộ.
              </p>
              <p>
                Khi đăng ký, cung cấp thông tin chính xác và cập nhật khi cần.
              </p>

              <h2>3. Tài khoản &amp; bảo mật</h2>
              <p>Bảo mật thông tin đăng nhập là trách nhiệm của bạn.</p>
              <p>Mọi hoạt động từ tài khoản được coi là do bạn thực hiện.</p>
              <p>
                Báo ngay cho support nếu phát hiện truy cập trái phép:
                <a href="mailto:support@vstory.vn">support@vstory.vn</a>.
              </p>

              <h2>4. Hành vi bị cấm</h2>
              <p>Người dùng không được:</p>
              <ul>
                <li>
                  Đăng nội dung vi phạm pháp luật, xâm phạm bản quyền, khiêu dâm,
                  kích động thù hằn, bạo lực cực đoan.
                </li>
                <li>Mạo danh, lừa đảo, quấy rối hoặc công kích cá nhân.</li>
                <li>
                  Mua/bán Xu, mua/bán tài khoản, trao đổi giá trị ngoài hệ thống.
                </li>
                <li>Lợi dụng nền tảng để gây thiệt hại cho người khác.</li>
              </ul>

              <h2>5. Nội dung do người dùng đăng</h2>
              <p>
                Người dùng giữ quyền tác giả đối với nội dung do mình sở hữu (xem
                Author Policy nếu bạn là tác giả).
              </p>
              <p>
                Khi đăng, bạn cấp cho VStory quyền không độc quyền, toàn cầu,
                miễn phí để hiển thị, sao lưu, cache và phân phối nội dung trong
                phạm vi vận hành nền tảng.
              </p>
              <p>
                VStory có quyền tạm ẩn hoặc gỡ nội dung khi có khiếu nại hợp lệ
                hoặc phát hiện vi phạm.
              </p>

              <h2>6. Hệ thống Xu (coin)</h2>
              <p>
                Xu là đơn vị ảo trong VStory dùng để mở khóa chương, ủng hộ tác
                giả, mua tính năng.
              </p>
              <p>
                Xu không phải tiền pháp định và không được quy đổi ra tiền mặt
                bên ngoài nền tảng.
              </p>
              <p>Mua Xu phải thực hiện qua kênh thanh toán chính thức của VStory.</p>

              <h2>7. Mở khóa chương</h2>
              <p>Một số chương là trả phí; giá hiển thị bằng Xu.</p>
              <p>Khi mở khóa, giao dịch được ghi nhận trên hệ thống.</p>

              <h2>8. Giao dịch ngoài nền tảng</h2>
              <p>
                Mua bán Xu, mua bán tài khoản, trao đổi Xu ngoài hệ thống bị
                nghiêm cấm. VStory không chịu trách nhiệm cho rủi ro phát sinh từ
                giao dịch ngoài hệ thống.
              </p>

              <h2>9. Khiếu nại &amp; báo cáo vi phạm</h2>
              <p>
                Gửi báo cáo/bằng chứng về nội dung vi phạm tới
                <a href="mailto:support@vstory.vn">support@vstory.vn</a>.
              </p>
              <p>
                VStory sẽ xác minh; có thể tạm ẩn nội dung trong quá trình xử lý.
              </p>

              <h2>10. Quyền riêng tư</h2>
              <p>
                VStory thu thập dữ liệu cơ bản (email, lịch sử đọc, tương tác) để
                vận hành dịch vụ.
              </p>
              <p>
                VStory không bán dữ liệu cá nhân cho bên thứ ba. Chi tiết trong
                Privacy Policy.
              </p>

              <h2>11. Giới hạn trách nhiệm</h2>
              <p>
                VStory không chịu trách nhiệm cho nội dung do người dùng đăng tải
                hoặc thiệt hại phát sinh từ giao dịch ngoài hệ thống.
              </p>
              <p>
                Trách nhiệm bồi thường tối đa của VStory không vượt quá số tiền
                người dùng thực tế đã trả cho nền tảng trong 12 tháng gần nhất
                (hoặc giới hạn khác theo quy định).
              </p>

              <h2>12. Thay đổi chính sách &amp; thông báo</h2>
              <p>
                VStory có thể cập nhật chính sách. Sẽ thông báo trên website hoặc
                email. Việc bạn tiếp tục sử dụng nền tảng = bạn đồng ý chính sách
                mới.
              </p>

              <h2>13. Liên hệ</h2>
              <p>
                Mọi thắc mắc/hỗ trợ:
                <a href="mailto:support@vstory.vn">support@vstory.vn</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
