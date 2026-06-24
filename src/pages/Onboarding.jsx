import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import TopicSelector from "@/components/TopicSelector";
import StreakCommitment from "@/components/StreakCommitment";
import { ArrowRight, ArrowLeft, LogIn, Sparkles } from "lucide-react";

export default function Onboarding() {
  const { user, isAuthenticated, isLoadingAuth, checkUserAuth } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(user?.topics || []);
  const [streakGoal, setStreakGoal] = useState(7);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#FF6B35]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA] px-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#FF6B35]/10">
          <Sparkles size={36} className="text-[#FF6B35]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Welcome to Knowi</h1>
        <p className="mt-2 max-w-xs text-sm text-neutral-500">
          Sign in to personalize your feed with topics you love and start learning.
        </p>
        <button
          onClick={() => base44.auth.redirectToLogin(window.location.href)}
          className="mt-8 flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
        >
          <LogIn size={16} /> Sign in to continue
        </button>
      </div>
    );
  }

  const toggle = (topic) => {
    setSelected((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
    setError("");
  };

  const handleContinue = async () => {
    if (step === 1) {
      if (selected.length < 3) {
        setError("Please select at least 3 topics");
        return;
      }
      setStep(2);
      return;
    }
    setSaving(true);
    try {
      await base44.auth.updateMe({ topics: selected, streak_goal: streakGoal });
      await checkUserAuth();
      navigate("/");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-5 py-10">
      <div className="mx-auto max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8 flex gap-2">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-[#FF6B35]" : "bg-neutral-200"}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-[#FF6B35]" : "bg-neutral-200"}`} />
        </div>

        {step === 2 && (
          <button onClick={() => setStep(1)} className="mb-4 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700">
            <ArrowLeft size={16} /> Back
          </button>
        )}

        {step === 1 && (
          <>
            <div className="mb-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF6B35]/10">
                <Sparkles size={24} className="text-[#FF6B35]" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Pick your interests</h1>
              <p className="mt-2 text-sm text-neutral-500">
                Choose at least 3 topics and we'll curate a personalized feed of knowledge cards just for you.
              </p>
            </div>
            <TopicSelector selected={selected} onToggle={toggle} minRequired={3} />
          </>
        )}

        {step === 2 && <StreakCommitment selected={streakGoal} onSelect={setStreakGoal} />}

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <button
          onClick={handleContinue}
          disabled={(step === 1 && selected.length < 3) || saving}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B35] py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#e85a28] disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          {saving ? "Saving..." : step === 1 ? "Continue" : "Start learning"}
          {!saving && <ArrowRight size={16} />}
        </button>

        {step === 2 && (
          <button
            onClick={async () => {
              setSaving(true);
              await base44.auth.updateMe({ topics: selected });
              await checkUserAuth();
              navigate("/");
              setSaving(false);
            }}
            className="mt-3 w-full text-center text-sm text-neutral-400 hover:text-neutral-600"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}