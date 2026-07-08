import { Check, ArrowRight, UserPlus } from "lucide-react";

function formatTime(time) {
  if (!time) return "6:00 AM";
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}

export default function ScreenPlan({ answers, isAuthenticated, saving, onCreateAccount, onEnterApp }) {
  const planItems = [
    `Daily quotes tailored to: ${answers.goal}`,
    `Morning spark at ${formatTime(answers.reminder_time)}`,
    "Topics chosen for your journey",
    "30-day streak to build the habit",
  ];

  return (
    <div className="flex min-h-screen flex-col justify-center px-7">
      <h1 className="font-display-serif text-3xl font-bold text-onboarding-cream">
        Here's your 30-day plan
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

      {isAuthenticated ? (
        <button
          onClick={onEnterApp}
          disabled={saving}
          className="mt-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-onboarding-gold py-4 text-base font-semibold text-onboarding-bg transition-transform active:scale-95 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Enter the app"} <ArrowRight size={18} />
        </button>
      ) : (
        <>
          <button
            onClick={onCreateAccount}
            className="mt-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-onboarding-gold py-4 text-base font-semibold text-onboarding-bg transition-transform active:scale-95"
          >
            <UserPlus size={18} /> Create account to save your plan
          </button>
          <button
            onClick={onEnterApp}
            className="mt-3 w-full py-3 text-sm font-medium text-onboarding-cream-dim underline-offset-4 hover:underline"
          >
            Maybe later
          </button>
        </>
      )}
    </div>
  );
}