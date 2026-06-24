import { BookOpen, Clock, Lightbulb } from "lucide-react";

export default function WeeklyGrowthStats({ keyPoints, minutes, insights }) {
  const stats = [
    { value: keyPoints, label: "key points", color: "text-[#FF6B35]", icon: BookOpen },
    { value: minutes, label: "minutes", color: "text-blue-500", icon: Clock },
    { value: insights, label: "insights", color: "text-emerald-500", icon: Lightbulb },
  ];

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-neutral-900 mb-3">Weekly growth</h3>
      <div className="flex justify-around">
        {stats.map(({ value, label, color }) => (
          <div key={label} className="text-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-[11px] text-neutral-400">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}