import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { TOPICS } from "@/lib/topics";
import {
  ArrowLeft,
  Loader2,
  Link2,
  Upload,
  FileText,
  BookOpen,
  Mic,
  Check,
  Pencil,
  Sparkles,
} from "lucide-react";

const TYPE_ICONS = { book: BookOpen, article: FileText, podcast: Mic };

export default function AdminAddContent() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("input"); // input | generating | review | publishing
  const [inputMode, setInputMode] = useState("url"); // url | file | text
  const [url, setUrl] = useState("");
  const [textContent, setTextContent] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [generated, setGenerated] = useState(null); // { source, cards }
  const [selectedTopic, setSelectedTopic] = useState("");
  const [editableCards, setEditableCards] = useState([]);
  const [editableSource, setEditableSource] = useState({});
  const [editingCardIdx, setEditingCardIdx] = useState(null);
  const [error, setError] = useState("");

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35]" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    navigate("/");
    return null;
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError("");
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setUploadedFileUrl(result.file_url);
    } catch (err) {
      setError("Failed to upload file. Please try again.");
    }
  };

  const generateSummary = async () => {
    setError("");
    if (inputMode === "url" && !url.trim()) {
      setError("Please enter a URL");
      return;
    }
    if (inputMode === "file" && !uploadedFileUrl) {
      setError("Please upload a file");
      return;
    }
    if (inputMode === "text" && textContent.trim().length < 100) {
      setError("Please paste at least 100 characters of content");
      return;
    }

    setStep("generating");

    try {
      let prompt = `You are an expert content summarizer for a microlearning app called Knowi. Analyze the following content and create a set of 6-10 bite-sized summary cards that capture the key insights and takeaways.\n\n`;

      let fileUrls = null;
      let useContext = false;

      if (inputMode === "url") {
        prompt += `Content URL: ${url}\n\nSummarize the content found at this URL.`;
        useContext = true;
      } else if (inputMode === "file") {
        prompt += `Analyze the attached file and create summary cards from its content.`;
        fileUrls = [uploadedFileUrl];
      } else {
        prompt += `Content to summarize:\n\n${textContent}`;
      }

      prompt += `\n\nFor each card:\n- headline: A punchy, attention-grabbing headline (max 12 words) that captures the core insight\n- body: A 2-4 sentence explanation that's clear, engaging, and stands alone as a complete thought (max 300 characters)\n\nReturn JSON with this structure:\n{\n  "source": {\n    "title": "Full title of the book, article, or podcast",\n    "author": "Author or creator name",\n    "type": "book" | "article" | "podcast",\n    "summary": "A compelling 1-2 sentence overview"\n  },\n  "cards": [{ "headline": "...", "body": "..." }]\n}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: useContext,
        model: useContext ? "gemini_3_flash" : undefined,
        file_urls: fileUrls,
        response_json_schema: {
          type: "object",
          properties: {
            source: {
              type: "object",
              properties: {
                title: { type: "string" },
                author: { type: "string" },
                type: { type: "string", enum: ["book", "article", "podcast"] },
                summary: { type: "string" },
              },
            },
            cards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  headline: { type: "string" },
                  body: { type: "string" },
                },
              },
            },
          },
        },
      });

      setGenerated(result);
      setEditableSource({
        title: result.source?.title || "",
        author: result.source?.author || "",
        type: result.source?.type || "article",
        summary: result.source?.summary || "",
      });
      setEditableCards(result.cards || []);
      setSelectedTopic(TOPICS[0]);
      setStep("review");
    } catch (err) {
      console.error("Generation failed:", err);
      setError("Failed to generate summary. Please try again.");
      setStep("input");
    }
  };

  const updateCard = (idx, field, value) => {
    setEditableCards((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c))
    );
  };

  const removeCard = (idx) => {
    setEditableCards((prev) => prev.filter((_, i) => i !== idx));
  };

  const publish = async () => {
    if (!selectedTopic) {
      setError("Please select a topic");
      return;
    }
    if (editableCards.length < 3) {
      setError("Need at least 3 cards to publish");
      return;
    }

    setStep("publishing");
    setError("");

    try {
      const source = await base44.entities.ContentSource.create({
        title: editableSource.title,
        author: editableSource.author,
        type: editableSource.type,
        topic: selectedTopic,
        cover_image: "",
        source_url: inputMode === "url" ? url : "",
        status: "published",
        summary: editableSource.summary,
        total_cards: editableCards.length,
      });

      const cards = editableCards.map((card, i) => ({
        source_id: source.id,
        source_title: source.title,
        source_author: source.author,
        source_type: source.type,
        topic: source.topic,
        card_number: i + 1,
        headline: card.headline,
        body: card.body,
      }));

      await base44.entities.Card.bulkCreate(cards);
      navigate("/admin");
    } catch (err) {
      console.error("Publish failed:", err);
      setError("Failed to publish. Please try again.");
      setStep("review");
    }
  };

  const inputModes = [
    { key: "url", label: "URL", icon: Link2 },
    { key: "file", label: "File", icon: Upload },
    { key: "text", label: "Text", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-4">
          <button
            onClick={() => navigate("/admin")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-neutral-900">Add Content</h1>
            <p className="text-xs text-neutral-400">
              {step === "input" && "Paste a URL or upload content"}
              {step === "generating" && "AI is generating cards..."}
              {step === "review" && "Review and publish"}
              {step === "publishing" && "Publishing..."}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Step: Input */}
        {step === "input" && (
          <div className="space-y-5">
            <div className="flex gap-2">
              {inputModes.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setInputMode(key)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all ${
                    inputMode === key
                      ? "border-[#FF6B35] bg-[#FF6B35]/5 text-[#FF6B35]"
                      : "border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            {inputMode === "url" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Content URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article..."
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/10"
                />
                <p className="mt-2 text-xs text-neutral-400">
                  Paste a link to an article, blog post, podcast transcript, or book summary
                </p>
              </div>
            )}

            {inputMode === "file" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Upload file
                </label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 py-10 transition-colors hover:border-[#FF6B35] hover:bg-[#FF6B35]/5">
                  <Upload size={28} className="text-neutral-300" />
                  <span className="mt-2 text-sm font-medium text-neutral-700">
                    {fileName || "Click to upload"}
                  </span>
                  <span className="mt-1 text-xs text-neutral-400">
                    PDF, TXT, or document file
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                </label>
                {uploadedFileUrl && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-emerald-500">
                    <Check size={14} /> File uploaded successfully
                  </p>
                )}
              </div>
            )}

            {inputMode === "text" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Paste content
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste the text content you want to summarize..."
                  rows={10}
                  className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/10"
                />
              </div>
            )}

            <button
              onClick={generateSummary}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B35] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#e85a28]"
            >
              <Sparkles size={16} />
              Generate Summary Cards
            </button>
          </div>
        )}

        {/* Step: Generating */}
        {step === "generating" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-neutral-200 border-t-[#FF6B35]" />
              <Sparkles size={20} className="absolute inset-0 m-auto text-[#FF6B35]" />
            </div>
            <h3 className="mt-6 text-base font-semibold text-neutral-900">
              Generating summary cards...
            </h3>
            <p className="mt-1 text-sm text-neutral-400">
              AI is analyzing the content and extracting key insights
            </p>
          </div>
        )}

        {/* Step: Review */}
        {step === "review" && (
          <div className="space-y-5">
            {/* Source metadata */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-sm font-semibold text-neutral-900">Source details</h2>
                <span className="ml-auto text-xs text-neutral-400">
                  {editableCards.length} cards generated
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500">Title</label>
                  <input
                    type="text"
                    value={editableSource.title}
                    onChange={(e) => setEditableSource({ ...editableSource, title: e.target.value })}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#FF6B35]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-500">Author</label>
                    <input
                      type="text"
                      value={editableSource.author}
                      onChange={(e) => setEditableSource({ ...editableSource, author: e.target.value })}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#FF6B35]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-500">Type</label>
                    <select
                      value={editableSource.type}
                      onChange={(e) => setEditableSource({ ...editableSource, type: e.target.value })}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#FF6B35]"
                    >
                      <option value="book">Book</option>
                      <option value="article">Article</option>
                      <option value="podcast">Podcast</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500">Topic</label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#FF6B35]"
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500">Summary</label>
                  <textarea
                    value={editableSource.summary}
                    onChange={(e) => setEditableSource({ ...editableSource, summary: e.target.value })}
                    rows={2}
                    className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#FF6B35]"
                  />
                </div>
              </div>
            </div>

            {/* Cards */}
            <div>
              <h2 className="mb-3 text-sm font-semibold text-neutral-900">Summary cards</h2>
              <div className="space-y-3">
                {editableCards.map((card, idx) => {
                  const TypeIcon = TYPE_ICONS[editableSource.type] || FileText;
                  return (
                    <div key={idx} className="rounded-2xl border border-neutral-200 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-100 text-xs font-semibold text-neutral-500">
                            {idx + 1}
                          </span>
                          <TypeIcon size={14} className="text-neutral-400" />
                        </div>
                        <button
                          onClick={() => removeCard(idx)}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        value={card.headline}
                        onChange={(e) => updateCard(idx, "headline", e.target.value)}
                        className="mb-2 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-semibold outline-none focus:border-[#FF6B35]"
                      />
                      <textarea
                        value={card.body}
                        onChange={(e) => updateCard(idx, "body", e.target.value)}
                        rows={3}
                        className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#FF6B35]"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={publish}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B35] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#e85a28]"
            >
              <Check size={16} />
              Publish to Feed
            </button>
          </div>
        )}

        {/* Step: Publishing */}
        {step === "publishing" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#FF6B35]" />
            <h3 className="mt-6 text-base font-semibold text-neutral-900">Publishing content...</h3>
            <p className="mt-1 text-sm text-neutral-400">Creating source and cards</p>
          </div>
        )}
      </div>
    </div>
  );
}