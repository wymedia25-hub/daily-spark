import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Share2, Bookmark, ListChecks, Clock, Zap, Check, ChevronRight, ArrowUpRight, BookOpen } from "lucide-react";
import TopicPill from "@/components/TopicPill";

export default function SourceOverview({ source, cards, readCardIds, onRead, onSelectCard }) {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);

  const keyPoints = cards.length;
  const minutes = Math.max(1, Math.round(cards.length * 2));
  const insights = Math.max(1, cards.length - 1);
  const youllLearn = cards.slice(0, 5).map((c) => c.headline);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: source.title, text: source.summary || "", url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (e) {
      try { await navigator.clipboard.writeText(window.location.href); } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF8]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#FDFBF8]/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100">
            <X size={20} className="text-neutral-800" />
          </button>
          <div className="flex items-center gap-1">
            <button onClick={handleShare} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100">
              <Share2 size={18} className="text-neutral-800" />
            </button>
            <button onClick={() => setBookmarked(!bookmarked)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100">
              <Bookmark size={18} className={bookmarked ? "fill-neutral-800 text-neutral-800" : "text-neutral-800"} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero — Book Cover */}
      <div className="flex flex-col items-center px-5 pt-4 pb-8">
        {source.cover_image ? (
          <img src={source.cover_image} alt={source.title} className="h-72 w-48 rounded-2xl object-cover shadow-xl" />
        ) : (
          <div className="flex h-72 w-48 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-700 to-neutral-900 p-6 text-center shadow-xl">
            <span className="text-lg font-bold leading-snug text-white">{source.title}</span>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="mx-auto max-w-2xl px-5 text-center">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Summary</p>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{source.title}</h1>
        <p className="mt-1 text-base text-neutral-500">{source.author}</p>

        {/* Stats */}
        <div className="mt-5 flex items-center justify-center">
          <div className="flex items-center gap-1.5 px-4">
            <ListChecks size={16} className="text-neutral-600" />
            <span className="text-sm font-medium text-neutral-800">{keyPoints} key points</span>
          </div>
          <div className="h-4 w-px bg-neutral-200" />
          <div className="flex items-center gap-1.5 px-4">
            <Clock size={16} className="text-neutral-600" />
            <span className="text-sm font-medium text-neutral-800">{minutes} min</span>
          </div>
          <div className="h-4 w-px bg-neutral-200" />
          <div className="flex items-center gap-1.5 px-4">
            <Zap size={16} className="text-neutral-600" />
            <span className="text-sm font-medium text-neutral-800">{insights} insights</span>
          </div>
        </div>
      </div>

      {/* What's inside? */}
      <div className="mx-auto max-w-2xl px-5 mt-8">
        <h2 className="mb-2 text-lg font-bold text-neutral-900">What's inside?</h2>
        <p className="text-sm leading-relaxed text-neutral-600">{source.summary || "Discover key insights and actionable takeaways from this source."}</p>
      </div>

      {/* You'll learn */}
      {youllLearn.length > 0 && (
        <div className="mx-auto max-w-2xl px-5 mt-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-base font-bold text-neutral-900">You'll learn</h3>
            <ul className="space-y-2.5">
              {youllLearn.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Check size={16} className="mt-0.5 shrink-0 text-[#FF6B35]" strokeWidth={3} />
                  <span className="text-sm text-neutral-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Key points */}
      <div className="mx-auto max-w-2xl px-5 mt-6">
        <h2 className="mb-3 text-lg font-bold text-neutral-900">Key points</h2>
        <div className="space-y-1">
          {cards.map((card, idx) => {
            const isRead = readCardIds.has(card.id);
            return (
              <button key={card.id} onClick={() => onSelectCard(idx)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-neutral-100">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isRead ? "bg-emerald-50 text-emerald-500" : "bg-[#FF6B35]/10 text-[#FF6B35]"}`}>
                  {idx + 1}
                </span>
                <span className="flex-1 text-sm leading-snug text-neutral-800">{card.headline}</span>
                <ChevronRight size={18} className="shrink-0 text-neutral-300" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Get the full book */}
      {source.source_url && (
        <div className="mx-auto max-w-2xl px-5 mt-6">
          <a href={source.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-neutral-100 py-3 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-200">
            <ArrowUpRight size={16} /> Get the full book
          </a>
        </div>
      )}

      {/* Explore categories */}
      <div className="mx-auto max-w-2xl px-5 mt-6 mb-32">
        <h2 className="mb-3 text-lg font-bold text-neutral-900">Explore categories</h2>
        <button onClick={() => navigate(`/search?q=${encodeURIComponent(source.topic)}`)}>
          <TopicPill topic={source.topic} size="md" />
        </button>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-200 bg-[#FDFBF8]/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl px-5 py-4">
          <button onClick={onRead} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B35] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#e85a28]">
            <BookOpen size={16} /> Read
          </button>
        </div>
      </div>
    </div>
  );
}