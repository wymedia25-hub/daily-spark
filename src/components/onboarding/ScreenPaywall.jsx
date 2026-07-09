import { useState } from "react";
import { Check, Crown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PLANS } from "@/lib/stripe-config";

export default function ScreenPaywall({ selectedPlanId = "annual", onSelectPlan }) {
  const { t } = useTranslation();
  const [internalPlan, setInternalPlan] = useState(selectedPlanId);
  const features = t("onboarding.paywallFeatures", { returnObjects: true });

  const selectPlan = (planId) => {
    setInternalPlan(planId);
    if (onSelectPlan) onSelectPlan(planId);
  };

  const selectedPlan = PLANS.find((p) => p.id === internalPlan) || PLANS[0];

  return (
    <div>
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-onboarding-gold/15">
        <Crown size={40} className="text-onboarding-gold" strokeWidth={1.5} />
      </div>
      <h1 className="font-display-serif text-3xl font-bold leading-tight text-onboarding-cream">
        {t("onboarding.paywallTitle")}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-onboarding-cream-dim">
        {t("onboarding.paywallSubtitle")}
      </p>
      <div className="mt-7 space-y-3">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-onboarding-gold/20">
              <Check size={14} className="text-onboarding-gold" />
            </div>
            <span className="text-base text-onboarding-cream-dim">{f}</span>
          </div>
        ))}
      </div>

      <div className="mt-7 space-y-3">
        {PLANS.map((plan) => {
          const isSelected = internalPlan === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => selectPlan(plan.id)}
              className={`relative flex w-full items-center justify-between rounded-2xl border-2 px-5 py-4 text-left transition-all ${
                isSelected
                  ? "border-onboarding-gold bg-onboarding-gold/15"
                  : "border-onboarding-cream/15 hover:border-onboarding-cream/30"
              }`}
            >
              <div>
                <p className="text-lg font-bold text-onboarding-cream">
                  {plan.price}
                  <span className="text-sm font-normal text-onboarding-cream-dim">{plan.period}</span>
                </p>
                <p className="text-sm text-onboarding-cream-dim">
                  {plan.id === "monthly"
                    ? t("paywall.planMonthly")
                    : t("paywall.planAnnual")}
                  {plan.savings ? ` · ${t("paywall.planSavingsTrial")}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {plan.highlighted && (
                  <span className="rounded-full bg-onboarding-gold px-2.5 py-1 text-xs font-bold text-onboarding-bg">
                    {t("paywall.bestValue")}
                  </span>
                )}
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                    isSelected
                      ? "border-onboarding-gold bg-onboarding-gold"
                      : "border-onboarding-cream/30"
                  }`}
                >
                  {isSelected && <Check size={14} className="text-onboarding-bg" strokeWidth={3} />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-onboarding-gold/30 bg-onboarding-gold/10 p-5 text-center">
        <p className="font-display-serif text-2xl font-bold text-onboarding-cream">
          {t("onboarding.paywallTrialCta")}
        </p>
        <p className="mt-2 text-sm text-onboarding-cream-dim">
          {t("onboarding.paywallTrialDesc", {
            price: selectedPlan.price,
            period: selectedPlan.period,
          })}
        </p>
      </div>
    </div>
  );
}