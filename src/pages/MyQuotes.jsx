import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function MyQuotes() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [newText, setNewText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) { setLoading(false); return; }
    loadQuotes();
  }, [isLoadingAuth, isAuthenticated]);

  const loadQuotes = async () => {
    try {
      const q = await base44.entities.UserQuote.filter({ created_by_id: user.id }, "-created_date", 100);
      setQuotes(q);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!newText.trim()) return;
    setSaving(true);
    try {
      const created = await base44.entities.UserQuote.create({ text: newText.trim() });
      setQuotes((prev) => [created, ...prev]);
      setNewText("");
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.UserQuote.delete(id);
      setQuotes((prev) => prev.filter((q) => q.id !== id));
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-purple-500" /></div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <button onClick={() => navigate("/explore")} className="mb-5 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700">
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-neutral-900">Your Own Quotes</h1>

      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-4">
        <textarea value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Write your own motivational quote..." rows={3} className="w-full resize-none text-sm text-neutral-900 outline-none" />
        <button onClick={handleAdd} disabled={!newText.trim() || saving} className="mt-3 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
          <Plus size={16} /> {saving ? "Adding..." : "Add Quote"}
        </button>
      </div>

      {quotes.length === 0 ? (
        <p className="py-12 text-center text-sm text-neutral-400">No quotes yet. Add your first one above!</p>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <div key={q.id} className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
              <p className="flex-1 text-sm text-neutral-800">{q.text}</p>
              <button onClick={() => handleDelete(q.id)} className="shrink-0 text-neutral-300 hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}