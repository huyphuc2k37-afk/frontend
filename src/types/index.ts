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
  /** Whether the cover image should be displayed (not rejected/pending) */
  coverVisible?: boolean;
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
  // Optional fields populated by certain endpoints
  isVip?: boolean;
  createdAt?: string;
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

// Fan Club types
export interface FanClub {
  id: string;
  authorId: string;
  name: string;
  description: string | null;
  totalFans: number;
  totalCoins: number;
  bannerImage: string | null;
  createdAt: string;
}

export interface FanClubMember {
  id: string;
  clubId: string;
  userId: string;
  tier: "member" | "vip" | "svip";
  tierCoins: number;
  joinedAt: string;
  user?: {
    id: string;
    name: string;
    image: string | null;
  };
  rank?: number;
}

export interface FanClubActivity {
  id: string;
  clubId: string;
  userId: string;
  action: "joined" | "upgraded" | "donated" | "milestone";
  coins: number;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    image: string | null;
  };
}

// ─── Author Level System ─────────────────────────────────────────────────────────

export interface AuthorLevel {
  id: string;
  level: number;
  name: string;
  minViews: number;
  minStories: number;
  minEarnings: number;
  badgeColor: string;
  avatarFrame?: string | null;
  benefits?: string[];
  createdAt: string;
}

export interface AuthorBadge {
  id: string;
  authorId: string;
  badgeType: string;
  earnedAt: string;
  expiresAt: string | null;
  createdAt: string;
}

export interface AuthorLevelInfo {
  currentLevel: AuthorLevel | null;
  nextLevel: AuthorLevel | null;
  stats: {
    totalViews: number;
    totalStories: number;
    totalEarnings: number;
  };
  progress: {
    percentage: number;
    viewsToNext: number;
    storiesToNext: number;
    earningsToNext: number;
  };
}
