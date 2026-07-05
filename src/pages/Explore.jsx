import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Sun, Heart, Rocket, Crown, Shield, Leaf, Mountain, Zap, Search, Bookmark, Clock, Plus, Sparkles, Lock, Check, CheckCircle2, Circle } from "lucide-react";
import { toggleFollowingTopic } from "@/lib/userPrefs";

const TOPIC_ICON_MAP = { Sun, Heart, Rocket, Crown, Shield, Leaf, Mountain, Zap };

const STATIC_SECTIONS = ["Daily Mindset", "Inner Work", "Hustle & Wins", "Founders & Business", "Heart & Relationships"];

export default function Explore() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [userQuotes, setUserQuotes] = useState([]);
  const [activity, setActivity] = useState(null);
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("topics");

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) { setLoading(false); return; }
    loadData();
  }, [isLoadingAuth, isAuthenticated]);

  const reloadPrefs = async () => {
    if (!user) return;
    const p = await base44.entities.UserPreferences.filter({ created_by_id: user.id }, "-created_date", 1);
    if (p[0]) setPrefs(p[0]);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const onFocus = () => reloadPrefs();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      const [topicsData, uq, a, p] = await Promise.all([
        base44.entities.Topic.list(50),
        base44.entities.UserQuote.filter({ created_by_id: user.id }, "-created_date", 200),
        base44.entities.UserActivity.filter({ created_by_id: user.id }, "-created_date", 1),
        base44.entities.UserPreferences.filter({ created_by_id: user.id }, "-created_date", 1),
      ]);
      const userLang = p[0]?.language_code || "en";
      const q = await base44.entities.Quote.filter({ language_code: userLang }, "-created_date", 500);
      setTopics(topicsData.sort((a, b) => (a.order || 0) - (b.order || 0)));
      setQuotes(q);
      setUserQuotes(uq);
      if (a[0]) setActivity(a[0]);
      if (p[0]) setPrefs(p[0]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-purple-500" /></div>;
  }

  if (!isAuthenticated) {
    return <div className="px-5 py-20 text-center"><p className="text-neutral-500">{t("explore.pleaseSignIn")}</p></div>;
  }

  const likedIds = new Set(activity?.liked_quote_ids || []);
  const savedIds = new Set(activity?.saved_quote_ids || []);
  const viewedIds = new Set(activity?.viewed_quote_ids || []);
  const isPremiumUser = prefs?.is_premium;
  const focusSet = new Set(prefs?.focus_areas || []);
  const followingSet = new Set(prefs?.following_topics || []);
  const favQuoteIds = new Set(prefs?.favorite_quotes || []);

  const getQuotesByIds = (ids) => quotes.filter((q) => ids.has(q.id));

  const shortcuts = [
    { label: t("explore.savedQuotes"), icon: Heart, count: favQuoteIds.size, action: () => navigate("/saved-quotes") },
    { label: t("explore.yourQuotes"), icon: Plus, count: userQuotes.length, action: () => navigate("/my-quotes") },
    { label: t("explore.history"), icon: Clock, count: viewedIds.size, action: () => setView("history") },
  ];

  const openTopic = (topicName) => navigate(`/?topic=${encodeURIComponent(topicName)}`);

  const handleToggleFollow = async (topicName, e) => {
    e.stopPropagation();
    const updated = await toggleFollowingTopic(user.id, topicName);
    setPrefs(updated);
  };

  const renderTopicChip = (topic) => {
    const Icon = TOPIC_ICON_MAP[topic.icon] || Sparkles;
    const locked = topic.is_premium && !isPremiumUser;
    const following = focusSet.has(topic.name);
    const isFollowed = followingSet.has(topic.name);
    return (
      <div
        key={topic.name}
        onClick={() => openTopic(topic.name)}
        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-left transition-colors hover:bg-neutral-50"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">{topic.name}</span>
            {topic.is_premium && (
              <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                {locked ? <><Lock size={9} /> {t("common.premium")}</> : <Crown size={10} />}
              </span>
            )}
          </div>
          {topic.description && <p className="text-xs text-neutral-400">{topic.description}</p>}
        </div>
        <button
          onClick={(e) => handleToggleFollow(topic.name, e)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-neutral-100"
        >
          {isFollowed
            ? <CheckCircle2 size={20} className="text-purple-500" />
            : <Circle size={20} className="text-neutral-300" />}
        </button>
      </div>
    );
  };

  // Build section groups
  const SECTION_LABEL_KEYS = {
    "Daily Mindset": "explore.sections.dailyMindset",
    "Inner Work": "explore.sections.innerWork",
    "Hustle & Wins": "explore.sections.hustleWins",
    "Founders & Business": "explore.sections.foundersBusiness",
    "Heart & Relationships": "explore.sections.heartRelationships",
  };

  const followingTopicObjects = (prefs?.following_topics || [])
    .map((name) => topics.find((tp) => tp.name === name))
    .filter(Boolean);

  const sectionsList = [];
  if (followingTopicObjects.length > 0) {
    sectionsList.push({ name: t("explore.following"), topics: followingTopicObjects });
  }
  for (const sectionName of STATIC_SECTIONS) {
    const sectionTopics = topics
      .filter((tp) => (tp.sections || []).includes(sectionName))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    sectionsList.push({ name: SECTION_LABEL_KEYS[sectionName] ? t(SECTION_LABEL_KEYS[sectionName]) : sectionName, topics: sectionTopics });
  }

  const filteredSections = sectionsList.map((section) => ({
    ...section,
    topics: section.topics.filter((t) => t.name.toLowerCase().includes(search.toLowerCase())),
  }));

  const displayQuotes = view === "liked" ? getQuotesByIds(likedIds) : view === "saved" ? getQuotesByIds(savedIds) : view === "history" ? getQuotesByIds(viewedIds) : [];

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-neutral-900">{t("explore.title")}</h1>

      <div className="mb-6 grid grid-cols-3 gap-3">
        {shortcuts.map((s) => (
          <button key={s.label} onClick={s.action} className="flex flex-col items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-3 transition-colors hover:bg-neutral-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <s.icon size={18} className="text-purple-600" />
            </div>
            <span className="text-[10px] font-medium text-neutral-700 text-center leading-tight">{s.label}</span>
            {s.count !== null && <span className="text-[10px] text-neutral-400">{s.count}</span>}
          </button>
        ))}
      </div>

      {view !== "topics" && (
        <div className="mb-6">
          <button onClick={() => setView("topics")} className="mb-3 text-sm text-purple-600">{t("explore.backToTopics")}</button>
          <h2 className="mb-3 text-lg font-bold text-neutral-900">{view === "liked" ? t("explore.likedQuotes") : view === "saved" ? t("explore.savedQuotes") : t("explore.history")}</h2>
          {displayQuotes.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400">{t("explore.noQuotesYet")}</p>
          ) : (
            <div className="space-y-3">
              {displayQuotes.map((q) => (
                <div key={q.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <p className="text-sm text-neutral-800">{q.text}</p>
                  {q.author && <p className="mt-2 text-xs text-neutral-400">— {q.author}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "topics" && (
        <>
          <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("explore.searchTopics")} className="w-full rounded-2xl border border-neutral-200 bg-white py-3 pl-12 pr-4 text-sm outline-none focus:border-purple-400" />
          </div>

          {followingSet.size === 0 && !search && (
            <div className="mb-6 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center">
              <Circle size={24} className="mx-auto mb-2 text-neutral-300" />
              <p className="text-sm text-neutral-400">{t("explore.followHint")}</p>
            </div>
          )}

          <div className="space-y-8">
            {filteredSections.map((section) => (
              <div key={section.name}>
                <h2 className="mb-3 text-lg font-bold tracking-tight text-neutral-900">{section.name}</h2>
                {section.topics.length === 0 ? (
                  <p className="py-4 text-center text-sm text-neutral-400">{t("explore.noTopicsYet")}</p>
                ) : (
                  <div className="space-y-2.5">
                    {section.topics.map(renderTopicChip)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}