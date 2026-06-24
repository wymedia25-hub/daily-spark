import { Link } from "react-router-dom";
import { Bookmark, BookOpen, FileText, Mic, Headphones } from "lucide-react";
import { TOPIC_COLORS } from "@/lib/topics";

export default function FeaturedSource({ source }) {
  if (!source) return null;
  const color = TOPIC_COLORS[source.topic] || "#6B7280";

  return (
    <div className="mb-6 rounded-2xl p-5 overflow-hidden" style={{ background: `linear-gradient(160deg, ${color}18, ${color}08)` }}>
      <p className="text-sm text-neutral-500 mb-3">
        Summary like "{source.title}"
      </p>
      <div className="flex justify-center mb-3">
        <div
          className="w-36 h-48 rounded-xl flex flex-col justify-end p-3 shadow-md"
          style={{ background: `linear-gradient(145deg, ${color}dd, ${color}99)` }}
        >
          {source.cover_image ? (
            <img src={source.cover_image} alt="" className="absolute inset-0 h-full w-full object-cover rounded-xl" />
          ) : (
            <h3 className="text-sm font-bold text-white leading-tight">{source.title}</h3>
          )}
        </div>
      </div>
      <p className="text-center text-sm font-medium text-neutral-700">{source.author}</p>
      <p className="text-center text-xs text-neutral-400 mt-0.5">{source.topic}</p>

      <div className="flex gap-3 mt-4">
        <Link
          to={`/source/${source.id}`}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-neutral-700"
        >
          <BookOpen size={16} /> Read
        </Link>
        <Link
          to={`/source/${source.id}?listen=true`}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] py-2.5 text-sm font-semibold text-white"
        >
          <Headphones size={16} /> Listen
        </Link>
      </div>
    </div>
  );
}