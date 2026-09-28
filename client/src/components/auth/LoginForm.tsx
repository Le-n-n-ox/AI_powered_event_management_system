import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"
import { motion, type Variants } from "framer-motion" // NEW: Animation library
import { useAuth } from "../../context/AuthContext"
import { VARIANTS } from "./authVariants"
import type { AuthVariant } from "./authVariants"
import { ErrorBanner } from "./AuthUI"

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
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await signIn(email, password, [variant])
    setSubmitting(false)
    if (error) return setError(error)
    navigate(redirectTo)
  }

  // Animation variants for staggering the form fields
 const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <motion.form 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      onSubmit={handleSubmit} 
      className="flex flex-col gap-5 w-full max-w-sm mx-auto"
    >
      <motion.div variants={itemVariants} className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Email Address</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <Mail size={18} />
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-gray-50/50 hover:bg-white focus:bg-white"
            placeholder="you@example.com"
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Password</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <Lock size={18} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-gray-50/50 hover:bg-white focus:bg-white"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="submit"
        disabled={submitting}
        className={`mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white shadow-md disabled:opacity-70 transition-all ${VARIANTS[variant].btn}`}
      >
        {submitting ? (
          <span className="animate-pulse">Signing in…</span>
        ) : (
          <>
            Log In to {VARIANTS[variant].label.split(" ")[0]}
            <ArrowRight size={16} />
          </>
        )}
      </motion.button>

      <motion.div variants={itemVariants} className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to={signupPath} className="font-semibold text-gray-900 hover:underline transition-all">
            Sign up now
          </Link>
        </p>
        <Link to="/login" className="text-xs text-gray-400 hover:text-gray-800 transition-colors">
          Wrong portal? Change account type
        </Link>
      </motion.div>
    </motion.form>
  )
}