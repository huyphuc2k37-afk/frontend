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
    slug: "tien-hiep",
    name: "Tu tiên",
    title: "Truyện Tiên Hiệp, Tu Tiên Hay Nhất - Đọc Miễn Phí",
    description:
      "Đọc truyện tiên hiệp, truyện tu tiên, truyện tu chân hay nhất online miễn phí. Cập nhật chương mới nhanh nhất tại VStory.",
    heading: "Truyện Tiên Hiệp – Tu Tiên",
    intro:
      "Khám phá thế giới tu tiên, tiên hiệp hấp dẫn với hàng nghìn tác phẩm hay. Đọc miễn phí, cập nhật mỗi ngày tại VStory.",
  },
  {
    slug: "hoc-duong",
    name: "Học đường",
    title: "Truyện Học Đường Hay - Đọc Online Miễn Phí",
    description:
      "Đọc truyện học đường hay, truyện tình cảm tuổi học trò online miễn phí. Hàng nghìn truyện học đường mới tại VStory.",
    heading: "Truyện Học Đường",
    intro:
      "Tổng hợp truyện học đường hay nhất – tình cảm tuổi học trò, thanh xuân vườn trường. Đọc miễn phí trên VStory.",
  },
  {
    slug: "kinh-di",
    name: "Kinh dị",
    title: "Truyện Kinh Dị Hay - Đọc Truyện Ma Online Miễn Phí",
    description:
      "Đọc truyện kinh dị, truyện ma, truyện rùng rợn online miễn phí. Cập nhật truyện kinh dị mới nhất tại VStory.",
    heading: "Truyện Kinh Dị",
    intro:
      "Bộ sưu tập truyện kinh dị, truyện ma rùng rợn. Đọc miễn phí những câu chuyện ly kỳ, bí ẩn trên VStory.",
  },
  {
    slug: "huyen-huyen",
    name: "Huyền huyễn",
    title: "Truyện Huyền Huyễn Hay Nhất - Đọc Online Miễn Phí",
    description:
      "Đọc truyện huyền huyễn, truyện fantasy hay nhất online miễn phí tại VStory. Hàng nghìn tác phẩm cập nhật liên tục.",
    heading: "Truyện Huyền Huyễn",
    intro:
      "Khám phá thế giới huyền huyễn kỳ ảo với hàng nghìn tác phẩm hay. Đọc miễn phí và cập nhật chương mới mỗi ngày tại VStory.",
  },
  {
    slug: "trong-sinh",
    name: "Trọng sinh",
    title: "Truyện Trọng Sinh Hay - Đọc Online Miễn Phí",
    description:
      "Đọc truyện trọng sinh hay nhất, truyện tái sinh, truyện sống lại online miễn phí tại VStory.",
    heading: "Truyện Trọng Sinh",
    intro:
      "Tuyển tập truyện trọng sinh hay – nhân vật chính sống lại, thay đổi số phận. Đọc miễn phí tại VStory.",
  },
  {
    slug: "co-dai",
    name: "Cổ đại",
    title: "Truyện Cổ Đại Hay Nhất - Đọc Online Miễn Phí",
    description:
      "Đọc truyện cổ đại hay, truyện cung đấu, truyện kiếm hiệp online miễn phí. Cập nhật hàng ngày tại VStory.",
    heading: "Truyện Cổ Đại",
    intro:
      "Bước vào thế giới cổ đại với cung đấu, giang hồ hiệp khách. Hàng nghìn truyện cổ đại hay đọc miễn phí trên VStory.",
  },
  {
    slug: "do-thi",
    name: "Hiện đại",
    title: "Truyện Đô Thị, Hiện Đại Hay - Đọc Online Miễn Phí",
    description:
      "Đọc truyện đô thị, truyện hiện đại hay nhất online miễn phí. Truyện tình cảm, phiêu lưu trong bối cảnh đô thị tại VStory.",
    heading: "Truyện Đô Thị – Hiện Đại",
    intro:
      "Tổng hợp truyện đô thị, hiện đại hay nhất. Từ tình cảm lãng mạn đến phiêu lưu hành động – đọc miễn phí trên VStory.",
  },
  {
    slug: "ngot-sung",
    name: "Thuần ngọt",
    title: "Truyện Ngọt Sủng, Thuần Ngọt Hay - Đọc Online Miễn Phí",
    description:
      "Đọc truyện ngọt sủng, thuần ngọt, sủng văn hay miễn phí. Truyện tình cảm ngọt ngào, lãng mạn tại VStory.",
    heading: "Truyện Ngọt Sủng – Thuần Ngọt",
    intro:
      "Tuyển tập truyện ngọt sủng, thuần ngọt dành cho fans tình cảm lãng mạn. Đọc miễn phí, cập nhật liên tục tại VStory.",
  },
  {
    slug: "khoa-hoc-vien-tuong",
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
    title: "Light Novel Tiếng Việt Hay - Đọc Online Miễn Phí",
    description:
      "Đọc light novel tiếng Việt, LN hay nhất trên VStory. Truyện nhẹ, phong cách Nhật Bản – miễn phí, cập nhật nhanh.",
    heading: "Light Novel Tiếng Việt",
    intro:
      "Tổng hợp light novel tiếng Việt hay nhất. Phong cách kể chuyện nhẹ nhàng, hấp dẫn – đọc miễn phí tại VStory.",
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
    slug: "mat-the",
    name: "Mạt thế",
    title: "Truyện Mạt Thế, Tận Thế Hay - Đọc Online Miễn Phí",
    description:
      "Đọc truyện mạt thế, tận thế, sinh tồn hay nhất online miễn phí tại VStory. Hàng nghìn chương cập nhật mỗi ngày.",
    heading: "Truyện Mạt Thế – Tận Thế",
    intro:
      "Khám phá thế giới mạt thế với các câu chuyện sinh tồn gay cấn. Đọc miễn phí tại VStory.",
  },
  {
    slug: "fanfic",
    name: "Fanfic",
    title: "Truyện Fanfic Hay - Đọc Online Miễn Phí",
    description:
      "Đọc fanfic hay nhất, đồng nhân các bộ truyện, phim nổi tiếng. Miễn phí trên VStory.",
    heading: "Truyện Fanfic",
    intro:
      "Tổng hợp fanfiction hay nhất – sáng tác đồng nhân dựa trên các tác phẩm nổi tiếng. Đọc miễn phí trên VStory.",
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
