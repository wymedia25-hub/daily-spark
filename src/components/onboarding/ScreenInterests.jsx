import { Check } from "lucide-react";

const INTERESTS = [
  "Money & Wealth",
  "Discipline & Focus",
  "Love & Relationships",
  "Self-Esteem",
  "Overcoming Fear",
  "Productivity",
  "Mindfulness",
  "Leadership",
  "Resilience",
  "Purpose & Meaning",
  "Health & Fitness",
  "Creativity",
];

export default function ScreenInterests({ values, onToggle }) {
  const toggle = (i) => {
    if (values.includes(i)) {
      onToggle(values.filter((v) => v !== i));
    } else {
      onToggle([...values, i]);
    }
  };

  return (
    <div>
      <h1 className="font-display-serif text-3xl font-bold text-onboarding-cream">
        Pick your interests
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-onboarding-cream-dim">
        Choose at least 3 to personalize your feed.
      </p>
      <div className="mt-7 flex flex-wrap gap-2.5">
        {INTERESTS.map((i) => {
          const active = values.includes(i);
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "border-onboarding-gold bg-onboarding-gold/15 text-onboarding-cream"
                  : "border-onboarding-cream/15 text-onboarding-cream-dim hover:border-onboarding-cream/30"
              }`}
            >
              {active && <Check size={14} className="text-onboarding-gold" />}
              {i}
            </button>
          );
        })}
      </div>
    </div>
  );
}