"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Header />

      <main className="section-container py-10 sm:py-14">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-[#f0e6d0]/80 bg-white p-6 shadow-card sm:p-8">
            <h1 className="text-heading-lg font-bold text-gray-900 sm:text-display-sm">
              Chính sách bảo mật
            </h1>
            <p className="mt-3 text-body-md leading-relaxed text-gray-700">
              Trang này mô tả cách VStory thu thập và sử dụng dữ liệu để vận hành
              dịch vụ.
            </p>
          </div>

          <section className="mt-6 rounded-3xl border border-[#f0e6d0]/80 bg-white p-6 shadow-card sm:p-8">
            <div className="space-y-3 text-body-md leading-relaxed text-gray-700">
              <p>
                VStory có thể thu thập dữ liệu cơ bản (ví dụ: email, lịch sử đọc,
                tương tác) để cung cấp và cải thiện trải nghiệm.
              </p>
              <p>VStory không bán dữ liệu cá nhân cho bên thứ ba.</p>
              <p>
                Nếu bạn cần hỗ trợ hoặc có yêu cầu liên quan đến quyền riêng tư,
                vui lòng liên hệ:{" "}
                <a className="underline" href="mailto:support@vstory.vn">
                  support@vstory.vn
                </a>
                .
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
