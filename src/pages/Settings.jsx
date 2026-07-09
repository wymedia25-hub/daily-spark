import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { labelFor } from "@/lib/i18n";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getDarkMode, setDarkMode } from "@/lib/useDarkMode";
import DrawerSelect from "@/components/DrawerSelect";
import StackHeader from "@/components/StackHeader";
import { User, Palette, Globe, LogOut, Share, Star, Heart, Languages, Check, Sun, Moon, Smartphone, Trash2, AlertTriangle } from "lucide-react";
import { MAIN_GOALS, GENDER_OPTIONS, AGE_RANGES, RELATIONSHIP_OPTIONS, BELIEF_OPTIONS } from "@/lib/themes";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "zh", label: "繁體中文 (Traditional Chinese)" },
  { value: "zh-CN", label: "简体中文 (Simplified Chinese)" },
  { value: "ja", label: "日本語 (Japanese)" },
  { value: "es", label: "Español (Spanish)" },
];

const APPEARANCE_OPTIONS = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Smartphone },
];

export default function Settings() {
  const { user, isAuthenticated, isLoadingAuth, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [appearance, setAppearance] = useState(getDarkMode());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

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

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-purple-500 dark:border-neutral-700 dark:border-t-purple-400" /></div>;
  }

  const startEdit = (field, label, options, labelGroup) => {
    if (options) {
      setEditing({ field, label, options, labelGroup });
      setEditValue(prefs?.[field] || "");
      setDrawerOpen(true);
    } else {
      setEditing({ field, label });
      setEditValue(prefs?.[field] || "");
    }
  };

  const handleDrawerSelect = async (val) => {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await base44.entities.UserPreferences.update(prefs.id, { [editing.field]: val });
      setPrefs(updated);
      if (editing.field === "language_code") i18n.changeLanguage(val);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } catch (err) { console.error(err); }
    setSaving(false);
    setEditing(null);
  };

  const saveTextEdit = async () => {
    setSaving(true);
    try {
      const updated = await base44.entities.UserPreferences.update(prefs.id, { [editing.field]: editValue });
      setPrefs(updated);
      setEditing(null);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleAppearance = (mode) => {
    setAppearance(mode);
    setDarkMode(mode);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await base44.functions.invoke("deleteAccount", {});
      await logout("/");
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  const aboutYouFields = [
    { field: "display_name", label: t("settings.name") },
    { field: "gender_identity", label: t("settings.genderIdentity"), options: GENDER_OPTIONS, labelGroup: "gender" },
    { field: "age_range", label: t("settings.age"), options: AGE_RANGES, labelGroup: "age" },
    { field: "relationship_status", label: t("settings.relationshipStatus"), options: RELATIONSHIP_OPTIONS, labelGroup: "relationship" },
    { field: "beliefs", label: t("settings.beliefs"), options: BELIEF_OPTIONS, labelGroup: "belief" },
    { field: "main_goal", label: t("settings.mainGoal"), options: MAIN_GOALS, labelGroup: "mainGoal" },
  ];

  const handleShare = async () => {
    const url = window.location.origin;
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        ok = true;
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const renderDrawerLabel = (val) => {
    if (!editing?.labelGroup) return editing?.options?.find(o => (typeof o === "string" ? o : o.value) === val)?.label || val;
    return labelFor(editing.labelGroup, val);
  };

  return (
    <div className="pb-24">
      <StackHeader title={t("settings.title")} />
      <div className="mx-auto max-w-2xl px-4 pt-2">

      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <User size={18} className="text-neutral-400 dark:text-neutral-500" />
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{t("settings.aboutYou")}</h2>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          {aboutYouFields.map((f, i) => (
            <button key={f.field} onClick={() => startEdit(f.field, f.label, f.options, f.labelGroup)} className={`flex w-full items-center justify-between px-5 py-4 text-left ${i > 0 ? "border-t border-neutral-100 dark:border-neutral-800" : ""}`}>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">{f.label}</span>
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{prefs?.[f.field] ? (f.labelGroup ? labelFor(f.labelGroup, prefs[f.field]) : prefs[f.field]) : t("settings.notSet")}</span>
            </button>
          ))}
          {savedFlash && (
            <div className="flex items-center gap-1.5 border-t border-neutral-100 px-5 py-3 text-green-600 dark:border-neutral-800 dark:text-green-400">
              <Check size={14} />
              <span className="text-xs font-medium">{t("settings.saved")}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Palette size={18} className="text-neutral-400 dark:text-neutral-500" />
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{t("settings.makeItYours")}</h2>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <button onClick={() => startEdit("language_code", t("settings.language"), LANGUAGE_OPTIONS)} className="flex w-full items-center justify-between px-5 py-4 text-left">
            <div className="flex items-center gap-2">
              <Languages size={16} className="text-neutral-400 dark:text-neutral-500" />
              <span className="text-sm text-neutral-500 dark:text-neutral-400">{t("settings.language")}</span>
            </div>
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{LANGUAGE_OPTIONS.find((o) => o.value === prefs?.language_code)?.label || "English"}</span>
          </button>
          <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 px-5 py-4">
            <div className="flex items-center gap-2">
              {appearance === "dark" ? <Moon size={16} className="text-neutral-400 dark:text-neutral-500" /> : appearance === "light" ? <Sun size={16} className="text-neutral-400 dark:text-neutral-500" /> : <Smartphone size={16} className="text-neutral-400 dark:text-neutral-500" />}
              <span className="text-sm text-neutral-500 dark:text-neutral-400">{t("settings.appearance")}</span>
            </div>
            <div className="flex gap-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 p-0.5">
              {APPEARANCE_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => handleAppearance(opt.value)} className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${appearance === opt.value ? "bg-white text-purple-600 shadow-sm dark:bg-neutral-600 dark:text-purple-300" : "text-neutral-400 dark:text-neutral-500"}`}>
                  <opt.icon size={15} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Globe size={18} className="text-neutral-400 dark:text-neutral-500" />
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{t("settings.account")}</h2>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">{t("settings.signedInAs")}</span>
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-[180px]">{user?.email}</span>
          </div>
          <button onClick={() => logout()} className="flex w-full items-center gap-2 border-t border-neutral-100 dark:border-neutral-800 px-5 py-4 text-left">
            <LogOut size={16} className="text-red-400" />
            <span className="text-sm font-medium text-red-500">{t("settings.signOut")}</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Heart size={18} className="text-neutral-400 dark:text-neutral-500" />
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{t("settings.supportUs")}</h2>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <button onClick={handleShare} className="flex w-full items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 px-5 py-4 text-left">
            <div className="flex items-center gap-3">
              <Share size={18} className="text-neutral-400 dark:text-neutral-500" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">{t("settings.shareApp")}</span>
            </div>
            {shareCopied && (
              <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                <Check size={12} /> Copied!
              </span>
            )}
          </button>
          <button onClick={() => window.open("mailto:hello@selfmade.app?subject=Review%20for%20Self%20Made", "_blank")} className="flex w-full items-center gap-3 px-5 py-4 text-left">
            <Star size={18} className="text-neutral-400 dark:text-neutral-500" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">{t("settings.leaveReview")}</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30">
          <button onClick={() => setShowDeleteConfirm(true)} className="flex w-full items-center gap-3 px-5 py-4 text-left">
            <Trash2 size={18} className="text-red-400" />
            <div>
              <span className="block text-sm font-medium text-red-500">{t("settings.deleteAccount")}</span>
              <span className="block text-xs text-red-400/70">{t("settings.deleteAccountDesc")}</span>
            </div>
          </button>
        </div>
      </div>
      </div>

      <DrawerSelect
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        value={editValue}
        options={editing?.options}
        onChange={handleDrawerSelect}
        label={editing?.label}
        includeBlank={editing?.field !== "language_code"}
        blankLabel={t("settings.notSet")}
        renderLabel={editing?.labelGroup ? (val) => labelFor(editing.labelGroup, val) : undefined}
      />

      {editing && !editing.options && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-neutral-900" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-neutral-100">{editing.label}</h3>
            <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-purple-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100" />
            <div className="mt-4 flex gap-2">
              <button onClick={saveTextEdit} disabled={saving} className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 py-3 text-sm font-semibold text-white disabled:opacity-40">{saving ? t("settings.saving") : t("settings.save")}</button>
              <button onClick={() => setEditing(null)} className="rounded-xl border border-neutral-200 px-5 py-3 text-sm font-medium text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">{t("settings.cancel")}</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => !deleting && setShowDeleteConfirm(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-neutral-900" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{t("settings.deleteAccount")}</h3>
            </div>
            <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">{t("settings.deleteAccountConfirm")}</p>
            <div className="flex gap-2">
              <button onClick={handleDeleteAccount} disabled={deleting} className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white disabled:opacity-40">{deleting ? t("settings.deleting") : t("settings.delete")}</button>
              <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting} className="rounded-xl border border-neutral-200 px-5 py-3 text-sm font-medium text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">{t("settings.cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}