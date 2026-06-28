import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import QuoteCard from "@/components/QuoteCard";
import { getThemeBackground, FREE_DAILY_SETS, QUOTES_PER_SET } from "@/lib/themes";
import { calculateStreakUpdate } from "@/lib/streakUtils";
import { toggleFavoriteQuote } from "@/lib/userPrefs";
import { LogIn, Sparkles, ChevronLeft, Plus, Check, Paintbrush } from "lucide-react";

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
  const [activeTopic, setActiveTopic] = useState(null);
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
      setActiveTopic(topicParam || null);
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
      // Show quotes from followed topics; fallback to recommended, then all free
      let topicNames = p.following_topics || [];
      if (topicNames.length === 0) topicNames = p.recommended_topics || [];
      if (topicNames.length === 0) topicNames = topics.filter((t) => !t.is_premium).map((t) => t.name);
      const topicSet = new Set(topicNames);
      filtered = filtered.filter((q) => topicSet.has(q.topic));

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

        const freeQuotes = filtered
          .filter((q) => !q.is_premium)
          .slice(0, FREE_DAILY_SETS * QUOTES_PER_SET);

        filtered = [...freeQuotes, paywallCard];
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

  const toggleFavorite = async (quoteId) => {
    const updated = await toggleFavoriteQuote(user.id, quoteId);
    setPrefs(updated);
  };

  const toggleFollowTopic = async () => {
    if (!activeTopic || !prefs) return;
    const focus = prefs.focus_areas || [];
    const newFocus = focus.includes(activeTopic)
      ? focus.filter((t) => t !== activeTopic)
      : [...focus, activeTopic];
    const updated = await base44.entities.UserPreferences.update(prefs.id, { focus_areas: newFocus });
    setPrefs(updated);
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

  const favoriteSet = new Set(prefs?.favorite_quotes || []);
  const isFollowing = activeTopic && (prefs?.focus_areas || []).includes(activeTopic);

  return (
    <div className="relative h-screen overflow-hidden">
      {activeTopic && (
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/50 to-transparent">
          <button
            onClick={() => navigate("/explore")}
            className="flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-md px-3 py-2 text-sm font-medium text-white max-w-[60%]"
          >
            <ChevronLeft size={16} className="shrink-0" />
            <span className="truncate">{activeTopic}</span>
          </button>
          <button
            onClick={toggleFollowTopic}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold backdrop-blur-md transition-colors ${
              isFollowing ? "bg-white/20 text-white" : "bg-white text-purple-600"
            }`}
          >
            {isFollowing ? <Check size={15} /> : <Plus size={15} />}
            {isFollowing ? "Following" : "Follow"}
          </button>
        </div>
      )}
      <div ref={containerRef} className="h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide">
        {feed.map((quote, i) => (
          <div key={quote.id || i} data-idx={i}>
            <QuoteCard
              quote={quote}
              index={i}
              total={feed.length}
              isFavorited={favoriteSet.has(quote.id)}
              onFavorite={() => toggleFavorite(quote.id)}
              backgroundUrl={quote._locked ? null : (customBackground || getThemeBackground(theme, i))}
              isLocked={quote._locked}
              paywallTitle={quote.paywallTitle}
              paywallSubtitle={quote.paywallSubtitle}
            />
          </div>
        ))}
      </div>
      <div className="fixed bottom-28 right-4 z-30">
        <button
          onClick={() => navigate("/theme")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-transform active:scale-90"
          title="Wallpapers"
        >
          <Paintbrush size={18} />
        </button>
      </div>
    </div>
  );
}