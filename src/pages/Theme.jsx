import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { THEMES } from "@/lib/themes";
import ThemePreview from "@/components/ThemePreview";
import { ArrowLeft } from "lucide-react";

export default function Theme() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState("Calm nature");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) { setLoading(false); return; }
    loadData();
  }, [isLoadingAuth, isAuthenticated]);

  const loadData = async () => {
    try {
      const p = await base44.entities.UserPreferences.filter({ created_by_id: user.id }, "-created_date", 1);
      if (p[0]) {
        setPrefs(p[0]);
        setSelectedTheme(p[0].preferred_theme || "Calm nature");
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const selectTheme = async (themeName) => {
    if (selectedTheme === themeName) return;
    setSelectedTheme(themeName);
    if (prefs) {
      const updated = await base44.entities.UserPreferences.update(prefs.id, { preferred_theme: themeName });
      setPrefs(updated);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-purple-500 dark:border-neutral-700 dark:border-t-purple-400" /></div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-[calc(1.5rem+env(safe-area-inset-top))]">
      <button onClick={() => navigate("/")} className="mb-6 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Choose your vibe</h1>
      <p className="mb-7 mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">Pick a mood for your daily quote backgrounds.</p>

      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((theme) => (
          <ThemePreview
            key={theme.name}
            themeName={theme.name}
            coverUrl={theme.cover}
            selected={selectedTheme === theme.name}
            onSelect={() => selectTheme(theme.name)}
          />
        ))}
      </div>
    </div>
  );
}