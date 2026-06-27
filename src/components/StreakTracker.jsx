import { Flame } from "lucide-react";
import { getLast7Days } from "@/lib/streakUtils";

export default function StreakTracker({ currentStreak, longestStreak, streakDays }) {
  const days = getLast7Days(streakDays);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-5 text-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Flame size={28} className="fill-white text-white" />
            <span className="text-3xl font-bold">{currentStreak || 0}</span>
          </div>
          <p className="text-sm text-white/80">Current streak</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{longestStreak || 0}</p>
          <p className="text-xs text-white/80">Best</p>
        </div>
      </div>
      <div className="mt-4 flex justify-between">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-white/70">{d.dayName}</span>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${d.attended ? "bg-white text-purple-600" : "bg-white/20 text-white/40"}`}>
              {d.attended ? "✓" : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}