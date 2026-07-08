import { useState } from "react";
import { X, Download, Copy, Check, Instagram, Twitter, Facebook, Send, Share2, Link2 } from "lucide-react";
import { downloadQuoteImage } from "@/lib/shareQuoteImage";

export default function ShareModal({ quote, backgroundUrl, isOpen, onClose }) {
  const [busy, setBusy] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [igHint, setIgHint] = useState(false);

  if (!isOpen) return null;

  const shareText = `"${quote.text}"${quote.author ? ` — ${quote.author}` : ""}`;
  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const fullText = `${shareText}\n\n${appUrl}`;

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        return true;
      } catch {
        return false;
      }
    }
  };

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(appUrl);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyText = async () => {
    const ok = await copyToClipboard(fullText);
    if (ok) {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
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

  const handleInstagram = async () => {
    await handleDownload();
    setIgHint(true);
    setTimeout(() => setIgHint(false), 4000);
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(appUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const handleFacebook = () => {
    const url = encodeURIComponent(appUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(fullText);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleTelegram = () => {
    const url = encodeURIComponent(appUrl);
    const text = encodeURIComponent(shareText);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ text: fullText, url: appUrl });
    } catch (e) {
      /* user cancelled */
    }
  };

  const buttons = [
    { label: "X", icon: Twitter, onClick: handleTwitter, color: "text-neutral-900 dark:text-neutral-100" },
    { label: "Facebook", icon: Facebook, onClick: handleFacebook, color: "text-blue-600" },
    { label: "WhatsApp", icon: Send, onClick: handleWhatsApp, color: "text-green-600" },
    { label: "Telegram", icon: Send, onClick: handleTelegram, color: "text-sky-500" },
    { label: "Instagram", icon: Instagram, onClick: handleInstagram, color: "text-pink-500" },
    { label: "Download", icon: Download, onClick: handleDownload, color: "text-neutral-600 dark:text-neutral-300" },
    { label: copiedText ? "Copied!" : "Copy Text", icon: copiedText ? Check : Copy, onClick: handleCopyText, color: "text-neutral-600 dark:text-neutral-300" },
    { label: copiedLink ? "Copied!" : "Copy Link", icon: copiedLink ? Check : Link2, onClick: handleCopyLink, color: "text-neutral-600 dark:text-neutral-300" },
  ];

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    buttons.push({ label: "More…", icon: Share2, onClick: handleNativeShare, color: "text-neutral-600 dark:text-neutral-300" });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-t-3xl bg-white p-6 animate-scale-in sm:rounded-3xl dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Share quote</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 sm:grid-cols-4">
          {buttons.map((btn) => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              disabled={busy}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 transition-colors hover:bg-neutral-200 disabled:opacity-40 dark:bg-neutral-800 dark:hover:bg-neutral-700">
                <btn.icon size={22} className={btn.color} />
              </div>
              <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{btn.label}</span>
            </button>
          ))}
        </div>

        {igHint ? (
          <p className="mt-5 text-center text-xs text-green-600 dark:text-green-400">
            Image saved — open Instagram and post it.
          </p>
        ) : (
          <p className="mt-5 text-center text-xs text-neutral-400 dark:text-neutral-500">
            Tap a platform to share, or copy the link.
          </p>
        )}
      </div>
    </div>
  );
}