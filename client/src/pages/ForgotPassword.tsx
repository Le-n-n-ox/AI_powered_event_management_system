import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { Field, ErrorBanner, InfoBanner } from "../components/auth/AuthUI";

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await requestPasswordReset(email.trim());
    setSubmitting(false);
    if (error) return setError(error);
    setSent(true);
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid grid-fade opacity-60" />
        <div className="absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-brand/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        <h1 className="font-heading text-2xl font-bold text-text mb-1">Reset your password</h1>
        <p className="text-sm text-text-soft mb-6">
          Enter your email and we'll send you a reset link.
        </p>

        <div className="bg-surface border border-border rounded-2xl shadow-xl shadow-shadow-soft p-6">
          {sent ? (
            <InfoBanner message="If that email exists, a reset link is on its way. Check your inbox." />
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field
                label="Email"
                icon={Mail}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <ErrorBanner message={error} />
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold text-text-on-dark bg-linear-to-r from-brand to-tag-violet shadow-md shadow-shadow-brand hover:brightness-110 disabled:opacity-60 transition-all"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        <Link
          to="/login"
          className="flex items-center gap-1.5 text-sm text-text-soft hover:text-brand-strong mt-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </motion.div>
    </div>
  );
}