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
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  storyCount: number;
}
