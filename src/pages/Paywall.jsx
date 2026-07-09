import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { PLANS } from "@/lib/stripe-config";
import { ArrowLeft, Check, Crown, Sparkles } from "lucide-react";

export default function Paywall() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) { setLoading(false); return; }
    loadPrefs();
  }, [isLoadingAuth, isAuthenticated]);

  const loadPrefs = async () => {
    try {
      const p = await base44.entities.UserPreferences.filter({ created_by_id: user.id }, "-created_date", 1);
      if (p[0]) setPrefs(p[0]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-purple-500" /></div>;
  }

  const features = t("paywall.features", { returnObjects: true });

  const handleSubscribe = async (plan) => {
    if (window.self !== window.top) {
      alert("Checkout works only from a published app. Please open the app in a new tab.");
      return;
    }
    setCheckoutLoading(plan.id);
    try {
      const result = await base44.functions.invoke("createCheckout", {
        priceId: plan.priceId,
        email: user?.email,
        user_preferences_id: prefs?.id,
      });
      if (result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
    setCheckoutLoading(null);
  };

  return (
    <div className="min-h-screen bg-onboarding-bg px-5 py-8">
      <div className="mx-auto max-w-md">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1 text-sm text-onboarding-cream-dim hover:text-onboarding-cream">
          <ArrowLeft size={16} /> {t("settings.back")}
        </button>

        <div className="mb-8 text-center">
          <div className="mb-4 flex h-20 w-20 mx-auto items-center justify-center rounded-3xl bg-onboarding-gold/15">
            <Crown size={40} className="text-onboarding-gold" />
          </div>
          <h1 className="font-display-serif text-3xl font-bold text-onboarding-cream">{t("paywall.title")}</h1>
          <p className="mt-2 text-onboarding-cream-dim">{t("paywall.subtitle")}</p>
        </div>

        <div className="mb-8 rounded-2xl border border-onboarding-cream/10 bg-onboarding-cream/5 p-5">
          <div className="space-y-3">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-3 text-onboarding-cream">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-onboarding-gold/20">
                  <Check size={14} className="text-onboarding-gold" />
                </div>
                <span className="text-sm font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => handleSubscribe(plan)}
              disabled={checkoutLoading !== null}
              className={`relative w-full overflow-hidden rounded-2xl p-5 text-left transition-all ${plan.highlighted ? "bg-onboarding-gold text-onboarding-bg ring-2 ring-onboarding-gold" : "border border-onboarding-cream/15 bg-onboarding-cream/5 text-onboarding-cream"}`}
            >
              {plan.highlighted && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-onboarding-bg px-3 py-1 text-[10px] font-bold text-onboarding-gold">
                  {t("paywall.bestValue")}
                </span>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{plan.price}</span>
                <span className="text-sm opacity-70">{plan.period}</span>
              </div>
              <p className="mt-1 text-sm opacity-80">{plan.name}{plan.savings ? ` · ${plan.savings}` : ""}</p>
              {checkoutLoading === plan.id && <p className="mt-2 text-xs opacity-60">Redirecting to checkout...</p>}
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-onboarding-cream-dim">
          {t("paywall.trialNote")}
        </p>
      </div>
    </div>
  );
}