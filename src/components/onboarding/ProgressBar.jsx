export default function ProgressBar({ current, total }) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="h-1 flex-1 rounded-full bg-onboarding-cream/15">
      <div
        className="h-1 rounded-full bg-onboarding-gold transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}