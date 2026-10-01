import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-2xl font-bold text-text mb-1">Reset your password</h1>
        <p className="text-sm text-text-soft mb-6">
          Enter your email and we'll send you a reset link.
        </p>

        <div className="bg-surface-muted border border-border rounded-xl shadow-sm p-6">
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
                className="flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold text-text-on-dark bg-brand hover:bg-brand-hover disabled:opacity-60 transition-colors"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        <Link
          to="/login"
          className="flex items-center gap-1.5 text-sm text-text-soft hover:text-text mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
}