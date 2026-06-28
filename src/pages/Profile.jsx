import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import StreakTracker from "@/components/StreakTracker";
import { Settings as SettingsIcon, LogOut, Shield, Bookmark, Bell, Sparkles, Crown, Pencil, Check, X, Heart } from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, isLoadingAuth, logout, checkUserAuth } = useAuth();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [prefs, setPrefs] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const [a, p, t] = await Promise.all([
        base44.entities.UserActivity.filter({ created_by_id: user.id }, "-created_date", 1),
        base44.entities.UserPreferences.filter({ created_by_id: user.id }, "-created_date", 1),
        base44.entities.Topic.list(50),
      ]);
      if (a[0]) setActivity(a[0]);
      if (p[0]) setPrefs(p[0]);
      setTopics(t.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-purple-500" /></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="px-5 py-20 text-center">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900">Profile</h1>
        <button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white">Sign in</button>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  const customizeItems = [
    { label: "Saved Quotes", icon: Heart, action: () => navigate("/saved-quotes") },
    { label: "Wallpapers", icon: Bookmark, action: () => navigate("/wallpapers") },
    { label: "Reminders", icon: Bell, action: () => navigate("/settings") },
    { label: "Settings", icon: SettingsIcon, action: () => navigate("/settings") },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-lg font-bold text-white">
          {(prefs?.display_name || user?.email || "U")[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">{prefs?.display_name || "Daily Spark User"}</h1>
          <p className="text-sm text-neutral-400">{user?.email}</p>
        </div>
      </div>

      {activity && (
        <div className="mb-5">
          <StreakTracker currentStreak={activity.current_streak} longestStreak={activity.longest_streak} streakDays={activity.streak_days} />
        </div>
      )}

      <h2 className="mb-3 text-sm font-bold text-neutral-900">Customize the app</h2>
      <div className="mb-5 grid grid-cols-2 gap-3">
        {customizeItems.map((item) => (
          <button key={item.label} onClick={item.action} className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-left transition-colors hover:bg-neutral-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <item.icon size={18} className="text-purple-600" />
            </div>
            <span className="text-sm font-medium text-neutral-800">{item.label}</span>
          </button>
        ))}
      </div>

      {!prefs?.is_premium && (
        <button onClick={() => navigate("/paywall")} className="mb-5 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 p-5 text-left text-white">
          <div className="flex items-center gap-2">
            <Crown size={20} />
            <h3 className="font-bold">Self-Growth Bundle</h3>
          </div>
          <p className="mt-2 text-sm text-white/80">Unlock premium affirmation decks: "I am" affirmations, gratitude, self-love, and more.</p>
          <span className="mt-3 inline-block rounded-lg bg-white px-4 py-2 text-sm font-bold text-purple-600">Unlock Premium</span>
        </button>
      )}

      {isAdmin && (
        <button onClick={() => navigate("/admin")} className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-left hover:bg-neutral-50">
          <Shield size={20} className="text-purple-600" />
          <span className="text-sm font-semibold text-neutral-900">Admin Dashboard</span>
        </button>
      )}

      <button onClick={() => logout()} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-3.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
        <LogOut size={16} /> Sign out
      </button>

    </div>
  );
}