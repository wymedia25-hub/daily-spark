import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { calculateRecommendations } from "@/lib/recommendationEngine";
import {
  saveOnboardingData as persistOnboarding,
  clearOnboardingData,
  mapPainToStruggle,
} from "@/lib/onboardingStorage";
import { ArrowLeft } from "lucide-react";
import ProgressBar from "@/components/onboarding/ProgressBar";
import ScreenHook from "@/components/onboarding/ScreenHook";
import ScreenGoal from "@/components/onboarding/ScreenGoal";
import ScreenPain from "@/components/onboarding/ScreenPain";
import ScreenTime from "@/components/onboarding/ScreenTime";
import ScreenPlan from "@/components/onboarding/ScreenPlan";

const STEPS = ["hook", "goal", "pain", "time", "plan"];

export default function Onboarding() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState({
    goal: "",
    pain: "",
    reminder_time: "06:00",
  });
  const [saving, setSaving] = useState(false);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    base44.entities.Topic.list(50).then(setTopics).catch(console.error);
  }, []);

  const handleSaveData = async () => {
    const data = {
      main_goal: answers.goal,
      struggles: [mapPainToStruggle(answers.pain)],
      reminder_time: answers.reminder_time,
      language_code: "en",
      onboarding_complete: true,
    };

    persistOnboarding(data);

    if (isAuthenticated && user) {
      setSaving(true);
      try {
        const recommended = calculateRecommendations(
          { main_goal: answers.goal, struggles: [mapPainToStruggle(answers.pain)] },
          topics
        );
        const prefsData = {
          ...data,
          recommended_topics: recommended,
          focus_areas: recommended,
          following_topics: recommended,
        };
        const existing = await base44.entities.UserPreferences.filter(
          { created_by_id: user.id },
          "-created_date",
          1
        );
        if (existing.length > 0) {
          await base44.entities.UserPreferences.update(existing[0].id, prefsData);
        } else {
          await base44.entities.UserPreferences.create(prefsData);
        }
        clearOnboardingData();
      } catch (err) {
        console.error(err);
      }
      setSaving(false);
    }
  };

  useEffect(() => {
    if (STEPS[stepIdx] === "plan") {
      handleSaveData();
    }
  }, [stepIdx]);

  const handleBack = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  };

  const handleCreateAccount = () => {
    navigate("/register");
  };

  const handleEnterApp = () => {
    navigate("/");
  };

  const step = STEPS[stepIdx];

  return (
    <div className="min-h-screen bg-onboarding-bg px-5 py-8 pt-[calc(2rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-md">
        {stepIdx > 0 && (
          <div className="mb-8 flex items-center gap-3">
            {step !== "plan" && (
              <button
                onClick={handleBack}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-onboarding-cream/10"
              >
                <ArrowLeft size={18} className="text-onboarding-cream-dim" />
              </button>
            )}
            <ProgressBar current={stepIdx} total={STEPS.length} />
          </div>
        )}

        {step === "hook" && <ScreenHook onNext={() => setStepIdx(1)} />}

        {step === "goal" && (
          <ScreenGoal
            value={answers.goal}
            onSelect={(g) => {
              setAnswers({ ...answers, goal: g });
              setTimeout(() => setStepIdx(2), 250);
            }}
          />
        )}

        {step === "pain" && (
          <>
            <ScreenPain
              value={answers.pain}
              onSelect={(p) => setAnswers({ ...answers, pain: p })}
            />
            {answers.pain && (
              <button
                onClick={() => setStepIdx(3)}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-onboarding-gold py-4 text-base font-semibold text-onboarding-bg transition-transform active:scale-95"
              >
                Continue
              </button>
            )}
          </>
        )}

        {step === "time" && (
          <>
            <ScreenTime
              value={answers.reminder_time}
              onChange={(t) => setAnswers({ ...answers, reminder_time: t })}
            />
            <button
              onClick={() => setStepIdx(4)}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-onboarding-gold py-4 text-base font-semibold text-onboarding-bg transition-transform active:scale-95"
            >
              Continue
            </button>
          </>
        )}

        {step === "plan" && (
          <ScreenPlan
            answers={answers}
            isAuthenticated={isAuthenticated}
            saving={saving}
            onCreateAccount={handleCreateAccount}
            onEnterApp={handleEnterApp}
          />
        )}
      </div>
    </div>
  );
}