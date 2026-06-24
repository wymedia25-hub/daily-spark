import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import KnowledgeCard from "@/components/KnowledgeCard";
import { Bookmark, LogIn } from "lucide-react";

export default function Bookmarks() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [bookmarkedCards, setBookmarkedCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressMap, setProgressMap] = useState({});

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadBookmarks();
  }, [isLoadingAuth, isAuthenticated, user]);

  const loadBookmarks = async () => {
    try {
      const progress = await base44.entities.UserProgress.filter(
        { created_by_id: user.id },
        "-updated_date",
        300
      );
      const bookmarkedIds = [];
      const pMap = {};
      progress.forEach((p) => {
        pMap[p.source_id] = p;
        (p.bookmarked_card_ids || []).forEach((id) => bookmarkedIds.push(id));
      });
      setProgressMap(pMap);

      if (bookmarkedIds.length === 0) {
        setBookmarkedCards([]);
        return;
      }

      const allCards = await base44.entities.Card.list("-created_date", 500);
      const bookmarked = allCards.filter((c) => bookmarkedIds.includes(c.id));
      setBookmarkedCards(bookmarked);
    } catch (err) {
      console.error("Failed to load bookmarks:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (cardId) => {
    const card = bookmarkedCards.find((c) => c.id === cardId);
    if (!card) return;
    const existing = progressMap[card.source_id];
    if (!existing) return;

    setBookmarkedCards((prev) => prev.filter((c) => c.id !== cardId));
    const bookmarked = new Set(existing.bookmarked_card_ids || []);
    bookmarked.delete(cardId);

    try {
      const updated = await base44.entities.UserProgress.update(existing.id, {
        bookmarked_card_ids: [...bookmarked],
      });
      setProgressMap((prev) => ({ ...prev, [card.source_id]: updated }));
    } catch (err) {
      console.error(err);
      loadBookmarks();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#FF6B35]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900">Saved</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
            <LogIn size={28} className="text-neutral-300" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900">Sign in to save cards</h3>
          <p className="mt-1 text-sm text-neutral-400">Bookmark cards to revisit them later</p>
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="mt-6 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900">Saved</h1>
      {bookmarkedCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
            <Bookmark size={28} className="text-neutral-300" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900">No saved cards yet</h3>
          <p className="mt-1 text-sm text-neutral-400">
            Tap the bookmark icon on any card to save it here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarkedCards.map((card) => (
            <KnowledgeCard
              key={card.id}
              card={card}
              isBookmarked={true}
              onBookmark={removeBookmark}
              isRead={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}