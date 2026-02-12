# VStory — Frontend Homepage

> Nền tảng truyện dành cho người Việt. Trang chủ hiện đại, mobile-first, Next.js + TypeScript.

## 🚀 Bắt đầu nhanh

```bash
cd frontend
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem trang chủ.

## 📁 Cấu trúc thư mục

```
frontend/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Root layout (metadata, ThemeProvider)
│   │   ├── page.tsx          # Entry point
│   │   └── HomePage.tsx      # Homepage assembly (client component)
│   ├── components/           # UI Components
│   │   ├── Header.tsx        # Sticky header + mobile hamburger + bottom bar
│   │   ├── Hero.tsx          # Full-bleed hero with animated particles
│   │   ├── FeatureStrip.tsx  # 4 feature cards
│   │   ├── SearchBar.tsx     # Search + filter chips + autocomplete
│   │   ├── Carousel.tsx      # Horizontal featured stories carousel
│   │   ├── StoryCard.tsx     # Reusable story card (cover, meta, badges)
│   │   ├── SectionsGrid.tsx  # Grid sections (Mới cập nhật, Đề xuất, etc.)
│   │   ├── CategoryChips.tsx # Genre chips with icons
│   │   ├── HowItWorks.tsx    # 3-step how-it-works section
│   │   ├── Footer.tsx        # Footer with links & social
│   │   └── ThemeProvider.tsx # Dark mode context + localStorage persistence
│   ├── config/
│   │   └── theme.ts          # Colors, fonts, Unsplash queries — edit to rebrand
│   ├── data/mock/
│   │   ├── featured.json     # 8 sample stories (edit/replace with API later)
│   │   └── categories.json   # 6 genre categories
│   ├── styles/
│   │   └── globals.css       # Tailwind directives + custom utilities
│   └── types/
│       └── index.ts          # TypeScript interfaces (Story, Category)
├── tailwind.config.ts        # Tailwind theme config (colors, fonts, animations)
├── next.config.js
├── tsconfig.json
├── postcss.config.js
├── .eslintrc.json
├── .prettierrc
└── package.json
```

## ✏️ Nơi chỉnh sửa nội dung

| Nội dung             | File                                  |
| -------------------- | ------------------------------------- |
| Hero text/CTA        | `src/components/Hero.tsx`             |
| Danh sách truyện     | `src/data/mock/featured.json`         |
| Danh sách thể loại   | `src/data/mock/categories.json`       |
| Feature strip        | `src/components/FeatureStrip.tsx`     |
| "How it works" steps | `src/components/HowItWorks.tsx`       |
| Colors / Fonts       | `tailwind.config.ts` + `src/config/theme.ts` |
| Footer links         | `src/components/Footer.tsx`           |

## 🔗 Kết nối Backend (thay mock data)

1. **Stories**: Thay `import featuredData from "@/data/mock/featured.json"` trong `HomePage.tsx` bằng `fetch()` hoặc SWR/React Query.
2. **Categories**: Tương tự, thay import JSON bằng API call.
3. **Search**: Component `SearchBar.tsx` nhận `stories` prop — thay bằng API search endpoint.
4. **Auth**: Nút "Đăng nhập (Google)" trong `Header.tsx` — kết nối NextAuth hoặc Firebase Auth.

Đảm bảo API trả về đúng interface `Story` & `Category` trong `src/types/index.ts`.

## 🎨 Design tokens

- **Primary**: `#5B21B6` → `#06B6D4` (purple → cyan gradient)
- **Font**: Plus Jakarta Sans (Google Fonts, loaded via CSS)
- **Dark mode**: Toggle ở header, persisted trong `localStorage`

## 📱 Responsive breakpoints

| Breakpoint | Width     |
| ---------- | --------- |
| Mobile     | < 640px   |
| Tablet     | 640–1024px|
| Desktop    | > 1024px  |

## ♿ Accessibility checklist

- [x] Semantic HTML (`<header>`, `<main>`, `<footer>`, `<nav>`, `<section>`)
- [x] `aria-label` on all sections and interactive elements
- [x] `aria-expanded` on mobile menu toggle
- [x] `role="combobox"` + `role="listbox"` on search autocomplete
- [x] Keyboard navigable (links, buttons)
- [x] Adequate color contrast (WCAG AA)
- [x] `alt` text on all images
- [x] Dark mode respects system preference + manual toggle

## ✅ Acceptance criteria

- [x] `npm run dev` starts Next.js — homepage loads
- [x] Responsive: hero & carousel adapt to mobile/desktop
- [x] Search input shows autocomplete from mock data
- [x] Carousel swipe on mobile; arrows on desktop
- [x] Hover & press states on buttons/cards
- [x] All images use `next/image` with lazy loading
- [x] 3+ Framer Motion animations (hero entrance, card stagger, floating particles)
- [x] TypeScript — no type errors
- [x] Dark mode toggle persisted in localStorage

## 🖼️ Unsplash image queries (for replacing placeholders)

- **Hero illustration**: `"futuristic reading app hero illustration, gradient, minimal"`
- **Story covers**: `"book cover, dramatic portrait, comic cover, flat design"`

---

Built with Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Heroicons.
