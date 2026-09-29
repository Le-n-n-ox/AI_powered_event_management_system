import { useState, useRef } from "react";
import { Sparkles, Loader2, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface AiAutofillProps {
  onDataExtracted: (data: any) => void;
}

export default function AiAutofill({ onDataExtracted }: AiAutofillProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      // --- SIMULATED AI DELAY FOR TESTING ---
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const mockExtractedData = {
        name: "Nairobi Tech Summit 2026",
        description:
          "The premier technology conference in East Africa focusing on AI and Web3.",
        venueName: "KICC",
        venueAddress: "Harambee Avenue, Nairobi",
        startDate: "2026-10-15T09:00",
        endDate: "2026-10-15T17:00",
        isPaid: true,
        ticketPrice: "2500",
        capacity: "500",
      };

      onDataExtracted(mockExtractedData);
    } catch (err) {
      setError("Failed to read document. Please try again.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mb-8 bg-gradient-to-r from-indigo-50/80 to-white/90 rounded-xl p-1 border border-slate-200 shadow-sm">
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
              Upload a poster, PDF, or agenda. We'll fill the form for you.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,image/*,.txt,.doc,.docx"
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