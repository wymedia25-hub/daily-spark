import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { THEMES, MAIN_GOALS, GENDER_OPTIONS, AGE_RANGES, RELATIONSHIP_OPTIONS, BELIEF_OPTIONS } from "@/lib/themes";
import { Sun, Heart, Rocket, Crown, Shield, Leaf, Mountain, Zap, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";

const TOPIC_ICON_MAP = { Sun, Heart, Rocket, Crown, Shield, Leaf, Mountain, Zap };

const STEPS = ["welcome", "goal", "focus", "gender", "age", "relationship", "beliefs", "theme", "name", "time"];

export default function Onboarding() {
  const { user, isAuthenticated, isLoadingAuth, checkUserAuth } = useAuth();
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(0);
  const [topics, setTopics] = useState([]);
  const [prefs, setPrefs] = useState({
    main_goal: "", focus_areas: [], gender_identity: "", age_range: "",
    relationship_status: "", beliefs: "", preferred_theme: "Calm nature",
    display_name: "", reminder_time: "09:00",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    loadTopics();
  }, [isLoadingAuth, isAuthenticated]);

  const loadTopics = async () => {
    try {
      const t = await base44.entities.Topic.list(50);
      setTopics(t.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (err) { console.error(err); }
  };

  if (isLoadingAuth) {
    return <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-purple-500" /></div>;
  }

  const step = STEPS[stepIdx];
  const canProceed = () => {
    if (step === "goal") return !!prefs.main_goal;
    if (step === "focus") return prefs.focus_areas.length >= 1;
    if (step === "theme") return !!prefs.preferred_theme;
    if (step === "name") return !!prefs.display_name.trim();
    return true;
  };

  const handleNext = () => {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      handleSave();
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const existing = await base44.entities.UserPreferences.filter({ created_by_id: user.id }, "-created_date", 1);
      if (existing.length > 0) {
        await base44.entities.UserPreferences.update(existing[0].id, { ...prefs, onboarding_complete: true });
      } else {
        await base44.entities.UserPreferences.create({ ...prefs, onboarding_complete: true });
      }
      navigate("/");
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const toggleFocus = (topicName) => {
    setPrefs((p) => ({
      ...p,
      focus_areas: p.focus_areas.includes(topicName)
        ? p.focus_areas.filter((t) => t !== topicName)
        : [...p.focus_areas, topicName],
    }));
  };

  const Illustration = ({ icon: Icon, gradient }) => (
    <div className={`mb-8 flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br ${gradient}`}>
      <Icon size={56} className="text-white" strokeWidth={1.5} />
    </div>
  );

  const OptionTile = ({ label, selected, onClick }) => (
    <button onClick={onClick} className={`w-full rounded-2xl border px-5 py-4 text-left text-base font-medium transition-all ${selected ? "border-purple-500 bg-purple-50 text-purple-700" : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"}`}>
      <div className="flex items-center justify-between">
        {label}
        {selected && <Check size={18} className="text-purple-500" />}
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-5 py-8">
      <div className="mx-auto max-w-md">
        {stepIdx > 0 && (
          <div className="mb-6 flex items-center gap-3">
            <button onClick={() => setStepIdx(stepIdx - 1)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100">
              <ArrowLeft size={18} className="text-neutral-600" />
            </button>
            <div className="h-1 flex-1 rounded-full bg-neutral-200">
              <div className="h-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all" style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }} />
            </div>
          </div>
        )}

        {step === "welcome" && (
          <div className="flex flex-col items-center pt-12 text-center">
            <Illustration icon={Sparkles} gradient="from-purple-500 to-pink-500" />
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Welcome to Daily Spark</h1>
            <p className="mt-3 text-base text-neutral-500">Your daily dose of motivation, inspiration, and self-growth — one quote at a time.</p>
          </div>
        )}

        {step === "goal" && (
          <div>
            <h1 className="mb-1 text-2xl font-bold tracking-tight text-neutral-900">What's your main goal?</h1>
            <p className="mb-6 text-sm text-neutral-500">We'll tailor your daily quotes to help you get there.</p>
            <div className="space-y-2.5">
              {MAIN_GOALS.map((goal) => (
                <OptionTile key={goal} label={goal} selected={prefs.main_goal === goal} onClick={() => setPrefs({ ...prefs, main_goal: goal })} />
              ))}
            </div>
          </div>
        )}

        {step === "focus" && (
          <div>
            <h1 className="mb-1 text-2xl font-bold tracking-tight text-neutral-900">What do you want to focus on?</h1>
            <p className="mb-6 text-sm text-neutral-500">Select topics that resonate with you.</p>
            <div className="space-y-2.5">
              {topics.map((topic) => {
                const Icon = TOPIC_ICON_MAP[topic.icon] || Sparkles;
                const selected = prefs.focus_areas.includes(topic.name);
                return (
                  <button key={topic.id} onClick={() => toggleFocus(topic.name)} className={`flex w-full items-center gap-3 rounded-2xl border px-5 py-4 text-left transition-all ${selected ? "border-purple-500 bg-purple-50" : "border-neutral-200 bg-white hover:border-neutral-300"}`}>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${selected ? "bg-purple-500 text-white" : "bg-neutral-100 text-neutral-500"}`}>
                      <Icon size={18} />
                    </div>
                    <span className="flex-1 text-base font-medium text-neutral-800">{topic.name}</span>
                    {selected && <Check size={18} className="text-purple-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {["gender", "age", "relationship", "beliefs"].includes(step) && (
          <div>
            <h1 className="mb-1 text-2xl font-bold tracking-tight text-neutral-900">
              {step === "gender" ? "What's your gender identity?" : step === "age" ? "How old are you?" : step === "relationship" ? "Relationship status?" : "What are your beliefs?"}
            </h1>
            <p className="mb-6 text-sm text-neutral-500">This helps us personalize content. You can skip this.</p>
            <div className="space-y-2.5">
              {(step === "gender" ? GENDER_OPTIONS : step === "age" ? AGE_RANGES : step === "relationship" ? RELATIONSHIP_OPTIONS : BELIEF_OPTIONS).map((opt) => (
                <OptionTile key={opt} label={opt} selected={prefs[step === "gender" ? "gender_identity" : step === "age" ? "age_range" : step === "relationship" ? "relationship_status" : "beliefs"] === opt} onClick={() => setPrefs({ ...prefs, [step === "gender" ? "gender_identity" : step === "age" ? "age_range" : step === "relationship" ? "relationship_status" : "beliefs"]: opt })} />
              ))}
            </div>
            <button onClick={handleNext} className="mt-4 text-sm font-medium text-neutral-400 hover:text-neutral-600">Skip this question</button>
          </div>
        )}

        {step === "theme" && (
          <div>
            <h1 className="mb-1 text-2xl font-bold tracking-tight text-neutral-900">Pick your vibe</h1>
            <p className="mb-6 text-sm text-neutral-500">Choose a background style for your quotes.</p>
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map((theme) => (
                <button key={theme.name} onClick={() => setPrefs({ ...prefs, preferred_theme: theme.name })} className={`overflow-hidden rounded-2xl border-2 transition-all ${prefs.preferred_theme === theme.name ? "border-purple-500" : "border-transparent"}`}>
                  <div className="h-24 w-full">
                    <img src={theme.backgrounds[0]} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="bg-white px-3 py-2 text-sm font-medium text-neutral-800">{theme.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "name" && (
          <div>
            <h1 className="mb-1 text-2xl font-bold tracking-tight text-neutral-900">What should we call you?</h1>
            <p className="mb-6 text-sm text-neutral-500">Your name makes the experience feel personal.</p>
            <input type="text" value={prefs.display_name} onChange={(e) => setPrefs({ ...prefs, display_name: e.target.value })} placeholder="Your name" className="w-full rounded-2xl border border-neutral-200 px-5 py-4 text-base text-neutral-900 outline-none focus:border-purple-400" />
          </div>
        )}

        {step === "time" && (
          <div>
            <h1 className="mb-1 text-2xl font-bold tracking-tight text-neutral-900">When do you want your daily spark?</h1>
            <p className="mb-6 text-sm text-neutral-500">We'll send you a reminder email at this time.</p>
            <input type="time" value={prefs.reminder_time} onChange={(e) => setPrefs({ ...prefs, reminder_time: e.target.value })} className="w-full rounded-2xl border border-neutral-200 px-5 py-4 text-base text-neutral-900 outline-none focus:border-purple-400" />
          </div>
        )}

        <button onClick={handleNext} disabled={!canProceed() || saving} className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 py-4 text-base font-semibold text-white transition-all disabled:opacity-40">
          {saving ? "Setting up..." : stepIdx === STEPS.length - 1 ? "Start my journey" : "Continue"}
          {!saving && <ArrowRight size={18} />}
        </button>
      </div>
    </div>
  );
}