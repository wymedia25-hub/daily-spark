import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { toggleFavoriteQuote } from "@/lib/userPrefs";
import { Heart } from "lucide-react";
import StackHeader from "@/components/StackHeader";

export default function SavedQuotes() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) { setLoading(false); return; }
    loadData();
  }, [isLoadingAuth, isAuthenticated]);

  const loadData = async () => {
    try {
      const p = await base44.entities.UserPreferences.filter({ created_by_id: user.id }, "-created_date", 1);
      if (p[0]) setPrefs(p[0]);
      const userLang = p[0]?.language_code || "en";
      const allQuotes = await base44.entities.Quote.filter({ language_code: userLang }, "-created_date", 500);
      setQuotes(allQuotes);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleToggle = async (quoteId) => {
    // Optimistic UI: update local state immediately
    const currentFavs = prefs?.favorite_quotes || [];
    const isFav = currentFavs.includes(quoteId);
    setPrefs({ ...prefs, favorite_quotes: isFav ? currentFavs.filter((id) => id !== quoteId) : [...currentFavs, quoteId] });
    try {
      const updated = await toggleFavoriteQuote(user.id, quoteId);
      setPrefs(updated);
    } catch (err) {
      setPrefs(prefs);
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-purple-500 dark:border-neutral-700 dark:border-t-purple-400" /></div>;
  }

  const favIds = new Set(prefs?.favorite_quotes || []);
  const favQuotes = quotes.filter((q) => favIds.has(q.id));

  return (
    <div className="pb-24">
      <StackHeader title="Saved Quotes" />
      <div className="mx-auto max-w-2xl px-4 pt-4">
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">Quotes you've favorited.</p>

      {favQuotes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <Heart size={28} className="mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
          <p className="text-sm text-neutral-400 dark:text-neutral-500">Tap the heart on any quote to save it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {favQuotes.map((q) => (
            <div key={q.id} className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <div onClick={() => navigate(`/quote/${q.id}`)} className="cursor-pointer">
                <p className="select-text text-base leading-relaxed text-neutral-800 dark:text-neutral-200">{q.text}</p>
                {q.author && <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">— {q.author}</p>}
              </div>
              <button
                onClick={() => handleToggle(q.id)}
                className="mt-3 flex items-center gap-1.5 text-xs font-medium text-red-400"
              >
                <Heart size={14} className="fill-red-400 text-red-400" /> Remove from favorites
              </button>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}