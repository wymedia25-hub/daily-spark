import { useState } from "react";
import { Star, X } from "lucide-react";

const FEEDBACK_TAGS = [
  "Easy to follow", "Relevant", "Hot topic", "Engaging",
  "Inspiring & motivating", "Practical", "Broadens knowledge", "New info"
];

export default function RatingModal({ source, onSubmit, onClose }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    onSubmit({ rating, feedback_tags: selectedTags });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="mx-6 w-full max-w-sm rounded-2xl bg-white p-8 text-center animate-scale-in">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <Star size={28} className="text-emerald-500" fill="currentColor" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">Thanks for your feedback!</h3>
          <p className="mt-1 text-sm text-neutral-400">We'll use it to improve recommendations</p>
          <button onClick={onClose} className="mt-6 w-full rounded-xl bg-[#FF6B35] py-3 text-sm font-semibold text-white">
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-white p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-neutral-900">How was this summary?</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600"><X size={20} /></button>
        </div>
        <p className="text-sm text-neutral-400 mb-4">Rate it to get better recommendations</p>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={36}
                className={star <= (hoverRating || rating) ? "text-amber-400" : "text-neutral-200"}
                fill={star <= (hoverRating || rating) ? "currentColor" : "none"}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <>
            <p className="text-sm font-semibold text-neutral-900 mb-3">
              {rating >= 4 ? "Thanks! Why did you like it?" : "How can we improve?"}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {FEEDBACK_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? "border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]"
                      : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          className="w-full rounded-xl bg-[#FF6B35] py-3 text-sm font-semibold text-white disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          Submit
        </button>
      </div>
    </div>
  );
}