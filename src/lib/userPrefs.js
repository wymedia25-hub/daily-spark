import { base44 } from "@/api/base44Client";

export async function getOrCreatePrefs(userId) {
  const existing = await base44.entities.UserPreferences.filter({ created_by_id: userId }, "-created_date", 1);
  if (existing.length > 0) return existing[0];
  return await base44.entities.UserPreferences.create({ following_topics: [], favorite_quotes: [] });
}

export async function toggleFollowingTopic(userId, topicName) {
  const prefs = await getOrCreatePrefs(userId);
  const current = prefs.following_topics || [];
  const updated = current.includes(topicName)
    ? current.filter((t) => t !== topicName)
    : [...current, topicName];
  return await base44.entities.UserPreferences.update(prefs.id, { following_topics: updated });
}

export async function toggleFavoriteQuote(userId, quoteId) {
  const prefs = await getOrCreatePrefs(userId);
  const current = prefs.favorite_quotes || [];
  const updated = current.includes(quoteId)
    ? current.filter((q) => q !== quoteId)
    : [...current, quoteId];
  return await base44.entities.UserPreferences.update(prefs.id, { favorite_quotes: updated });
}