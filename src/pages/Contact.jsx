import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function Contact() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "hello@dailyspark.app",
        subject: `Contact form message from ${name || "a visitor"}`,
        body: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      });
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again or email us directly.");
    }
    setSending(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-5 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-24">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
      >
        <ArrowLeft size={16} /> {t("settings.back")}
      </button>

      <h1 className="font-display-serif text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
        Contact Us
      </h1>

      <p className="mt-3 text-base text-neutral-500 dark:text-neutral-400">
        Questions, feedback, or just want to say hi? We'd love to hear from you.
      </p>

      <a
        href="mailto:hello@dailyspark.app"
        className="mt-6 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950">
          <Mail size={18} className="text-purple-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Email</p>
          <p className="text-sm text-neutral-400">hello@dailyspark.app</p>
        </div>
      </a>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none focus:border-purple-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none focus:border-purple-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none focus:border-purple-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            placeholder="Tell us what's on your mind..."
          />
        </div>

        {sent && (
          <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
            Thanks! Your message has been sent — we'll get back to you soon.
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3.5 text-sm font-semibold text-white transition-transform active:scale-95 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {sending ? "Sending..." : "Send Message"} <Send size={16} />
        </button>
      </form>
    </div>
  );
}