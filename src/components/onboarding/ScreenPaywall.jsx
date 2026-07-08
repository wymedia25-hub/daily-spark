import { Check, Crown } from "lucide-react";
import { PLANS } from "@/lib/stripe-config";

const FEATURES = [
  "Unlimited daily quotes",
  "All premium themes & wallpapers",
  "Custom daily reminders",
  "No limits, no ads",
];

export default function ScreenPaywall() {
  const monthly = PLANS.find((p) => p.id === "monthly") || PLANS[0];

  return (
    <div>
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-onboarding-gold/15">
        <Crown size={40} className="text-onboarding-gold" strokeWidth={1.5} />
      </div>
      <h1 className="font-display-serif text-3xl font-bold leading-tight text-onboarding-cream">
        Unlock Daily Spark Premium
      </h1>
      <p className="mt-3 text-base leading-relaxed text-onboarding-cream-dim">
        Get everything you need to stay motivated every single day.
      </p>
      <div className="mt-7 space-y-3">
        {FEATURES.map((f) => (
          <div key={f} className="flex items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-onboarding-gold/20">
              <Check size={14} className="text-onboarding-gold" />
            </div>
            <span className="text-base text-onboarding-cream-dim">{f}</span>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-onboarding-gold/30 bg-onboarding-gold/10 p-5 text-center">
        <p className="font-display-serif text-2xl font-bold text-onboarding-cream">
          Start your 7-day free trial
        </p>
        <p className="mt-2 text-sm text-onboarding-cream-dim">
          Free for 7 days, then {monthly.price}{monthly.period} — cancel anytime.
        </p>
      </div>
    </div>
  );
}