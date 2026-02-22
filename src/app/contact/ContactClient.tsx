"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ContactClient() {
  return (
    <>
      <Header />

      <main className="section-container py-10 sm:py-14">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-[#f0e6d0]/80 bg-white p-6 shadow-card sm:p-8">
            <h1 className="text-heading-lg font-bold text-gray-900 sm:text-display-sm">
              Liên hệ VStory
            </h1>
            <p className="mt-3 text-body-md leading-relaxed text-gray-700">
              Nếu bạn cần hỗ trợ tài khoản, báo lỗi nội dung, khiếu nại bản quyền
              hoặc hợp tác, vui lòng liên hệ qua các kênh chính thức dưới đây.
            </p>
          </div>

          <section className="mt-6 rounded-3xl border border-[#f0e6d0]/80 bg-white p-6 shadow-card sm:p-8">
            <h2 className="text-heading-md font-semibold text-gray-900">Kênh hỗ trợ</h2>
            <div className="mt-4 space-y-3 text-body-md leading-relaxed text-gray-700">
              <p>
                Email hỗ trợ: {" "}
                <a className="underline" href="mailto:support@vstory.vn">
                  support@vstory.vn
                </a>
              </p>
              <p>
                Facebook: {" "}
                <a
                  className="underline"
                  href="https://www.facebook.com/vstory1202"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  facebook.com/vstory1202
                </a>
              </p>
              <p>
                Telegram: {" "}
                <a
                  className="underline"
                  href="https://t.me/seringuyen05061"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  t.me/seringuyen05061
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
