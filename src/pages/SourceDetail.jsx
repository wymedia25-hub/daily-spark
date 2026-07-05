import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import SourceOverview from "@/components/source/SourceOverview";
import ChapterReader from "@/components/source/ChapterReader";
import ContentsView from "@/components/source/ContentsView";
import RatingModal from "@/components/RatingModal";
import { calculateStreakUpdate } from "@/lib/streakUtils";

export default function SourceDetail() {
  const { id } = useParams();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [source, setSource] = useState(null);
  const [cards, setCards] = useState([]);
  const [progress, setProgress] = useState(null);
  const [activity, setActivity] = useState(null);
  const [view, setView] = useState("overview"); // overview | reader | contents
  const [cardIndex, setCardIndex] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) { setLoading(false); return; }
    loadData();
  }, [isLoadingAuth, isAuthenticated, id]);

  const loadData = async () => {
    try {
      const [src, cardList, progList, actList] = await Promise.all([
        base44.entities.ContentSource.get(id),
        base44.entities.Card.filter({ source_id: id }, "card_number", 200),
        base44.entities.UserProgress.filter({ source_id: id, created_by_id: user.id }, "-created_date", 1),
        base44.entities.UserActivity.filter({ created_by_id: user.id }, "-created_date", 1),
      ]);

      const sortedCards = cardList.sort((a, b) => (a.card_number || 0) - (b.card_number || 0));
      setSource(src);
      setCards(sortedCards);

      let prog = progList[0];
      if (!prog) {
        prog = await base44.entities.UserProgress.create({
          source_id: id,
          source_title: src.title,
          source_type: src.type,
          topic: src.topic,
          total_cards: sortedCards.length,
          read_card_ids: [],
          bookmarked_card_ids: [],
          completed: false,
        });
      }
      setProgress(prog);
      if (actList[0]) setActivity(actList[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const readCardIds = new Set(progress?.read_card_ids || []);

  const markCardRead = async (cardId) => {
    if (!cardId || readCardIds.has(cardId) || !progress) return;
    const newRead = [...readCardIds, cardId];
    const completed = newRead.length >= cards.length;
    const updated = await base44.entities.UserProgress.update(progress.id, {
      read_card_ids: newRead,
      completed,
    });
    setProgress(updated);

    if (completed) {
      await recordStreak();
      setTimeout(() => setShowRating(true), 400);
    }
  };

  const recordStreak = async () => {
    try {
      let act = activity;
      if (!act) {
        const acts = await base44.entities.UserActivity.filter({ created_by_id: user.id }, "-created_date", 1);
        act = acts[0];
      }
      if (!act) return;

      const streakUpdate = calculateStreakUpdate(act.streak_days, act.last_seen_date);
      if (streakUpdate.changed) {
        const longest = Math.max(act.longest_streak || 0, streakUpdate.current_streak);
        const today = new Date().toISOString().split("T")[0];
        const updated = await base44.entities.UserActivity.update(act.id, {
          streak_days: streakUpdate.streak_days,
          current_streak: streakUpdate.current_streak,
          longest_streak: longest,
          last_seen_date: today,
        });
        setActivity(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartReading = () => {
    const firstUnread = cards.findIndex((c) => !readCardIds.has(c.id));
    setCardIndex(firstUnread >= 0 ? firstUnread : 0);
    setView("reader");
  };

  const handleNext = async () => {
    if (cardIndex < cards.length - 1) {
      const nextIdx = cardIndex + 1;
      setCardIndex(nextIdx);
      await markCardRead(cards[nextIdx].id);
    } else {
      await markCardRead(cards[cardIndex].id);
    }
  };

  const handleBack = () => {
    if (view === "reader" && cardIndex === 0) {
      setView("overview");
    } else if (view === "reader") {
      setCardIndex(cardIndex - 1);
    } else if (view === "contents") {
      setView("overview");
    }
  };

  const handleSelectCard = (idx) => {
    setCardIndex(idx);
    setView("reader");
  };

  const handleRatingSubmit = async ({ rating, feedback_tags }) => {
    if (!progress) return;
    const updated = await base44.entities.UserProgress.update(progress.id, { rating, feedback_tags });
    setProgress(updated);
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#FDFBF8]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#FF6B35]" /></div>;
  }

  if (!source) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#FDFBF8] px-6 text-center">
        <p className="text-neutral-500">Source not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-[#FF6B35]">← Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF8]">
      {view === "overview" && (
        <SourceOverview
          source={source}
          cards={cards}
          readCardIds={readCardIds}
          onRead={handleStartReading}
          onSelectCard={handleSelectCard}
        />
      )}

      {view === "reader" && cards[cardIndex] && (
        <ChapterReader
          card={cards[cardIndex]}
          source={source}
          cardIndex={cardIndex}
          totalCards={cards.length}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {view === "contents" && (
        <div className="mx-auto max-w-2xl px-5 py-4">
          <ContentsView
            cards={cards}
            readCardIds={readCardIds}
            onSelectCard={handleSelectCard}
          />
        </div>
      )}

      {showRating && (
        <RatingModal
          source={source}
          onSubmit={handleRatingSubmit}
          onClose={() => setShowRating(false)}
        />
      )}
    </div>
  );
}