import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import SourceTypeIcon from "@/components/SourceTypeIcon";
import TopicPill from "@/components/TopicPill";
import { BookOpen, CheckCircle2, Bookmark, LogIn } from "lucide-react";

export default function Library() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("reading");

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) { setLoading(false); return; }
    loadProgress();
  }, [isLoadingAuth, isAuthenticated]);

  const loadProgress = async () => {
    try {
      const data = await base44.entities.UserProgress.filter(
        { created_by_id: user.id }, "-updated_date", 300
      );
      setProgress(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#FF6B35]" /></div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900">Library</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <LogIn size={28} className="mb-4 text-neutral-300" />
          <h3 className="text-base font-semibold text-neutral-900">Sign in to access your library</h3>
          <p className="mt-1 text-sm text-neutral-400">Track your reading history and saved items</p>
          <button onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="mt-6 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white">Sign in</button>
        </div>
      </div>
    );
  }

  const inProgress = progress.filter((p) => !p.completed && (p.read_card_ids?.length || 0) > 0);
  const completed = progress.filter((p) => p.completed);
  const saved = progress.filter((p) => (p.bookmarked_card_ids?.length || 0) > 0);

  const tabs = [
    { key: "reading", label: "In Progress", items: inProgress },
    { key: "completed", label: "Completed", items: completed },
    { key: "saved", label: "Saved", items: saved },
  ];
  const currentTab = tabs.find((t) => t.key === tab);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold tracking-tight text-neutral-900">Library</h1>

      <div className="flex gap-2 mb-5">
        {tabs.map(({ key, label, items }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
              tab === key ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"
            }`}
          >
            {label} ({items.length})
          </button>
        ))}
      </div>

      {currentTab.items.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={28} className="mx-auto text-neutral-200 mb-3" />
          <p className="text-sm text-neutral-500">
            {tab === "reading" && "Start reading a summary to see it here"}
            {tab === "completed" && "Complete a summary to see it here"}
            {tab === "saved" && "Bookmark cards to see them here"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {currentTab.items.map((p) => {
            const readCount = p.read_card_ids?.length || 0;
            const total = p.total_cards || 1;
            const percent = Math.round((readCount / total) * 100);
            return (
              <Link
                key={p.id}
                to={`/source/${p.source_id}`}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 hover:bg-neutral-50"
              >
                <SourceTypeIcon type={p.source_type} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900">{p.source_title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <TopicPill topic={p.topic} />
                    <span className="text-[11px] text-neutral-400">
                      {p.completed ? "Completed" : `${readCount}/${total} key points`}
                    </span>
                  </div>
                  {!p.completed && (
                    <div className="mt-1.5 h-1 w-full rounded-full bg-neutral-100">
                      <div className="h-full rounded-full bg-[#FF6B35] transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  )}
                </div>
                {p.completed && <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}