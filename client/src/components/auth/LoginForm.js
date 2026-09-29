import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { VARIANTS } from "./authVariants";
import { ErrorBanner } from "./AuthUI";
const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 },
    },
};
// text-base on mobile prevents iOS Safari zooming into the field on focus
const INPUT = "block w-full h-11 border border-border rounded-xl bg-surface-muted text-base sm:text-sm text-text placeholder:text-text-soft shadow-sm transition-all hover:border-border-strong hover:bg-surface focus:bg-surface focus:outline-none focus:border-focus focus:ring-2 focus:ring-focus-soft disabled:opacity-60 disabled:cursor-not-allowed";
const ICON_WRAP = "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-soft transition-colors group-focus-within:text-focus";
const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-md";
export default function LoginForm({ variant, redirectTo, signupPath }) {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const emailId = useId();
    const passwordId = useId();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        if (submitting)
            return;
        setSubmitting(true);
        setError(null);
        const { error: authError } = await signIn(email.trim(), password, [
            variant,
        ]);
        setSubmitting(false);
        if (authError)
            return setError(authError);
        navigate(redirectTo);
    }
    return (_jsxs(motion.form, { variants: containerVariants, initial: "hidden", animate: "show", onSubmit: handleSubmit, className: "flex flex-col gap-5 w-full max-w-sm mx-auto", children: [_jsxs(motion.div, { variants: itemVariants, className: "space-y-1.5", children: [_jsx("label", { htmlFor: emailId, className: "block text-sm font-medium text-text-muted", children: "Email address" }), _jsxs("div", { className: "relative group", children: [_jsx("div", { className: ICON_WRAP, children: _jsx(Mail, { size: 18 }) }), _jsx("input", { id: emailId, type: "email", inputMode: "email", autoComplete: "email", autoCapitalize: "none", spellCheck: false, required: true, disabled: submitting, value: email, onChange: (e) => setEmail(e.target.value), className: `${INPUT} pl-11 pr-3`, placeholder: "you@example.com" })] })] }), _jsxs(motion.div, { variants: itemVariants, className: "space-y-1.5", children: [_jsx("label", { htmlFor: passwordId, className: "block text-sm font-medium text-text-muted", children: "Password" }), _jsxs("div", { className: "relative group", children: [_jsx("div", { className: ICON_WRAP, children: _jsx(Lock, { size: 18 }) }), _jsx("input", { id: passwordId, type: showPassword ? "text" : "password", autoComplete: "current-password", required: true, disabled: submitting, value: password, onChange: (e) => setPassword(e.target.value), className: `${INPUT} pl-11 pr-12`, placeholder: "Enter your password" }), _jsx("button", { type: "button", onClick: () => setShowPassword((s) => !s), "aria-label": showPassword ? "Hide password" : "Show password", "aria-pressed": showPassword, className: `absolute inset-y-0 right-0 w-12 flex items-center justify-center text-text-soft hover:text-text-muted transition-colors ${FOCUS}`, children: showPassword ? _jsx(EyeOff, { size: 18 }) : _jsx(Eye, { size: 18 }) })] })] }), error && (_jsx(motion.div, { variants: itemVariants, children: _jsx(ErrorBanner, { message: error }) })), _jsx(motion.button, { variants: itemVariants, whileHover: { scale: submitting ? 1 : 1.01 }, whileTap: { scale: submitting ? 1 : 0.98 }, type: "submit", disabled: submitting, className: `mt-1 flex items-center justify-center gap-2 h-12 px-4 rounded-xl text-sm font-semibold text-text-on-dark shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed ${VARIANTS[variant].btn}`, children: submitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { size: 16, className: "animate-spin" }), "Signing in\u2026"] })) : (_jsxs(_Fragment, { children: ["Log in to ", VARIANTS[variant].label.split(" ")[0], _jsx(ArrowRight, { size: 16 })] })) }), _jsxs(motion.div, { variants: itemVariants, className: "mt-1 pt-5 border-t border-border flex flex-col gap-3 text-center", children: [_jsxs("p", { className: "text-sm text-text-muted", children: ["Don't have an account?", " ", _jsx(Link, { to: signupPath, className: `font-semibold text-brand hover:text-brand-hover hover:underline ${FOCUS}`, children: "Sign up" })] }), _jsx(Link, { to: "/login", className: `text-xs text-text-soft hover:text-text transition-colors ${FOCUS}`, children: "Wrong portal? Change account type" })] })] }));
}
