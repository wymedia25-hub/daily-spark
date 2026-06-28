import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { THEMES } from "@/lib/themes";
import ThemePreview from "@/components/ThemePreview";
import { ArrowLeft, Check } from "lucide-react";

export default function Theme() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState("Calm nature");
  const [customBg, setCustomBg] = useState(null);
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
    setSelectedTheme(themeName);
    if (prefs) {
      const updated = await base44.entities.UserPreferences.update(prefs.id, { preferred_theme: themeName });
      setPrefs(updated);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-purple-500" /></div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <button onClick={() => navigate("/")} className="mb-5 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700">
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-neutral-900">Theme</h1>
      <p className="mb-6 text-sm text-neutral-500">Choose a background theme for your quotes.</p>

      <div className="space-y-6">
        {THEMES.map((theme) => (
          <div key={theme.name}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900">{theme.name}</h2>
              {selectedTheme === theme.name && (
                <span className="flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-semibold text-purple-600">
                  <Check size={11} /> Active
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {theme.backgrounds.map((url, idx) => (
                <ThemePreview key={url} themeName={theme.name} url={url} selected={selectedTheme === theme.name} onSelect={() => selectTheme(theme.name)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}