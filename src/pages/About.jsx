import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function About() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl px-5 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-24">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
      >
        <ArrowLeft size={16} /> {t("settings.back")}
      </button>

      <h1 className="font-display-serif text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
        About Daily Spark
      </h1>

      <div className="mt-5 space-y-4 text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
        <p>
          Daily Spark is a motivational quotes app designed for founders,
          solopreneurs, and independent creators. We deliver bite-sized,
          original quotes that light a fire under you each morning — fuel for
          the relentless pursuit of financial freedom and personal growth.
        </p>
        <p>
          The app curates quotes across topics that matter most to independent
          builders: hustle, discipline, confidence, resilience, and
          self-mastery. Whether you are waking up at 5am to build your dream,
          pushing through a tough quarter, or simply need a spark of
          motivation to keep going, Daily Spark meets you where you are. An
          onboarding quiz tailors the experience to your goals and struggles,
          so every quote feels relevant to your journey.
        </p>
        <p>
          Every quote in Daily Spark is original or sourced from the public
          domain — we never use copyrighted material. Premium subscribers
          unlock exclusive themes, wallpapers, and an expanded library of
          reflections to deepen the daily ritual. Our mission is simple: one
          spark, every day, to keep you building.
        </p>
        <p>
          Daily Spark is built by a small team of indie makers who have lived
          the ups and downs of the founder life. We built this because we
          needed it ourselves — a calm, premium, distraction-free companion
          that delivers the right words at the right moment. We hope it helps
          you stay focused, stay motivated, and stay free.
        </p>
      </div>
    </div>
  );
}