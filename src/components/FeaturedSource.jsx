import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function FeaturedSource({ source }) {
  if (!source) return null;

  return (
    <Link to={`/source/${source.id}`} className="block mb-6">
      <div className="relative rounded-2xl bg-[#006AFF] p-5 overflow-hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">Free daily read</h2>
            <p className="mt-2 flex items-center gap-1 text-sm font-medium text-white/80">
              Get it now <ArrowRight size={14} />
            </p>
          </div>
          <div className="h-28 w-20 shrink-0 overflow-hidden rounded-lg shadow-lg">
            {source.cover_image ? (
              <img src={source.cover_image} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/20 p-2">
                <span className="text-xs font-bold text-white text-center line-clamp-4">{source.title}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}