import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

const GOALS = [
  "Financial freedom / FIRE",
  "Build better habits",
  "Stay disciplined",
  "Grow my business",
];

export default function ScreenGoal({ value, onSelect }) {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="font-display-serif text-3xl font-bold text-onboarding-cream">
        {t("onboarding.goalTitle")}
      </h1>
      <div className="mt-7 space-y-3">
        {GOALS.map((goal) => (
          <button
            key={goal}
            onClick={() => onSelect(goal)}
            className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left text-base font-medium transition-all ${
              value === goal
                ? "border-onboarding-gold bg-onboarding-gold/15 text-onboarding-cream"
                : "border-onboarding-cream/15 text-onboarding-cream-dim hover:border-onboarding-cream/30"
            }`}
          >
            {t(`onboarding.goals.${goal}`, { defaultValue: goal })}
            {value === goal && <Check size={18} className="text-onboarding-gold" />}
          </button>
        ))}
      </div>
    </div>
  );
}