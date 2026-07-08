import { Sparkles, ArrowRight } from "lucide-react";

export default function ScreenHook({ onNext }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-7 text-center">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-onboarding-gold/15">
        <Sparkles size={40} className="text-onboarding-gold" strokeWidth={1.5} />
      </div>
      <h1 className="font-display-serif text-4xl font-bold leading-tight text-onboarding-cream">
        One spark of motivation every morning to build your FIRE life.
      </h1>
      <p className="mt-5 max-w-sm text-base leading-relaxed text-onboarding-cream-dim">
        Daily quotes to fuel your financial independence, discipline, and drive.
      </p>
      <button
        onClick={onNext}
        className="mt-12 flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-onboarding-gold py-4 text-base font-semibold text-onboarding-bg transition-transform active:scale-95"
      >
        Continue <ArrowRight size={18} />
      </button>
    </div>
  );
}