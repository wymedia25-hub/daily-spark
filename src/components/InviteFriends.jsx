import { useState } from "react";
import { Gift, Check } from "lucide-react";

export default function InviteFriends() {
  const [copied, setCopied] = useState(false);

  const handleInvite = async () => {
    const url = window.location.origin;
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        ok = true;
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-neutral-900">Grow together</h3>
          <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
            Share Daily Spark with your friends and stay motivated together
          </p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FF6B35]/10">
          <Gift size={22} className="text-[#FF6B35]" />
        </div>
      </div>
      <button
        onClick={handleInvite}
        className="mt-4 w-full rounded-xl bg-[#FF6B35] py-2.5 text-sm font-semibold text-white hover:bg-[#e85a28] transition-colors"
      >
        {copied ? "Link copied!" : "Invite friends"}
      </button>
      {copied && (
        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-green-600">
          <Check size={12} />
          Share the link with your friends
        </div>
      )}
    </div>
  );
}