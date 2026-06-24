import { useState, useRef } from "react";
import { X, List, ChevronRight } from "lucide-react";

const FONT_SIZES = [
  { label: "S", body: "16px", title: "22px" },
  { label: "M", body: "18px", title: "24px" },
  { label: "L", body: "20px", title: "26px" },
];

export default function ChapterReader({ card, source, cardIndex, totalCards, onNext, onBack }) {
  const [fontIdx, setFontIdx] = useState(1);
  const touchStartX = useRef(null);

  if (!card) return null;

  const font = FONT_SIZES[fontIdx];

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - endX;
    if (diff > 60) {
      onNext();
    } else if (diff < -60) {
      onBack();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="min-h-screen bg-[#FDFBF8] pb-28"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#FDFBF8]/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3">
          <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100">
            <X size={20} className="text-neutral-800" />
          </button>
          <span className="text-xs font-medium text-neutral-400">{cardIndex + 1} of {totalCards}</span>
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

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3">
          <span className="text-xs font-medium text-neutral-400">Swipe to continue</span>
          <button onClick={onNext} className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-200 text-neutral-800 transition-colors hover:bg-neutral-300">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}