import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import StreakTracker from "@/components/StreakTracker";
import { Settings as SettingsIcon, LogOut, Bell, Crown, Heart, Upload, PenSquare } from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, isLoadingAuth, logout, checkUserAuth } = useAuth();
  const { t } = useTranslation();
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
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-purple-500 dark:border-neutral-700 dark:border-t-purple-400" /></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="px-5 py-20 text-center">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">{t("profile.title")}</h1>
        <button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white">{t("profile.signIn")}</button>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  const customizeItems = [
    { label: t("profile.savedQuotes"), icon: Heart, action: () => navigate("/saved-quotes") },
    { label: t("profile.myQuotes"), icon: PenSquare, action: () => navigate("/my-quotes") },
    { label: t("profile.reminders"), icon: Bell, action: () => navigate("/reminders") },
    { label: t("profile.settings"), icon: SettingsIcon, action: () => navigate("/settings") },
    ...(isAdmin ? [{ label: t("profile.importData"), icon: Upload, action: () => navigate("/admin/import") }] : []),
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-lg font-bold text-white">
          {(prefs?.display_name || user?.email || "U")[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">{prefs?.display_name || t("profile.defaultName")}</h1>
          <p className="text-sm text-neutral-400 dark:text-neutral-500">{user?.email}</p>
        </div>
      </div>

      {activity && (
        <div className="mb-5">
          <StreakTracker currentStreak={activity.current_streak} longestStreak={activity.longest_streak} streakDays={activity.streak_days} />
        </div>
      )}

      <h2 className="mb-3 text-sm font-bold text-neutral-900 dark:text-neutral-100">{t("profile.customizeApp")}</h2>
      <div className="mb-5 space-y-2.5">
        {customizeItems.map((item) => (
          <button key={item.label} onClick={item.action} className="flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-left transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50">
              <item.icon size={18} className="text-purple-600" />
            </div>
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{item.label}</span>
          </button>
        ))}
      </div>

      {!prefs?.is_premium && (
        <button onClick={() => navigate("/paywall")} className="mb-5 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 p-5 text-left text-white">
          <div className="flex items-center gap-2">
            <Crown size={20} />
            <h3 className="font-bold">{t("profile.selfGrowthBundle")}</h3>
          </div>
          <p className="mt-2 text-sm text-white/80">{t("profile.bundleDesc")}</p>
          <span className="mt-3 inline-block rounded-lg bg-white px-4 py-2 text-sm font-bold text-purple-600">{t("profile.unlockPremium")}</span>
        </button>
      )}

      <button onClick={() => logout()} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-3.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800">
        <LogOut size={16} /> {t("profile.signOut")}
      </button>

    </div>
  );
}