import { Heart, Bookmark, Share2 } from "lucide-react";

export default function QuoteCard({
  quote,
  index,
  total,
  isLiked,
  isSaved,
  onLike,
  onSave,
  onShare,
  backgroundUrl,
  isLocked,
  paywallTitle,
  paywallSubtitle,
}) {
  if (isLocked) {
    return (
      <div className="relative flex h-screen w-full shrink-0 snap-start snap-always items-center justify-center overflow-hidden bg-gradient-to-br from-purple-600 to-pink-500 px-8">
        <div className="text-center text-white">
          <p className="text-2xl font-bold leading-tight">
            {paywallTitle || "You've reached your daily limit"}
          </p>
          <p className="mt-3 text-white/80">
            {paywallSubtitle || "Unlock unlimited quotes, all topics, wallpapers & more"}
          </p>
          <a
            href="/paywall"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-3 text-sm font-bold text-purple-600"
          >
            Unlock Premium
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full shrink-0 snap-start snap-always overflow-hidden">
      <img src={backgroundUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/65" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-8">
        <p
          className="max-w-lg text-center text-2xl font-medium leading-relaxed text-white"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
        >
          {quote.text}
        </p>
        {quote.author && (
          <p className="mt-5 text-sm font-light text-white/70">— {quote.author}</p>
        )}
      </div>

      <div className="absolute top-6 left-1/2 z-20 -translate-x-1/2">
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
          {index + 1} / {total}
        </span>
      </div>

      <div className="absolute bottom-28 left-0 right-0 z-20 flex items-center justify-center gap-6">
        <button
          onClick={onLike}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-transform active:scale-90"
        >
          <Heart size={22} className={isLiked ? "fill-red-400 text-red-400" : "text-white"} />
        </button>
        <button
          onClick={onSave}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-transform active:scale-90"
        >
          <Bookmark size={22} className={isSaved ? "fill-amber-400 text-amber-400" : "text-white"} />
        </button>
        <button
          onClick={onShare}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-transform active:scale-90"
        >
          <Share2 size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
}