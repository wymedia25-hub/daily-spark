import { Check } from "lucide-react";

const STRUGGLES = [
  "Anxiety & overthinking",
  "Lack of motivation",
  "Low confidence",
  "Depression & sadness",
  "Loneliness",
  "Work & business stress",
  "Heartbreak",
  "Toxic relationship",
  "Inconsistent",
  "Distracted",
  "Not sure where to start",
];

export default function ScreenStruggles({ values, onToggle }) {
  const toggle = (s) => {
    if (values.includes(s)) {
      onToggle(values.filter((v) => v !== s));
    } else {
      onToggle([...values, s]);
    }
  };

  return (
    <div>
      <h1 className="font-display-serif text-3xl font-bold text-onboarding-cream">
        What's getting in your way?
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-onboarding-cream-dim">
        Select all that apply — we'll tailor your feed accordingly.
      </p>
      <div className="mt-7 flex flex-wrap gap-2.5">
        {STRUGGLES.map((s) => {
          const active = values.includes(s);
          return (
            <button
              key={s}
              onClick={() => toggle(s)}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "border-onboarding-gold bg-onboarding-gold/15 text-onboarding-cream"
                  : "border-onboarding-cream/15 text-onboarding-cream-dim hover:border-onboarding-cream/30"
              }`}
            >
              {active && <Check size={14} className="text-onboarding-gold" />}
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}