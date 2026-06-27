import { Check } from "lucide-react";

export default function TopicPicker({ topics, selectedTopic, onSelect, userPrefs }) {
  const focusSet = new Set(userPrefs?.focus_areas || userPrefs?.recommended_topics || []);

  return (
    <div className="fixed left-0 right-0 top-0 z-30 bg-gradient-to-b from-black/50 to-transparent pb-8 pt-4">
      <div className="scrollbar-hide mx-auto flex max-w-2xl gap-2 overflow-x-auto px-4">
        <button
          onClick={() => onSelect(null)}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold backdrop-blur-md transition-colors ${
            selectedTopic === null
              ? "bg-white text-purple-600"
              : "bg-white/15 text-white hover:bg-white/25"
          }`}
        >
          For You
        </button>
        {topics.map((topic) => {
          const active = selectedTopic === topic.name;
          const recommended = focusSet.has(topic.name);
          return (
            <button
              key={topic.id}
              onClick={() => onSelect(topic.name)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold backdrop-blur-md transition-colors ${
                active ? "bg-white text-purple-600" : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              {topic.name}
              {recommended && <Check size={12} className={active ? "text-purple-500" : "text-white/70"} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}