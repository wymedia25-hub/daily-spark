export default function CollectionCard({ title, subtitle, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-44 h-48 shrink-0 rounded-2xl p-4 flex flex-col justify-end text-left shadow-sm hover:shadow-md transition-shadow"
      style={{ background: `linear-gradient(145deg, ${color}dd, ${color}88)` }}
    >
      <h3 className="text-sm font-bold text-white leading-snug">{title}</h3>
      <p className="mt-1 text-[11px] text-white/70">{subtitle}</p>
    </button>
  );
}