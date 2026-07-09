import { Check, Flame } from "lucide-react";

const STREAK_OPTIONS = [
  { days: 7, label: "7 days", badge: "Promising" },
  { days: 14, label: "14 days", badge: "Determined" },
  { days: 30, label: "30 days", badge: "Impressive" },
  { days: 50, label: "50 days", badge: "Unstoppable" },
];

export default function ScreenStreak({ value, onSelect }) {
  return (
    <div>
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-onboarding-gold/15">
        <Flame size={28} className="text-onboarding-gold" strokeWidth={1.5} />
      </div>
      <h1 className="font-display-serif text-3xl font-bold text-onboarding-cream">
        Commit to your streak
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-onboarding-cream-dim">
        Pick a streak goal to stay motivated and build a daily habit.
      </p>
      <div className="mt-7 space-y-3">
        {STREAK_OPTIONS.map((option) => (
          <button
            key={option.days}
            onClick={() => onSelect(option.days)}
            className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left text-base font-medium transition-all ${
              value === option.days
                ? "border-onboarding-gold bg-onboarding-gold/15 text-onboarding-cream"
                : "border-onboarding-cream/15 text-onboarding-cream-dim hover:border-onboarding-cream/30"
            }`}
          >
            {option.label}
            {value === option.days ? (
              <Check size={18} className="text-onboarding-gold" />
            ) : (
              <span className="text-sm text-onboarding-cream-dim">{option.badge}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}