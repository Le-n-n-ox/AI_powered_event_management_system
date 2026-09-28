import { useState, useRef } from "react";
import { Sparkles, FileText, Loader2, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      // ⚠️ Replace this block with your actual API call to your backend/Gemini
      // const formData = new FormData();
      // formData.append("file", file);
      // const response = await fetch("/api/ai/parse-event", { method: "POST", body: formData });
      // const extractedData = await response.json();

      // --- SIMULATED AI DELAY FOR TESTING ---
      await new Promise((resolve) => setTimeout(resolve, 2500));
      
      const mockExtractedData = {
        name: "Nairobi Tech Summit 2026",
        description: "The premier technology conference in East Africa focusing on AI and Web3.",
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
    <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-1 border border-indigo-100 shadow-sm">
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2.5 rounded-lg text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              Magic Auto-Fill
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text text-xs uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-indigo-50">
                AI Powered
              </span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
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
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100/50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors disabled:opacity-50"
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
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }}
            className="px-5 pb-3 text-xs text-red-500"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}