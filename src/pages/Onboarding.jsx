import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { calculateRecommendations } from "@/lib/recommendationEngine";
import {
  saveOnboardingData as persistOnboarding,
  clearOnboardingData,
} from "@/lib/onboardingStorage";
import { PLANS } from "@/lib/stripe-config";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import ProgressBar from "@/components/onboarding/ProgressBar";
import ScreenHook from "@/components/onboarding/ScreenHook";
import ScreenName from "@/components/onboarding/ScreenName";
import ScreenGoal from "@/components/onboarding/ScreenGoal";
import ScreenMood from "@/components/onboarding/ScreenMood";
import ScreenStruggles from "@/components/onboarding/ScreenStruggles";
import ScreenQuoteStyle from "@/components/onboarding/ScreenQuoteStyle";
import ScreenInterests from "@/components/onboarding/ScreenInterests";
import ScreenTime from "@/components/onboarding/ScreenTime";
import ScreenStreak from "@/components/onboarding/ScreenStreak";
import ScreenPlan from "@/components/onboarding/ScreenPlan";
import ScreenPaywall from "@/components/onboarding/ScreenPaywall";

const STEPS = [
  "hook",
  "name",
  "goal",
  "mood",
  "struggles",
  "quote_style",
  "interests",
  "time",
  "streak",
  "plan",
  "paywall",
];

export default function Onboarding() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState({
    display_name: "",
    goal: "",
    mood: "",
    struggles: [],
    quote_style: "",
    interests: [],
    reminder_time: "06:00",
    streak_days: null,
    language_code: "en",
  });
  const [saving, setSaving] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("annual");
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    base44.entities.Topic.list(50).then(setTopics).catch(console.error);
  }, []);

  const handleSaveData = async () => {
    const data = {
      display_name: answers.display_name,
      main_goal: answers.goal,
      mood: answers.mood,
      struggles: answers.struggles,
      quote_style: answers.quote_style,
      interests: answers.interests,
      reminder_time: answers.reminder_time,
      streak_goal: answers.streak_days,
      language_code: answers.language_code || "en",
      onboarding_complete: true,
    };

    persistOnboarding(data);

    if (isAuthenticated && user) {
      setSaving(true);
      try {
        const recommended = calculateRecommendations(
          { main_goal: answers.goal, struggles: answers.struggles },
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

  const handleEnterApp = () => {
    navigate("/");
  };

  const handleStartTrial = async () => {
    if (window.self !== window.top) {
      alert("Checkout works only from a published app. Please open the app in a new tab.");
      return;
    }
    setCheckoutLoading(true);
    try {
      const plan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[0];
      const result = await base44.functions.invoke("createCheckout", {
        priceId: plan.priceId,
        email: user?.email,
      });
      if (result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
    setCheckoutLoading(false);
  };

  const step = STEPS[stepIdx];
  const showHeader = stepIdx > 0 && step !== "paywall";
  const goNext = () => setStepIdx(stepIdx + 1);

  const canContinue =
    (step === "name" && answers.display_name.trim().length > 0) ||
    (step === "goal" && answers.goal) ||
    (step === "mood" && answers.mood) ||
    (step === "struggles" && answers.struggles.length > 0) ||
    (step === "quote_style" && answers.quote_style) ||
    (step === "interests" && answers.interests.length >= 3) ||
    step === "time" ||
    (step === "streak" && answers.streak_days) ||
    step === "plan";

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-onboarding-bg px-7 pt-[calc(2rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex h-full w-full max-w-md flex-col">
        {showHeader && (
          <div className="mb-6 flex shrink-0 items-center gap-3">
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

        <div className="flex flex-1 flex-col justify-center overflow-y-auto">
          {step === "hook" && (
            <ScreenHook
              value={answers.language_code}
              onSelect={(code) => setAnswers({ ...answers, language_code: code })}
            />
          )}

          {step === "name" && (
            <ScreenName
              value={answers.display_name}
              onChange={(n) => setAnswers({ ...answers, display_name: n })}
            />
          )}

          {step === "goal" && (
            <ScreenGoal
              value={answers.goal}
              onSelect={(g) => setAnswers({ ...answers, goal: g })}
            />
          )}

          {step === "mood" && (
            <ScreenMood
              value={answers.mood}
              onSelect={(m) => setAnswers({ ...answers, mood: m })}
            />
          )}

          {step === "struggles" && (
            <ScreenStruggles
              values={answers.struggles}
              onToggle={(s) => setAnswers({ ...answers, struggles: s })}
            />
          )}

          {step === "quote_style" && (
            <ScreenQuoteStyle
              value={answers.quote_style}
              onSelect={(qs) => setAnswers({ ...answers, quote_style: qs })}
            />
          )}

          {step === "interests" && (
            <ScreenInterests
              values={answers.interests}
              onToggle={(i) => setAnswers({ ...answers, interests: i })}
            />
          )}

          {step === "time" && (
            <ScreenTime
              value={answers.reminder_time}
              onChange={(t) => setAnswers({ ...answers, reminder_time: t })}
            />
          )}

          {step === "streak" && (
            <ScreenStreak
              value={answers.streak_days}
              onSelect={(d) => setAnswers({ ...answers, streak_days: d })}
            />
          )}

          {step === "plan" && <ScreenPlan answers={answers} />}

          {step === "paywall" && (
            <ScreenPaywall
              selectedPlanId={selectedPlanId}
              onSelectPlan={setSelectedPlanId}
            />
          )}
        </div>

        <div className="shrink-0">
          {step === "hook" && (
            <button
              onClick={goNext}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-onboarding-gold py-4 text-base font-semibold text-onboarding-bg transition-transform active:scale-95"
            >
              Continue <ArrowRight size={18} />
            </button>
          )}

          {step !== "hook" && step !== "paywall" && (
            <button
              onClick={goNext}
              disabled={!canContinue || saving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-onboarding-gold py-4 text-base font-semibold text-onboarding-bg transition-transform active:scale-95 disabled:opacity-50"
            >
              {saving ? t("onboarding.saving") : t("onboarding.continueBtn")} <ArrowRight size={18} />
            </button>
          )}

          {step === "paywall" && (
            <div>
              <button
                onClick={handleStartTrial}
                disabled={checkoutLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-onboarding-gold py-4 text-base font-semibold text-onboarding-bg transition-transform active:scale-95 disabled:opacity-50"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> {t("onboarding.redirecting")}
                  </>
                ) : (
                  t("onboarding.startTrial")
                )}
              </button>
              <button
                onClick={handleEnterApp}
                className="mt-3 w-full py-3 text-sm font-medium text-onboarding-cream-dim underline-offset-4 hover:underline"
              >
                {t("onboarding.maybeLater")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}