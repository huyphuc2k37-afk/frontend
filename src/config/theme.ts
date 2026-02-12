/** Theme configuration — edit colors/fonts here to rebrand */
export const theme = {
  colors: {
    primary: "#7c3aed",
    primaryDark: "#5b21b6",
    accent: "#06b6d4",
    gradientStart: "#5B21B6",
    gradientEnd: "#06B6D4",
  },
  fonts: {
    heading: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
    body: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  },
  /** Unsplash search queries — swap these when you have real assets */
  unsplash: {
    hero: "futuristic reading app hero illustration, gradient, minimal",
    cover: "book cover, dramatic portrait, novel cover, flat design",
  },
} as const;
