import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { THEMES } from "@/lib/themes";
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
                <button
                  key={url}
                  onClick={() => selectTheme(theme.name)}
                  className="relative aspect-[3/4] overflow-hidden rounded-xl border-2 transition-colors hover:border-purple-400"
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  {selectedTheme === theme.name && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500">
                        <Check size={16} className="text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}