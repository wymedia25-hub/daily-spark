import { Check } from "lucide-react";

function formatTime(time) {
  if (!time) return "6:00 AM";
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}

export default function ScreenPlan({ answers }) {
  const planItems = [
    `Daily quotes tailored to: ${answers.goal}`,
    `Morning spark at ${formatTime(answers.reminder_time)}`,
    "Topics chosen for your journey",
    `${answers.streak_days || 30}-day streak to build the habit`,
  ];

  return (
    <div>
      <h1 className="font-display-serif text-3xl font-bold text-onboarding-cream">
        Here's your {answers.streak_days || 30}-day plan
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