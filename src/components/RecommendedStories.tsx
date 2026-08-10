"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { API_BASE_URL, PLACEHOLDER_COVER } from "@/lib/api";
import { useSession } from "next-auth/react";
import { EyeIcon, HeartIcon } from "@heroicons/react/24/outline";

interface RecommendedStory {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  author: { id: string; name: string };
  genre: string;
  views: number;
  likes: number;
  reason: string;
  score: number;
}

interface RecommendedStoriesProps {
  type?: "personalized" | "trending" | "new" | "similar";
  storyId?: string;
  title?: string;
  limit?: number;
  excludeIds?: string[];
  className?: string;
  onStoryClick?: (story: RecommendedStory) => void;
}

export default function RecommendedStories({
  type = "personalized",
  storyId,
  title = "Đề cử cho bạn",
  limit = 10,
  excludeIds = [],
  className = "",
  onStoryClick,
}: RecommendedStoriesProps) {
  const { data: session } = useSession();
  const [stories, setStories] = useState<RecommendedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const params = new URLSearchParams({
        type,
        limit: String(limit),
      });

      if (storyId) params.set("storyId", storyId);
      if (excludeIds.length > 0) params.set("exclude", excludeIds.join(","));

      const response = await fetch(`${API_BASE_URL}/api/recommendations?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();
      setStories(data.recommendations || []);
    } catch (err) {
      console.error("[RecommendedStories] Error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [type, storyId, limit, excludeIds.join(",")]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleClick = async (story: RecommendedStory) => {
    // Log the click
    try {
      const token = (session as { accessToken?: string })?.accessToken;
      if (token) {
        await fetch(`${API_BASE_URL}/api/recommendations/log`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ storyId: story.id, action: "click" }),
        });
      }
    } catch (err) {
      console.error("[RecommendedStories] Log error:", err);
    }

    onStoryClick?.(story);
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case "similar":
        return "Truyện cùng thể loại";
      case "popular":
        return "Hot";
      case "new":
        return "Mới";
      case "genre":
        return "Theo sở thích";
      case "author":
        return "Cùng tác giả";
      case "collaborative":
        return "Độc giả như bạn đọc";
      case "trending":
        return "Xu hướng";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] rounded-lg bg-gray-200" />
              <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
              <div className="mt-1 h-3 w-1/2 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || stories.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {stories.map((story) => (
          <Link
            key={story.id}
            href={`/truyen/${story.slug}`}
            onClick={() => handleClick(story)}
            className="group block"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
              {story.coverImage ? (
                <Image
                  src={story.coverImage}
                  alt={story.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 180px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
                  No Cover
                </div>
              )}
              {story.reason && (
                <span className="absolute left-1 top-1 rounded bg-primary-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {getReasonLabel(story.reason)}
                </span>
              )}
            </div>
            <h4 className="mt-2 line-clamp-1 text-sm font-medium text-gray-900 transition-colors group-hover:text-primary-600">
              {story.title}
            </h4>
            <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
              {story.author.name}
            </p>
            <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
              <span className="inline-flex items-center gap-0.5">
                <EyeIcon className="h-3 w-3" />
                {story.views >= 1000
                  ? `${(story.views / 1000).toFixed(1)}K`
                  : story.views}
              </span>
              <span className="inline-flex items-center gap-0.5">
                <HeartIcon className="h-3 w-3" />
                {story.likes >= 1000
                  ? `${(story.likes / 1000).toFixed(1)}K`
                  : story.likes}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
