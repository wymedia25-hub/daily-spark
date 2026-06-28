import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import QuoteCard from "@/components/QuoteCard";
import { getThemeBackground } from "@/lib/themes";
import { toggleFavoriteQuote } from "@/lib/userPrefs";
import { ChevronLeft } from "lucide-react";

export default function QuoteDetail() {
  const { id } = useParams();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [isUserQuote, setIsUserQuote] = useState(false);
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) { setLoading(false); return; }
    loadData();
  }, [isLoadingAuth, isAuthenticated, id]);

  const loadData = async () => {
    try {
      const [q, uq, p] = await Promise.all([
        base44.entities.Quote.list(200),
        base44.entities.UserQuote.filter({ created_by_id: user.id }, "-created_date", 200),
        base44.entities.UserPreferences.filter({ created_by_id: user.id }, "-created_date", 1),
      ]);
      const found = q.find((item) => item.id === id);
      if (found) {
        setQuote(found);
        setIsUserQuote(false);
      } else {
        const userFound = uq.find((item) => item.id === id);
        setQuote(userFound || null);
        setIsUserQuote(!!userFound);
      }
      if (p[0]) setPrefs(p[0]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleFavorite = async (quoteId) => {
    const updated = await toggleFavoriteQuote(user.id, quoteId);
    setPrefs(updated);
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#FAFAFA]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-purple-500" /></div>;
  }

  if (!quote) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#FAFAFA] px-6 text-center">
        <p className="text-neutral-500">Quote not found.</p>
        <button onClick={() => navigate(isUserQuote ? "/my-quotes" : "/saved-quotes")} className="mt-4 text-sm text-purple-600">← Back</button>
      </div>
    );
  }

  const favoriteSet = new Set(prefs?.favorite_quotes || []);

  return (
    <div className="relative h-screen overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center px-4 py-3 bg-gradient-to-b from-black/50 to-transparent">
        <button
          onClick={() => navigate(isUserQuote ? "/my-quotes" : "/saved-quotes")}
          className="flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-md px-3 py-2 text-sm font-medium text-white"
        >
          <ChevronLeft size={16} /> {isUserQuote ? "Your Own Quotes" : "Saved Quotes"}
        </button>
      </div>
      <div className="h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide">
        <div data-idx={0}>
          <QuoteCard
            quote={quote}
            index={0}
            total={1}
            isFavorited={favoriteSet.has(quote.id)}
            onFavorite={() => toggleFavorite(quote.id)}
            backgroundUrl={getThemeBackground(prefs?.preferred_theme || "Calm nature", 0)}
            theme={prefs?.preferred_theme || "Calm nature"}
          />
        </div>
      </div>
    </div>
  );
}