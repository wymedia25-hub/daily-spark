import { useState } from "react";
import { Check, Crown } from "lucide-react";
import { getThemeGradient } from "@/lib/themeGradients";
import { labelFor } from "@/lib/i18n";

export default function ThemePreview({ themeName, coverUrl, selected, onSelect, isPremium }) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={onSelect}
      className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] select-none"
      style={{ background: getThemeGradient(themeName) }}
    >
      {!imgError && (
        <img
          src={coverUrl}
          alt={themeName}
          loading="lazy"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <span className="absolute bottom-3 left-0 right-0 px-3 text-center text-sm font-semibold text-white drop-shadow-md">
        {labelFor("themes", themeName)}
      </span>
      {isPremium && !selected && (
        <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 shadow-lg ring-2 ring-white">
          <Crown size={14} className="text-white" />
        </div>
      )}
      {selected && (
        <>
          <div className="absolute inset-0 rounded-2xl border-4 border-purple-500" />
          <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-purple-500 shadow-lg ring-2 ring-white">
            <Check size={16} className="text-white" strokeWidth={3} />
          </div>
        </>
      )}
    </button>
  );
}