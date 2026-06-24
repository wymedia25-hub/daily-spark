import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import SourceTypeIcon from "@/components/SourceTypeIcon";
import TopicPill from "@/components/TopicPill";
import { ArrowLeft, Plus, BookOpen, FileText, Mic, Loader2, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/");
      return;
    }
    loadSources();
  }, [isLoadingAuth, isAuthenticated, user, navigate]);

  const loadSources = async () => {
    try {
      const data = await base44.entities.ContentSource.list("-created_date", 200);
      setSources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (source) => {
    const newStatus = source.status === "published" ? "draft" : "published";
    try {
      await base44.entities.ContentSource.update(source.id, { status: newStatus });
      setSources((prev) =>
        prev.map((s) => (s.id === source.id ? { ...s, status: newStatus } : s))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSource = async (source) => {
    if (!confirm(`Delete "${source.title}" and all its cards?`)) return;
    try {
      await base44.entities.Card.deleteMany({ source_id: source.id });
      await base44.entities.ContentSource.delete(source.id);
      setSources((prev) => prev.filter((s) => s.id !== source.id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Admin header */}
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-neutral-900">Admin</h1>
              <p className="text-xs text-neutral-400">Content management</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/add")}
            className="flex items-center gap-1.5 rounded-lg bg-[#FF6B35] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e85a28]"
          >
            <Plus size={16} />
            Add Content
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-6">
        {sources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
              <BookOpen size={28} className="text-neutral-300" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900">No content yet</h3>
            <p className="mt-1 text-sm text-neutral-400">
              Add your first book, article, or podcast to get started
            </p>
            <button
              onClick={() => navigate("/admin/add")}
              className="mt-6 flex items-center gap-1.5 rounded-lg bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Add Content
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sources.map((source) => (
              <div
                key={source.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <SourceTypeIcon type={source.type} size={18} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-neutral-900">{source.title}</h3>
                        <p className="text-xs text-neutral-400">{source.author || "Unknown author"}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          source.status === "published"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-neutral-100 text-neutral-400"
                        }`}
                      >
                        {source.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <TopicPill topic={source.topic} />
                      <span className="text-xs text-neutral-400">
                        {source.total_cards || 0} cards
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => togglePublish(source)}
                        className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                      >
                        {source.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => deleteSource(source)}
                        className="flex items-center gap-1 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}