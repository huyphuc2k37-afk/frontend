export interface TagInfo {
  id: string;
  name: string;
  slug: string;
  type: string;
}

export interface Story {
  id: string;
  title: string;
  slug: string;
  coverImage?: string | null;
  /** Direct Supabase URL for cloud-stored covers (null if base64 or rejected) */
  coverUrl?: string | null;
  description: string | null;
  genre: string;
  storyOrigin?: string;
  originalTitle?: string | null;
  originalAuthor?: string | null;
  originalLanguage?: string | null;
  translatorName?: string | null;
  translationGroup?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  status: string;
  views: number;
  likes: number;
  updatedAt: string;
  author: { id: string; name: string; image: string | null };
  _count: { chapters: number; bookmarks: number };
  category?: { name: string; slug: string } | null;
  categoryId?: string | null;
  storyTagList?: TagInfo[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  icon: string;
  color: string;
  displayOrder?: number;
  storyCount?: number;
  _count?: { stories: number };
}
