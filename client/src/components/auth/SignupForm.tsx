import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { User, Phone, Mail, Lock, KeyRound, Eye, EyeOff } from "lucide-react" // 1. Added Eye and EyeOff
import { useAuth } from "../../context/AuthContext"
import { formatPhoneNumber } from "../../utils/phone"
import { VARIANTS } from "./authVariants"
import type { AuthVariant } from "./authVariants"
import { Field, ErrorBanner, InfoBanner } from "./AuthUI"

interface Props {
  variant: AuthVariant
  redirectTo: string
  loginPath: string
}

export default function SignupForm({ variant, redirectTo, loginPath }: Props) {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  // 2. Added states for both password fields
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setSubmitting(true)
    const result = await signUp({
      email,
      password,
      fullName,
      role: variant,
      phone: phone ? formatPhoneNumber(phone) : undefined,
      inviteCode: variant === "admin" ? inviteCode.trim() : undefined,
    })
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }
    if (result.needsConfirmation) {
      setInfo("Check your email to confirm your account, then log in.")
      return
    }
    navigate(redirectTo)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field
        label="Full name"
        icon={User}
        required
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      {variant !== "admin" && (
        <Field
          label={variant === "attendee" ? "Phone number" : "Phone number (optional)"}
          icon={Phone}
          type="tel"
          required={variant === "attendee"}
          placeholder="e.g. 0711223344"
          hint={variant === "attendee" ? "Used for SMS updates and the event assistant." : undefined}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      )}

      <Field
        label="Email"
        icon={Mail}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      
      {/* 3. Wrapped Main Password field */}
      <div className="relative">
        <Field
          label="Password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 focus:outline-none"
          title={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* 4. Wrapped Confirm Password field */}
      <div className="relative">
        <Field
          label="Confirm password"
          icon={Lock}
          type={showConfirmPassword ? "text" : "password"}
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 focus:outline-none"
          title={showConfirmPassword ? "Hide password" : "Show password"}
        >
          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {variant === "admin" && (
        <Field
          label="Admin invite code"
          icon={KeyRound}
          required
          hint="Codes are single-use and issued by an existing admin."
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
        />
      )}

      <ErrorBanner message={error} />
      <InfoBanner message={info} />

      <button
        type="submit"
        disabled={submitting}
        className={`py-2.5 px-4 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-colors ${VARIANTS[variant].btn}`}
      >
        {submitting ? "Creating account…" : "Create Account"}
      </button>

      <p className="text-sm text-gray-500">
        Already have an account?{" "}
        <Link to={loginPath} className="font-medium text-gray-900 underline">
          Log in
        </Link>
      </p>
    </form>
  )
}