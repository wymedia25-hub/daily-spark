import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ArrowLeft, Upload, FileSpreadsheet, Check, AlertCircle, Trash2 } from "lucide-react";

const ENTITY_OPTIONS = [
  {
    label: "Quotes",
    value: "Quote",
    fields: ["text", "author", "topic", "background_image_url", "set_number", "is_premium"],
    required: ["text", "topic"],
  },
  {
    label: "Content Sources",
    value: "ContentSource",
    fields: ["title", "author", "type", "topic", "cover_image", "source_url", "status", "summary", "total_cards"],
    required: ["title", "type", "topic"],
  },
  {
    label: "Cards",
    value: "Card",
    fields: ["source_id", "source_title", "source_author", "source_type", "topic", "card_number", "headline", "body"],
    required: ["source_id", "source_title", "headline", "body", "topic", "source_type"],
  },
];

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let current = "";
    let inQuotes = false;
    for (const char of lines[i]) {
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === "," && !inQuotes) { values.push(current.trim()); current = ""; }
      else { current += char; }
    }
    values.push(current.trim());
    if (values.some((v) => v)) {
      const row = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ""; });
      rows.push(row);
    }
  }
  return { headers, rows };
}

export default function AdminImport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [entity, setEntity] = useState(ENTITY_OPTIONS[0]);
  const [parsed, setParsed] = useState(null);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-neutral-500">Admin access required.</p>
      </div>
    );
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setError("");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { headers, rows } = parseCSV(ev.target.result);
      if (!rows.length) { setError("No data rows found in CSV."); setParsed(null); return; }
      const missing = entity.required.filter((f) => !headers.includes(f));
      if (missing.length) { setError(`Missing required columns: ${missing.join(", ")}`); setParsed(null); return; }
      setParsed({ headers, rows });
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!parsed) return;
    setImporting(true);
    setError("");
    setResult(null);
    try {
      const records = parsed.rows.map((row) => {
        const obj = {};
        entity.fields.forEach((f) => {
          if (row[f] !== undefined && row[f] !== "") {
            if (f === "set_number" || f === "card_number" || f === "total_cards") obj[f] = Number(row[f]);
            else if (f === "is_premium") obj[f] = row[f] === "true" || row[f] === "1";
            else obj[f] = row[f];
          }
        });
        return obj;
      });

      const BATCH = 50;
      let created = 0;
      for (let i = 0; i < records.length; i += BATCH) {
        const batch = records.slice(i, i + BATCH);
        await base44.entities[entity.value].bulkCreate(batch);
        created += batch.length;
      }
      setResult({ count: created });
      setParsed(null);
      setFileName("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err.message || "Import failed.");
    }
    setImporting(false);
  };

  const clearFile = () => {
    setParsed(null);
    setFileName("");
    setError("");
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <button onClick={() => navigate("/profile")} className="mb-5 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700">
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-neutral-900">Import Data</h1>
      <p className="mb-6 text-sm text-neutral-500">Upload a CSV file to bulk-add records.</p>

      {/* Entity selector */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Import into</label>
        <div className="flex gap-2">
          {ENTITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setEntity(opt); clearFile(); }}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                entity.value === opt.value
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expected columns */}
      <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <p className="mb-1 text-xs font-semibold text-neutral-500">Expected CSV columns</p>
        <p className="text-sm text-neutral-700">{entity.fields.join(", ")}</p>
        <p className="mt-1 text-xs text-neutral-400">Required: {entity.required.join(", ")}</p>
      </div>

      {/* Upload area */}
      <div
        onClick={() => fileRef.current?.click()}
        className="mb-4 flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-neutral-200 bg-white p-8 transition-colors hover:border-purple-300"
      >
        <Upload size={28} className="text-neutral-400" />
        <span className="text-sm font-medium text-neutral-600">
          {fileName || "Click to select a CSV file"}
        </span>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
      </div>

      {fileName && !parsed && !error && (
        <p className="mb-4 text-sm text-neutral-400">Parsing…</p>
      )}

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4">
          <Check size={16} className="text-green-600" />
          <p className="text-sm font-medium text-green-700">Successfully imported {result.count} {entity.label.toLowerCase()}!</p>
        </div>
      )}

      {/* Preview */}
      {parsed && (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-neutral-400" />
              <span className="text-sm font-medium text-neutral-700">{parsed.rows.length} rows ready</span>
            </div>
            <button onClick={clearFile} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-red-500">
              <Trash2 size={12} /> Clear
            </button>
          </div>
          <div className="max-h-60 overflow-auto rounded-xl border border-neutral-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-neutral-50">
                <tr>
                  {parsed.headers.filter((h) => entity.fields.includes(h)).map((h) => (
                    <th key={h} className="whitespace-nowrap border-b border-neutral-100 px-3 py-2 font-semibold text-neutral-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsed.rows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-b border-neutral-50">
                    {parsed.headers.filter((h) => entity.fields.includes(h)).map((h) => (
                      <td key={h} className="max-w-[200px] truncate px-3 py-2 text-neutral-700">{row[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {parsed.rows.length > 10 && (
              <p className="px-3 py-2 text-center text-xs text-neutral-400">+ {parsed.rows.length - 10} more rows</p>
            )}
          </div>

          <button
            onClick={handleImport}
            disabled={importing}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 py-3.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {importing ? "Importing…" : `Import ${parsed.rows.length} ${entity.label}`}
          </button>
        </div>
      )}
    </div>
  );
}