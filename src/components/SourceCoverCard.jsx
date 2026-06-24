import { Link } from "react-router-dom";
import { Bookmark, BookOpen, FileText, Mic } from "lucide-react";
import { TOPIC_COLORS } from "@/lib/topics";

const TYPE_ICONS = { book: BookOpen, article: FileText, podcast: Mic };

export default function SourceCoverCard({ source, size = "md", onSave }) {
  const color = TOPIC_COLORS[source.topic] || "#6B7280";
  const Icon = TYPE_ICONS[source.type] || FileText;
  const sizes = {
    sm: "w-28 h-40",
    md: "w-36 h-52",
    lg: "w-44 h-60",
  };

  return (
    <Link to={`/source/${source.id}`} className={`${sizes[size]} shrink-0 block group`}>
      <div
        className="relative h-full w-full rounded-xl p-3 flex flex-col justify-between overflow-hidden shadow-sm transition-shadow group-hover:shadow-md"
        style={{ background: `linear-gradient(145deg, ${color}ee, ${color}99)` }}
      >
        {source.cover_image ? (
          <img src={source.cover_image} alt={source.title} className="absolute inset-0 h-full w-full object-cover rounded-xl" />
        ) : (
          <>
            <Icon size={18} className="text-white/50" />
            <div>
              <h3 className="text-sm font-bold leading-tight text-white line-clamp-3">{source.title}</h3>
              {source.author && <p className="mt-1 text-[10px] text-white/70 truncate">{source.author}</p>}
            </div>
          </>
        )}
        {onSave && (
          <button
            onClick={(e) => { e.preventDefault(); onSave(source.id); }}
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-md bg-white/20 text-white backdrop-blur-sm"
          >
            <Bookmark size={14} />
          </button>
        )}
      </div>
    </Link>
  );
}