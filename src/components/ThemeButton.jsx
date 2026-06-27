import { Paintbrush } from "lucide-react";
import { THEMES } from "@/lib/themes";

export default function ThemeButton({ currentTheme, onThemeChange }) {
  const idx = THEMES.findIndex((t) => t.name === currentTheme);
  const nextTheme = THEMES[(idx + 1) % THEMES.length];

  return (
    <button
      onClick={() => onThemeChange(nextTheme.name)}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-transform active:scale-90"
      title={`Theme: ${currentTheme}`}
    >
      <Paintbrush size={18} />
    </button>
  );
}