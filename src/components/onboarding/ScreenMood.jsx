import { Check } from "lucide-react";

const MOODS = ["Sad", "Anxious", "Unmotivated", "Okay", "Hopeful"];

export default function ScreenMood({ value, onSelect }) {
  return (
    <div>
      <h1 className="font-display-serif text-3xl font-bold text-onboarding-cream">
        How are you feeling right now?
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-onboarding-cream-dim">
        This helps us tune the tone of your quotes.
      </p>
      <div className="mt-7 space-y-3">
        {MOODS.map((mood) => (
          <button
            key={mood}
            onClick={() => onSelect(mood)}
            className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left text-base font-medium transition-all ${
              value === mood
                ? "border-onboarding-gold bg-onboarding-gold/15 text-onboarding-cream"
                : "border-onboarding-cream/15 text-onboarding-cream-dim hover:border-onboarding-cream/30"
            }`}
          >
            {mood}
            {value === mood && <Check size={18} className="text-onboarding-gold" />}
          </button>
        ))}
      </div>
    </div>
  );
}