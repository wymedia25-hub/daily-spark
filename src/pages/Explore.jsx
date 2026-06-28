import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Sun, Heart, Rocket, Crown, Shield, Leaf, Mountain, Zap, Search, Bookmark, Clock, Plus, Sparkles, Lock } from "lucide-react";

const TOPIC_ICON_MAP = { Sun, Heart, Rocket, Crown, Shield, Leaf, Mountain, Zap };

const STATIC_SECTIONS = ["Daily Mindset", "Inner Work", "Hustle & Wins", "Founders & Business", "Heart & Relationships"];

export default function Explore() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [quotes, setQuotes] = useState([]);
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

  const loadData = async () => {
    try {
      const [t, q, a, p] = await Promise.all([
        base44.entities.Topic.list(50),
        base44.entities.Quote.list(200),
        base44.entities.UserActivity.filter({ created_by_id: user.id }, "-created_date", 1),
        base44.entities.UserPreferences.filter({ created_by_id: user.id }, "-created_date", 1),
      ]);
      setTopics(t.sort((a, b) => (a.order || 0) - (b.order || 0)));
      setQuotes(q);
      if (a[0]) setActivity(a[0]);
      if (p[0]) setPrefs(p[0]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-purple-500" /></div>;
  }

  if (!isAuthenticated) {
    return <div className="px-5 py-20 text-center"><p className="text-neutral-500">Please sign in to explore.</p></div>;
  }

  const likedIds = new Set(activity?.liked_quote_ids || []);
  const savedIds = new Set(activity?.saved_quote_ids || []);
  const viewedIds = new Set(activity?.viewed_quote_ids || []);
  const isPremiumUser = prefs?.is_premium;

  const getQuotesByIds = (ids) => quotes.filter((q) => ids.has(q.id));

  const shortcuts = [
    { label: "Liked", icon: Heart, count: likedIds.size, action: () => setView("liked") },
    { label: "Saved", icon: Bookmark, count: savedIds.size, action: () => setView("saved") },
    { label: "Your Quotes", icon: Plus, count: null, action: () => navigate("/my-quotes") },
    { label: "History", icon: Clock, count: viewedIds.size, action: () => setView("history") },
  ];

  const openTopic = (topicName) => navigate(`/?topic=${encodeURIComponent(topicName)}`);

  const renderTopicChip = (topic) => {
    const Icon = TOPIC_ICON_MAP[topic.icon] || Sparkles;
    const locked = topic.is_premium && !isPremiumUser;
    return (
      <button
        key={topic.name}
        onClick={() => openTopic(topic.name)}
        className="flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-left transition-colors hover:bg-neutral-50"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">{topic.name}</span>
            {topic.is_premium && (
              <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                {locked ? <><Lock size={9} /> Premium</> : <Crown size={10} />}
              </span>
            )}
          </div>
          {topic.description && <p className="text-xs text-neutral-400">{topic.description}</p>}
        </div>
      </button>
    );
  };

  // Build section groups
  const recommendedTopics = (prefs?.recommended_topics || [])
    .map((name) => topics.find((t) => t.name === name))
    .filter(Boolean);

  const sectionsList = [];
  if (recommendedTopics.length > 0) {
    sectionsList.push({ name: "For you", topics: recommendedTopics });
  }
  for (const sectionName of STATIC_SECTIONS) {
    const sectionTopics = topics
      .filter((t) => (t.sections || []).includes(sectionName))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    sectionsList.push({ name: sectionName, topics: sectionTopics });
  }

  const filteredSections = sectionsList.map((section) => ({
    ...section,
    topics: section.topics.filter((t) => t.name.toLowerCase().includes(search.toLowerCase())),
  }));

  const displayQuotes = view === "liked" ? getQuotesByIds(likedIds) : view === "saved" ? getQuotesByIds(savedIds) : view === "history" ? getQuotesByIds(viewedIds) : [];

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-neutral-900">Explore</h1>

      <div className="mb-6 grid grid-cols-4 gap-3">
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
          <button onClick={() => setView("topics")} className="mb-3 text-sm text-purple-600">← Back to topics</button>
          <h2 className="mb-3 text-lg font-bold text-neutral-900">{view === "liked" ? "Liked Quotes" : view === "saved" ? "Saved Quotes" : "History"}</h2>
          {displayQuotes.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400">No quotes here yet</p>
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
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search topics" className="w-full rounded-2xl border border-neutral-200 bg-white py-3 pl-12 pr-4 text-sm outline-none focus:border-purple-400" />
          </div>

          <div className="space-y-8">
            {filteredSections.map((section) => (
              <div key={section.name}>
                <h2 className="mb-3 text-lg font-bold tracking-tight text-neutral-900">{section.name}</h2>
                {section.topics.length === 0 ? (
                  <p className="py-4 text-center text-sm text-neutral-400">No topics here yet</p>
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