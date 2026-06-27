export const THEMES = [
  {
    name: "Calm nature",
    backgrounds: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501785888047-21806975704e?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80&auto=format&fit=crop",
    ],
  },
  {
    name: "Night sky",
    backgrounds: [
      "https://images.unsplash.com/photo-1419242902214-272adf3c1da4?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532978879514-6cac7b25b6f8?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1488148895776-4f588c219608?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1419242902214-272adf3c1da4?w=800&q=80&auto=format&fit=crop",
    ],
  },
  {
    name: "Cozy",
    backgrounds: [
      "https://images.unsplash.com/photo-1519710164239-12349f8f5b6f?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1449844908741-1bdcdea5e8be?w=800&q=80&auto=format&fit=crop",
    ],
  },
  {
    name: "Minimal",
    backgrounds: [
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80&auto=format&fit=crop",
    ],
  },
];

export const THEME_NAMES = THEMES.map(t => t.name);

export function getThemeBackground(themeName, index) {
  const theme = THEMES.find(t => t.name === themeName) || THEMES[0];
  return theme.backgrounds[index % theme.backgrounds.length];
}

export const MAIN_GOALS = [
  "Reduce stress",
  "Build confidence",
  "Stay motivated",
  "Heal & grow",
  "Improve relationships",
];

export const GENDER_OPTIONS = ["Woman", "Man", "Non-binary", "Prefer not to say"];
export const AGE_RANGES = ["Under 18", "18-24", "25-34", "35-44", "45-54", "55+"];
export const RELATIONSHIP_OPTIONS = ["Single", "In a relationship", "Married", "It's complicated"];
export const BELIEF_OPTIONS = ["Spiritual", "Religious", "Agnostic", "Atheist", "Other"];

export const TOPIC_ICONS = {
  "Positive Thinking": "Sun",
  "Self-Love": "Heart",
  "Hustle": "Rocket",
  "Self-Esteem": "Crown",
  "Social Anxiety": "Shield",
  "Healing": "Leaf",
  "Strength": "Mountain",
  "Short Quotes": "Zap",
};

export const FREE_TOPIC_COUNT = 3;
export const FREE_DAILY_SETS = 5;
export const QUOTES_PER_SET = 5;