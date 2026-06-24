import { TOPIC_COLORS } from "@/lib/topics";

export default function TopicPill({ topic, size = "sm" }) {
  const color = TOPIC_COLORS[topic] || "#6B7280";
  const sizeClasses = {
    sm: "text-[11px] px-2.5 py-0.5",
    md: "text-xs px-3 py-1",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]}`}
      style={{ backgroundColor: `${color}14`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {topic}
    </span>
  );
}