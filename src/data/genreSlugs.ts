/* ── Genre slug mapping for SEO landing pages ── */

export interface GenreSEO {
  /** URL-friendly slug */
  slug: string;
  /** Vietnamese genre name (matches backend data) */
  name: string;
  /** SEO title for the page */
  title: string;
  /** SEO meta description */
  description: string;
  /** H1 heading on the page */
  heading: string;
  /** Intro paragraph for crawlers */
  intro: string;
}

/**
 * Primary genre pages – each generates a dedicated /the-loai/[slug] page
 * that targets a specific search keyword cluster.
 *
 * IMPORTANT: All slugs must be canonical category slugs from the database.
 * Do NOT use old/alternative slugs here — they would cause 301 redirects
 * which wastes crawl budget and signals poor link hygiene.
 */
export const genreSEOPages: GenreSEO[] = [
  {
    slug: "ngon-tinh",
    name: "Ngôn tình",
    title: "Truyện Ngôn Tình Hay Nhất - Đọc Online Miễn Phí",
    description:
      "Đọc truyện ngôn tình hay, ngôn tình ngọt, ngôn tình sủng đọc miễn phí. Hàng nghìn truyện ngôn tình mới cập nhật mỗi ngày trên VStory.",
    heading: "Truyện Ngôn Tình",
    intro:
      "Khám phá kho truyện ngôn tình phong phú trên VStory. Từ ngôn tình ngọt ngào, lãng mạn đến ngôn tình ngược, sủng – tất cả đều miễn phí và cập nhật liên tục.",
  },
  {
    slug: "dam-my",
    name: "Đam mỹ",
    title: "Truyện Đam Mỹ Hay - Đọc Truyện BL Online Miễn Phí",
    description:
      "Đọc truyện đam mỹ hay nhất, truyện BL, truyện boys love online miễn phí. Cập nhật chương mới nhanh nhất tại VStory.",
    heading: "Truyện Đam Mỹ",
    intro:
      "Tổng hợp truyện đam mỹ hay, truyện BL hot nhất. Đọc miễn phí các tác phẩm đam mỹ ngọt, ngược, hài hước và nhiều hơn nữa tại VStory.",
  },
  {
    slug: "xuyen-khong",
    name: "Xuyên không",
    title: "Truyện Xuyên Không Hay - Đọc Online Miễn Phí",
    description:
      "Đọc truyện xuyên không hay, truyện xuyên về quá khứ, xuyên không cổ đại online miễn phí tại VStory. Cập nhật liên tục.",
    heading: "Truyện Xuyên Không",
    intro:
      "Tuyển tập truyện xuyên không hay nhất – xuyên về cổ đại, xuyên vào sách, xuyên game. Đọc miễn phí tại VStory với hàng nghìn chương mới mỗi ngày.",
  },
  {
    slug: "huyen-huyen",
    name: "Huyền huyễn",
    title: "Truyện Huyền Huyễn, Tiên Hiệp Hay Nhất - Đọc Miễn Phí",
    description:
      "Đọc truyện huyền huyễn, tiên hiệp, tu tiên hay nhất online miễn phí. Cập nhật chương mới nhanh nhất tại VStory.",
    heading: "Truyện Huyền Huyễn – Giả Tưởng",
    intro:
      "Khám phá thế giới huyền huyễn, tiên hiệp, tu tiên kỳ ảo với hàng nghìn tác phẩm hay. Đọc miễn phí và cập nhật chương mới mỗi ngày tại VStory.",
  },
  {
    slug: "hoc-duong",
    name: "Học đường",
    title: "Truyện Học Đường Hay - Đọc Online Miễn Phí",
    description:
      "Đọc truyện học đường hay, truyện tình cảm tuổi học trò, đời thường online miễn phí. Hàng nghìn truyện học đường mới tại VStory.",
    heading: "Truyện Học Đường – Đời Thường",
    intro:
      "Tổng hợp truyện học đường hay nhất – tình cảm tuổi học trò, thanh xuân vườn trường, đời thường. Đọc miễn phí trên VStory.",
  },
  {
    slug: "kinh-di",
    name: "Kinh dị",
    title: "Truyện Kinh Dị Hay - Đọc Truyện Ma Online Miễn Phí",
    description:
      "Đọc truyện kinh dị, truyện ma, truyện linh dị online miễn phí. Cập nhật truyện kinh dị mới nhất tại VStory.",
    heading: "Truyện Kinh Dị – Linh Dị",
    intro:
      "Bộ sưu tập truyện kinh dị, truyện ma, linh dị rùng rợn. Đọc miễn phí những câu chuyện ly kỳ, bí ẩn trên VStory.",
  },
  {
    slug: "tinh-cam",
    name: "Tình cảm",
    title: "Truyện Tình Cảm Hay Nhất - Đọc Online Miễn Phí",
    description:
      "Đọc truyện tình cảm hay, ngọt sủng, lãng mạn online miễn phí tại VStory. Cập nhật liên tục.",
    heading: "Truyện Tình Cảm",
    intro:
      "Tuyển tập truyện tình cảm, lãng mạn, ngọt sủng dành cho fans tình cảm. Đọc miễn phí, cập nhật liên tục tại VStory.",
  },
  {
    slug: "co-dai",
    name: "Cổ đại",
    title: "Truyện Cổ Đại, Kiếm Hiệp Hay - Đọc Online Miễn Phí",
    description:
      "Đọc truyện cổ đại hay, truyện cung đấu, truyện kiếm hiệp online miễn phí. Cập nhật hàng ngày tại VStory.",
    heading: "Truyện Cổ Đại – Kiếm Hiệp",
    intro:
      "Bước vào thế giới cổ đại với cung đấu, giang hồ hiệp khách. Hàng nghìn truyện cổ đại hay đọc miễn phí trên VStory.",
  },
  {
    slug: "khoa-hoc",
    name: "Khoa học viễn tưởng",
    title: "Truyện Khoa Học Viễn Tưởng Hay - Đọc Online Miễn Phí",
    description:
      "Đọc truyện khoa học viễn tưởng, truyện sci-fi hay nhất online miễn phí tại VStory. Cập nhật liên tục.",
    heading: "Truyện Khoa Học Viễn Tưởng",
    intro:
      "Khám phá thế giới khoa học viễn tưởng với công nghệ, vũ trụ và AI. Đọc miễn phí trên VStory.",
  },
  {
    slug: "light-novel",
    name: "Light novel",
    title: "Light Novel & Fanfic Tiếng Việt Hay - Đọc Online Miễn Phí",
    description:
      "Đọc light novel tiếng Việt, fanfic hay nhất trên VStory. Phong cách Nhật Bản – miễn phí, cập nhật nhanh.",
    heading: "Light Novel & Fanfic",
    intro:
      "Tổng hợp light novel, fanfic tiếng Việt hay nhất. Phong cách kể chuyện nhẹ nhàng, hấp dẫn – đọc miễn phí tại VStory.",
  },
  {
    slug: "bach-hop",
    name: "Bách hợp",
    title: "Truyện Bách Hợp Hay - Đọc Truyện GL Online Miễn Phí",
    description:
      "Đọc truyện bách hợp, truyện GL hay nhất online miễn phí. Cập nhật truyện bách hợp mới nhanh nhất tại VStory.",
    heading: "Truyện Bách Hợp",
    intro:
      "Tuyển tập truyện bách hợp, GL hay nhất. Đọc miễn phí trên VStory với cập nhật liên tục.",
  },
  {
    slug: "phieu-luu",
    name: "Phiêu lưu",
    title: "Truyện Phiêu Lưu & Hành Động Hay - Đọc Online Miễn Phí",
    description:
      "Đọc truyện phiêu lưu, hành động, mạt thế hay nhất online miễn phí tại VStory. Hàng nghìn chương cập nhật mỗi ngày.",
    heading: "Truyện Phiêu Lưu – Hành Động",
    intro:
      "Khám phá thế giới phiêu lưu, hành động gay cấn. Đọc miễn phí tại VStory.",
  },
];

/** Lookup genre SEO data by slug */
export function getGenreSEOBySlug(slug: string): GenreSEO | undefined {
  return genreSEOPages.find((g) => g.slug === slug);
}

/** Lookup genre SEO data by genre name */
export function getGenreSEOByName(name: string): GenreSEO | undefined {
  return genreSEOPages.find(
    (g) => g.name.toLowerCase() === name.toLowerCase(),
  );
}
