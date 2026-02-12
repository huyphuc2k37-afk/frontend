export interface Story {
  id: string;
  slug: string;
  title: string;
  author: string;
  coverUrl: string;
  coverQuery?: string;
  excerpt: string;
  isPaid: boolean;
  priceCoins: number;
  type: "novel";
  genre: string;
  updatedAt: string;
  readersCount: number;
  chaptersCount?: number;
  status?: "ongoing" | "completed";
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  storyCount: number;
}
