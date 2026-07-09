import { useState } from "react";
import { Heart, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getThemeGradient } from "@/lib/themeGradients";
import ShareModal from "@/components/ShareModal";

export default function QuoteCard({
  quote,
  index,
  total,
  isFavorited,
  onFavorite,
  backgroundUrl,
  theme,
  isLocked,
  paywallTitle,
  paywallSubtitle,
}) {
  const [showShare, setShowShare] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { t } = useTranslation();

  if (isLocked) {
    return (
      <div className="relative flex h-screen w-full shrink-0 snap-start snap-always items-center justify-center overflow-hidden bg-onboarding-bg px-8">
        <div className="text-center">
          <p className="font-display-serif text-2xl font-bold leading-tight text-onboarding-cream">
            {paywallTitle || t("paywall.dailyLimit")}
          </p>
          <p className="mt-3 text-onboarding-cream-dim">
            {paywallSubtitle || t("paywall.unlockAllDesc")}
          </p>
          <a
            href="/paywall"
            className="mt-8 inline-block rounded-xl bg-onboarding-gold px-8 py-3 text-sm font-bold text-onboarding-bg"
          >
            {t("paywall.unlockBtn")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full shrink-0 snap-start snap-always overflow-hidden" style={{ background: getThemeGradient(theme) }}>
      {!imgError && backgroundUrl && (
        <img src={backgroundUrl} alt="" onError={() => setImgError(true)} className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/65" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-8">
        <p
          className="select-text max-w-lg text-center text-2xl font-medium leading-relaxed text-white"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
        >
          {quote.text}
        </p>
        {quote.author && (
        <p className="select-text mt-5 text-sm font-light text-white/70">— {quote.author}</p>
        )}
      </div>

      <div className="absolute bottom-28 left-0 right-0 z-20 flex items-center justify-center gap-8">
        <button
          onClick={onFavorite}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-transform active:scale-90"
        >
          <Heart size={22} className={isFavorited ? "fill-red-400 text-red-400" : "text-white"} />
        </button>
        <button
          onClick={() => setShowShare(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-transform active:scale-90"
        >
          <Share2 size={20} className="text-white" />
        </button>
      </div>

      <ShareModal
        quote={quote}
        backgroundUrl={backgroundUrl}
        isOpen={showShare}
        onClose={() => setShowShare(false)}
      />
    </div>
  );
}