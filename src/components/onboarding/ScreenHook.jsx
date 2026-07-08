import { Sparkles } from "lucide-react";

export default function ScreenHook() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-onboarding-gold/15">
        <Sparkles size={40} className="text-onboarding-gold" strokeWidth={1.5} />
      </div>
      <h1 className="font-display-serif text-4xl font-bold leading-tight text-onboarding-cream">
        One spark of motivation every morning to build your FIRE life.
      </h1>
      <p className="mt-5 max-w-sm text-base leading-relaxed text-onboarding-cream-dim">
        Daily quotes to fuel your financial independence, discipline, and drive.
      </p>
    </div>
  );
}