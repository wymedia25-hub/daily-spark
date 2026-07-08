import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import QuoteCard from "@/components/QuoteCard";
import { getThemeBackground } from "@/lib/themes";
import { getOnboardingData } from "@/lib/onboardingStorage";
import { LogIn, X } from "lucide-react";

export default function GuestFeed() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    loadQuotes();
  }, []);

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const loadQuotes = async () => {
    try {
      const data = getOnboardingData();
      const lang = data?.language_code || "en";
      const q = await base44.entities.Quote.filter(
        { language_code: lang, is_premium: false },
        "-created_date",
        100
      );
      setQuotes(shuffle(q).slice(0, 25));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = () => {
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-onboarding-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-onboarding-cream/20 border-t-onboarding-gold" />
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-onboarding-bg px-6 text-center">
        <p className="text-onboarding-cream-dim">No quotes available right now.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-6 rounded-xl bg-onboarding-gold px-6 py-2.5 text-sm font-semibold text-onboarding-bg"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-3 bg-onboarding-bg/95 px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur-md">
          <p className="text-sm text-onboarding-cream-dim">
            Sign in to personalize & save your progress
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 rounded-lg bg-onboarding-gold px-4 py-2 text-xs font-semibold text-onboarding-bg"
            >
              <LogIn size={13} /> Sign in
            </button>
            <button onClick={() => setShowBanner(false)} className="text-onboarding-cream-dim">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      <div className="h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide no-overscroll">
        {quotes.map((quote, i) => (
          <QuoteCard
            key={quote.id}
            quote={quote}
            index={i}
            total={quotes.length}
            isFavorited={false}
            onFavorite={handleFavorite}
            backgroundUrl={getThemeBackground("Calm nature", i)}
            theme="Calm nature"
          />
        ))}
      </div>
    </div>
  );
}