import { useId, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { VARIANTS } from "./authVariants";
import type { AuthVariant } from "./authVariants";
import { ErrorBanner } from "./AuthUI";

interface Props {
  variant: AuthVariant;
  redirectTo: string;
  signupPath: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// text-base on mobile prevents iOS Safari zooming into the field on focus
const INPUT =
  "block w-full h-11 border border-border rounded-xl bg-surface-muted text-base sm:text-sm text-text placeholder:text-text-soft shadow-sm transition-all duration-200 hover:border-brand-border hover:bg-surface focus:bg-surface focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft disabled:opacity-60 disabled:cursor-not-allowed";

const ICON_WRAP =
  "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-soft transition-colors duration-200 group-focus-within:text-brand";

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-md";

export default function LoginForm({ variant, redirectTo, signupPath }: Props) {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const { error: authError } = await signIn(email.trim(), password, [
      variant,
    ]);
    setSubmitting(false);
    if (authError) return setError(authError);
    navigate(redirectTo);
  }

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="show"
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 w-full max-w-sm mx-auto"
    >
      <motion.div variants={itemVariants} className="space-y-1.5">
        <label
          htmlFor={emailId}
          className="block text-sm font-medium text-text-muted"
        >
          Email address
        </label>
        <div className="relative group">
          <div className={ICON_WRAP}>
            <Mail size={18} />
          </div>
          <input
            id={emailId}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            disabled={submitting}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${INPUT} pl-11 pr-3`}
            placeholder="you@example.com"
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-1.5">
        <label
          htmlFor={passwordId}
          className="block text-sm font-medium text-text-muted"
        >
          Password
        </label>
        <div className="relative group">
          <div className={ICON_WRAP}>
            <Lock size={18} />
          </div>
          <input
            id={passwordId}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            disabled={submitting}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${INPUT} pl-11 pr-12`}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className={`absolute inset-y-1 right-1 w-10 flex items-center justify-center rounded-lg text-text-soft hover:text-brand-strong hover:bg-brand-soft transition-colors duration-200 ${FOCUS}`}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants}>
          <ErrorBanner message={error} />
        </motion.div>
      )}

      <motion.button
        variants={itemVariants}
        whileHover={{ scale: submitting ? 1 : 1.02 }}
        whileTap={{ scale: submitting ? 1 : 0.97 }}
        type="submit"
        disabled={submitting}
        className={`group mt-1 flex items-center justify-center gap-2 h-12 px-4 rounded-xl text-sm font-semibold text-text-on-dark shadow-md shadow-shadow-brand/30 transition-all duration-200 hover:shadow-lg hover:shadow-shadow-brand/50 hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed ${VARIANTS[variant].btn}`}
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            Log in to {VARIANTS[variant].label.split(" ")[0]}
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </>
        )}
      </motion.button>

      <motion.div
        variants={itemVariants}
        className="mt-1 pt-5 border-t border-border flex flex-col gap-3 text-center"
      >
        <p className="text-sm text-text-muted">
          Don't have an account?{" "}
          <Link
            to={signupPath}
            className={`font-semibold text-brand-strong hover:text-tag-violet hover:underline ${FOCUS}`}
          >
            Sign up
          </Link>
        </p>
        <Link
          to="/login"
          className={`text-xs text-text-soft hover:text-brand-strong transition-colors ${FOCUS}`}
        >
          Wrong portal? Change account type
        </Link>
      </motion.div>
    </motion.form>
  );
}