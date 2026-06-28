import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ArrowLeft, Bell, Mail, Check } from "lucide-react";

export default function Reminders() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) { setLoading(false); return; }
    loadPrefs();
  }, [isLoadingAuth, isAuthenticated]);

  const loadPrefs = async () => {
    try {
      const p = await base44.entities.UserPreferences.filter({ created_by_id: user.id }, "-created_date", 1);
      if (p[0]) {
        setPrefs(p[0]);
      } else {
        const created = await base44.entities.UserPreferences.create({ display_name: user?.full_name || "" });
        setPrefs(created);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateTime = async (val) => {
    setSaving(true);
    try {
      setPrefs({ ...prefs, reminder_time: val });
      const updated = await base44.entities.UserPreferences.update(prefs.id, { reminder_time: val });
      setPrefs(updated);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-purple-500" /></div>;
  }

  const reminderEnabled = !!(prefs?.reminder_time);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <button onClick={() => navigate("/profile")} className="mb-5 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700">
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900">Reminders</h1>

      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Bell size={18} className="text-neutral-400" />
          <h2 className="text-sm font-bold text-neutral-900">Daily Reminder</h2>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <span className="text-sm text-neutral-500">Reminder time</span>
              <p className="text-xs text-neutral-400">We'll email you a quote at this hour</p>
            </div>
            <input
              type="time"
              value={prefs?.reminder_time || ""}
              onChange={(e) => updateTime(e.target.value)}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-900 outline-none focus:border-purple-400"
            />
          </div>
          <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-neutral-400" />
              <span className="text-sm text-neutral-500">Method</span>
            </div>
            <span className="text-sm font-medium text-neutral-900">Email</span>
          </div>
          <button
            onClick={() => reminderEnabled && updateTime("")}
            disabled={!reminderEnabled}
            className="flex w-full items-center justify-between border-t border-neutral-100 px-5 py-4 text-left"
          >
            <span className="text-sm text-neutral-500">Status</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${reminderEnabled ? "text-green-600" : "text-neutral-400"}`}>
                {reminderEnabled ? "On" : "Off"}
              </span>
              <div className={`relative h-6 w-11 rounded-full transition-colors ${reminderEnabled ? "bg-green-500" : "bg-neutral-200"}`}>
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${reminderEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </div>
          </button>
          {savedFlash && (
            <div className="flex items-center gap-1.5 border-t border-neutral-100 px-5 py-3 text-green-600">
              <Check size={14} />
              <span className="text-xs font-medium">Saved</span>
            </div>
          )}
        </div>
        {saving && <p className="mt-2 text-xs text-neutral-400">Saving...</p>}
      </div>

      <p className="text-xs text-neutral-400">Reminders are sent at the start of the hour you select. Times are in UTC.</p>
    </div>
  );
}