import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import SourceTypeIcon from "@/components/SourceTypeIcon";
import TopicPill from "@/components/TopicPill";
import { BookOpen, FileText, Mic, CheckCircle2, LogIn, Flame } from "lucide-react";
import { TOPIC_COLORS } from "@/lib/topics";

export default function Progress() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadProgress();
  }, [isLoadingAuth, isAuthenticated, user]);

  const loadProgress = async () => {
    try {
      const data = await base44.entities.UserProgress.filter(
        { created_by_id: user.id },
        "-updated_date",
        300
      );
      setProgress(data);
    } catch (err) {
      console.error("Failed to load progress:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#FF6B35]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900">Progress</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
            <LogIn size={28} className="text-neutral-300" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900">Sign in to track progress</h3>
          <p className="mt-1 text-sm text-neutral-400">See your learning streaks and completions</p>
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="mt-6 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  const completed = progress.filter((p) => p.completed);
  const totalRead = progress.reduce((sum, p) => sum + (p.read_card_ids?.length || 0), 0);
  const topicsExplored = new Set(completed.map((p) => p.topic)).size;

  const byType = {
    book: completed.filter((p) => p.source_type === "book").length,
    article: completed.filter((p) => p.source_type === "article").length,
    podcast: completed.filter((p) => p.source_type === "podcast").length,
  };

  const topicCounts = {};
  completed.forEach((p) => {
    topicCounts[p.topic] = (topicCounts[p.topic] || 0) + 1;
  });
  const topicEntries = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
  const maxTopicCount = Math.max(...Object.values(topicCounts), 1);

  const typeIcons = {
    book: { Icon: BookOpen, label: "Books", color: "#8B5CF6" },
    article: { Icon: FileText, label: "Articles", color: "#3B82F6" },
    podcast: { Icon: Mic, label: "Podcasts", color: "#F97316" },
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900">Progress</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <CheckCircle2 size={20} className="mb-2 text-[#FF6B35]" />
          <p className="text-2xl font-bold text-neutral-900">{completed.length}</p>
          <p className="text-xs text-neutral-400">Completed</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <BookOpen size={20} className="mb-2 text-[#FF6B35]" />
          <p className="text-2xl font-bold text-neutral-900">{totalRead}</p>
          <p className="text-xs text-neutral-400">Cards read</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <Flame size={20} className="mb-2 text-[#FF6B35]" />
          <p className="text-2xl font-bold text-neutral-900">{topicsExplored}</p>
          <p className="text-xs text-neutral-400">Topics</p>
        </div>
      </div>

      {/* By type breakdown */}
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-neutral-900">Completed by type</h2>
        <div className="space-y-3">
          {Object.entries(typeIcons).map(([type, { Icon, label, color }]) => {
            const count = byType[type];
            const max = Math.max(...Object.values(byType), 1);
            return (
              <div key={type} className="flex items-center gap-3">
                <div className="flex w-24 items-center gap-2">
                  <Icon size={16} style={{ color }} />
                  <span className="text-sm text-neutral-600">{label}</span>
                </div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(count / max) * 100}%`, backgroundColor: color }}
                  />
                </div>
                <span className="w-6 text-right text-sm font-semibold text-neutral-900">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* By topic breakdown */}
      {topicEntries.length > 0 && (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-neutral-900">By topic</h2>
          <div className="space-y-3">
            {topicEntries.map(([topic, count]) => {
              const color = TOPIC_COLORS[topic] || "#6B7280";
              return (
                <div key={topic} className="flex items-center gap-3">
                  <div className="w-32">
                    <TopicPill topic={topic} />
                  </div>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(count / maxTopicCount) * 100}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="w-6 text-right text-sm font-semibold text-neutral-900">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed sources list */}
      {completed.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-neutral-900">Recently completed</h2>
          <div className="space-y-2">
            {completed.slice(0, 10).map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3"
              >
                <SourceTypeIcon type={p.source_type} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900">{p.source_title}</p>
                  <p className="text-xs text-neutral-400">{p.topic}</p>
                </div>
                <CheckCircle2 size={18} className="text-emerald-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      {completed.length === 0 && (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-12 text-center">
          <CheckCircle2 size={32} className="mb-3 text-neutral-300" />
          <p className="text-sm font-medium text-neutral-700">No completions yet</p>
          <p className="mt-1 text-xs text-neutral-400">Read all cards from a source to complete it</p>
        </div>
      )}
    </div>
  );
}