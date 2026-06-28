import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { calculateRecommendations, STRUGGLES, MOODS, QUOTE_STYLES } from "@/lib/recommendationEngine";
import { MAIN_GOALS, TOPIC_ICONS } from "@/lib/themes";
import { Sun, Heart, Rocket, Crown, Shield, Leaf, Mountain, Zap, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";

const ICON_MAP = { Sun, Heart, Rocket, Crown, Shield, Leaf, Mountain, Zap };
const STEPS = ["welcome", "goal", "struggles", "mood", "quote_style", "interests", "result"];

export default function Onboarding() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(0);
  const [topics, setTopics] = useState([]);
  const [prefs, setPrefs] = useState({
    display_name: "",
    main_goal: "",
    struggles: [],
    mood: "",
    quote_style: "",
    interests: [],
    preferred_theme: "Calm nature",
    reminder_time: "09:00",
  });
  const [recommendedTopics, setRecommendedTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [computed, setComputed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [following, setFollowing] = useState([]);

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
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (STEPS[stepIdx] === "result" && !computed && topics.length > 0) {
      const recommended = calculateRecommendations({
        main_goal: prefs.main_goal,
        struggles: prefs.struggles,
        mood: prefs.mood,
        quote_style: prefs.quote_style,
        interests: prefs.interests,
        focus_areas: prefs.focus_areas || [],
        relationship_status: prefs.relationship_status || "",
      }, topics);
      setRecommendedTopics(recommended);
      setSelectedTopics(recommended);
      setComputed(true);
    }
  }, [stepIdx, computed, topics]);

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-purple-500" />
      </div>
    );
  }

  const step = STEPS[stepIdx];

  const canProceed = () => {
    if (step === "welcome") return !!prefs.display_name.trim();
    if (step === "goal") return !!prefs.main_goal;
    if (step === "struggles") return prefs.struggles.length >= 1;
    if (step === "mood") return !!prefs.mood;
    if (step === "quote_style") return !!prefs.quote_style;
    if (step === "interests") return prefs.interests.length >= 1;
    if (step === "result") return selectedTopics.length >= 1;
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
      const data = {
        ...prefs,
        recommended_topics: recommendedTopics,
        focus_areas: selectedTopics,
        following_topics: following,
        onboarding_complete: true,
      };
      const existing = await base44.entities.UserPreferences.filter({ created_by_id: user.id }, "-created_date", 1);
      if (existing.length > 0) {
        await base44.entities.UserPreferences.update(existing[0].id, data);
      } else {
        await base44.entities.UserPreferences.create(data);
      }
      navigate("/");
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const toggleArrayItem = (field, value) => {
    setPrefs((p) => ({
      ...p,
      [field]: p[field].includes(value) ? p[field].filter((v) => v !== value) : [...p[field], value],
    }));
  };

  const toggleTopic = (name) => {
    setSelectedTopics((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const toggleFollowing = (name, e) => {
    e.stopPropagation();
    setFollowing((prev) => prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]);
  };

  const recommendedSet = new Set(recommendedTopics);
  const recommendedTopicObjects = recommendedTopics
    .map((name) => topics.find((t) => t.name === name))
    .filter(Boolean);
  const otherTopicObjects = topics.filter((t) => !recommendedSet.has(t.name));

  const OptionTile = ({ label, selected, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border px-5 py-4 text-left text-base font-medium transition-all ${
        selected ? "border-purple-500 bg-purple-50 text-purple-700" : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
      }`}
    >
      <div className="flex items-center justify-between">
        {label}
        {selected && <Check size={18} className="text-purple-500" />}
      </div>
    </button>
  );

  const Chip = ({ label, selected, onClick }) => (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
        selected ? "border-purple-500 bg-purple-500 text-white" : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
      }`}
    >
      {label}
    </button>
  );

  const followingSet = new Set(following);

  const TopicCard = ({ topic, selected, recommended, onClick }) => {
    const Icon = ICON_MAP[TOPIC_ICONS[topic.name]] || Sparkles;
    const isFollowing = followingSet.has(topic.name);
    return (
      <div
        onClick={onClick}
        className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl border px-5 py-4 text-left transition-all ${
          selected ? "border-purple-500 bg-purple-50" : "border-neutral-200 bg-white hover:border-neutral-300"
        }`}
      >
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${selected ? "bg-purple-500 text-white" : "bg-neutral-100 text-neutral-500"}`}>
          <Icon size={18} />
        </div>
        <span className="flex-1 text-base font-medium text-neutral-800">{topic.name}</span>
        {recommended && (
          <span className="flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-semibold text-purple-600">
            <Sparkles size={10} /> Chosen for you
          </span>
        )}
        {!recommended && selected && <Check size={18} className="text-purple-500" />}
        <button
          onClick={(e) => toggleFollowing(topic.name, e)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
        >
          <Heart size={16} className={isFollowing ? "fill-red-400 text-red-400" : "text-neutral-300"} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-5 py-8">
      <div className="mx-auto max-w-md">
        {/* Progress bar */}
        <div className="mb-8 flex items-center gap-3">
          {stepIdx > 0 && (
            <button
              onClick={() => setStepIdx(stepIdx - 1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-neutral-100"
            >
              <ArrowLeft size={18} className="text-neutral-600" />
            </button>
          )}
          <div className="h-1 flex-1 rounded-full bg-neutral-200">
            <div
              className="h-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Welcome + Name */}
        {step === "welcome" && (
          <div className="flex flex-col pt-8">
            <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles size={52} className="text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Welcome to Daily Spark</h1>
            <p className="mt-2 text-base text-neutral-500">Your daily dose of motivation, one quote at a time.</p>
            <h2 className="mb-3 mt-8 text-lg font-semibold text-neutral-900">What should we call you?</h2>
            <input
              type="text"
              value={prefs.display_name}
              onChange={(e) => setPrefs({ ...prefs, display_name: e.target.value })}
              placeholder="Your name"
              className="w-full rounded-2xl border border-neutral-200 px-5 py-4 text-base text-neutral-900 outline-none focus:border-purple-400"
              autoFocus
            />
          </div>
        )}

        {/* Step 2: Main Goal */}
        {step === "goal" && (
          <div>
            <h1 className="mb-1 text-2xl font-bold tracking-tight text-neutral-900">What's your main goal?</h1>
            <p className="mb-6 text-sm text-neutral-500">We'll tailor your daily quotes to help you get there.</p>
            <div className="space-y-2.5">
              {MAIN_GOALS.map((goal) => (
                <OptionTile
                  key={goal}
                  label={goal}
                  selected={prefs.main_goal === goal}
                  onClick={() => setPrefs({ ...prefs, main_goal: goal })}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Struggles */}
        {step === "struggles" && (
          <div>
            <h1 className="mb-1 text-2xl font-bold tracking-tight text-neutral-900">What are you struggling with?</h1>
            <p className="mb-6 text-sm text-neutral-500">Select all that apply. This helps us personalize your feed.</p>
            <div className="flex flex-wrap gap-2.5">
              {STRUGGLES.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  selected={prefs.struggles.includes(s)}
                  onClick={() => toggleArrayItem("struggles", s)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Mood */}
        {step === "mood" && (
          <div>
            <h1 className="mb-1 text-2xl font-bold tracking-tight text-neutral-900">How do you feel right now?</h1>
            <p className="mb-6 text-sm text-neutral-500">There's no wrong answer. We're here for you.</p>
            <div className="space-y-2.5">
              {MOODS.map((mood) => (
                <OptionTile
                  key={mood}
                  label={mood}
                  selected={prefs.mood === mood}
                  onClick={() => setPrefs({ ...prefs, mood })}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Quote Style */}
        {step === "quote_style" && (
          <div>
            <h1 className="mb-1 text-2xl font-bold tracking-tight text-neutral-900">What kind of quotes hit hardest for you?</h1>
            <p className="mb-6 text-sm text-neutral-500">We'll match the tone to what resonates.</p>
            <div className="space-y-2.5">
              {QUOTE_STYLES.map((style) => (
                <OptionTile
                  key={style}
                  label={style}
                  selected={prefs.quote_style === style}
                  onClick={() => setPrefs({ ...prefs, quote_style: style })}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Interests */}
        {step === "interests" && (
          <div>
            <h1 className="mb-1 text-2xl font-bold tracking-tight text-neutral-900">Pick what speaks to you</h1>
            <p className="mb-6 text-sm text-neutral-500">Select topics that resonate with you.</p>
            <div className="flex flex-wrap gap-2.5">
              {topics.map((topic) => (
                <Chip
                  key={topic.id}
                  label={topic.name}
                  selected={prefs.interests.includes(topic.name)}
                  onClick={() => toggleArrayItem("interests", topic.name)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Result */}
        {step === "result" && (
          <div>
            <h1 className="mb-1 text-2xl font-bold tracking-tight text-neutral-900">Based on your answers</h1>
            <p className="mb-6 text-sm text-neutral-500">
              Here's your personalized feed. Toggle any topic on or off.
            </p>

            <div className="mb-6 space-y-2.5">
              {recommendedTopicObjects.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  selected={selectedTopics.includes(topic.name)}
                  recommended={true}
                  onClick={() => toggleTopic(topic.name)}
                />
              ))}
            </div>

            {otherTopicObjects.length > 0 && (
              <>
                <h2 className="mb-3 text-sm font-bold text-neutral-400">More topics</h2>
                <div className="mb-6 space-y-2.5">
                  {otherTopicObjects.map((topic) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      selected={selectedTopics.includes(topic.name)}
                      recommended={false}
                      onClick={() => toggleTopic(topic.name)}
                    />
                  ))}
                </div>
              </>
            )}

            <button
              onClick={handleNext}
              disabled={!canProceed() || saving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 py-4 text-base font-semibold text-white transition-all disabled:opacity-40"
            >
              {saving ? "Setting up..." : "Start my journey"}
              {!saving && <ArrowRight size={18} />}
            </button>
          </div>
        )}

        {/* Continue button (hidden on result step which has its own Start button) */}
        {step !== "result" && (
          <button
            onClick={handleNext}
            disabled={!canProceed() || saving}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 py-4 text-base font-semibold text-white transition-all disabled:opacity-40"
          >
            Continue
            {!saving && <ArrowRight size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}