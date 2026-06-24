import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { TOPIC_COLORS } from "@/lib/topics";
import TopicPill from "@/components/TopicPill";
import SourceTypeIcon from "@/components/SourceTypeIcon";
import { Bookmark, Share2 } from "lucide-react";

export default function Shorts() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Card.list("-created_date", 100)
      .then((all) => setCards([...all].sort(() => Math.random() - 0.5)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#FF6B35]" />
      </div>
    );
  }

  return (
    <div className="snap-y snap-mandatory h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide -mx-4 -mt-6">
      {cards.map((card) => {
        const color = TOPIC_COLORS[card.topic] || "#6B7280";
        return (
          <div key={card.id} className="snap-start h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-6">
            <div
              className="relative w-full max-w-md rounded-3xl p-6 flex flex-col justify-between min-h-[70vh] shadow-lg"
              style={{ background: `linear-gradient(160deg, ${color}12, ${color}06)`, borderLeft: `3px solid ${color}` }}
            >
              <div className="flex items-center gap-2.5">
                <SourceTypeIcon type={card.source_type} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-800 truncate">{card.source_title}</p>
                  <p className="text-xs text-neutral-400">{card.source_author}</p>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center py-8">
                <TopicPill topic={card.topic} />
                <h2 className="mt-4 text-2xl font-bold leading-snug tracking-tight text-neutral-900">
                  {card.headline}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-neutral-600">
                  {card.body}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">#{card.card_number}</span>
                <div className="flex gap-3">
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-neutral-500 shadow-sm">
                    <Share2 size={18} />
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-neutral-500 shadow-sm">
                    <Bookmark size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}