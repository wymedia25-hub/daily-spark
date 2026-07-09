import { User } from "lucide-react";

export default function ScreenName({ value, onChange }) {
  return (
    <div>
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-onboarding-gold/15">
        <User size={28} className="text-onboarding-gold" strokeWidth={1.5} />
      </div>
      <h1 className="font-display-serif text-3xl font-bold text-onboarding-cream">
        What should we call you?
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-onboarding-cream-dim">
        Your name personalizes your daily experience.
      </p>
      <div className="mt-7">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your name"
          maxLength={40}
          autoFocus
          className="w-full rounded-2xl border border-onboarding-cream/15 bg-onboarding-cream/5 px-5 py-4 text-base font-medium text-onboarding-cream placeholder:text-onboarding-cream-dim/50 outline-none focus:border-onboarding-gold"
        />
      </div>
    </div>
  );
}