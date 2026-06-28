import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ArrowLeft, User, Palette, Globe, LogOut, Share, Star, Heart, Languages } from "lucide-react";

export default function Settings() {
  const { user, isAuthenticated, isLoadingAuth, logout } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

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

  const startEdit = (field, label) => {
    setEditing({ field, label });
    setEditValue(prefs[field] || "");
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const updated = await base44.entities.UserPreferences.update(prefs.id, { [editing.field]: editValue });
      setPrefs(updated);
      setEditing(null);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const aboutYouFields = [
    { field: "display_name", label: "Name" },
    { field: "gender_identity", label: "Gender identity" },
    { field: "age_range", label: "Age" },
    { field: "relationship_status", label: "Relationship status" },
    { field: "beliefs", label: "Beliefs" },
  ];

  const handleShare = async () => {
    const url = window.location.origin;
    try {
      if (navigator.share) await navigator.share({ title: "Daily Spark", text: "Get daily motivation!", url });
      else await navigator.clipboard.writeText(url);
    } catch (e) {}
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <button onClick={() => navigate("/profile")} className="mb-5 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700">
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900">Settings</h1>

      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <User size={18} className="text-neutral-400" />
          <h2 className="text-sm font-bold text-neutral-900">About You</h2>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white">
          {aboutYouFields.map((f, i) => (
            <button key={f.field} onClick={() => startEdit(f.field, f.label)} className={`flex w-full items-center justify-between px-5 py-4 text-left ${i > 0 ? "border-t border-neutral-100" : ""}`}>
              <span className="text-sm text-neutral-500">{f.label}</span>
              <span className="text-sm font-medium text-neutral-900">{prefs?.[f.field] || "Not set"}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Palette size={18} className="text-neutral-400" />
          <h2 className="text-sm font-bold text-neutral-900">Make It Yours</h2>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white">
          <button className="flex w-full items-center justify-between px-5 py-4 text-left">
            <div className="flex items-center gap-2">
              <Languages size={16} className="text-neutral-400" />
              <span className="text-sm text-neutral-500">Language</span>
            </div>
            <span className="text-sm font-medium text-neutral-900">English</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Globe size={18} className="text-neutral-400" />
          <h2 className="text-sm font-bold text-neutral-900">Account</h2>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-neutral-500">Signed in as</span>
            <span className="text-sm font-medium text-neutral-900 truncate max-w-[180px]">{user?.email}</span>
          </div>
          <button onClick={() => logout()} className="flex w-full items-center gap-2 border-t border-neutral-100 px-5 py-4 text-left">
            <LogOut size={16} className="text-red-400" />
            <span className="text-sm font-medium text-red-500">Sign out</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Heart size={18} className="text-neutral-400" />
          <h2 className="text-sm font-bold text-neutral-900">Support Us</h2>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white">
          <button onClick={handleShare} className="flex w-full items-center gap-3 border-b border-neutral-100 px-5 py-4 text-left">
            <Share size={18} className="text-neutral-400" />
            <span className="text-sm text-neutral-700">Share Daily Spark</span>
          </button>
          <button className="flex w-full items-center gap-3 px-5 py-4 text-left">
            <Star size={18} className="text-neutral-400" />
            <span className="text-sm text-neutral-700">Leave a review</span>
          </button>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="w-full max-w-md rounded-t-2xl bg-white p-6 sm:rounded-2xl">
            <h3 className="mb-4 text-lg font-bold text-neutral-900">{editing.label}</h3>
            <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-purple-400" />
            <div className="mt-4 flex gap-2">
              <button onClick={saveEdit} disabled={saving} className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 py-3 text-sm font-semibold text-white disabled:opacity-40">{saving ? "Saving..." : "Save"}</button>
              <button onClick={() => setEditing(null)} className="rounded-xl border border-neutral-200 px-5 py-3 text-sm font-medium text-neutral-600">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}