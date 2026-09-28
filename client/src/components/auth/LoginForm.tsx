import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff } from "lucide-react" // 1. Added Eye and EyeOff
import { useAuth } from "../../context/AuthContext"
import { VARIANTS } from "./authVariants"
import type { AuthVariant } from "./authVariants"
import { Field, ErrorBanner } from "./AuthUI"

interface Props {
  variant: AuthVariant
  redirectTo: string
  signupPath: string
}

export default function LoginForm({ variant, redirectTo, signupPath }: Props) {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false) // 2. Added state for password visibility
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    // Each portal only accepts its own account type
    const { error } = await signIn(email, password, [variant])

    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    navigate(redirectTo)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field
        label="Email"
        icon={Mail}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      
      {/* 3. Wrapped Field in a relative div and added the toggle button */}
      <div className="relative">
        <Field
          label="Password"
          icon={Lock}
          type={showPassword ? "text" : "password"} // Dynamic type
          required
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

      <ErrorBanner message={error} />

      <button
        type="submit"
        disabled={submitting}
        className={`py-2.5 px-4 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-colors ${VARIANTS[variant].btn}`}
      >
        {submitting ? "Signing in…" : "Log In"}
      </button>

      <div className="text-sm text-gray-500 flex flex-col gap-1">
        <p>
          No account?{" "}
          <Link to={signupPath} className="font-medium text-gray-900 underline">
            Sign up
          </Link>
        </p>
        <Link to="/login" className="text-xs text-gray-400 hover:text-gray-600">
          Not a {variant}? Choose another login
        </Link>
      </div>
    </form>
  )
}