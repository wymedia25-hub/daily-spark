import { useState } from "react";
import { CheckCircle2, Share2, Plus } from "lucide-react";

export default function ContentsView({ cards, readCardIds, onSelectCard }) {
  const [tab, setTab] = useState("keypoints");

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-6 border-b border-neutral-200 mb-4">
        {[
          { key: "keypoints", label: "Key points" },
          { key: "insights", label: "Insights" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-2.5 text-sm font-semibold transition-colors ${
              tab === key
                ? "text-[#FF6B35] border-b-2 border-[#FF6B35]"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Key points tab */}
      {tab === "keypoints" && (
        <div className="space-y-1">
          <button
            onClick={() => onSelectCard(0)}
            className="w-full text-left px-3 py-3 rounded-xl text-sm text-neutral-600 hover:bg-neutral-50"
          >
            Overview
          </button>
          {cards.map((card, idx) => {
            const isRead = readCardIds.has(card.id);
            return (
              <button
                key={card.id}
                onClick={() => onSelectCard(idx)}
                className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl transition-colors hover:bg-neutral-50`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isRead ? "bg-emerald-50 text-emerald-500" : "bg-neutral-100 text-neutral-500"
                }`}>
                  {isRead ? <CheckCircle2 size={16} /> : idx + 1}
                </span>
                <span className="text-sm text-neutral-800 leading-snug">{card.headline}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Insights tab */}
      {tab === "insights" && (
        <div className="space-y-4">
          {cards.map((card, idx) => (
            <div key={card.id} className="border-b border-neutral-100 pb-4 last:border-0">
              <p className="text-sm text-neutral-800 leading-relaxed">{card.body}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-neutral-400">From key point {idx + 1}</span>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50">
                    <Share2 size={12} /> Share
                  </button>
                  <button className="flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50">
                    <Plus size={12} /> Remember
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}