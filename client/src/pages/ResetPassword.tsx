import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Loader2 } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { Field, ErrorBanner } from "../components/auth/AuthUI";

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setSubmitting(true);
    const { error } = await updatePassword(password);
    setSubmitting(false);

    if (error) return setError(error);
    navigate("/login");
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid grid-fade opacity-60" />
        <div className="absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-tag-violet/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        <h1 className="font-heading text-2xl font-bold text-text mb-1">Set a new password</h1>
        <p className="text-sm text-text-soft mb-6">Choose a new password for your account.</p>

        <div className="bg-surface border border-border rounded-2xl shadow-xl shadow-shadow-soft p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field
              label="New password"
              icon={Lock}
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Field
              label="Confirm new password"
              icon={Lock}
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <ErrorBanner message={error} />
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold text-text-on-dark bg-linear-to-r from-brand to-tag-violet shadow-md shadow-shadow-brand hover:brightness-110 disabled:opacity-60 transition-all"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update password"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}