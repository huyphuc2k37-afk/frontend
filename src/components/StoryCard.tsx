"use client";

import { useMemo, memo } from "react";
import Link from "next/link";
import { Eye, BookOpen, Crown, Sparkles, Flame } from "lucide-react";
import type { Story } from "@/types";
import { API_BASE_URL, resolveCoverSrc } from "@/lib/api";
import { isTranslatedStory } from "@/lib/storyOrigin";
import { formatVietnameseNumber, cn } from "@/lib/utils";
import { Badge } from "./ui/Badge";
import CoverImage from "@/lib/CoverImage";

interface StoryCardProps {
  story: Story;
  variant?: "default" | "featured" | "compact";
  rank?: number;
}

function StoryCardInner({ story, variant = "default", rank }: StoryCardProps) {
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";

  const initialCoverSrc = useMemo(() => resolveCoverSrc(story), [story]);
  const translated = useMemo(() => isTranslatedStory(story), [story]);
  const fallbackUrl = useMemo(
    () =>
      `${API_BASE_URL}/api/stories/${story.id}/cover?v=${encodeURIComponent(
        story.updatedAt || "2"
      )}`,
    [story.id, story.updatedAt]
  );

  const tags = useMemo(() => {
    if (story.storyTagList && story.storyTagList.length > 0) {
      return story.storyTagList
        .filter((t) => t.type === "genre")
        .slice(0, 2)
        .map((t) => ({ slug: t.slug, name: t.name }));
    }
    return (story.genre ?? "")
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean)
      .slice(0, 2)
      .map((g, idx) => ({ slug: g.toLowerCase(), name: g }));
  }, [story]);

  const isHot = (story.views ?? 0) > 50000;
  const isVip = story.isVip ?? false;
  const isNew =
    story.createdAt &&
    Date.now() - new Date(story.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;

  if (isCompact) {
    return (
      <Link
        href={`/truyen/${story.slug}`}
        className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
      >
        <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md bg-muted">
          <CoverImage
            src={initialCoverSrc}
            alt={story.title}
            sizes="44px"
            fallbackUrl={fallbackUrl}
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-body-md font-semibold text-foreground group-hover:text-primary">
            {story.title}
          </h3>
          <p className="line-clamp-1 text-caption text-muted-foreground">
            {story.author?.name}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/truyen/${story.slug}`} className="block">
      <article
        className={cn(
          "group overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover hover:border-primary/30",
          isFeatured && "w-[260px] flex-shrink-0 sm:w-[280px]"
        )}
      >
        {/* Cover */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
          {typeof rank === "number" && (
            <div className="absolute left-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-body-md font-bold text-white shadow-lg">
              #{rank}
            </div>
          )}
          <CoverImage
            src={initialCoverSrc}
            alt={`Bìa truyện ${story.title}`}
            sizes={isFeatured ? "280px" : "(max-width: 640px) 50vw, 180px"}
            fallbackUrl={fallbackUrl}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute right-2 top-2 z-10 flex flex-col items-end gap-1">
            {isVip && (
              <Badge variant="vip" className="gap-1">
                <Crown className="h-3 w-3" /> VIP
              </Badge>
            )}
            {isHot && (
              <Badge variant="hot" className="gap-1">
                <Flame className="h-3 w-3" /> Hot
              </Badge>
            )}
            {isNew && (
              <Badge variant="new" className="gap-1">
                <Sparkles className="h-3 w-3" /> Mới
              </Badge>
            )}
            {translated && (
              <Badge variant="info" className="text-[10px]">
                Dịch
              </Badge>
            )}
          </div>

          {/* Bottom gradient */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
        </div>

        {/* Info */}
        <div className="p-3 sm:p-4">
          <h3 className="line-clamp-1 text-heading-md transition-colors group-hover:text-primary">
            {story.title}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-caption text-muted-foreground">
            {story.author?.name}
          </p>
          {story.description && (
            <p className="mt-2 line-clamp-2 text-body-sm text-muted-foreground">
              {story.description}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag.slug} variant="secondary" className="text-[10px]">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="mt-3 flex items-center gap-3 text-caption text-muted-foreground">
            <span className="flex items-center gap-1" title="Lượt xem">
              <Eye className="h-3 w-3" />
              {formatVietnameseNumber(story.views ?? 0)}
            </span>
            {typeof story._count?.chapters === "number" && (
              <span className="flex items-center gap-1" title="Số chương">
                <BookOpen className="h-3 w-3" />
                {formatVietnameseNumber(story._count.chapters)} chương
              </span>
            )}
            {story.status && (
              <span className="flex items-center gap-1" title="Trạng thái">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    story.status === "ongoing" ? "bg-emerald-500" : "bg-gray-400"
                  )}
                  aria-hidden
                />
                {story.status === "ongoing" ? "Đang ra" : "Hoàn thành"}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default memo(StoryCardInner);
