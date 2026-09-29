import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useId, useState, } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Phone, Mail, Lock, KeyRound, Eye, EyeOff, UserPlus, Loader2, } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { formatPhoneNumber } from "../../utils/phone";
import { VARIANTS } from "./authVariants";
import { ErrorBanner, InfoBanner } from "./AuthUI";
const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 },
    },
};
const INPUT = "block w-full h-11 border rounded-xl bg-surface-muted text-base sm:text-sm text-text placeholder:text-text-soft shadow-sm transition-all hover:bg-surface focus:bg-surface focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed";
const INPUT_OK = "border-border hover:border-border-strong focus:border-focus focus:ring-focus-soft";
const INPUT_BAD = "border-danger-border focus:border-danger focus:ring-danger-bg";
const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-md";
function ModernInput({ icon: Icon, label, hint, invalid, rightElement, className, ...props }) {
    const id = useId();
    const hintId = `${id}-hint`;
    return (_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { htmlFor: id, className: "block text-sm font-medium text-text-muted", children: label }), _jsxs("div", { className: "relative group", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-soft transition-colors group-focus-within:text-focus", children: _jsx(Icon, { size: 18 }) }), _jsx("input", { ...props, id: id, "aria-invalid": invalid || undefined, "aria-describedby": hint ? hintId : undefined, className: `${INPUT} ${invalid ? INPUT_BAD : INPUT_OK} pl-11 ${rightElement ? "pr-12" : "pr-3"} ${className ?? ""}` }), rightElement && (_jsx("div", { className: "absolute inset-y-0 right-0 flex items-center", children: rightElement }))] }), hint && (_jsx("p", { id: hintId, className: `text-xs ${invalid ? "text-danger" : "text-text-soft"}`, children: hint }))] }));
}
function EyeToggle({ shown, onToggle, label, }) {
    return (_jsx("button", { type: "button", onClick: onToggle, "aria-label": `${shown ? "Hide" : "Show"} ${label}`, "aria-pressed": shown, className: `w-12 h-full flex items-center justify-center text-text-soft hover:text-text-muted transition-colors ${FOCUS}`, children: shown ? _jsx(EyeOff, { size: 18 }) : _jsx(Eye, { size: 18 }) }));
}
export default function SignupForm({ variant, redirectTo, loginPath }) {
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [error, setError] = useState(null);
    const [info, setInfo] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const mismatch = confirm.length > 0 && password !== confirm;
    async function handleSubmit(e) {
        e.preventDefault();
        if (submitting)
            return;
        setError(null);
        setInfo(null);
        if (password.length < 6)
            return setError("Password must be at least 6 characters.");
        if (password !== confirm)
            return setError("Passwords do not match.");
        setSubmitting(true);
        const result = await signUp({
            email: email.trim(),
            password,
            fullName: fullName.trim(),
            role: variant,
            phone: phone ? formatPhoneNumber(phone) : undefined,
            inviteCode: variant === "admin" ? inviteCode.trim() : undefined,
        });
        setSubmitting(false);
        if (result.error)
            return setError(result.error);
        if (result.needsConfirmation)
            return setInfo("Check your email to confirm your account, then log in.");
        navigate(redirectTo);
    }
    return (_jsxs(motion.form, { variants: containerVariants, initial: "hidden", animate: "show", onSubmit: handleSubmit, className: "flex flex-col gap-4 w-full max-w-sm mx-auto", children: [_jsx(motion.div, { variants: itemVariants, children: _jsx(ModernInput, { icon: User, label: "Full name", autoComplete: "name", required: true, disabled: submitting, value: fullName, onChange: (e) => setFullName(e.target.value), placeholder: "Jane Doe" }) }), variant !== "admin" && (_jsx(motion.div, { variants: itemVariants, children: _jsx(ModernInput, { icon: Phone, type: "tel", inputMode: "tel", autoComplete: "tel", label: variant === "attendee"
                        ? "Phone number"
                        : "Phone number (optional)", required: variant === "attendee", disabled: submitting, placeholder: "e.g. 0711223344", hint: variant === "attendee"
                        ? "Used for SMS updates and the event assistant."
                        : undefined, value: phone, onChange: (e) => setPhone(e.target.value) }) })), _jsx(motion.div, { variants: itemVariants, children: _jsx(ModernInput, { icon: Mail, type: "email", inputMode: "email", autoComplete: "email", autoCapitalize: "none", spellCheck: false, label: "Email address", required: true, disabled: submitting, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com" }) }), _jsx(motion.div, { variants: itemVariants, children: _jsx(ModernInput, { icon: Lock, type: showPassword ? "text" : "password", autoComplete: "new-password", label: "Password", required: true, minLength: 6, disabled: submitting, hint: "At least 6 characters.", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Create a password", rightElement: _jsx(EyeToggle, { shown: showPassword, onToggle: () => setShowPassword((s) => !s), label: "password" }) }) }), _jsx(motion.div, { variants: itemVariants, children: _jsx(ModernInput, { icon: Lock, type: showConfirm ? "text" : "password", autoComplete: "new-password", label: "Confirm password", required: true, disabled: submitting, invalid: mismatch, hint: mismatch ? "Passwords do not match." : undefined, value: confirm, onChange: (e) => setConfirm(e.target.value), placeholder: "Repeat your password", rightElement: _jsx(EyeToggle, { shown: showConfirm, onToggle: () => setShowConfirm((s) => !s), label: "confirm password" }) }) }), variant === "admin" && (_jsx(motion.div, { variants: itemVariants, children: _jsx(ModernInput, { icon: KeyRound, label: "Admin invite code", autoComplete: "off", autoCapitalize: "none", spellCheck: false, required: true, disabled: submitting, hint: "Codes are single-use and issued by an existing admin.", value: inviteCode, onChange: (e) => setInviteCode(e.target.value) }) })), error && (_jsx(motion.div, { variants: itemVariants, children: _jsx(ErrorBanner, { message: error }) })), info && (_jsx(motion.div, { variants: itemVariants, children: _jsx(InfoBanner, { message: info }) })), _jsx(motion.button, { variants: itemVariants, whileHover: { scale: submitting ? 1 : 1.01 }, whileTap: { scale: submitting ? 1 : 0.98 }, type: "submit", disabled: submitting, className: `mt-2 flex items-center justify-center gap-2 h-12 px-4 rounded-xl text-sm font-semibold text-text-on-dark shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed ${VARIANTS[variant].btn}`, children: submitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { size: 16, className: "animate-spin" }), "Creating account\u2026"] })) : (_jsxs(_Fragment, { children: [_jsx(UserPlus, { size: 16 }), "Create account"] })) }), _jsx(motion.div, { variants: itemVariants, className: "mt-1 pt-5 border-t border-border text-center", children: _jsxs("p", { className: "text-sm text-text-muted", children: ["Already have an account?", " ", _jsx(Link, { to: loginPath, className: `font-semibold text-brand hover:text-brand-hover hover:underline ${FOCUS}`, children: "Log in" })] }) })] }));
}
