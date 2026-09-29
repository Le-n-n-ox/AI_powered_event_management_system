import { useState, useRef } from "react";
import { Sparkles, Loader2, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface AiAutofillProps {
  onDataExtracted: (data: any) => void;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export default function AiAutofill({ onDataExtracted }: AiAutofillProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setIsProcessing(true);
    setError(null);

    try {
      const tooLarge = files.find((file) => file.size > MAX_FILE_BYTES);
      if (tooLarge) {
        throw new Error(`${tooLarge.name} is too large (max 5 MB).`);
      }

      const formData = new FormData();
      for (const file of files) formData.append("files", file);

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/api/extract-event`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to process document.");
      }

      const body = await response.json();
      const { rawText, ...extractedFields } = body;
      onDataExtracted({
        ...extractedFields,
        knowledgeText: rawText || "",
      });
    } catch (err) {
      console.error("Auto-fill error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to read document. Please try again.",
      );
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mb-8 bg-linear-to-r from-indigo-50/80 to-white/90 rounded-xl p-1 border border-slate-200 shadow-sm">
      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 p-2.5 rounded-lg text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Magic Auto-Fill
              <span className="text-indigo-600 text-xs uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-indigo-50">
                AI Powered
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload a poster or agenda as a PDF, or a text file (.txt, .md, .csv, .json). We'll fill the form and knowledge base for you.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.txt,.md,.csv,.json"
            multiple
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100/50 border-slate-200 shadow-sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Reading Document...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 pb-3 text-xs text-red-600"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}