"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

type PolicySection = {
  number: number;
  title: string;
  content: React.ReactNode;
};

const effectiveFrom = "15/02/2026";
const version = "1.1";

const sections: PolicySection[] = [
  {
    number: 1,
    title: "Tư cách Tác giả",
    content: (
      <>
        <ul className="list-disc pl-5">
          <li>Người dùng có thể đăng ký trở thành Tác giả thông qua hệ thống của VStory.</li>
          <li>Tác giả phải cung cấp thông tin chính xác và đầy đủ khi yêu cầu rút tiền.</li>
          <li>VStory có quyền từ chối hoặc hủy tư cách Tác giả nếu phát hiện vi phạm.</li>
        </ul>
      </>
    ),
  },
  {
    number: 2,
    title: "Quyền sở hữu tác phẩm",
    content: (
      <>
        <p>
          Tác giả giữ toàn bộ quyền sở hữu trí tuệ đối với tác phẩm của mình, trừ khi có thỏa thuận độc quyền riêng bằng văn bản.
        </p>
        <p>Khi đăng tải nội dung lên VStory, Tác giả cấp cho VStory quyền:</p>
        <ul className="list-disc pl-5">
          <li>Hiển thị nội dung trên nền tảng</li>
          <li>Lưu trữ, sao lưu và xử lý kỹ thuật phục vụ vận hành</li>
          <li>Phân phối nội dung đến người dùng trong phạm vi hệ thống</li>
        </ul>
        <p>
          Quyền này là không độc quyền và không làm mất quyền sở hữu của Tác giả.
        </p>
      </>
    ),
  },
  {
    number: 3,
    title: "Trách nhiệm về nội dung",
    content: (
      <>
        <p>Tác giả cam kết:</p>
        <ul className="list-disc pl-5">
          <li>Nội dung do mình sáng tạo hoặc có quyền sử dụng hợp pháp</li>
          <li>Không sao chép trái phép</li>
          <li>Không vi phạm pháp luật</li>
          <li>Không chứa nội dung bị cấm theo quy định của VStory</li>
        </ul>

        <h3 className="mt-4 text-body-md font-semibold text-gray-900">3.1 Kiểm duyệt nội dung</h3>
        <p className="mt-2">
          Mọi truyện được đăng tải trên VStory sẽ được đội ngũ kiểm duyệt của VStory <strong>xem xét và phê duyệt trước khi hiển thị công khai</strong> trên nền tảng. Truyện chỉ được xuất bản sau khi được duyệt thành công.
        </p>
        <ul className="list-disc pl-5">
          <li>Truyện mới đăng sẽ ở trạng thái <em>&quot;Chờ duyệt&quot;</em> cho đến khi được xét duyệt.</li>
          <li>VStory có quyền từ chối duyệt truyện nếu vi phạm chính sách nội dung hoặc quy định pháp luật.</li>
          <li>Tác giả sẽ được thông báo lý do nếu truyện bị từ chối.</li>
          <li>Thời gian xét duyệt thông thường: 1–3 ngày làm việc.</li>
        </ul>

        <h3 className="mt-4 text-body-md font-semibold text-gray-900">3.2 Nội dung bị nghiêm cấm</h3>
        <p className="mt-2">
          VStory <strong>nghiêm cấm tuyệt đối</strong> các loại nội dung sau đây. Truyện vi phạm sẽ bị gỡ bỏ ngay lập tức và tài khoản tác giả có thể bị khóa vĩnh viễn:
        </p>
        <ul className="list-disc pl-5">
          <li>Nội dung khiêu dâm, đồi trụy, kích dục (18+)</li>
          <li>Nội dung mô tả chi tiết bạo lực đẫm máu, tra tấn, hành hạ</li>
          <li>Nội dung tuyên truyền, kích động bạo lực, khủng bố</li>
          <li>Nội dung liên quan đến ma túy, chất cấm</li>
          <li>Nội dung phân biệt chủng tộc, giới tính, tôn giáo</li>
          <li>Nội dung xuyên tạc lịch sử, chống phá Nhà nước</li>
          <li>Nội dung xâm phạm quyền trẻ em</li>
          <li>Mọi nội dung khác vi phạm pháp luật Việt Nam</li>
        </ul>

        <h3 className="mt-4 text-body-md font-semibold text-gray-900">3.3 Quyền xử lý của VStory</h3>
        <p className="mt-2">VStory có quyền:</p>
        <ul className="list-disc pl-5">
          <li>Gỡ bỏ nội dung vi phạm mà không cần thông báo trước</li>
          <li>Tạm ẩn nội dung khi có khiếu nại</li>
          <li>Tạm giữ doanh thu liên quan đến nội dung đang tranh chấp</li>
          <li>Yêu cầu Tác giả chỉnh sửa hoặc bổ sung nhãn nội dung phù hợp</li>
        </ul>
      </>
    ),
  },
  {
    number: 4,
    title: "Cơ chế kiếm tiền",
    content: (
      <>
        <h3 className="text-body-md font-semibold text-gray-900">4.1 Mở khóa chương bằng Xu</h3>
        <ul className="mt-2 list-disc pl-5">
          <li>Tác giả có thể thiết lập chương truyện là miễn phí hoặc trả phí.</li>
          <li>Người đọc sử dụng Xu để mở khóa chương trả phí.</li>
          <li>Xu là đơn vị ảo chỉ có giá trị trong hệ thống VStory.</li>
        </ul>

        <h3 className="mt-4 text-body-md font-semibold text-gray-900">4.2 Chia doanh thu</h3>
        <p className="mt-2">Khi một chương trả phí được mở khóa:</p>
        <ul className="list-disc pl-5">
          <li>70% doanh thu thuộc về Tác giả</li>
          <li>30% thuộc về VStory (phí nền tảng)</li>
          <li>Doanh thu được ghi nhận minh bạch trong Dashboard của Tác giả.</li>
        </ul>
      </>
    ),
  },
  {
    number: 5,
    title: "Rút tiền và thanh toán",
    content: (
      <>
        <h3 className="text-body-md font-semibold text-gray-900">5.1 Điều kiện rút tiền</h3>
        <ul className="mt-2 list-disc pl-5">
          <li>Ngưỡng rút tối thiểu: 50.000 VNĐ</li>
          <li>Chỉ số dư khả dụng (không tranh chấp, không bị tạm giữ) mới được rút.</li>
        </ul>

        <h3 className="mt-4 text-body-md font-semibold text-gray-900">5.2 Quy trình rút tiền</h3>
        <p className="mt-2">Tác giả gửi yêu cầu rút tiền qua Dashboard. Cung cấp:</p>
        <ul className="list-disc pl-5">
          <li>Họ và tên chủ tài khoản</li>
          <li>Số tài khoản ngân hàng</li>
          <li>Tên ngân hàng</li>
          <li>Thông tin cá nhân cần thiết (CMND/CCCD hoặc mã số thuế nếu có)</li>
        </ul>
        <p className="mt-3">VStory tiến hành kiểm tra:</p>
        <ul className="list-disc pl-5">
          <li>Xác minh tính hợp lệ</li>
          <li>Kiểm tra gian lận</li>
          <li>Kiểm tra tranh chấp bản quyền</li>
        </ul>
        <p className="mt-3">Sau khi xác nhận hợp lệ, VStory xử lý thanh toán trong vòng 4–8 giờ làm việc.</p>
      </>
    ),
  },
  {
    number: 6,
    title: "Chi tiết phân chia doanh thu và thuế",
    content: (
      <>
        <h3 className="text-body-md font-semibold text-gray-900">6.1 Cơ cấu phân chia doanh thu</h3>
        <p className="mt-2">
          Khi người đọc mở khóa chương trả phí, tổng doanh thu được phân chia như sau:
        </p>

        <div className="mt-3 overflow-hidden rounded-xl border border-[#f0e6d0]/80">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="bg-[#fdf9f0]">
                <th className="px-4 py-2.5 text-left font-semibold text-gray-800">Khoản mục</th>
                <th className="px-4 py-2.5 text-right font-semibold text-gray-800">Tỷ lệ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e6d0]/50">
              <tr>
                <td className="px-4 py-2.5 text-gray-700">Phí nền tảng VStory</td>
                <td className="px-4 py-2.5 text-right font-medium text-gray-900">30%</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-gray-700">Phần doanh thu của Tác giả (trước thuế)</td>
                <td className="px-4 py-2.5 text-right font-medium text-gray-900">70%</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-gray-700">Thuế TNCN (khấu trừ 5%)</td>
                <td className="px-4 py-2.5 text-right font-medium text-gray-900">−5%</td>
              </tr>
              <tr className="bg-[#fdf9f0]">
                <td className="px-4 py-2.5 font-semibold text-gray-900">Tác giả thực nhận</td>
                <td className="px-4 py-2.5 text-right font-bold text-primary-600">65%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mt-5 text-body-md font-semibold text-gray-900">6.2 Ví dụ minh họa</h3>
        <p className="mt-2">Giả sử tổng doanh thu từ một chương là <strong>100.000 VNĐ</strong>:</p>
        <div className="mt-3 overflow-hidden rounded-xl border border-[#f0e6d0]/80">
          <table className="w-full text-body-sm">
            <tbody className="divide-y divide-[#f0e6d0]/50">
              <tr>
                <td className="px-4 py-2.5 text-gray-700">Phí nền tảng (30%)</td>
                <td className="px-4 py-2.5 text-right text-gray-900">30.000 VNĐ</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-gray-700">Doanh thu Tác giả trước thuế (70%)</td>
                <td className="px-4 py-2.5 text-right text-gray-900">70.000 VNĐ</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-gray-700">Thuế TNCN (5%)</td>
                <td className="px-4 py-2.5 text-right text-red-600">−5.000 VNĐ</td>
              </tr>
              <tr className="bg-[#fdf9f0]">
                <td className="px-4 py-2.5 font-semibold text-gray-900">Tác giả thực nhận</td>
                <td className="px-4 py-2.5 text-right font-bold text-primary-600">65.000 VNĐ</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mt-5 text-body-md font-semibold text-gray-900">6.3 Thuế thu nhập cá nhân (TNCN)</h3>
        <p className="mt-2">
          VStory khấu trừ <strong>5% thuế TNCN</strong> trên phần doanh thu của Tác giả trước khi thanh toán, theo quy định pháp luật Việt Nam. Cụ thể:
        </p>
        <ul className="list-disc pl-5">
          <li>Tổng doanh thu trừ 30% phí nền tảng = 70% về Tác giả</li>
          <li>Thuế TNCN = 5% (khấu trừ trên phần của Tác giả)</li>
          <li><strong>Tác giả thực nhận: 65% tổng doanh thu</strong> (chưa bao gồm phí chuyển khoản nếu có)</li>
        </ul>

        <h3 className="mt-5 text-body-md font-semibold text-gray-900">6.4 Minh bạch khi rút tiền</h3>
        <p className="mt-2">Khi Tác giả thực hiện rút tiền, hệ thống sẽ hiển thị rõ ràng:</p>
        <ul className="list-disc pl-5">
          <li>Tổng doanh thu từ chương trả phí</li>
          <li>Phí nền tảng 30% đã trừ</li>
          <li>Số thuế TNCN 5% bị khấu trừ</li>
          <li>Phí chuyển khoản (nếu có)</li>
          <li>Số tiền thực nhận cuối cùng</li>
          <li>Thời gian xử lý dự kiến</li>
        </ul>
        <p className="mt-3">Tác giả cần xác nhận trước khi hoàn tất yêu cầu rút tiền.</p>
      </>
    ),
  },
  {
    number: 7,
    title: "Tạm giữ và từ chối thanh toán",
    content: (
      <>
        <p>VStory có quyền tạm giữ hoặc từ chối thanh toán trong các trường hợp:</p>
        <ul className="list-disc pl-5">
          <li>Phát hiện gian lận</li>
          <li>Nội dung bị khiếu nại bản quyền</li>
          <li>Vi phạm điều khoản</li>
          <li>Cung cấp thông tin sai lệch</li>
        </ul>
        <p className="mt-3">VStory sẽ thông báo lý do nếu có tạm giữ.</p>
      </>
    ),
  },
  {
    number: 8,
    title: "Nghĩa vụ thuế của Tác giả",
    content: (
      <>
        <p>
          Việc khấu trừ 5% chỉ nhằm hỗ trợ thực hiện nghĩa vụ thuế theo quy định. Tác giả vẫn chịu trách nhiệm tự kê khai và hoàn thành nghĩa vụ thuế cá nhân theo pháp luật Việt Nam.
        </p>
      </>
    ),
  },
  {
    number: 9,
    title: "Chấm dứt hợp tác",
    content: (
      <>
        <p>VStory có quyền:</p>
        <ul className="list-disc pl-5">
          <li>Tạm khóa hoặc khóa vĩnh viễn tài khoản Tác giả</li>
          <li>Gỡ bỏ nội dung vi phạm</li>
          <li>Ngừng hợp tác nếu Tác giả vi phạm nghiêm trọng</li>
          <li>
            <strong>Gỡ toàn bộ nội dung và xóa vĩnh viễn tài khoản</strong> nếu phát hiện Tác giả sử dụng AI (trí tuệ
            nhân tạo) để tạo hàng loạt truyện nhằm mục đích spam, trục lợi hệ thống hoặc làm giảm chất lượng nền tảng.
            Mọi doanh thu chưa rút liên quan đến nội dung vi phạm sẽ bị hủy bỏ và không được thanh toán.
          </li>
        </ul>
        <p className="mt-3">Trong trường hợp chấm dứt, doanh thu hợp lệ còn lại sẽ được xử lý theo quy định.</p>
      </>
    ),
  },
  {
    number: 10,
    title: "Trách nhiệm pháp lý",
    content: (
      <>
        <p>
          VStory là nền tảng trung gian cung cấp dịch vụ phân phối nội dung. Tác giả chịu trách nhiệm pháp lý đối với nội dung do mình đăng tải.
        </p>
      </>
    ),
  },
  {
    number: 11,
    title: "Thay đổi chính sách",
    content: (
      <>
        <p>
          VStory có thể cập nhật chính sách này khi cần thiết. Việc tiếp tục sử dụng nền tảng đồng nghĩa với việc Tác giả chấp nhận các thay đổi.
        </p>
      </>
    ),
  },
  {
    number: 12,
    title: "Liên hệ",
    content: (
      <>
        <p>Mọi thắc mắc liên quan đến: Doanh thu, Rút tiền, Bản quyền, Hỗ trợ kỹ thuật</p>
        <p className="mt-2">
          Vui lòng liên hệ:{" "}
          <a className="underline" href="mailto:support@vstory.vn">
            support@vstory.vn
          </a>
        </p>
      </>
    ),
  },
];

export default function AuthorPolicyClient() {
  return (
    <>
      <Header />

      <main className="section-container py-10 sm:py-14">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-[#f0e6d0]/80 bg-white p-6 shadow-card sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-heading-lg font-bold text-gray-900 sm:text-display-sm">
                  CHÍNH SÁCH DÀNH CHO TÁC GIẢ
                </h1>
                <p className="mt-1 text-body-md font-medium text-gray-700">
                  (AUTHOR POLICY) — VSTORY
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
              Chính sách này áp dụng cho mọi người dùng đăng ký và hoạt động với tư cách Tác giả trên nền tảng VStory.
              Việc đăng tải nội dung và tham gia kiếm tiền trên VStory đồng nghĩa với việc bạn đồng ý tuân thủ các điều khoản dưới đây.
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
