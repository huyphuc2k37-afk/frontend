"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface UseChapterKeyboardProps {
  enabled: boolean;
  prevChapterId?: string;
  nextChapterId?: string;
  storySlug: string;
  toggleSettings?: () => void;
}

export function useChapterKeyboard({
  enabled,
  prevChapterId,
  nextChapterId,
  storySlug,
  toggleSettings,
}: UseChapterKeyboardProps) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (e.key === "ArrowLeft" && prevChapterId) {
        e.preventDefault();
        router.push(`/truyen/${storySlug}/chapter/${prevChapterId}`);
      } else if (e.key === "ArrowRight" && nextChapterId) {
        e.preventDefault();
        router.push(`/truyen/${storySlug}/chapter/${nextChapterId}`);
      } else if (e.key === "Escape") {
        router.push(`/truyen/${storySlug}`);
      } else if (e.key.toLowerCase() === "s" && toggleSettings) {
        e.preventDefault();
        toggleSettings();
      } else if (e.key === " ") {
        // Space scrolls
        e.preventDefault();
        window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, prevChapterId, nextChapterId, storySlug, router, toggleSettings]);
}
