import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { toggleFavoriteQuote } from "@/lib/userPrefs";
import { ArrowLeft, Heart } from "lucide-react";

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
      const [p, allQuotes] = await Promise.all([
        base44.entities.UserPreferences.filter({ created_by_id: user.id }, "-created_date", 1),
        base44.entities.Quote.list(200),
      ]);
      if (p[0]) setPrefs(p[0]);
      setQuotes(allQuotes);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleToggle = async (quoteId) => {
    const updated = await toggleFavoriteQuote(user.id, quoteId);
    setPrefs(updated);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-purple-500" /></div>;
  }

  const favIds = new Set(prefs?.favorite_quotes || []);
  const favQuotes = quotes.filter((q) => favIds.has(q.id));

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <button onClick={() => navigate("/profile")} className="mb-5 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700">
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-neutral-900">Saved Quotes</h1>
      <p className="mb-6 text-sm text-neutral-500">Quotes you've favorited.</p>

      {favQuotes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center">
          <Heart size={28} className="mx-auto mb-3 text-neutral-300" />
          <p className="text-sm text-neutral-400">Tap the heart on any quote to save it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {favQuotes.map((q) => (
            <div key={q.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
              <p className="text-base leading-relaxed text-neutral-800">{q.text}</p>
              {q.author && <p className="mt-3 text-xs text-neutral-400">— {q.author}</p>}
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
  );
}