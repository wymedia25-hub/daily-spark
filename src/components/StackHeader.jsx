import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { setNavDirection } from "@/lib/navigationState";

export default function StackHeader({ title, rightAction }) {
  const navigate = useNavigate();

  const handleBack = () => {
    setNavDirection("pop");
    navigate(-1);
  };

  return (
    <div className="sticky top-0 z-40 flex items-center gap-2 border-b border-neutral-100 bg-background/80 backdrop-blur-lg px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] dark:border-neutral-800">
      <button
        onClick={handleBack}
        className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 -ml-1"
      >
        <ChevronLeft size={22} className="text-foreground" />
      </button>
      {title && (
        <h1 className="flex-1 text-[17px] font-semibold tracking-tight text-foreground">
          {title}
        </h1>
      )}
      {rightAction && <div className="ml-auto">{rightAction}</div>}
    </div>
  );
}