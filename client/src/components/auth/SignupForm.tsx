import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { formatPhoneNumber } from "../../utils/phone";
import { VARIANTS } from "./authVariants";
import type { AuthVariant } from "./authVariants";
import { ErrorBanner, InfoBanner } from "./AuthUI";

interface Props {
  variant: AuthVariant;
  redirectTo: string;
  loginPath: string;
}

// Reusable Input Component to keep Signup code clean
const ModernInput = ({ icon: Icon, label, ...props }: any) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-[var(--color-text-muted)]">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-soft)] group-focus-within:text-[var(--color-focus)] transition-colors">
        <Icon size={18} />
      </div>
      <input
        {...props}
        className="block w-full pl-10 pr-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm shadow-sm text-[var(--color-text)] placeholder:text-[var(--color-text-soft)] focus:outline-none focus:border-[var(--color-focus)] focus:ring-1 focus:ring-[var(--color-focus-soft)] transition-all bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface)] focus:bg-[var(--color-surface)]"
      />
      {props.rightElement && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {props.rightElement}
        </div>
      )}
    </div>
    {props.hint && (
      <p className="text-xs text-[var(--color-text-soft)] mt-1">{props.hint}</p>
    )}
  </div>
);

export default function SignupForm({ variant, redirectTo, loginPath }: Props) {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  // States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setSubmitting(true);
    const result = await signUp({
      email,
      password,
      fullName,
      role: variant,
      phone: phone ? formatPhoneNumber(phone) : undefined,
      inviteCode: variant === "admin" ? inviteCode.trim() : undefined,
    });
    setSubmitting(false);

    if (result.error) return setError(result.error);
    if (result.needsConfirmation)
      return setInfo("Check your email to confirm your account, then log in.");
    navigate(redirectTo);
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="show"
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-sm mx-auto"
    >
      <motion.div variants={itemVariants}>
        <ModernInput
          icon={User}
          label="Full Name"
          required
          value={fullName}
          onChange={(e: any) => setFullName(e.target.value)}
          placeholder="Jane Doe"
        />
      </motion.div>

      {variant !== "admin" && (
        <motion.div variants={itemVariants}>
          <ModernInput
            icon={Phone}
            type="tel"
            label={
              variant === "attendee"
                ? "Phone Number"
                : "Phone Number (optional)"
            }
            required={variant === "attendee"}
            placeholder="e.g. 0711223344"
            hint={
              variant === "attendee"
                ? "Used for SMS updates and the event assistant."
                : undefined
            }
            value={phone}
            onChange={(e: any) => setPhone(e.target.value)}
          />
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <ModernInput
          icon={Mail}
          type="email"
          label="Email Address"
          required
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <ModernInput
          icon={Lock}
          type={showPassword ? "text" : "password"}
          label="Password"
          required
          minLength={6}
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          placeholder="••••••••"
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[var(--color-text-soft)] hover:text-[var(--color-text-muted)] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <ModernInput
          icon={Lock}
          type={showConfirm ? "text" : "password"}
          label="Confirm Password"
          required
          value={confirm}
          onChange={(e: any) => setConfirm(e.target.value)}
          placeholder="••••••••"
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-[var(--color-text-soft)] hover:text-[var(--color-text-muted)] transition-colors"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
      </motion.div>

      {variant === "admin" && (
        <motion.div variants={itemVariants}>
          <ModernInput
            icon={KeyRound}
            label="Admin Invite Code"
            required
            hint="Codes are single-use and issued by an existing admin."
            value={inviteCode}
            onChange={(e: any) => setInviteCode(e.target.value)}
          />
        </motion.div>
      )}

      {error && (
        <motion.div variants={itemVariants}>
          <ErrorBanner message={error} />
        </motion.div>
      )}
      {info && (
        <motion.div variants={itemVariants}>
          <InfoBanner message={info} />
        </motion.div>
      )}

      <motion.button
        variants={itemVariants}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="submit"
        disabled={submitting}
        className={`mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-[var(--color-text-on-dark)] shadow-md disabled:opacity-70 transition-all ${VARIANTS[variant].btn}`}
      >
        {submitting ? (
          <span className="animate-pulse">Creating account…</span>
        ) : (
          <>
            <UserPlus size={16} /> Create Account
          </>
        )}
      </motion.button>

      <motion.div
        variants={itemVariants}
        className="mt-4 pt-4 border-t border-[var(--color-border)] text-center"
      >
        <p className="text-sm text-[var(--color-text-muted)]">
          Already have an account?{" "}
          <Link
            to={loginPath}
            className="font-semibold text-[var(--color-text)] hover:underline transition-all"
          >
            Log in
          </Link>
        </p>
      </motion.div>
    </motion.form>
  );
}
