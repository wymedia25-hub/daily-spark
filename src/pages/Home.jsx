import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import QuoteCard from "@/components/QuoteCard";
import ThemeButton from "@/components/ThemeButton";
import { getThemeBackground, FREE_DAILY_SETS, QUOTES_PER_SET } from "@/lib/themes";
import { calculateStreakUpdate } from "@/lib/streakUtils";
import { LogIn, Sparkles } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(null);
  const [activity, setActivity] = useState(null);
  const [feed, setFeed] = useState([]);
  const [allQuotes, setAllQuotes] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("Calm nature");
  const [customBackground, setCustomBackground] = useState(null);
  const containerRef = useRef(null);
  const viewedSet = useRef(new Set());

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) { setLoading(false); return; }
    loadAll();
  }, [isLoadingAuth, isAuthenticated]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) {
      window.history.replaceState({}, "", "/");
      if (prefs) setPrefs({ ...prefs, is_premium: true });
    }
  }, [prefs]);

  const loadAll = async () => {
    try {
      const userPrefs = await base44.entities.UserPreferences.filter({ created_by_id: user.id }, "-created_date", 1);
      if (userPrefs.length === 0 || !userPrefs[0].onboarding_complete) {
        navigate("/onboarding");
        return;
      }
      const p = userPrefs[0];
      setPrefs(p);
      setTheme(p.preferred_theme || "Calm nature");

      const userActivity = await base44.entities.UserActivity.filter({ created_by_id: user.id }, "-created_date", 1);
      let act = userActivity[0];
      if (!act) {
        act = await base44.entities.UserActivity.create({
          liked_quote_ids: [], saved_quote_ids: [], viewed_quote_ids: [],
          current_streak: 0, longest_streak: 0, streak_days: [],
          last_seen_date: "", viewed_today_count: 0, viewed_today_date: "",
        });
      }

      const streakUpdate = calculateStreakUpdate(act.streak_days, act.last_seen_date);
      if (streakUpdate.changed) {
        const longest = Math.max(act.longest_streak || 0, streakUpdate.current_streak);
        const today = new Date().toISOString().split("T")[0];
        act = await base44.entities.UserActivity.update(act.id, {
          streak_days: streakUpdate.streak_days,
          current_streak: streakUpdate.current_streak,
          longest_streak: longest,
          last_seen_date: today,
        });
      }
      setActivity(act);

      const [quotes, topics] = await Promise.all([
        base44.entities.Quote.list(200),
        base44.entities.Topic.list(50),
      ]);
      setAllQuotes(quotes);
      setAllTopics(topics);
      const params = new URLSearchParams(window.location.search);
      const topicParam = params.get("topic");
      buildFeed(quotes, topics, p, topicParam);
      if (topicParam) window.history.replaceState({}, "", "/");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const buildFeed = (quotes, topics, p, topic) => {
    const muted = new Set(p.muted_topics || []);
    let filtered = quotes.filter((q) => !muted.has(q.topic));

    if (topic) {
      // Topic selected: show only quotes from that topic
      const topicObj = topics.find((t) => t.name === topic);
      const isPremiumTopic = topicObj?.is_premium;

      filtered = filtered.filter((q) => q.topic === topic);

      if (isPremiumTopic && !p.is_premium) {
        // Non-premium user selecting a premium topic: show paywall
        filtered = [{
          _locked: true,
          id: "paywall",
          paywallTitle: `Unlock ${topic}, chosen for you`,
          paywallSubtitle: "Upgrade to access all quotes in this topic, plus wallpapers & more.",
        }];
      }
    } else {
      // Default "For You" feed
      const focusSet = new Set(p.focus_areas || p.recommended_topics || []);

      filtered.sort((a, b) => {
        const aFocus = focusSet.has(a.topic) ? 0 : 1;
        const bFocus = focusSet.has(b.topic) ? 0 : 1;
        return aFocus - bFocus;
      });

      if (!p.is_premium) {
        const premiumRecTopics = (p.recommended_topics || []).filter((name) => {
          const t = topics.find((t) => t.name === name);
          return t && t.is_premium;
        });

        const paywallTitle = premiumRecTopics.length > 0
          ? `Unlock ${premiumRecTopics.slice(0, 2).join(" & ")}${premiumRecTopics.length > 2 ? " & more" : ""}, chosen for you`
          : "You've reached your daily limit";

        const paywallCard = {
          _locked: true,
          id: "paywall",
          paywallTitle,
          paywallSubtitle: "Unlock all premium topics, unlimited quotes, wallpapers & more",
        };

        const freeFocus = filtered
          .filter((q) => !q.is_premium && focusSet.has(q.topic))
          .slice(0, FREE_DAILY_SETS * QUOTES_PER_SET);
        const freeFiller = filtered
          .filter((q) => !q.is_premium && !focusSet.has(q.topic))
          .slice(0, 5);

        filtered = [...freeFocus, paywallCard, ...freeFiller];
      }
    }

    setFeed(filtered);
  };

  const markViewed = useCallback(async (quoteId) => {
    if (!quoteId || quoteId === "paywall" || viewedSet.current.has(quoteId)) return;
    viewedSet.current.add(quoteId);

    if (!activity) return;
    const newViewed = [...new Set([...(activity.viewed_quote_ids || []), quoteId])];
    const today = new Date().toISOString().split("T")[0];
    const isNewDay = activity.viewed_today_date !== today;
    const newCount = isNewDay ? 1 : (activity.viewed_today_count || 0) + 1;

    const updated = await base44.entities.UserActivity.update(activity.id, {
      viewed_quote_ids: newViewed,
      viewed_today_count: newCount,
      viewed_today_date: today,
    });
    setActivity(updated);
  }, [activity]);

  const toggleLike = async (quoteId) => {
    if (!activity) return;
    const liked = activity.liked_quote_ids || [];
    const newLiked = liked.includes(quoteId) ? liked.filter((id) => id !== quoteId) : [...liked, quoteId];
    const updated = await base44.entities.UserActivity.update(activity.id, { liked_quote_ids: newLiked });
    setActivity(updated);
  };

  const toggleSave = async (quoteId) => {
    if (!activity) return;
    const saved = activity.saved_quote_ids || [];
    const newSaved = saved.includes(quoteId) ? saved.filter((id) => id !== quoteId) : [...saved, quoteId];
    const updated = await base44.entities.UserActivity.update(activity.id, { saved_quote_ids: newSaved });
    setActivity(updated);
  };

  const handleShare = async (quote) => {
    const text = `"${quote.text}"${quote.author ? ` — ${quote.author}` : ""}`;
    try {
      if (navigator.share) await navigator.share({ text });
      else await navigator.clipboard.writeText(text);
    } catch (e) {}
  };

  const handleBackgroundSelect = (url) => {
    setCustomBackground(url);
  };

  useEffect(() => {
    if (!feed.length || !containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.idx);
            const quote = feed[idx];
            if (quote && !quote._locked) markViewed(quote.id);
          }
        });
      },
      { threshold: 0.6 }
    );
    const cards = containerRef.current.querySelectorAll("[data-idx]");
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, [feed, markViewed]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#FAFAFA]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-purple-500" /></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 px-6 text-center text-white">
        <Sparkles size={48} className="mb-6" />
        <h1 className="text-3xl font-bold">Daily Spark</h1>
        <p className="mt-3 max-w-xs text-white/80">Start your journey to daily motivation and self-growth.</p>
        <button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="mt-8 flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-purple-600">
          <LogIn size={16} /> Get Started
        </button>
      </div>
    );
  }

  const likedSet = new Set(activity?.liked_quote_ids || []);
  const savedSet = new Set(activity?.saved_quote_ids || []);

  return (
    <div className="relative h-screen overflow-hidden">
      <div ref={containerRef} className="h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide">
        {feed.map((quote, i) => (
          <div key={quote.id || i} data-idx={i}>
            <QuoteCard
              quote={quote}
              index={i}
              total={feed.length}
              isLiked={likedSet.has(quote.id)}
              isSaved={savedSet.has(quote.id)}
              onLike={() => toggleLike(quote.id)}
              onSave={() => toggleSave(quote.id)}
              onShare={() => handleShare(quote)}
              backgroundUrl={quote._locked ? null : (customBackground || getThemeBackground(theme, i))}
              isLocked={quote._locked}
              paywallTitle={quote.paywallTitle}
              paywallSubtitle={quote.paywallSubtitle}
            />
          </div>
        ))}
      </div>
      <div className="fixed bottom-28 right-4 z-30">
        <ThemeButton onBackgroundSelect={handleBackgroundSelect} />
      </div>
    </div>
  );
}