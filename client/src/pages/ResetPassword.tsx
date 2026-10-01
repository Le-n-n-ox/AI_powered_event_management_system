import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-2xl font-bold text-text mb-1">Set a new password</h1>
        <p className="text-sm text-text-soft mb-6">Choose a new password for your account.</p>

        <div className="bg-surface-muted border border-border rounded-xl shadow-sm p-6">
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
              className="flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold text-text-on-dark bg-brand hover:bg-brand-hover disabled:opacity-60 transition-colors"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}