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
  description: string | null;
  genre: string;
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
