import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import KnowledgeCard from "@/components/KnowledgeCard";
import { Sparkles, LogIn } from "lucide-react";
import confetti from "canvas-confetti";

function TrackedCard({ card, onRead, isBookmarked, isRead, onBookmark }) {
  const ref = useRef(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.5 && !fired.current) {
          fired.current = true;
          onRead(card.id, card.source_id);
          observer.disconnect();
        }
      },
      { threshold: [0, 0.5, 1] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [card.id, onRead]);

  return (
    <div ref={ref}>
      <KnowledgeCard
        card={card}
        isBookmarked={isBookmarked}
        onBookmark={onBookmark}
        isRead={isRead}
      />
    </div>
  );
}

export default function Home() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const [readCardIds, setReadCardIds] = useState(new Set());
  const [bookmarkedCardIds, setBookmarkedCardIds] = useState(new Set());
  const [progressMap, setProgressMap] = useState({});
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated && user) {
      const topics = user.topics;
      if (!topics || topics.length === 0) {
        navigate("/onboarding");
        return;
      }
    }
  }, [isLoadingAuth, isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isLoadingAuth) return;
    loadData();
  }, [isLoadingAuth, isAuthenticated, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const allCards = await base44.entities.Card.list("-created_date", 300);
      let filtered = allCards;
      if (isAuthenticated && user?.topics?.length > 0) {
        filtered = allCards.filter((c) => user.topics.includes(c.topic));
      }
      filtered = [...filtered].sort(() => Math.random() - 0.5);
      setCards(filtered);

      if (isAuthenticated && user) {
        const progress = await base44.entities.UserProgress.filter(
          { created_by_id: user.id },
          "-updated_date",
          300
        );
        const pMap = {};
        const readIds = new Set();
        const bookmarkIds = new Set();
        progress.forEach((p) => {
          pMap[p.source_id] = p;
          (p.read_card_ids || []).forEach((id) => readIds.add(id));
          (p.bookmarked_card_ids || []).forEach((id) => bookmarkIds.add(id));
        });
        setProgressMap(pMap);
        setReadCardIds(readIds);
        setBookmarkedCardIds(bookmarkIds);
      }
    } catch (err) {
      console.error("Failed to load feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < cards.length) {
          setVisibleCount((prev) => Math.min(prev + 4, cards.length));
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [cards.length, visibleCount]);

  const markAsRead = useCallback(
    async (cardId, sourceId) => {
      setReadCardIds((prev) => {
        if (prev.has(cardId)) return prev;
        const next = new Set(prev);
        next.add(cardId);
        return next;
      });

      if (!isAuthenticated || !user) return;

      const existing = progressMap[sourceId];
      const sourceCards = cards.filter((c) => c.source_id === sourceId);
      const card = cards.find((c) => c.id === cardId);

      try {
        const currentReadIds = existing?.read_card_ids || [];
        const newReadIds = [...new Set([...currentReadIds, cardId])];
        const isComplete = newReadIds.length >= sourceCards.length;

        if (existing) {
          const wasCompleted = existing.completed;
          const updated = await base44.entities.UserProgress.update(existing.id, {
            read_card_ids: newReadIds,
            completed: isComplete,
          });
          setProgressMap((prev) => ({ ...prev, [sourceId]: updated }));
          if (isComplete && !wasCompleted) {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          }
        } else if (card) {
          const created = await base44.entities.UserProgress.create({
            source_id: sourceId,
            source_title: card.source_title,
            source_type: card.source_type,
            topic: card.topic,
            total_cards: sourceCards.length,
            read_card_ids: newReadIds,
            completed: isComplete,
          });
          setProgressMap((prev) => ({ ...prev, [sourceId]: created }));
          if (isComplete) {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          }
        }
      } catch (err) {
        console.error("Failed to track progress:", err);
      }
    },
    [cards, progressMap, isAuthenticated, user]
  );

  const toggleBookmark = useCallback(
    async (cardId) => {
      const card = cards.find((c) => c.id === cardId);
      if (!card) return;
      const wasBookmarked = bookmarkedCardIds.has(cardId);

      setBookmarkedCardIds((prev) => {
        const next = new Set(prev);
        if (wasBookmarked) next.delete(cardId);
        else next.add(cardId);
        return next;
      });

      if (!isAuthenticated || !user) return;

      const existing = progressMap[card.source_id];
      const sourceCards = cards.filter((c) => c.source_id === card.source_id);

      try {
        if (existing) {
          const bookmarked = new Set(existing.bookmarked_card_ids || []);
          if (wasBookmarked) bookmarked.delete(cardId);
          else bookmarked.add(cardId);
          const updated = await base44.entities.UserProgress.update(existing.id, {
            bookmarked_card_ids: [...bookmarked],
          });
          setProgressMap((prev) => ({ ...prev, [card.source_id]: updated }));
        } else {
          const created = await base44.entities.UserProgress.create({
            source_id: card.source_id,
            source_title: card.source_title,
            source_type: card.source_type,
            topic: card.topic,
            total_cards: sourceCards.length,
            read_card_ids: [],
            bookmarked_card_ids: wasBookmarked ? [] : [cardId],
            completed: false,
          });
          setProgressMap((prev) => ({ ...prev, [card.source_id]: created }));
        }
      } catch (err) {
        setBookmarkedCardIds((prev) => {
          const next = new Set(prev);
          if (wasBookmarked) next.add(cardId);
          else next.delete(cardId);
          return next;
        });
      }
    },
    [cards, progressMap, bookmarkedCardIds, isAuthenticated, user]
  );

  const visibleCards = cards.slice(0, visibleCount);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#FF6B35]" />
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              {isAuthenticated ? "Ready to learn?" : "Knowi"}
            </h1>
            <p className="mt-0.5 text-sm text-neutral-400">
              {isAuthenticated
                ? "Your daily dose of knowledge"
                : "Bite-sized knowledge, one card at a time"}
            </p>
          </div>
          {!isAuthenticated && (
            <button
              onClick={() => base44.auth.redirectToLogin(window.location.href)}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-700"
            >
              <LogIn size={14} />
              Sign in
            </button>
          )}
        </div>
      </header>

      {!isAuthenticated && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#FF6B35]/20 bg-[#FF6B35]/5 px-4 py-3">
          <Sparkles size={18} className="shrink-0 text-[#FF6B35]" />
          <p className="text-sm text-neutral-600">
            Sign in to personalize your feed and track your progress
          </p>
        </div>
      )}

      {visibleCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
            <Sparkles size={28} className="text-neutral-300" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900">No cards yet</h3>
          <p className="mt-1 text-sm text-neutral-400">
            {isAuthenticated
              ? "Try selecting more topics in your profile"
              : "Check back soon for new content"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleCards.map((card) => (
            <TrackedCard
              key={card.id}
              card={card}
              isBookmarked={bookmarkedCardIds.has(card.id)}
              isRead={readCardIds.has(card.id)}
              onRead={markAsRead}
              onBookmark={toggleBookmark}
            />
          ))}
          {visibleCount < cards.length && (
            <div ref={sentinelRef} className="flex justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-[#FF6B35]" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}