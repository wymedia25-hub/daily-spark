import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Search as SearchIcon, BookOpen, FileText, Mic, X } from "lucide-react";
import SourceCoverCard from "@/components/SourceCoverCard";

const TYPES = [
  { key: "all", label: "All" },
  { key: "book", label: "Books", icon: BookOpen },
  { key: "article", label: "Articles", icon: FileText },
  { key: "podcast", label: "Podcasts", icon: Mic },
];

export default function Search() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(new URLSearchParams(window.location.search).get("q") || "");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    base44.entities.ContentSource.filter({ status: "published" }, "-created_date", 200)
      .then(setSources)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = sources;
    if (typeFilter !== "all") result = result.filter((s) => s.type === typeFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((s) =>
        s.title.toLowerCase().includes(q) || (s.author || "").toLowerCase().includes(q) || (s.topic || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [sources, query, typeFilter]);

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-4">
        <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search books, articles, podcasts..."
          className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-10 pr-10 text-sm outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/10"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Type filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
        {TYPES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTypeFilter(key)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
              typeFilter === key
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#FF6B35]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <SearchIcon size={32} className="mx-auto text-neutral-200 mb-3" />
          <p className="text-sm text-neutral-500">No results found</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((source) => (
            <SourceCoverCard key={source.id} source={source} size="sm" />
          ))}
        </div>
      )}
    </div>
  );
}