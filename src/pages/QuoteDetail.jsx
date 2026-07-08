import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import QuoteCard from "@/components/QuoteCard";
import ShareModal from "@/components/ShareModal";
import { getThemeBackground } from "@/lib/themes";
import { toggleFavoriteQuote } from "@/lib/userPrefs";
import { ChevronLeft, Share2 } from "lucide-react";
import { setNavDirection } from "@/lib/navigationState";

export default function QuoteDetail() {
  const { id } = useParams();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [isUserQuote, setIsUserQuote] = useState(false);
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) { setLoading(false); return; }
    loadData();
  }, [isLoadingAuth, isAuthenticated, id]);

  const loadData = async () => {
    try {
      const p = await base44.entities.UserPreferences.filter({ created_by_id: user.id }, "-created_date", 1);
      if (p[0]) setPrefs(p[0]);
      const userLang = p[0]?.language_code || "en";
      const q = await base44.entities.Quote.filter({ language_code: userLang }, "-created_date", 500);
      const found = q.find((item) => item.id === id);
      if (found) {
        setQuote(found);
        setIsUserQuote(false);
      } else {
        const uq = await base44.entities.UserQuote.filter({ created_by_id: user.id }, "-created_date", 200);
        const userFound = uq.find((item) => item.id === id);
        setQuote(userFound || null);
        setIsUserQuote(!!userFound);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleFavorite = async (quoteId) => {
    const updated = await toggleFavoriteQuote(user.id, quoteId);
    setPrefs(updated);
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#FAFAFA] dark:bg-neutral-950"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-purple-500 dark:border-neutral-700 dark:border-t-purple-400" /></div>;
  }

  if (!quote) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#FAFAFA] px-6 text-center dark:bg-neutral-950">
        <p className="text-neutral-500 dark:text-neutral-400">Quote not found.</p>
        <button onClick={() => { setNavDirection('pop'); navigate(-1); }} className="mt-4 text-sm text-purple-600">← Back</button>
      </div>
    );
  }

  const favoriteSet = new Set(prefs?.favorite_quotes || []);

  return (
    <div className="relative h-screen overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] bg-gradient-to-b from-black/50 to-transparent">
        <button
          onClick={() => { setNavDirection('pop'); navigate(-1); }}
          className="flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-md px-3 py-2 text-sm font-medium text-white"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => setShowShare(true)}
          className="flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-md px-3 py-2 text-sm font-medium text-white"
        >
          <Share2 size={16} />
        </button>
      </div>
      <div className="h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide no-overscroll">
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
      <ShareModal
        quote={quote}
        backgroundUrl={getThemeBackground(prefs?.preferred_theme || "Calm nature", 0)}
        isOpen={showShare}
        onClose={() => setShowShare(false)}
      />
    </div>
  );
}