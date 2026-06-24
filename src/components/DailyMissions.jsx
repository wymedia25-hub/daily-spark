import { Flame, BookOpen, CheckCircle2, Circle } from "lucide-react";

export default function DailyMissions({ todayCardsRead = 0 }) {
  const missions = [
    { title: "Start a streak", completed: todayCardsRead >= 1, icon: Flame },
    { title: "Learn 12 key points", completed: todayCardsRead >= 12, icon: BookOpen },
  ];
  const completedCount = missions.filter((m) => m.completed).length;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <h3 className="text-sm font-bold text-neutral-900 mb-3">Daily mission</h3>
      <div className="space-y-2">
        {missions.map((m) => (
          <div key={m.title} className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${m.completed ? "bg-emerald-100" : "bg-neutral-200"}`}>
                <m.icon size={16} className={m.completed ? "text-emerald-600" : "text-neutral-400"} />
              </div>
              <span className={`text-sm font-medium ${m.completed ? "text-neutral-800" : "text-neutral-500"}`}>{m.title}</span>
            </div>
            {m.completed ? (
              <CheckCircle2 size={20} className="text-emerald-500" />
            ) : (
              <Circle size={20} className="text-neutral-200" />
            )}
          </div>
        ))}
      </div>
      <div className={`mt-3 rounded-xl py-2 text-center text-[11px] font-bold uppercase tracking-wider ${
        completedCount > 0 ? "bg-emerald-500 text-white" : "bg-neutral-100 text-neutral-400"
      }`}>
        {completedCount} daily missions completed
      </div>
    </div>
  );
}