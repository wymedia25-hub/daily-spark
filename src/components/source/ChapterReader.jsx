import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, Share2, Highlighter } from "lucide-react";

export default function ChapterReader({ card, cardIndex, totalCards, onNext, onPrev, onBack }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    };
  }, [card?.id]);

  const toggleAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const text = `${card.headline}. ${card.body}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlaying(false);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  if (!card) return null;

  return (
    <div className="pb-24">
      {/* Chapter heading */}
      <h1 className="text-2xl font-bold leading-snug tracking-tight text-neutral-900 mb-6">
        {card.headline}
      </h1>

      {/* Body */}
      <div className="text-base leading-[1.8] text-neutral-700 whitespace-pre-line">
        {card.body}
      </div>

      {/* Actions */}
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={toggleAudio}
          className="flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isPlaying ? "Pause" : "Listen"}
        </button>
        <button className="flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
          <Share2 size={16} /> Share
        </button>
        <button className="flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
          <Highlighter size={16} /> Highlight
        </button>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-200 bg-white/95 backdrop-blur-lg p-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <button
            onClick={onPrev}
            disabled={cardIndex === 0}
            className="flex items-center gap-1 text-sm font-medium text-neutral-600 disabled:text-neutral-300"
          >
            <ChevronLeft size={18} /> Previous
          </button>
          <span className="text-xs font-medium text-neutral-400">
            {cardIndex + 1} of {totalCards}
          </span>
          <button
            onClick={onNext}
            className="flex items-center gap-1 text-sm font-semibold text-[#FF6B35]"
          >
            {cardIndex + 1 === totalCards ? "Finish" : "Next"} <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}