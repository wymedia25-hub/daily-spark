import { Paintbrush, X } from "lucide-react";
import { THEMES } from "@/lib/themes";
import { useState } from "react";

export default function ThemeButton({ currentTheme, onBackgroundSelect }) {
  const [open, setOpen] = useState(false);

  const allBackgrounds = THEMES.flatMap((t) =>
    t.backgrounds.map((url) => ({ url, theme: t.name }))
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-transform active:scale-90"
        title="Choose background"
      >
        <Paintbrush size={18} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="mb-4 w-full max-w-md rounded-2xl bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">Choose background</h3>
              <button onClick={() => setOpen(false)}>
                <X size={18} className="text-neutral-500" />
              </button>
            </div>
            <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto">
              {allBackgrounds.map(({ url }) => (
                <button
                  key={url}
                  onClick={() => {
                    onBackgroundSelect(url);
                    setOpen(false);
                  }}
                  className="aspect-square overflow-hidden rounded-xl border-2 border-transparent hover:border-purple-400"
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}