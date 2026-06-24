import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import TopicSelector from "@/components/TopicSelector";
import { LogOut, Shield, Check, Pencil, BookOpen } from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, isLoadingAuth, logout, checkUserAuth } = useAuth();
  const navigate = useNavigate();
  const [editingTopics, setEditingTopics] = useState(false);
  const [topics, setTopics] = useState([]);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ completed: 0, read: 0 });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setTopics(user.topics || []);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    loadStats();
  }, [isAuthenticated, user]);

  const loadStats = async () => {
    try {
      const progress = await base44.entities.UserProgress.filter(
        { created_by_id: user.id },
        "-updated_date",
        300
      );
      const completed = progress.filter((p) => p.completed).length;
      const read = progress.reduce((sum, p) => sum + (p.read_card_ids?.length || 0), 0);
      setStats({ completed, read });
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#FF6B35]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900">Profile</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
            <LogOut size={28} className="text-neutral-300" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900">Sign in to your account</h3>
          <p className="mt-1 text-sm text-neutral-400">Access your profile and saved topics</p>
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

  const toggleTopic = (topic) => {
    setTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const saveTopics = async () => {
    if (topics.length < 3) return;
    setSaving(true);
    try {
      await base44.auth.updateMe({ topics });
      await checkUserAuth();
      setEditingTopics(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900">Profile</h1>

      {/* User card */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FF6B35]/10 text-lg font-bold text-[#FF6B35]">
            {(user?.full_name || user?.email || "U")[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-neutral-900">
              {user?.full_name || "Knowi Learner"}
            </p>
            <p className="truncate text-sm text-neutral-400">{user?.email}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-neutral-50 p-3 text-center">
            <p className="text-xl font-bold text-neutral-900">{stats.completed}</p>
            <p className="text-xs text-neutral-400">Completed</p>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3 text-center">
            <p className="text-xl font-bold text-neutral-900">{stats.read}</p>
            <p className="text-xs text-neutral-400">Cards read</p>
          </div>
          <div className="rounded-xl bg-orange-50 p-3 text-center">
            <p className="text-xl font-bold text-[#FF6B35]">{user?.streak_count || 0}🔥</p>
            <p className="text-xs text-neutral-400">Streak</p>
          </div>
        </div>
      </div>

      {/* Topics */}
      <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">Your interests</h2>
          {!editingTopics ? (
            <button
              onClick={() => setEditingTopics(true)}
              className="flex items-center gap-1 text-xs font-medium text-[#FF6B35] hover:underline"
            >
              <Pencil size={13} />
              Edit
            </button>
          ) : null}
        </div>

        {editingTopics ? (
          <>
            <TopicSelector selected={topics} onToggle={toggleTopic} minRequired={3} />
            <div className="mt-4 flex gap-2">
              <button
                onClick={saveTopics}
                disabled={topics.length < 3 || saving}
                className="flex-1 rounded-lg bg-[#FF6B35] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e85a28] disabled:bg-neutral-200 disabled:text-neutral-400"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setTopics(user.topics || []);
                  setEditingTopics(false);
                }}
                className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-600"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            {topics.length > 0 ? (
              topics.map((t) => (
                <span
                  key={t}
                  className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700"
                >
                  {t}
                </span>
              ))
            ) : (
              <button
                onClick={() => navigate("/onboarding")}
                className="text-sm text-[#FF6B35] hover:underline"
              >
                Select your topics →
              </button>
            )}
          </div>
        )}
        {saved && (
          <p className="mt-3 flex items-center gap-1 text-xs text-emerald-500">
            <Check size={14} /> Topics updated
          </p>
        )}
      </div>

      {/* Invite friends */}
      <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Grow together</h2>
            <p className="mt-1 text-xs text-neutral-400">Share Knowi with your friends</p>
          </div>
        </div>
        <button
          onClick={() => {
            const url = window.location.origin;
            if (navigator.share) navigator.share({ title: "Join Knowi", text: "Learn something new every day!", url });
            else navigator.clipboard.writeText(url);
          }}
          className="mt-3 w-full rounded-xl bg-[#FF6B35] py-2.5 text-sm font-semibold text-white"
        >
          Invite friends
        </button>
      </div>

      {/* Admin link */}
      {isAdmin && (
        <button
          onClick={() => navigate("/admin")}
          className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-left transition-colors hover:bg-neutral-50"
        >
          <Shield size={20} className="text-[#FF6B35]" />
          <div>
            <p className="text-sm font-semibold text-neutral-900">Admin Dashboard</p>
            <p className="text-xs text-neutral-400">Manage content and sources</p>
          </div>
        </button>
      )}

      {/* Logout */}
      <button
        onClick={() => logout()}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-3.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </div>
  );
}