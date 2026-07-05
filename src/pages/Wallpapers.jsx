import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ArrowLeft, Lock, Download } from "lucide-react";

export default function Wallpapers() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [wallpapers, setWallpapers] = useState([]);
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) { setLoading(false); return; }
    loadData();
  }, [isLoadingAuth, isAuthenticated]);

  const loadData = async () => {
    try {
      const [w, p] = await Promise.all([
        base44.entities.Wallpaper.list(50),
        base44.entities.UserPreferences.filter({ created_by_id: user.id }, "-created_date", 1),
      ]);
      setWallpapers(w);
      if (p[0]) setPrefs(p[0]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-purple-500 dark:border-neutral-700 dark:border-t-purple-400" /></div>;
  }

  const isPremium = prefs?.is_premium;

  const handleDownload = (wp) => {
    if (wp.is_premium && !isPremium) {
      navigate("/paywall");
      return;
    }
    window.open(wp.image_url, "_blank");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-[calc(1.5rem+env(safe-area-inset-top))]">
      <button onClick={() => navigate("/explore")} className="mb-5 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Wallpapers</h1>

      <div className="grid grid-cols-2 gap-3">
        {wallpapers.map((wp) => {
          const locked = wp.is_premium && !isPremium;
          return (
            <div key={wp.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <div className="relative aspect-[9/16]">
                <img src={wp.image_url} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs font-medium text-white">{wp.quote_text}</p>
                </div>
                {locked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Lock size={24} className="text-white" />
                  </div>
                )}
              </div>
              <button onClick={() => handleDownload(wp)} className={`flex w-full items-center justify-center gap-1.5 py-3 text-xs font-medium ${locked ? "text-amber-600" : "text-purple-600"}`}>
                {locked ? "Unlock" : "Download"} <Download size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}