import { X, Copy, Link2, Twitter, Facebook, MessageCircle, Check } from "lucide-react";
import { useState } from "react";

export default function ShareSheet({ quote, open, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!open || !quote) return null;

  const text = `"${quote.text}"${quote.author ? ` — ${quote.author}` : ""}`;
  const url = window.location.origin;

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, "_blank");
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const options = [
    { label: "Copy text", icon: Copy, action: copyText },
    { label: "Copy link", icon: Link2, action: copyLink },
    { label: "Twitter / X", icon: Twitter, action: shareTwitter },
    { label: "Facebook", icon: Facebook, action: shareFacebook },
    { label: "WhatsApp", icon: MessageCircle, action: shareWhatsApp },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div className="mb-4 w-full max-w-md rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-neutral-900">Share quote</h3>
          <button onClick={onClose}><X size={18} className="text-neutral-400" /></button>
        </div>
        {copied && (
          <div className="mb-3 flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
            <Check size={15} /> Copied to clipboard!
          </div>
        )}
        <div className="space-y-1">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => { opt.action(); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <opt.icon size={18} className="text-neutral-500" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}