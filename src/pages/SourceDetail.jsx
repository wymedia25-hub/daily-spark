import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { TOPIC_COLORS } from "@/lib/topics";
import ContentsView from "@/components/source/ContentsView";
import ChapterReader from "@/components/source/ChapterReader";
import RatingModal from "@/components/RatingModal";
import { ArrowLeft, BookOpen, Headphones, List } from "lucide-react";
import confetti from "canvas-confetti";

export default function SourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, checkUserAuth } = useAuth();
  const [source, setSource] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("contents"); // contents | reading
  const [activeIdx, setActiveIdx] = useState(0);
  const [readCardIds, setReadCardIds] = useState(new Set());
  const [progress, setProgress] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [mode, setMode] = useState("read"); // read | listen

  useEffect(() => {
    loadData();
    const params = new URLSearchParams(window.location.search);
    if (params.get("listen") === "true") setMode("listen");
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
      // Update streak and daily tracking
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
      checkUserAuth();
      if (isComplete) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        setTimeout(() => setShowRating(true), 1000);
      }
    } catch (err) { console.error(err); }
  };

  const openCard = (idx) => {
    setActiveIdx(idx);
    setView("reading");
    if (cards[idx]) markRead(cards[idx]);
  };

  const nextCard = () => {
    if (activeIdx + 1 < cards.length) {
      openCard(activeIdx + 1);
    } else {
      setView("contents");
    }
  };

  const prevCard = () => { if (activeIdx > 0) openCard(activeIdx - 1); };

  const submitRating = async ({ rating, feedback_tags }) => {
    if (progress) {
      await base44.entities.UserProgress.update(progress.id, { rating, feedback_tags });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#FF6B35]" />
      </div>
    );
  }

  if (!source) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA]">
        <p className="text-neutral-500">Source not found</p>
        <button onClick={() => navigate("/")} className="mt-4 text-sm text-[#FF6B35]">Go home</button>
      </div>
    );
  }

  const color = TOPIC_COLORS[source.topic] || "#6B7280";
  const readCount = readCardIds.size;
  const progressPercent = cards.length > 0 ? (readCount / cards.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-20 h-1 bg-neutral-200">
        <div className="h-full bg-[#FF6B35] transition-all" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 backdrop-blur-lg pt-1">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <button onClick={() => view === "reading" ? setView("contents") : navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 text-center min-w-0 px-3">
            <p className="truncate text-sm font-semibold text-neutral-900">{source.title}</p>
            <p className="text-[11px] text-neutral-400">{readCount} of {cards.length} key points</p>
          </div>
          {view === "reading" ? (
            <button onClick={() => setView("contents")} className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100">
              <List size={20} />
            </button>
          ) : (
            <div className="w-9" />
          )}
        </div>

        {/* Read / Listen toggle */}
        <div className="mx-auto flex max-w-2xl px-4 pb-3">
          <div className="flex w-full rounded-xl bg-neutral-100 p-1">
            <button onClick={() => setMode("read")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
                mode === "read" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-400"}`}>
              <BookOpen size={15} /> Read
            </button>
            <button onClick={() => setMode("listen")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
                mode === "listen" ? "bg-[#FF6B35] text-white shadow-sm" : "text-neutral-400"}`}>
              <Headphones size={15} /> Listen
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-5">
        {view === "contents" ? (
          <ContentsView cards={cards} readCardIds={readCardIds} onSelectCard={openCard} />
        ) : (
          <ChapterReader
            card={cards[activeIdx]}
            cardIndex={activeIdx}
            totalCards={cards.length}
            onNext={nextCard}
            onPrev={prevCard}
            onBack={() => setView("contents")}
          />
        )}
      </div>

      {/* Rating modal */}
      {showRating && (
        <RatingModal source={source} onSubmit={submitRating} onClose={() => setShowRating(false)} />
      )}
    </div>
  );
}