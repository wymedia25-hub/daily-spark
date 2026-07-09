import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

function formatTime(time) {
  if (!time) return "6:00 AM";
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}

export default function ScreenPlan({ answers }) {
  const { t } = useTranslation();
  const streakDays = answers.streak_days || 30;
  const goalLabel = answers.goal
    ? t(`onboarding.goals.${answers.goal}`, { defaultValue: answers.goal })
    : null;
  const interestLabels = answers.interests
    .slice(0, 3)
    .map(i => t(`onboarding.interests.${i}`, { defaultValue: i }));
  const planItems = [
    goalLabel
      ? t("onboarding.planDailyQuotes", { goal: goalLabel })
      : t("onboarding.planDailyQuotesDefault"),
    t("onboarding.planMorningSpark", { time: formatTime(answers.reminder_time) }),
    answers.interests.length > 0
      ? t("onboarding.planTopics", { topics: interestLabels.join(", ") + (answers.interests.length > 3 ? "…" : "") })
      : t("onboarding.planTopicsDefault"),
    t("onboarding.planStreak", { days: streakDays }),
  ];

  return (
    <div>
      <h1 className="font-display-serif text-3xl font-bold text-onboarding-cream">
        {answers.display_name
          ? t("onboarding.planTitleWithName", { name: answers.display_name, days: streakDays })
          : t("onboarding.planTitle", { days: streakDays })}
      </h1>
      <div className="mt-7 space-y-4">
        {planItems.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-onboarding-gold/20">
              <Check size={14} className="text-onboarding-gold" />
            </div>
            <span className="text-base text-onboarding-cream-dim">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}