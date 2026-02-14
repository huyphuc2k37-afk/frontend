import Link from "next/link";

const footerLinks = {
  product: [
    { label: "Khám phá", href: "/explore" },
    { label: "Bảng xếp hạng", href: "/ranking" },
    { label: "Trở thành tác giả", href: "/author" },
    { label: "Giới thiệu", href: "/about" },
    { label: "Điều khoản", href: "/terms" },
    { label: "Chính sách bảo mật", href: "/privacy" },
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
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center">
              <span className="text-heading-md text-gradient">VStory</span>
            </Link>
            <p className="mt-3 max-w-xs text-body-sm text-gray-500">
              Nền tảng truyện dành cho người Việt. Đọc, viết, chia sẻ câu
              chuyện của bạn.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-body-sm font-semibold uppercase tracking-wider text-gray-400">
              Sản phẩm
            </h4>
            <ul className="mt-3 space-y-2">
              {footerLinks.product.map((link) => (
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

          {/* Social */}
          <div>
            <h4 className="text-body-sm font-semibold uppercase tracking-wider text-gray-400">
              Mạng xã hội
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
