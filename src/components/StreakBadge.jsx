import { Flame } from "lucide-react";

export default function StreakBadge({ count }) {
  return (
    <div className="flex items-center gap-1">
      <Flame size={18} className="text-orange-500" fill={count > 0 ? "#f97316" : "none"} />
      <span className="text-sm font-bold text-neutral-900">{count || 0}</span>
    </div>
  );
}