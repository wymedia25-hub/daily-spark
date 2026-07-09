import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ScreenTime({ value, onChange }) {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="font-display-serif text-3xl font-bold text-onboarding-cream">
        {t("onboarding.timeTitle")}
      </h1>
      <div className="mt-8 flex flex-col items-center">
        <div className="flex items-center gap-3 rounded-2xl border border-onboarding-cream/15 px-6 py-5">
          <Bell size={20} className="text-onboarding-gold" />
          <input
            type="time"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent text-2xl font-bold text-onboarding-cream outline-none [color-scheme:dark]"
          />
        </div>
        <p className="mt-5 text-center text-sm text-onboarding-cream-dim">
          {t("onboarding.timeSubtitle")}
        </p>
      </div>
    </div>
  );
}