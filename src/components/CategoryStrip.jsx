import { Brain, Briefcase, FlaskConical, ScrollText, Cpu, Lightbulb, Heart, Zap, DollarSign, Palette } from "lucide-react";

const TOPIC_ICONS = {
  "Psychology": Brain,
  "Business": Briefcase,
  "Science": FlaskConical,
  "History": ScrollText,
  "Technology": Cpu,
  "Philosophy": Lightbulb,
  "Health": Heart,
  "Productivity": Zap,
  "Finance": DollarSign,
  "Arts & Culture": Palette,
};

export default function CategoryStrip({ topics, onTopicClick }) {
  return (
    <section className="mb-6">
      <h2 className="text-lg font-bold tracking-tight text-neutral-900 mb-3">Categories you're interested in</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {topics.map((topic) => {
          const Icon = TOPIC_ICONS[topic] || Lightbulb;
          return (
            <button
              key={topic}
              onClick={() => onTopicClick(topic)}
              className="flex w-36 shrink-0 flex-col items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-50">
                <Icon size={22} className="text-neutral-700" />
              </div>
              <span className="text-xs font-semibold text-neutral-800 text-center leading-tight">{topic}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}