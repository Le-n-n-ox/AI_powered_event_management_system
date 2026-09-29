import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { Sparkles, Upload, Trash2 } from "lucide-react";
const MAX_CHARS = 15000;
const MAX_FILE_BYTES = 500 * 1024;
export default function KnowledgeSection({ data, updateData, inputCls }) {
    const fileRef = useRef(null);
    const [fileError, setFileError] = useState(null);
    const text = data.knowledgeText ?? "";
    const overLimit = text.length > MAX_CHARS;
    async function handleFiles(e) {
        const files = Array.from(e.target.files ?? []);
        setFileError(null);
        let combined = text;
        for (const file of files) {
            if (file.size > MAX_FILE_BYTES) {
                setFileError(`${file.name} is too large (max 500 KB).`);
                continue;
            }
            const content = (await file.text()).trim();
            if (!content)
                continue;
            combined += `${combined ? "\n\n" : ""}--- ${file.name} ---\n${content}`;
        }
        updateData("knowledgeText", combined);
        if (fileRef.current)
            fileRef.current.value = "";
    }
    return (_jsxs("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-6", children: [_jsxs("div", { className: "flex items-start justify-between gap-4 mb-1", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 flex items-center gap-2", children: [_jsx(Sparkles, { className: "w-5 h-5 text-indigo-600" }), "AI Assistant Knowledge"] }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Anything attendees might text the help desk about: agenda details, FAQs, rules, parking, Wi-Fi, dress code. The assistant answers only from this and the fields above." })] }), _jsxs("div", { className: "flex gap-2 shrink-0", children: [_jsx("input", { ref: fileRef, type: "file", accept: ".txt,.md,.csv,.json", multiple: true, onChange: handleFiles, className: "hidden" }), _jsxs("button", { type: "button", onClick: () => fileRef.current?.click(), className: "flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100", children: [_jsx(Upload, { className: "w-4 h-4" }), "Add file"] }), text && (_jsxs("button", { type: "button", onClick: () => updateData("knowledgeText", ""), className: "flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50", children: [_jsx(Trash2, { className: "w-4 h-4" }), "Clear"] }))] })] }), _jsx("textarea", { rows: 9, value: text, onChange: (e) => updateData("knowledgeText", e.target.value), placeholder: "e.g.\nParking: free at the west gate, 200 spaces.\nWi-Fi: network EventGuest, password HackTheFuture.\nDress code: smart casual.\nLunch is vegetarian-friendly; tell staff about allergies.", className: `${inputCls} w-full mt-4 font-mono` }), _jsxs("div", { className: "flex justify-between items-center mt-2 text-xs", children: [_jsx("span", { className: "text-gray-400", children: "Text files only (.txt, .md, .csv, .json). For PDFs, paste the text in." }), _jsxs("span", { className: overLimit ? "text-red-600 font-medium" : "text-gray-400", children: [text.length.toLocaleString(), " / ", MAX_CHARS.toLocaleString(), " characters"] })] }), overLimit && (_jsxs("p", { className: "text-xs text-red-600 mt-1", children: ["Only the first ", MAX_CHARS.toLocaleString(), " characters will be used by the assistant. Trim the rest."] })), fileError && _jsx("p", { className: "text-xs text-red-600 mt-1", children: fileError })] }));
}
