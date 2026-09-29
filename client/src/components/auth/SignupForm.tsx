import {
  useId,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
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
  Loader2,
  type LucideIcon,
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const INPUT =
  "block w-full h-11 border rounded-xl bg-surface-muted text-base sm:text-sm text-text placeholder:text-text-soft shadow-sm transition-all hover:bg-surface focus:bg-surface focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed";
const INPUT_OK =
  "border-border hover:border-border-strong focus:border-focus focus:ring-focus-soft";
const INPUT_BAD =
  "border-danger-border focus:border-danger focus:ring-danger-bg";

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-md";

interface ModernInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  label: string;
  hint?: string;
  invalid?: boolean;
  rightElement?: ReactNode;
}

function ModernInput({
  icon: Icon,
  label,
  hint,
  invalid,
  rightElement,
  className,
  ...props
}: ModernInputProps) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-text-muted">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-soft transition-colors group-focus-within:text-focus">
          <Icon size={18} />
        </div>
        <input
          {...props}
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={hint ? hintId : undefined}
          className={`${INPUT} ${invalid ? INPUT_BAD : INPUT_OK} pl-11 ${
            rightElement ? "pr-12" : "pr-3"
          } ${className ?? ""}`}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {hint && (
        <p
          id={hintId}
          className={`text-xs ${invalid ? "text-danger" : "text-text-soft"}`}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

function EyeToggle({
  shown,
  onToggle,
  label,
}: {
  shown: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`${shown ? "Hide" : "Show"} ${label}`}
      aria-pressed={shown}
      className={`w-12 h-full flex items-center justify-center text-text-soft hover:text-text-muted transition-colors ${FOCUS}`}
    >
      {shown ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );
}

export default function SignupForm({ variant, redirectTo, loginPath }: Props) {
  const { signUp } = useAuth();
  const navigate = useNavigate();

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

  const mismatch = confirm.length > 0 && password !== confirm;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setInfo(null);
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

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

    if (result.error) return setError(result.error);
    if (result.needsConfirmation)
      return setInfo("Check your email to confirm your account, then log in.");
    navigate(redirectTo);
  }

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
          label="Full name"
          autoComplete="name"
          required
          disabled={submitting}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Doe"
        />
      </motion.div>

      {variant !== "admin" && (
        <motion.div variants={itemVariants}>
          <ModernInput
            icon={Phone}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            label={
              variant === "attendee"
                ? "Phone number"
                : "Phone number (optional)"
            }
            required={variant === "attendee"}
            disabled={submitting}
            placeholder="e.g. 0711223344"
            hint={
              variant === "attendee"
                ? "Used for SMS updates and the event assistant."
                : undefined
            }
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <ModernInput
          icon={Mail}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          label="Email address"
          required
          disabled={submitting}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <ModernInput
          icon={Lock}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          label="Password"
          required
          minLength={6}
          disabled={submitting}
          hint="At least 6 characters."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          rightElement={
            <EyeToggle
              shown={showPassword}
              onToggle={() => setShowPassword((s) => !s)}
              label="password"
            />
          }
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <ModernInput
          icon={Lock}
          type={showConfirm ? "text" : "password"}
          autoComplete="new-password"
          label="Confirm password"
          required
          disabled={submitting}
          invalid={mismatch}
          hint={mismatch ? "Passwords do not match." : undefined}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat your password"
          rightElement={
            <EyeToggle
              shown={showConfirm}
              onToggle={() => setShowConfirm((s) => !s)}
              label="confirm password"
            />
          }
        />
      </motion.div>

      {variant === "admin" && (
        <motion.div variants={itemVariants}>
          <ModernInput
            icon={KeyRound}
            label="Admin invite code"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            required
            disabled={submitting}
            hint="Codes are single-use and issued by an existing admin."
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
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
        whileHover={{ scale: submitting ? 1 : 1.01 }}
        whileTap={{ scale: submitting ? 1 : 0.98 }}
        type="submit"
        disabled={submitting}
        className={`mt-2 flex items-center justify-center gap-2 h-12 px-4 rounded-xl text-sm font-semibold text-text-on-dark shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed ${VARIANTS[variant].btn}`}
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Creating account…
          </>
        ) : (
          <>
            <UserPlus size={16} />
            Create account
          </>
        )}
      </motion.button>

      <motion.div
        variants={itemVariants}
        className="mt-1 pt-5 border-t border-border text-center"
      >
        <p className="text-sm text-text-muted">
          Already have an account?{" "}
          <Link
            to={loginPath}
            className={`font-semibold text-brand hover:text-brand-hover hover:underline ${FOCUS}`}
          >
            Log in
          </Link>
        </p>
      </motion.div>
    </motion.form>
  );
}