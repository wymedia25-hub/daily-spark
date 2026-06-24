import { TOPICS } from "@/lib/topics";
import { Check } from "lucide-react";

export default function TopicSelector({ selected, onToggle, minRequired = 3 }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {TOPICS.map((topic) => {
          const isSelected = selected.includes(topic);
          return (
            <button
              key={topic}
              onClick={() => onToggle(topic)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                isSelected
                  ? "border-[#FF6B35] bg-[#FF6B35] text-white shadow-sm"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              {isSelected && <Check size={15} strokeWidth={3} />}
              {topic}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-neutral-400">
        {selected.length < minRequired
          ? `Select ${minRequired - selected.length} more to continue`
          : `${selected.length} topics selected — looking good!`}
      </p>
    </div>
  );
}