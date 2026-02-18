/* ────── Genre data for VStory ────── */

export interface GenreGroup {
  label: string;
  genres: string[];
}

/**
 * Full grouped genre list for story creation / editing.
 *
 * Only TRUE genres are listed here — items that answer
 * "What kind of story is this?"
 *
 * Relationship types (1x1, Harem …), endings (HE, SE …),
 * perspectives, pricing, etc. belong in the Tag system
 * (type: relation / ending / tone / form / content / perspective / mature).
 */
export const genreGroups: GenreGroup[] = [
  {
    label: "🔹 Tình cảm",
    genres: [
      "Ngôn tình", "Đam mỹ", "Bách hợp", "LGBT+", "ABO",
    ],
  },
  {
    label: "🔹 Bối cảnh & thời đại",
    genres: [
      "Học đường", "Cổ đại", "Hiện đại", "Mạt thế",
      "Quân nhân", "Showbiz", "Thương trường", "Văn phòng công sở",
    ],
  },
  {
    label: "🔹 Giả tưởng & siêu nhiên",
    genres: [
      "Huyền huyễn", "Tu tiên", "Khoa học viễn tưởng", "Kinh dị",
      "Dị giới", "Dị năng", "Hiện đại kỳ ảo", "Tâm linh",
    ],
  },
  {
    label: "🔹 Xuyên không & chuyển sinh",
    genres: [
      "Xuyên không", "Xuyên sách", "Xuyên game", "Xuyên nhanh",
      "Trọng sinh", "Trùng sinh", "Hoán đổi linh hồn", "Hệ thống",
    ],
  },
  {
    label: "🔹 Phong cách & cảm xúc",
    genres: [
      "Ngược tâm", "Ngọt ngào", "Thuần ngọt", "Chữa lành",
      "Tâm lý tội phạm",
    ],
  },
  {
    label: "🔹 Đề tài đặc biệt",
    genres: [
      "Làm ruộng", "Ẩm thực", "E-sport", "Thể thao",
    ],
  },
  {
    label: "🔹 Hình thức tác phẩm",
    genres: [
      "Light novel", "Fanfic", "Oneshot", "Truyện ngắn",
    ],
  },
];

/** Flat list of all genre names */
export const allGenres: string[] = genreGroups.flatMap((g) => g.genres);


