import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { labelFor } from "@/lib/i18n";

const STYLES = [
  { value: "Short & punchy", desc: "Quick, bold one-liners" },
  { value: "Deep & reflective", desc: "Thoughtful, contemplative" },
  { value: "Tough love", desc: "Direct, no-excuses push" },
  { value: "Gentle & soft", desc: "Warm, comforting words" },
];

export default function ScreenQuoteStyle({ value, onSelect }) {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="font-display-serif text-3xl font-bold text-onboarding-cream">
        {t("onboarding.styleTitle")}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-onboarding-cream-dim">
        {t("onboarding.styleSubtitle")}
      </p>
      <div className="mt-7 space-y-3">
        {STYLES.map((s) => (
          <button
            key={s.value}
            onClick={() => onSelect(s.value)}
            className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all ${
              value === s.value
                ? "border-onboarding-gold bg-onboarding-gold/15"
                : "border-onboarding-cream/15 hover:border-onboarding-cream/30"
            }`}
          >
            <div>
              <span className={`text-base font-medium ${value === s.value ? "text-onboarding-cream" : "text-onboarding-cream-dim"}`}>
                {labelFor("quoteStyle", s.value)}
              </span>
              <p className="mt-0.5 text-xs text-onboarding-cream-dim">
                {t(`onboarding.styleDescs.${s.value}`, { defaultValue: s.desc })}
              </p>
            </div>
            {value === s.value && <Check size={18} className="text-onboarding-gold" />}
          </button>
        ))}
      </div>
    </div>
  );
}