import { Gift } from "lucide-react";

export default function InviteFriends() {
  const handleInvite = () => {
    const url = window.location.origin;
    if (navigator.share) {
      navigator.share({
        title: "Join Knowi",
        text: "Learn something new every day with bite-sized summaries!",
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-neutral-900">Grow together</h3>
          <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
            Share Knowi with your friends and learn together
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
        Invite friends
      </button>
    </div>
  );
}