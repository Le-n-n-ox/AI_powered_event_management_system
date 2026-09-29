import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useId, useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, Mail, Briefcase, Utensils, MessageCircle, TriangleAlert, Loader2, ShieldCheck, } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
// @ts-ignore The UI card module is JSX and is compiled by the application build.
 } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
const REFERRAL_OPTIONS = [
    "Social Media",
    "Friend or Colleague",
    "Email",
    "Event Website",
    "Search Engine",
    "Other",
];
const LABEL = "flex items-center gap-1.5 text-sm font-medium text-text-muted";
const SECTION_TITLE = "font-heading text-xs font-semibold text-text-soft uppercase tracking-wider border-b border-border pb-2";
const TEXTAREA = "flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-base sm:text-sm text-text shadow-sm transition-colors placeholder:text-text-soft hover:border-border-strong focus-visible:outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus-soft disabled:cursor-not-allowed disabled:opacity-60";
function formatPhoneNumber(phone) {
    const clean = phone.trim().replace(/\s+/g, "");
    if (clean.startsWith("0"))
        return "+254" + clean.substring(1);
    if (clean.startsWith("254"))
        return "+" + clean;
    return clean;
}
function Hint({ children }) {
    return (_jsx("span", { className: "text-text-soft font-normal text-xs ml-1", children: children }));
}
export default function RegistrationForm({ eventId, onSuccess }) {
    const uid = useId();
    const id = (name) => `${uid}-${name}`;
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [organization, setOrganization] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [dietaryNotes, setDietaryNotes] = useState("");
    const [referralSource, setReferralSource] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting)
            return;
        if (!agreedToTerms) {
            setError("Please agree to the terms before registering.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const { error: supabaseError } = await supabase.from("attendees").insert([
                {
                    event_id: eventId,
                    full_name: fullName.trim(),
                    phone_number: formatPhoneNumber(phoneNumber),
                    email: email.trim() || null,
                    organization: organization.trim() || null,
                    job_title: jobTitle.trim() || null,
                    dietary_notes: dietaryNotes.trim() || null,
                    referral_source: referralSource || null,
                },
            ]);
            if (supabaseError)
                throw supabaseError;
            onSuccess();
        }
        catch (err) {
            console.error("Registration error:", err);
            setError(err instanceof Error
                ? err.message
                : "Failed to register. Please try again.");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 }, children: _jsx(Card, { className: "bg-surface shadow-sm ring-border", children: _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "font-heading text-xl text-text", children: "Register for this event" }), _jsx(CardDescription, { className: "text-text-soft", children: "Fields marked with * are required." })] }), _jsxs(CardContent, { className: "space-y-6", children: [error && (_jsxs("div", { role: "alert", className: "flex items-start gap-2 p-3 text-sm text-danger bg-danger-bg border border-danger-border rounded-lg", children: [_jsx(TriangleAlert, { className: "w-4 h-4 mt-0.5 shrink-0" }), _jsx("span", { children: error })] })), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: SECTION_TITLE, children: "Your details" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsxs("label", { htmlFor: id("name"), className: LABEL, children: [_jsx(User, { className: "w-4 h-4 text-text-soft" }), " Full name *"] }), _jsx(Input, { id: id("name"), required: true, autoComplete: "name", disabled: isSubmitting, value: fullName, onChange: (e) => setFullName(e.target.value), placeholder: "John Doe" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsxs("label", { htmlFor: id("phone"), className: LABEL, children: [_jsx(Phone, { className: "w-4 h-4 text-text-soft" }), " Phone number *", _jsx(Hint, { children: "(for SMS updates)" })] }), _jsx(Input, { id: id("phone"), required: true, type: "tel", inputMode: "tel", autoComplete: "tel", disabled: isSubmitting, value: phoneNumber, onChange: (e) => setPhoneNumber(e.target.value), placeholder: "e.g. 0711223344" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsxs("label", { htmlFor: id("email"), className: LABEL, children: [_jsx(Mail, { className: "w-4 h-4 text-text-soft" }), " Email", _jsx(Hint, { children: "(optional)" })] }), _jsx(Input, { id: id("email"), type: "email", inputMode: "email", autoComplete: "email", autoCapitalize: "none", spellCheck: false, disabled: isSubmitting, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "john@example.com" })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: SECTION_TITLE, children: "Professional info (optional)" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsxs("label", { htmlFor: id("org"), className: LABEL, children: [_jsx(Briefcase, { className: "w-4 h-4 text-text-soft" }), " ", "Organization"] }), _jsx(Input, { id: id("org"), autoComplete: "organization", disabled: isSubmitting, value: organization, onChange: (e) => setOrganization(e.target.value) })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { htmlFor: id("job"), className: LABEL, children: "Job title" }), _jsx(Input, { id: id("job"), autoComplete: "organization-title", disabled: isSubmitting, value: jobTitle, onChange: (e) => setJobTitle(e.target.value) })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: SECTION_TITLE, children: "Additional info (optional)" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsxs("label", { htmlFor: id("diet"), className: LABEL, children: [_jsx(Utensils, { className: "w-4 h-4 text-text-soft" }), " Dietary or accessibility needs"] }), _jsx("textarea", { id: id("diet"), rows: 2, disabled: isSubmitting, className: TEXTAREA, value: dietaryNotes, onChange: (e) => setDietaryNotes(e.target.value), placeholder: "e.g. Vegetarian, wheelchair access needed" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsxs("label", { className: LABEL, children: [_jsx(MessageCircle, { className: "w-4 h-4 text-text-soft" }), " How did you hear about this event?"] }), _jsxs(Select, { value: referralSource, onValueChange: (value) => setReferralSource(value ?? ""), children: [_jsx(SelectTrigger, { className: "w-full", disabled: isSubmitting, children: _jsx(SelectValue, { placeholder: "Select an option" }) }), _jsx(SelectContent, { children: REFERRAL_OPTIONS.map((opt) => (_jsx(SelectItem, { value: opt, children: opt }, opt))) })] })] })] })] }), _jsxs("label", { htmlFor: id("terms"), className: "flex items-start gap-3 text-sm text-text-muted p-3 rounded-lg bg-surface-muted border border-border cursor-pointer", children: [_jsx("input", { id: id("terms"), type: "checkbox", checked: agreedToTerms, onChange: (e) => setAgreedToTerms(e.target.checked), className: "mt-0.5 w-5 h-5 shrink-0 rounded border-border-strong accent-brand cursor-pointer" }), _jsx("span", { className: "leading-snug", children: "I agree to receive SMS communication about this event and confirm the details above are accurate." })] })] }), _jsxs(CardFooter, { className: "flex-col items-stretch gap-3 border-border bg-surface-muted/50 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("p", { className: "flex items-center gap-1.5 text-xs text-text-soft", children: [_jsx(ShieldCheck, { className: "w-3.5 h-3.5 shrink-0" }), "Your details are shared only with the organizer."] }), _jsx(Button, { type: "submit", disabled: isSubmitting, className: "w-full sm:w-auto h-11 gap-2 shadow-md shadow-shadow-brand", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), "Registering\u2026"] })) : ("Secure my spot") })] })] }) }) }));
}
