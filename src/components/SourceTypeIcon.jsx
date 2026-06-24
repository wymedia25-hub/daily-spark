import { BookOpen, FileText, Mic } from "lucide-react";

export default function SourceTypeIcon({ type, size = 16, className = "" }) {
  const config = {
    book: { Icon: BookOpen, bg: "bg-violet-50", text: "text-violet-600" },
    article: { Icon: FileText, bg: "bg-blue-50", text: "text-blue-600" },
    podcast: { Icon: Mic, bg: "bg-orange-50", text: "text-orange-600" },
  };
  const { Icon, bg, text } = config[type] || config.article;

  return (
    <div className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${bg} ${text} ${className}`}>
      <Icon size={size} strokeWidth={2} />
    </div>
  );
}