import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import FeaturedSource from "@/components/FeaturedSource";
import SourceCarousel from "@/components/SourceCarousel";
import StreakBadge from "@/components/StreakBadge";
import WeeklyGrowthStats from "@/components/WeeklyGrowthStats";
import TopicSelector from "@/components/TopicSelector";
import { User, Sparkles, LogIn, X } from "lucide-react";
import DailyMissions from "@/components/DailyMissions";
import CollectionCard from "@/components/CollectionCard";
import InviteFriends from "@/components/InviteFriends";
import { TOPIC_COLORS } from "@/lib/topics";

const COLLECTION_THEMES = {
  "Psychology": { title: "Master Your Mind", subtitle: "Understand human behavior" },
  "Business": { title: "Think Like a CEO", subtitle: "Plan, Achieve, Succeed" },
  "Self-Help": { title: "Unlock Your Potential", subtitle: "Transform your daily habits" },
  "Science": { title: "How The World Works", subtitle: "Science-backed insights" },
  "History": { title: "Lessons From The Past", subtitle: "Timeless wisdom & stories" },
  "Philosophy": { title: "Deep Thinking", subtitle: "Big questions, clear answers" },
  "Finance": { title: "Build Your Wealth", subtitle: "Smart money strategies" },
  "Productivity": { title: "Get More Done", subtitle: "Work smarter, not harder" },
  "Health": { title: "Live Better", subtitle: "Mind, body & wellness" },
  "Technology": { title: "The Future Is Now", subtitle: "Innovation & the digital age" },
};

export default function Home() {
  const { user, isAuthenticated, isLoadingAuth, checkUserAuth } = useAuth();
  const navigate = useNavigate();
  const [sources, setSources] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoals, setShowGoals] = useState(false);
  const [editTopics, setEditTopics] = useState([]);
  const [savingTopics, setSavingTopics] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated && user && (!user.topics || user.topics.length === 0)) {
      navigate("/onboarding");
    }
  }, [isLoadingAuth, isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isLoadingAuth) return;
    loadData();
  }, [isLoadingAuth, isAuthenticated, user]);

  const loadData = async () => {
    try {
      const src = await base44.entities.ContentSource.filter({ status: "published" }, "-created_date", 200);
      setSources(src);
      if (isAuthenticated && user) {
        const prog = await base44.entities.UserProgress.filter({ created_by_id: user.id }, "-updated_date", 300);
        setProgress(prog);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const userTopics = user?.topics || [];
  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.source_id));
  const totalRead = progress.reduce((sum, p) => sum + (p.read_card_ids?.length || 0), 0);
  const totalInsights = progress.filter(p => (p.read_card_ids?.length || 0) > 0).length;

  const topicSources = useMemo(() => {
    const map = {};
    userTopics.forEach((topic) => {
      map[topic] = sources.filter((s) => s.topic === topic);
    });
    return map;
  }, [sources, userTopics]);

  const featured = useMemo(() => {
    return sources.find((s) => userTopics.includes(s.topic) && !completedIds.has(s.id)) || sources[0];
  }, [sources, userTopics, completedIds]);

  const otherSources = useMemo(() => {
    return sources.filter((s) => !userTopics.includes(s.topic));
  }, [sources, userTopics]);

  const saveGoals = async () => {
    if (editTopics.length < 3) return;
    setSavingTopics(true);
    await base44.auth.updateMe({ topics: editTopics });
    await checkUserAuth();
    setShowGoals(false);
    setSavingTopics(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#FF6B35]" /></div>;
  }

  return (
    <div>
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">Knowi</h1>
        <div className="flex items-center gap-3">
          {isAuthenticated && <StreakBadge count={user?.streak_count || 0} />}
          {isAuthenticated ? (
            <Link to="/profile" className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
              <User size={16} className="text-neutral-500" />
            </Link>
          ) : (
            <button onClick={() => base44.auth.redirectToLogin(window.location.href)}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white">
              <LogIn size={14} /> Sign in
            </button>
          )}
        </div>
      </header>

      {/* Not signed in banner */}
      {!isAuthenticated && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#FF6B35]/20 bg-[#FF6B35]/5 px-4 py-3">
          <Sparkles size={18} className="shrink-0 text-[#FF6B35]" />
          <p className="text-sm text-neutral-600">Sign in to personalize your feed and track progress</p>
        </div>
      )}

      {/* Featured source */}
      {featured && <FeaturedSource source={featured} />}

      {/* Weekly growth */}
      {isAuthenticated && totalRead > 0 && (
        <div className="mb-6">
          <WeeklyGrowthStats keyPoints={totalRead} minutes={Math.round(totalRead * 1.5)} insights={totalInsights} />
        </div>
      )}

      {/* Daily missions */}
      {isAuthenticated && (
        <div className="mb-6">
          <DailyMissions todayCardsRead={user?.today_date === new Date().toISOString().split("T")[0] ? (user?.today_cards_read || 0) : 0} />
        </div>
      )}

      {/* Collections made for you */}
      {isAuthenticated && userTopics.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 mb-3">Collections made for you</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {userTopics.slice(0, 4).map((topic) => {
              const theme = COLLECTION_THEMES[topic];
              if (!theme) return null;
              const color = TOPIC_COLORS[topic] || "#6B7280";
              return (
                <CollectionCard
                  key={topic}
                  title={theme.title}
                  subtitle={theme.subtitle}
                  color={color}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(topic)}`)}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Topic carousels */}
      {userTopics.map((topic) => (
        topicSources[topic]?.length > 0 && (
          <SourceCarousel
            key={topic}
            title={`More to ${topic.toLowerCase()}`}
            subtitle="You might like these summaries for this goal"
            sources={topicSources[topic]}
          />
        )
      ))}

      {/* Other sources */}
      {otherSources.length > 0 && (
        <SourceCarousel title="Discover more" subtitle="Explore other topics" sources={otherSources} />
      )}

      {/* Invite friends */}
      {isAuthenticated && <InviteFriends />}

      {/* Manage recommendations */}
      {isAuthenticated && (
        <div className="mt-2 mb-8 rounded-2xl border border-neutral-200 bg-white p-5">
          <h3 className="text-sm font-bold text-neutral-900 mb-1">Manage recommendations</h3>
          <p className="text-xs text-neutral-400 mb-3">Adjust your goals to get new recommendations</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {userTopics.map((t) => (
              <span key={t} className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">{t}</span>
            ))}
          </div>
          <button
            onClick={() => { setEditTopics(userTopics); setShowGoals(true); }}
            className="w-full rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Manage
          </button>
        </div>
      )}

      {/* Goals modal */}
      {showGoals && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-neutral-900">Update recommendations?</h3>
              <button onClick={() => setShowGoals(false)}><X size={20} className="text-neutral-400" /></button>
            </div>
            <p className="text-sm text-neutral-400 mb-5">Your content will refresh to match your updated goals</p>
            <TopicSelector selected={editTopics} onToggle={(t) => setEditTopics((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])} minRequired={3} />
            <button onClick={saveGoals} disabled={editTopics.length < 3 || savingTopics}
              className="mt-5 w-full rounded-xl bg-[#FF6B35] py-3 text-sm font-semibold text-white disabled:bg-neutral-200 disabled:text-neutral-400">
              {savingTopics ? "Saving..." : "Continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}