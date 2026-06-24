import { Trophy } from "lucide-react";

const STREAK_OPTIONS = [
  { days: 7, label: "7-day streak", badge: "Promising" },
  { days: 14, label: "14-day streak", badge: "Determined" },
  { days: 30, label: "30-day streak", badge: "Impressive" },
  { days: 50, label: "50-day streak", badge: "Unstoppable" },
];

export default function StreakCommitment({ selected, onSelect }) {
  return (
    <div>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF6B35]/10">
        <Trophy size={24} className="text-[#FF6B35]" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
        Commit to growing with Knowi
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Pick a streak goal to stay motivated and build a daily learning habit.
      </p>
      <div className="mt-6 space-y-3">
        {STREAK_OPTIONS.map((option) => (
          <button
            key={option.days}
            onClick={() => onSelect(option.days)}
            className={`flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all ${
              selected === option.days
                ? "border-[#FF6B35] bg-[#FF6B35]/5 shadow-sm"
                : "border-neutral-200 hover:border-neutral-300"
            }`}
          >
            <span className={`text-sm font-semibold ${selected === option.days ? "text-neutral-900" : "text-neutral-700"}`}>
              {option.label}
            </span>
            <span className={`text-sm ${selected === option.days ? "text-[#FF6B35] font-medium" : "text-neutral-400"}`}>
              {option.badge}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}