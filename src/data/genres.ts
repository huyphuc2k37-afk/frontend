/* ────── Genre data for VStory ────── */

export interface GenreGroup {
  label: string;
  genres: string[];
}

/** Full grouped genre list for story creation / editing */
export const genreGroups: GenreGroup[] = [
  {
    label: "🔹 Tình cảm",
    genres: [
      "Ngôn tình", "Đam mỹ", "LGBT+", "Bách hợp",
      "Thanh mai trúc mã", "Cưỡng chế yêu", "Sinh tử văn", "ABO",
    ],
  },
  {
    label: "🔹 Bối cảnh & thời đại",
    genres: [
      "Học đường", "Văn phòng công sở", "Thương trường", "Showbiz",
      "Quân nhân", "Hiện đại", "Cổ đại", "Tương lai",
      "Tiền sử", "Mạt thế", "Tận thế", "Chiến tranh", "Việt Nam",
    ],
  },
  {
    label: "🔹 Giả tưởng & siêu nhiên",
    genres: [
      "Hiện đại kỳ ảo", "Khoa học viễn tưởng", "Huyền huyễn", "Dị giới",
      "Dị năng", "Tu tiên", "Thú nhân", "Robot", "AI",
      "Thần thú", "Tâm linh", "Kinh dị", "Minh hôn",
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
    label: "🔹 Tâm lý & cảm xúc",
    genres: [
      "Ngược tâm", "Ngược nhẹ", "Ngọt ngào", "Thuần ngọt",
      "Chữa lành", "Tâm lý", "Tâm lý tội phạm",
    ],
  },
  {
    label: "🔹 Hướng nội dung",
    genres: [
      "Góc nhìn nữ chính", "Góc nhìn nam chính", "Làm ruộng",
      "Ẩm thực", "Livestream", "E-sport", "Thể thao",
      "Thế giới mạng", "Thế giới ngầm",
    ],
  },
  {
    label: "🔹 Hình thức quan hệ",
    genres: ["1x1", "NP / Harem", "Không CP", "BDSM"],
  },
  {
    label: "🔹 Kết thúc truyện",
    genres: [
      "HE (Happy Ending)", "SE (Sad Ending)", "OE (Open Ending)",
      "BE (Bad Ending)", "GE (Good Ending)",
    ],
  },
  {
    label: "🔹 Hình thức tác phẩm",
    genres: [
      "Tự truyện", "Tản văn", "Light novel", "Fanfic",
      "Oneshot", "Truyện ngắn", "Tiểu thuyết",
    ],
  },
  {
    label: "🔹 Phân loại khác",
    genres: ["Miễn phí", "Trả phí", "Truyện có yếu tố 16+"],
  },
];

/** Flat list of all genre names */
export const allGenres: string[] = genreGroups.flatMap((g) => g.genres);

/** Genres that require age verification (16+ / 18+) */
export const matureGenres = ["BDSM", "Truyện có yếu tố 16+"];
