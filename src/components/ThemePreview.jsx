import { useState } from "react";
import { Check } from "lucide-react";
import { getThemeGradient } from "@/lib/themeGradients";

export default function ThemePreview({ themeName, url, selected, onSelect }) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={onSelect}
      className="relative aspect-[3/4] overflow-hidden rounded-xl border-2 transition-colors hover:border-purple-400"
      style={{ background: getThemeGradient(themeName) }}
    >
      {!imgError && (
        <img src={url} alt="" onError={() => setImgError(true)} className="h-full w-full object-cover" />
      )}
      {selected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500">
            <Check size={16} className="text-white" />
          </div>
        </div>
      )}
    </button>
  );
}