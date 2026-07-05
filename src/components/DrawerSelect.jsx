import { Check } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

export default function DrawerSelect({ open, onOpenChange, value, options, onChange, label, includeBlank, blankLabel, renderLabel }) {
  const getDisplayLabel = (opt) => {
    const val = typeof opt === "string" ? opt : opt.value;
    const lbl = typeof opt === "string" ? opt : opt.label;
    return renderLabel ? renderLabel(val) : lbl;
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[70vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
        <DrawerHeader className="text-center">
          <DrawerTitle className="text-neutral-900 dark:text-neutral-100">{label}</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-1 px-4 pb-6">
          {includeBlank && (
            <button
              onClick={() => { onChange(""); onOpenChange(false); }}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm transition-colors ${
                !value ? "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
              }`}
            >
              <span>{blankLabel || "Not set"}</span>
              {!value && <Check size={18} />}
            </button>
          )}
          {options?.map((opt) => {
            const val = typeof opt === "string" ? opt : opt.value;
            const isSelected = val === value;
            return (
              <button
                key={val}
                onClick={() => { onChange(val); onOpenChange(false); }}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm transition-colors ${
                  isSelected ? "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                <span>{getDisplayLabel(opt)}</span>
                {isSelected && <Check size={18} />}
              </button>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}