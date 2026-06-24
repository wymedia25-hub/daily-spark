import { useState, useEffect } from "react";
import { X, List, Play, Pause, ChevronRight } from "lucide-react";

const FONT_SIZES = [
  { label: "S", body: "16px", title: "22px" },
  { label: "M", body: "18px", title: "24px" },
  { label: "L", body: "20px", title: "26px" },
];

export default function ChapterReader({ card, source, cardIndex, totalCards, onNext, onBack, mode, onToggleMode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [fontIdx, setFontIdx] = useState(1);

  useEffect(() => {
    if (mode === "listen" && card) {
      window.speechSynthesis.cancel();
      const text = `${card.headline}. ${card.body}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } else {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, [card?.id, mode]);

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  const toggleAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const text = `${card.headline}. ${card.body}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  if (!card) return null;

  const font = FONT_SIZES[fontIdx];

  return (
    <div className="min-h-screen bg-[#FDFBF8] pb-28">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#FDFBF8]/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3">
          <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100">
            <X size={20} className="text-neutral-800" />
          </button>
          <div className="flex rounded-full bg-neutral-200 p-0.5">
            <button onClick={() => onToggleMode("read")} className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${mode === "read" ? "bg-neutral-900 text-white" : "text-neutral-500"}`}>
              Read
            </button>
            <button onClick={() => onToggleMode("listen")} className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${mode === "listen" ? "bg-neutral-900 text-white" : "text-neutral-500"}`}>
              Listen
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100">
              <List size={18} className="text-neutral-700" />
            </button>
            <button onClick={() => setFontIdx((fontIdx + 1) % FONT_SIZES.length)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100">
              <span className="text-xs font-bold text-neutral-700">AA</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-5 pt-4">
        <h1 className="mb-5 font-bold leading-snug tracking-tight text-neutral-900" style={{ fontFamily: "Georgia, serif", fontSize: font.title }}>
          {card.headline}
        </h1>
        <div className="whitespace-pre-line leading-[1.8] text-neutral-800" style={{ fontFamily: "Georgia, serif", fontSize: font.body }}>
          {card.body}
        </div>
      </div>

      {/* Bottom bar: mini player + page nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-5 py-3">
          {source?.cover_image ? (
            <img src={source.cover_image} alt="" className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-neutral-800" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-neutral-900">{card.headline}</p>
            <p className="truncate text-[11px] text-neutral-400">{source?.title}</p>
          </div>
          <button onClick={toggleAudio} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6B35] text-white">
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>
        </div>
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 pb-3">
          <span className="text-xs font-medium text-neutral-500">{cardIndex + 1} of {totalCards}</span>
          <button onClick={onNext} className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-200 text-neutral-800 transition-colors hover:bg-neutral-300">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}