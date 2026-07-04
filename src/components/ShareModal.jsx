import { useState } from "react";
import { X, Share2, Download, MessageCircle, Copy, Check, Instagram } from "lucide-react";
import { shareQuoteAsImage, downloadQuoteImage } from "@/lib/shareQuoteImage";

export default function ShareModal({ quote, backgroundUrl, isOpen, onClose }) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `"${quote.text}"${quote.author ? ` — ${quote.author}` : ""}`;
  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  const handleNativeShare = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await shareQuoteAsImage(quote, backgroundUrl);
      onClose();
    } catch (e) {
      console.error(e);
    }
    setBusy(false);
  };

  const handleDownload = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await downloadQuoteImage(quote, backgroundUrl);
    } catch (e) {
      console.error(e);
    }
    setBusy(false);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${shareText}\n\n${appUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${appUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInstagram = () => {
    // Instagram doesn't support direct web image sharing — download first, then guide the user
    handleDownload();
  };

  const buttons = [
    { label: "WhatsApp", icon: MessageCircle, onClick: handleWhatsApp, color: "text-green-600" },
    { label: "Instagram", icon: Instagram, onClick: handleInstagram, color: "text-pink-500" },
    { label: copied ? "Copied!" : "Copy Text", icon: copied ? Check : Copy, onClick: handleCopy, color: "text-neutral-600" },
    { label: "Save Image", icon: Download, onClick: handleDownload, color: "text-neutral-600" },
    { label: "More Apps", icon: Share2, onClick: handleNativeShare, color: "text-neutral-600" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-t-3xl bg-white p-6 animate-scale-in sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-900">Share quote</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {buttons.map((btn) => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              disabled={busy}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 transition-colors hover:bg-neutral-200 disabled:opacity-40">
                <btn.icon size={22} className={btn.color} />
              </div>
              <span className="text-[11px] font-medium text-neutral-600">{btn.label}</span>
            </button>
          ))}
        </div>

        <p className="mt-5 text-center text-xs text-neutral-400">
          For Instagram stories, save the image first then upload it manually.
        </p>
      </div>
    </div>
  );
}