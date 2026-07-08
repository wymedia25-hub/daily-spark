import { Check, Heart } from "lucide-react";

const PAINS = [
  "Losing motivation",
  "Inconsistent",
  "Distracted",
  "Not sure where to start",
];

const REASSURANCE = {
  "Losing motivation": "You're not alone — most builders lose steam not from lack of desire, but from missing a daily spark. That's exactly what we're here to fix.",
  "Inconsistent": "Consistency isn't about willpower — it's about having the right fuel each morning. Your daily spark will keep the fire burning.",
  "Distracted": "A focused mind starts with a focused morning. One quote, one idea, one push forward — every single day.",
  "Not sure where to start": "Every journey begins with a single step. Your daily spark will point the way, one morning at a time.",
};

export default function ScreenPain({ value, onSelect }) {
  return (
    <div>
      <h1 className="font-display-serif text-3xl font-bold text-onboarding-cream">
        What's been getting in your way?
      </h1>
      <div className="mt-7 space-y-3">
        {PAINS.map((pain) => (
          <button
            key={pain}
            onClick={() => onSelect(pain)}
            className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left text-base font-medium transition-all ${
              value === pain
                ? "border-onboarding-gold bg-onboarding-gold/15 text-onboarding-cream"
                : "border-onboarding-cream/15 text-onboarding-cream-dim hover:border-onboarding-cream/30"
            }`}
          >
            {pain}
            {value === pain && <Check size={18} className="text-onboarding-gold" />}
          </button>
        ))}
      </div>
      {value && (
        <div className="mt-7 flex items-start gap-3 rounded-2xl border border-onboarding-gold/20 bg-onboarding-gold/5 p-5">
          <Heart size={18} className="mt-0.5 shrink-0 text-onboarding-gold" />
          <p className="text-sm leading-relaxed text-onboarding-cream-dim">
            {REASSURANCE[value]}
          </p>
        </div>
      )}
    </div>
  );
}