export const STRUGGLES = [
  "Heartbreak",
  "Anxiety & overthinking",
  "Depression & sadness",
  "Low confidence",
  "Lack of motivation",
  "Toxic relationship",
  "Loneliness",
  "Work & business stress",
];

export const MOODS = ["Sad", "Anxious", "Unmotivated", "Okay", "Hopeful"];

export const QUOTE_STYLES = [
  "Short & punchy",
  "Deep & reflective",
  "Tough love",
  "Gentle & soft",
];

const SCORE_MAP = {
  main_goal: {
    "Reduce stress": { "Positive Thinking": 3, Healing: 2, "Social Anxiety": 2 },
    "Build confidence": { "Self-Esteem": 3, "Self-Love": 2, Strength: 2 },
    "Stay motivated": { Hustle: 3, Strength: 2, "Positive Thinking": 2 },
    "Heal & grow": { Healing: 3, "Self-Love": 2, Strength: 1 },
    "Improve relationships": { "Self-Love": 3, Healing: 2, "Positive Thinking": 1 },
  },
  struggles: {
    Heartbreak: { Healing: 3, "Self-Love": 2, Strength: 1 },
    "Anxiety & overthinking": { "Social Anxiety": 3, "Positive Thinking": 2, Healing: 1 },
    "Depression & sadness": { Healing: 3, "Positive Thinking": 2, "Self-Love": 1 },
    "Low confidence": { "Self-Esteem": 3, "Self-Love": 2, Strength: 1 },
    "Lack of motivation": { Hustle: 3, Strength: 2, "Positive Thinking": 1 },
    "Toxic relationship": { "Self-Love": 3, Strength: 2, Healing: 1 },
    Loneliness: { "Self-Love": 2, "Social Anxiety": 2, Healing: 1 },
    "Work & business stress": { Hustle: 3, Strength: 2, "Positive Thinking": 1 },
  },
  mood: {
    Sad: { Healing: 2, "Positive Thinking": 1 },
    Anxious: { "Social Anxiety": 2, Healing: 1 },
    Unmotivated: { Hustle: 2, Strength: 1 },
    Okay: { "Positive Thinking": 1, "Self-Love": 1 },
    Hopeful: { "Positive Thinking": 1, Hustle: 1 },
  },
  quote_style: {
    "Short & punchy": { "Short Quotes": 3 },
    "Deep & reflective": { Healing: 2, "Self-Love": 1 },
    "Tough love": { Strength: 2, Hustle: 1 },
    "Gentle & soft": { "Self-Love": 2, Healing: 1 },
  },
};

const FREE_TOPICS = new Set([
  "Positive Thinking",
  "Self-Love",
  "Strength",
  "Industry Titans",
  "Being Single",
  "Gratitude",
]);

const FOCUS_AREA_RULES = [
  { keywords: ["strength"], scores: { Strength: 3 } },
  { keywords: ["confidence", "self-esteem", "self esteem"], scores: { "Self-Esteem": 3, "Positive Thinking": 1 } },
  { keywords: ["healing"], scores: { Healing: 3 } },
  { keywords: ["money", "wealth", "finance"], scores: { "Money & Wealth": 3, Hustle: 1 } },
  { keywords: ["discipline", "focus", "productivity"], scores: { "Discipline & Focus": 3, Hustle: 1 } },
  { keywords: ["love", "relationship"], scores: { "Love & Relationships": 3 } },
  { keywords: ["gratitude"], scores: { Gratitude: 3 } },
  { keywords: ["career", "business", "success"], scores: { Hustle: 2, "Industry Titans": 1 } },
];

const MAIN_GOAL_RULES = [
  { keywords: ["motivated", "motivation"], scores: { Strength: 2, "Positive Thinking": 1 } },
  { keywords: ["money", "rich", "wealth", "financial"], scores: { "Money & Wealth": 3 } },
  { keywords: ["discipline", "focus", "habit", "productive"], scores: { "Discipline & Focus": 3 } },
  { keywords: ["confidence", "self-esteem", "self esteem"], scores: { "Self-Esteem": 3 } },
  { keywords: ["heal", "anxiety", "calm"], scores: { Healing: 2, "Social Anxiety": 1 } },
  { keywords: ["love", "relationship", "partner"], scores: { "Love & Relationships": 3 } },
  { keywords: ["grateful", "gratitude", "happy", "positive"], scores: { Gratitude: 2, "Positive Thinking": 1 } },
  { keywords: ["business", "founder", "entrepreneur", "startup"], scores: { Hustle: 2, "Industry Titans": 1 } },
];

const INTEREST_RULES = [
  { keywords: ["business", "entrepreneurship"], scores: { Hustle: 2, "Industry Titans": 2 } },
  { keywords: ["investing", "finance", "money"], scores: { "Money & Wealth": 3, "Finance & Investing": 2 } },
  { keywords: ["technology", "tech"], scores: { "Tech & Hardware": 2, "Software Pioneers": 1 } },
  { keywords: ["self-improvement", "personal growth"], scores: { "Discipline & Focus": 2, "Positive Thinking": 1 } },
  { keywords: ["mindfulness", "spirituality"], scores: { Gratitude: 2, Healing: 1 } },
  { keywords: ["relationships", "dating"], scores: { "Love & Relationships": 2 } },
];

const RELATIONSHIP_STATUS_RULES = [
  { keywords: ["single"], scores: { "Being Single": 4, "Self-Love": 1 } },
  { keywords: ["in a relationship", "dating"], scores: { "Love & Relationships": 3 } },
  { keywords: ["married", "engaged"], scores: { "Love & Relationships": 4 } },
  { keywords: ["divorced", "separated", "widowed"], scores: { Healing: 2, "Being Single": 2, "Self-Love": 1 } },
];

/**
 * Calculates recommended topics based on onboarding answers.
 *
 * @param {Object} answers - { main_goal, struggles[], mood, quote_style, interests[], focus_areas[], relationship_status }
 * @param {Array} topics - Topic entities with `name`
 * @returns {string[]} - Top 4 recommended topic names, with at least 1 free and 1 premium
 */
export function calculateRecommendations(answers, topics) {
  const scores = {};
  topics.forEach((t) => { scores[t.name] = 0; });

  const addScores = (map) => {
    if (!map) return;
    Object.entries(map).forEach(([topic, pts]) => {
      if (scores[topic] !== undefined) scores[topic] += pts;
    });
  };

  const scoreByText = (text, rules) => {
    if (!text) return;
    const lower = text.toLowerCase();
    rules.forEach((rule) => {
      if (rule.keywords.some((kw) => lower.includes(kw))) {
        addScores(rule.scores);
      }
    });
  };

  // Existing SCORE_MAP scoring (mood, struggles, quote_style, main_goal)
  addScores(SCORE_MAP.main_goal[answers.main_goal]);
  (answers.struggles || []).forEach((s) => addScores(SCORE_MAP.struggles[s]));
  addScores(SCORE_MAP.mood[answers.mood]);
  addScores(SCORE_MAP.quote_style[answers.quote_style]);
  (answers.interests || []).forEach((i) => {
    if (scores[i] !== undefined) scores[i] += 2;
  });

  // New keyword-based scoring (additive on top)
  (answers.focus_areas || []).forEach((fa) => scoreByText(fa, FOCUS_AREA_RULES));
  scoreByText(answers.main_goal, MAIN_GOAL_RULES);
  (answers.interests || []).forEach((i) => scoreByText(i, INTEREST_RULES));
  scoreByText(answers.relationship_status, RELATIONSHIP_STATUS_RULES);

  const ranked = topics
    .map((t) => ({ name: t.name, is_premium: !FREE_TOPICS.has(t.name), score: scores[t.name] || 0 }))
    .sort((a, b) => b.score - a.score);

  let top4 = ranked.slice(0, 4);

  // Rule 1: must contain at least 1 FREE topic
  if (!top4.some((t) => !t.is_premium)) {
    const lowestPremium = top4.filter((t) => t.is_premium).sort((a, b) => a.score - b.score)[0];
    const highestFree = ranked.filter((t) => !t.is_premium && !top4.includes(t)).sort((a, b) => b.score - a.score)[0];
    if (lowestPremium && highestFree) {
      top4 = top4.map((t) => (t === lowestPremium ? highestFree : t));
    }
  }

  // Rule 2: must contain at least 1 PREMIUM topic
  if (!top4.some((t) => t.is_premium)) {
    const lowestFree = top4.filter((t) => !t.is_premium).sort((a, b) => a.score - b.score)[0];
    const highestPremium = ranked.filter((t) => t.is_premium && !top4.includes(t)).sort((a, b) => b.score - a.score)[0];
    if (lowestFree && highestPremium) {
      top4 = top4.map((t) => (t === lowestFree ? highestPremium : t));
    }
  }

  return top4.map((t) => t.name);
}