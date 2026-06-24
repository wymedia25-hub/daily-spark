import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import SourceOverview from "@/components/source/SourceOverview";
import ChapterReader from "@/components/source/ChapterReader";
import RatingModal from "@/components/RatingModal";
import confetti from "canvas-confetti";

export default function SourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, checkUserAuth } = useAuth();
  const [source, setSource] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("overview");
  const [activeIdx, setActiveIdx] = useState(0);
  const [readCardIds, setReadCardIds] = useState(new Set());
  const [progress, setProgress] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [mode, setMode] = useState("read");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [src, allCards] = await Promise.all([
        base44.entities.ContentSource.get(id),
        base44.entities.Card.filter({ source_id: id }, "card_number", 50),
      ]);
      setSource(src);
      setCards(allCards);

      if (isAuthenticated && user) {
        const prog = await base44.entities.UserProgress.filter(
          { source_id: id, created_by_id: user.id }, "-updated_date", 1
        );
        if (prog.length > 0) {
          setProgress(prog[0]);
          setReadCardIds(new Set(prog[0].read_card_ids || []));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (card) => {
    if (readCardIds.has(card.id)) return;
    const newRead = new Set(readCardIds);
    newRead.add(card.id);
    setReadCardIds(newRead);

    if (!isAuthenticated || !user) return;

    const readIds = [...newRead];
    const isComplete = readIds.length >= cards.length;

    try {
      if (progress) {
        const updated = await base44.entities.UserProgress.update(progress.id, {
          read_card_ids: readIds, completed: isComplete,
        });
        setProgress(updated);
      } else {
        const created = await base44.entities.UserProgress.create({
          source_id: id, source_title: source.title, source_type: source.type,
          topic: source.topic, total_cards: cards.length,
          read_card_ids: readIds, completed: isComplete,
        });
        setProgress(created);
      }
      const today = new Date().toISOString().split("T")[0];
      const isNewDay = user.last_active_date !== today;
      const todayCards = isNewDay ? 1 : (user.today_cards_read || 0) + 1;
      if (isNewDay) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        const streak = user.last_active_date === yesterday ? (user.streak_count || 0) + 1 : 1;
        await base44.auth.updateMe({ streak_count: streak, last_active_date: today, today_date: today, today_cards_read: todayCards });
      } else {
        await base44.auth.updateMe({ today_date: today, today_cards_read: todayCards });
      }
      if (isComplete) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        setTimeout(() => setShowRating(true), 1000);
      }
    } catch (err) { console.error(err); }
  };

  const startReading = () => {
    const firstUnread = cards.findIndex((c) => !readCardIds.has(c.id));
    const idx = firstUnread >= 0 ? firstUnread : 0;
    setActiveIdx(idx);
    setMode("read");
    setView("reading");
    if (cards[idx]) markRead(cards[idx]);
  };

  const startListening = () => {
    const firstUnread = cards.findIndex((c) => !readCardIds.has(c.id));
    const idx = firstUnread >= 0 ? firstUnread : 0;
    setActiveIdx(idx);
    setMode("listen");
    setView("reading");
    if (cards[idx]) markRead(cards[idx]);
  };

  const openCard = (idx) => {
    setActiveIdx(idx);
    setMode("read");
    setView("reading");
    if (cards[idx]) markRead(cards[idx]);
  };

  const nextCard = () => {
    if (activeIdx + 1 < cards.length) {
      openCard(activeIdx + 1);
    } else {
      setView("overview");
    }
  };

  const submitRating = async ({ rating, feedback_tags }) => {
    if (progress) {
      await base44.entities.UserProgress.update(progress.id, { rating, feedback_tags });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFBF8]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#FF6B35]" />
      </div>
    );
  }

  if (!source) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFBF8]">
        <p className="text-neutral-500">Source not found</p>
        <button onClick={() => navigate("/")} className="mt-4 text-sm text-[#FF6B35]">Go home</button>
      </div>
    );
  }

  if (view === "overview") {
    return (
      <SourceOverview
        source={source}
        cards={cards}
        readCardIds={readCardIds}
        onRead={startReading}
        onListen={startListening}
        onSelectCard={openCard}
      />
    );
  }

  return (
    <div>
      <ChapterReader
        card={cards[activeIdx]}
        source={source}
        cardIndex={activeIdx}
        totalCards={cards.length}
        onNext={nextCard}
        onBack={() => setView("overview")}
        mode={mode}
        onToggleMode={setMode}
      />
      {showRating && (
        <RatingModal source={source} onSubmit={submitRating} onClose={() => setShowRating(false)} />
      )}
    </div>
  );
}