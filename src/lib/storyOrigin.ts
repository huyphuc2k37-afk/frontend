export type StoryOrigin = "original" | "translated";

export const STORY_ORIGIN_LABELS: Record<StoryOrigin, string> = {
  original: "Sáng tác",
  translated: "Truyện dịch",
};

export const STORY_ORIGIN_OPTIONS: { value: StoryOrigin; label: string; description: string }[] = [
  {
    value: "original",
    label: "Truyện sáng tác",
    description: "Tác phẩm gốc do tác giả trên VStory sáng tác.",
  },
  {
    value: "translated",
    label: "Truyện dịch",
    description: "Bản dịch/chuyển ngữ từ tác phẩm gốc ở ngôn ngữ khác.",
  },
];

export function isTranslatedStory(story: { storyOrigin?: string | null }) {
  return story.storyOrigin === "translated";
}

export function getStoryOriginLabel(origin?: string | null) {
  return origin === "translated" ? STORY_ORIGIN_LABELS.translated : STORY_ORIGIN_LABELS.original;
}