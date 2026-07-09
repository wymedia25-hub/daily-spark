import { Sparkles, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "zh", label: "繁體中文" },
  { value: "zh-CN", label: "简体中文" },
  { value: "ja", label: "日本語" },
  { value: "es", label: "Español" },
];

export default function ScreenHook({ value, onSelect }) {
  const { i18n } = useTranslation();

  const handleSelect = (val) => {
    i18n.changeLanguage(val);
    if (onSelect) onSelect(val);
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-onboarding-gold/15">
        <Sparkles size={40} className="text-onboarding-gold" strokeWidth={1.5} />
      </div>
      <h1 className="font-display-serif text-4xl font-bold leading-tight text-onboarding-cream">
        One spark of motivation every morning to build your FIRE life.
      </h1>
      <p className="mt-5 max-w-sm text-base leading-relaxed text-onboarding-cream-dim">
        Daily quotes to fuel your financial independence, discipline, and drive.
      </p>

      <div className="mt-8 w-full max-w-xs">
        <div className="mb-3 flex items-center justify-center gap-1.5 text-onboarding-cream-dim">
          <Globe size={14} />
          <span className="text-xs font-medium uppercase tracking-wide">Language</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              onClick={() => handleSelect(lang.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                value === lang.value
                  ? "bg-onboarding-gold text-onboarding-bg"
                  : "bg-onboarding-cream/10 text-onboarding-cream hover:bg-onboarding-cream/20"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}