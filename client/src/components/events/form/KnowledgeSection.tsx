import { Sparkles, Trash2 } from "lucide-react";

// Keep in sync with MAX_DOC_CHARS in the backend.
const MAX_CHARS = 15000;

interface Props {
  data: { knowledgeText: string };
  updateData: (field: string, value: any) => void;
  inputCls: string;
}

export default function KnowledgeSection({
  data,
  updateData,
  inputCls,
}: Props) {
  const text = data.knowledgeText ?? "";
  const overLimit = text.length > MAX_CHARS;

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-sm p-6">
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          <h2 className="text-xl font-semibold text-text flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand" />
            AI Assistant Knowledge
          </h2>
          <p className="text-sm text-text-soft mt-1">
            Filled in automatically by Magic Auto-Fill above. Edit it freely, or
            type directly: anything attendees might text the help desk about
            (FAQs, parking, Wi-Fi, rules, dress code). The assistant answers
            only from this and the fields above.
          </p>
        </div>

        {text && (
          <button
            type="button"
            onClick={() => updateData("knowledgeText", "")}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-text-muted bg-surface border border-border rounded-lg hover:bg-surface-muted shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      <textarea
        rows={9}
        value={text}
        onChange={(e) => updateData("knowledgeText", e.target.value)}
        placeholder={
          "e.g.\nParking: free at the west gate, 200 spaces.\nWi-Fi: network EventGuest, password HackTheFuture.\nDress code: smart casual.\nLunch is vegetarian-friendly; tell staff about allergies."
        }
        className={`${inputCls} w-full mt-4 font-mono`}
      />

      <div className="flex justify-between items-center mt-2 text-xs">
        <span className="text-text-soft">
          Raw text context for the SMS Help Desk AI.
        </span>
        <span
          className={overLimit ? "text-danger font-medium" : "text-text-soft"}
        >
          {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}{" "}
          characters
        </span>
      </div>

      {overLimit && (
        <p className="text-xs text-danger mt-1">
          Only the first {MAX_CHARS.toLocaleString()} characters will be used by
          the assistant. Trim the rest.
        </p>
      )}
    </div>
  );
}
