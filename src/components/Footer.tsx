import Link from "next/link";

const footerLinks = {
  explore: [
    { label: "Khám phá truyện", href: "/explore" },
    { label: "Bảng xếp hạng", href: "/ranking" },
    { label: "Thể loại truyện", href: "/the-loai" },
    { label: "Trở thành tác giả", href: "/author" },
  ],
  genres: [
    { label: "Truyện Ngôn Tình", href: "/the-loai/tinh-cam" },
    { label: "Truyện Đam Mỹ", href: "/the-loai/tinh-cam" },
    { label: "Truyện Xuyên Không", href: "/the-loai/xuyen-khong" },
    { label: "Truyện Tiên Hiệp", href: "/the-loai/gia-tuong-huyen-huyen" },
    { label: "Truyện Kinh Dị", href: "/the-loai/kinh-di-tam-linh" },
    { label: "Truyện Học Đường", href: "/the-loai/hoc-duong-do-thi" },
    { label: "Truyện Huyền Huyễn", href: "/the-loai/gia-tuong-huyen-huyen" },
    { label: "Light Novel", href: "/the-loai/fanfic-light-novel" },
  ],
  support: [
    { label: "Giới thiệu", href: "/about" },
    { label: "Điều khoản", href: "/terms" },
    { label: "Chính sách bảo mật", href: "/privacy" },
    { label: "Liên hệ", href: "/contact" },
  ],
  social: [
    { label: "Telegram", href: "https://t.me/seringuyen05061" },
    { label: "Facebook", href: "https://www.facebook.com/vstory1202" },
    { label: "TikTok", href: "https://www.tiktok.com/@vstory1202" },
  ],
};

export default function Footer() {
  return (
    <footer
      className="border-t border-[#f0e6d0]/50 pb-28 pt-12 sm:pb-12"
      aria-label="Footer"
    >
      <div className="section-container">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center">
              <span className="text-heading-md text-gradient">VStory</span>
            </Link>
            <p className="mt-3 max-w-xs text-body-sm text-gray-500">
              Nền tảng đọc truyện chữ online miễn phí dành cho người Việt.
            </p>
          </div>

          {/* Trang chính */}
          <div>
            <h4 className="text-body-sm font-semibold uppercase tracking-wider text-gray-400">
              Trang chính
            </h4>
            <ul className="mt-3 space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-gray-600 transition-colors hover:text-primary-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Thể loại */}
          <div>
            <h4 className="text-body-sm font-semibold uppercase tracking-wider text-gray-400">
              Thể loại
            </h4>
            <ul className="mt-3 space-y-2">
              {footerLinks.genres.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-gray-600 transition-colors hover:text-primary-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h4 className="text-body-sm font-semibold uppercase tracking-wider text-gray-400">
              Hỗ trợ
            </h4>
            <ul className="mt-3 space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-gray-600 transition-colors hover:text-primary-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mạng xã hội */}
          <div>
            <h4 className="text-body-sm font-semibold uppercase tracking-wider text-gray-400">
              Kết nối
            </h4>
            <ul className="mt-3 space-y-2">
              {footerLinks.social.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-body-sm text-gray-600 transition-colors hover:text-primary-600"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-[#f0e6d0]/50 pt-6 text-center">
          <p className="text-caption text-gray-400">
            &copy; {new Date().getFullYear()} VStory. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
