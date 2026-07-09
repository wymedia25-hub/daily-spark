import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import QuoteCard from "@/components/QuoteCard";
import PullToRefresh from "@/components/PullToRefresh";
import { getThemeBackground, FREE_DAILY_SETS, QUOTES_PER_SET } from "@/lib/themes";
import { calculateStreakUpdate } from "@/lib/streakUtils";
import { toggleFavoriteQuote } from "@/lib/userPrefs";
import { ChevronLeft, Plus, Check, Paintbrush, Frown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { labelFor } from "@/lib/i18n";
import { calculateRecommendations } from "@/lib/recommendationEngine";
import { getOnboardingData, clearOnboardingData } from "@/lib/onboardingStorage";
import GuestFeed from "@/components/GuestFeed";

export default function Home() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
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
  const poolRef = useRef([]);
  const topicKeyRef = useRef(null);

  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const topicParam = new URLSearchParams(location.search).get("topic");

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) { setLoading(false); return; }
    loadAll();
  }, [isLoadingAuth, isAuthenticated, topicParam]);

  useEffect(() => {
    if (topicParam === null) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) {
      window.history.replaceState({}, "", "/");
      if (prefs) setPrefs({ ...prefs, is_premium: true });
    }
  }, [prefs, topicParam]);

  const syncOnboardingFromStorage = async () => {
    const stored = getOnboardingData();
    if (!stored) return;
    try {
      const topicsList = await base44.entities.Topic.list(100);
      const recommended = calculateRecommendations(
        { main_goal: stored.main_goal, struggles: stored.struggles || [] },
        topicsList
      );
      const prefsData = {
        ...stored,
        recommended_topics: recommended,
        focus_areas: recommended,
        following_topics: recommended,
        onboarding_complete: true,
      };
      const existing = await base44.entities.UserPreferences.filter({ created_by_id: user.id }, "-created_date", 1);
      if (existing.length > 0) {
        await base44.entities.UserPreferences.update(existing[0].id, prefsData);
      } else {
        await base44.entities.UserPreferences.create(prefsData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      clearOnboardingData();
    }
  };

  const loadAll = async () => {
    try {
      if (topicKeyRef.current === topicParam && feed.length > 0) return;
      topicKeyRef.current = topicParam;
      setLoading(true);
      await syncOnboardingFromStorage();
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
          last_seen_date: "",
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

      const userLang = p.language_code || "en";
      const [quotes, topics] = await Promise.all([
        base44.entities.Quote.filter({ language_code: userLang }, "-created_date", 500),
        base44.entities.Topic.list(100),
      ]);
      setAllQuotes(quotes);
      setAllTopics(topics);
      setActiveTopic(topicParam || null);
      buildFeed(quotes, topics, p, topicParam);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const buildFeed = (quotes, topics, p, topic) => {
    const muted = new Set(p.muted_topics || []);
    const userLang = p.language_code || "en";
    let filtered = quotes.filter((q) => !muted.has(q.topic) && (q.language_code || "en") === userLang);

    if (topic) {
      const topicObj = topics.find((t) => t.name === topic);
      const isPremiumTopic = topicObj?.is_premium;

      filtered = filtered.filter((q) => q.topic === topic);

      if (isPremiumTopic && !p.is_premium) {
        filtered = [{
          _locked: true,
          id: "paywall",
          paywallTitle: t("paywall.unlockTopic", { topic: labelFor("topics", topic) }),
          paywallSubtitle: t("paywall.unlockTopicDesc"),
        }];
      }
    } else {
      let topicNames = p.following_topics || [];
      if (topicNames.length === 0) topicNames = p.recommended_topics || [];
      if (topicNames.length === 0) topicNames = topics.filter((t) => !t.is_premium).map((t) => t.name);
      const topicSet = new Set(topicNames);
      const topicFiltered = filtered.filter((q) => topicSet.has(q.topic));
      filtered = topicFiltered.length > 0 ? topicFiltered : filtered;

      if (!p.is_premium) {
        const premiumRecTopics = (p.recommended_topics || []).filter((name) => {
          const topicObj = topics.find((t) => t.name === name);
          return topicObj && topicObj.is_premium;
        });

        const topicNames = premiumRecTopics.slice(0, 2).map((name) => labelFor("topics", name)).join(" & ");
        const paywallTitle = premiumRecTopics.length > 0
          ? t("paywall.unlockTopics", { topics: topicNames })
          : t("paywall.dailyLimit");

        const paywallCard = {
          _locked: true,
          id: "paywall",
          paywallTitle,
          paywallSubtitle: t("paywall.unlockAllDesc"),
        };

        const freeQuotes = shuffleArray(filtered.filter((q) => !q.is_premium))
          .slice(0, FREE_DAILY_SETS * QUOTES_PER_SET);

        filtered = [...freeQuotes, paywallCard];
        poolRef.current = [];
      } else {
        poolRef.current = filtered;
        filtered = shuffleArray(filtered);
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
    // Optimistic UI: update local state immediately
    const currentFavs = prefs?.favorite_quotes || [];
    const isFav = currentFavs.includes(quoteId);
    setPrefs({ ...prefs, favorite_quotes: isFav ? currentFavs.filter((id) => id !== quoteId) : [...currentFavs, quoteId] });
    try {
      const updated = await toggleFavoriteQuote(user.id, quoteId);
      setPrefs(updated);
    } catch (err) {
      // Revert on error
      setPrefs(prefs);
      console.error(err);
    }
  };

  const toggleFollowTopic = async () => {
    if (!activeTopic || !prefs) return;
    const focus = prefs.focus_areas || [];
    const isFollowing = focus.includes(activeTopic);
    // Optimistic UI
    const newFocus = isFollowing ? focus.filter((t) => t !== activeTopic) : [...focus, activeTopic];
    setPrefs({ ...prefs, focus_areas: newFocus });
    try {
      const updated = await base44.entities.UserPreferences.update(prefs.id, { focus_areas: newFocus });
      setPrefs(updated);
    } catch (err) {
      setPrefs(prefs);
      console.error(err);
    }
  };

  const handleRefresh = async () => {
    await loadAll();
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

  useEffect(() => {
    if (!poolRef.current.length || !containerRef.current) return;
    const sentinel = containerRef.current.querySelector("[data-sentinel]");
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && poolRef.current.length) {
          setFeed((prev) => [...prev, ...shuffleArray(poolRef.current)]);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [feed]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#FAFAFA] dark:bg-neutral-950"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-purple-500 dark:border-neutral-700 dark:border-t-purple-400" /></div>;
  }

  if (!isAuthenticated) {
    if (getOnboardingData()) {
      return <GuestFeed />;
    }
    return <Navigate to="/onboarding" replace />;
  }

  if (feed.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#FAFAFA] px-6 text-center dark:bg-neutral-950">
        {activeTopic && (
          <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
            <button
              onClick={() => navigate("/explore")}
              className="flex items-center gap-1 rounded-full bg-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              <ChevronLeft size={16} className="shrink-0" />
              <span className="truncate">{labelFor("topics", activeTopic)}</span>
            </button>
          </div>
        )}
        <Frown size={40} className="mb-4 text-neutral-300 dark:text-neutral-600" />
        <p className="text-base font-semibold text-neutral-700 dark:text-neutral-200">
          {activeTopic ? t("home.noQuotesInTopic") : t("home.noQuotesAvailable")}
        </p>
        <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-500">
          {t("home.tryAnotherTopic")}
        </p>
        <button
          onClick={() => navigate("/explore")}
          className="mt-6 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white"
        >
          {t("common.explore")}
        </button>
      </div>
    );
  }

  const favoriteSet = new Set(prefs?.favorite_quotes || []);
  const isFollowing = activeTopic && (prefs?.focus_areas || []).includes(activeTopic);

  return (
    <div className="relative h-screen overflow-hidden">
      {activeTopic && (
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] bg-gradient-to-b from-black/50 to-transparent">
          <button
            onClick={() => navigate("/explore")}
            className="flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-md px-3 py-2 text-sm font-medium text-white max-w-[60%]"
          >
            <ChevronLeft size={16} className="shrink-0" />
            <span className="truncate">{labelFor("topics", activeTopic)}</span>
          </button>
          <button
            onClick={toggleFollowTopic}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold backdrop-blur-md transition-colors ${
              isFollowing ? "bg-white/20 text-white" : "bg-white text-purple-600"
            }`}
          >
            {isFollowing ? <Check size={15} /> : <Plus size={15} />}
            {isFollowing ? t("common.following") : t("common.follow")}
          </button>
        </div>
      )}
      <PullToRefresh
        onRefresh={handleRefresh}
        className="h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide no-overscroll"
      >
        <div ref={containerRef}>
          {feed.map((quote, i) => (
            <div key={`${quote.id}-${i}`} data-idx={i}>
              <QuoteCard
                quote={quote}
                index={i}
                total={feed.length}
                isFavorited={favoriteSet.has(quote.id)}
                onFavorite={() => toggleFavorite(quote.id)}
                backgroundUrl={quote._locked ? null : (customBackground || getThemeBackground(theme, i))}
                theme={theme}
                isLocked={quote._locked}
                paywallTitle={quote.paywallTitle}
                paywallSubtitle={quote.paywallSubtitle}
              />
            </div>
          ))}
          {poolRef.current.length > 0 && !activeTopic && (
            <div data-sentinel className="h-1" />
          )}
        </div>
      </PullToRefresh>
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