import { useRef, useState } from "react";
import { Sparkles, Upload, Trash2 } from "lucide-react";

const MAX_CHARS = 15000;
const MAX_FILE_BYTES = 500 * 1024;

interface Props {
  data: { knowledgeText: string };
  updateData: (field: string, value: any) => void;
  inputCls: string;
}

export default function KnowledgeSection({ data, updateData, inputCls }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const text = data.knowledgeText ?? "";
  const overLimit = text.length > MAX_CHARS;

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []) as File[];
    setFileError(null);

    let combined = text;
    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        setFileError(`${file.name} is too large (max 500 KB).`);
        continue;
      }
      const content = (await file.text()).trim();
      if (!content) continue;
      combined += `${combined ? "\n\n" : ""}--- ${file.name} ---\n${content}`;
    }

    updateData("knowledgeText", combined);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            AI Assistant Knowledge
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Anything attendees might text the help desk about: agenda details, FAQs, rules,
            parking, Wi-Fi, dress code. The assistant answers only from this and the fields above.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.csv,.json"
            multiple
            onChange={handleFiles}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100"
          >
            <Upload className="w-4 h-4" />
            Add file
          </button>
          {text && (
            <button
              type="button"
              onClick={() => updateData("knowledgeText", "")}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      <textarea
        rows={9}
        value={text}
        onChange={(e) => updateData("knowledgeText", e.target.value)}
        placeholder={"e.g.\nParking: free at the west gate, 200 spaces.\nWi-Fi: network EventGuest, password HackTheFuture.\nDress code: smart casual.\nLunch is vegetarian-friendly; tell staff about allergies."}
        className={`${inputCls} w-full mt-4 font-mono`}
      />

      <div className="flex justify-between items-center mt-2 text-xs">
        <span className="text-gray-400">
          Text files only (.txt, .md, .csv, .json). For PDFs, paste the text in.
        </span>
        <span className={overLimit ? "text-red-600 font-medium" : "text-gray-400"}>
          {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
        </span>
      </div>

      {overLimit && (
        <p className="text-xs text-red-600 mt-1">
          Only the first {MAX_CHARS.toLocaleString()} characters will be used by the assistant. Trim the rest.
        </p>
      )}
      {fileError && <p className="text-xs text-red-600 mt-1">{fileError}</p>}
    </div>
  );
}
