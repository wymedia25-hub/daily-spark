import SourceCoverCard from "./SourceCoverCard";

export default function SourceCarousel({ title, subtitle, sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="mb-3">
        <h2 className="text-lg font-bold tracking-tight text-neutral-900">{title}</h2>
        {subtitle && <p className="text-xs text-neutral-400">{subtitle}</p>}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {sources.map((source) => (
          <SourceCoverCard key={source.id} source={source} />
        ))}
      </div>
    </section>
  );
}