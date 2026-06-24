import { useState } from "react";
import { Bookmark, ChevronDown } from "lucide-react";
import SourceTypeIcon from "./SourceTypeIcon";
import TopicPill from "./TopicPill";
import { TOPIC_COLORS } from "@/lib/topics";

export default function KnowledgeCard({ card, isBookmarked, onBookmark, isRead }) {
  const [expanded, setExpanded] = useState(false);
  const topicColor = TOPIC_COLORS[card.topic] || "#6B7280";

  return (
    <article
      className="animate-card-enter relative rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      style={{ borderLeftWidth: "3px", borderLeftColor: topicColor }}
    >
      {/* Header: source info */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <SourceTypeIcon type={card.source_type} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-900">{card.source_title}</p>
            {card.source_author && (
              <p className="truncate text-xs text-neutral-400">{card.source_author}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => onBookmark?.(card.id)}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
            isBookmarked
              ? "bg-[#FF6B35]/10 text-[#FF6B35]"
              : "text-neutral-300 hover:bg-neutral-100 hover:text-neutral-500"
          }`}
          aria-label="Bookmark card"
        >
          <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Topic pill + card number */}
      <div className="mt-4 flex items-center gap-2">
        <TopicPill topic={card.topic} />
        {card.card_number && (
          <span className="text-[11px] font-medium text-neutral-300">
            #{card.card_number}
          </span>
        )}
        {isRead && (
          <span className="ml-auto text-[11px] font-medium text-emerald-500">✓ Read</span>
        )}
      </div>

      {/* Headline */}
      <h2 className="mt-3 text-xl font-bold leading-snug tracking-tight text-neutral-900">
        {card.headline}
      </h2>

      {/* Body */}
      <p
        className={`mt-2 text-[15px] leading-relaxed text-neutral-600 ${
          expanded ? "" : "line-clamp-3"
        }`}
      >
        {card.body}
      </p>

      {card.body && card.body.length > 180 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#FF6B35] hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
          <ChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </article>
  );
}