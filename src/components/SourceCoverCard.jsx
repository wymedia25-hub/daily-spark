import { Link } from "react-router-dom";
import { Bookmark, BookOpen, FileText, Mic } from "lucide-react";
import { TOPIC_COLORS } from "@/lib/topics";

const TYPE_ICONS = { book: BookOpen, article: FileText, podcast: Mic };

export default function SourceCoverCard({ source, size = "md", onSave }) {
  const color = TOPIC_COLORS[source.topic] || "#6B7280";
  const Icon = TYPE_ICONS[source.type] || FileText;
  const sizes = {
    sm: "w-36",
    md: "w-40",
    lg: "w-48",
  };
  const coverHeights = {
    sm: "h-52",
    md: "h-56",
    lg: "h-64",
  };

  return (
    <Link to={`/source/${source.id}`} className={`${sizes[size]} shrink-0 block group`}>
      {/* Book cover */}
      <div className={`relative ${coverHeights[size]} w-full rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow`}>
        {source.cover_image ? (
          <img src={source.cover_image} alt={source.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-4" style={{ background: `linear-gradient(145deg, ${color}, ${color}aa)` }}>
            <Icon size={20} className="text-white/40 mb-2" />
            <h3 className="text-sm font-bold leading-tight text-white text-center line-clamp-4">{source.title}</h3>
          </div>
        )}
        {/* Bookmark */}
        <button
          onClick={(e) => { e.preventDefault(); onSave?.(source.id); }}
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 backdrop-blur-sm text-white"
        >
          <Bookmark size={15} />
        </button>
      </div>
      {/* Title + author below cover */}
      <h3 className="mt-2 text-xs font-bold leading-tight text-neutral-900 line-clamp-2">{source.title}</h3>
      {source.author && <p className="mt-0.5 text-[11px] text-neutral-400 truncate">{source.author}</p>}
    </Link>
  );
}