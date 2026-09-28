import type { InputHTMLAttributes } from "react"
import type { LucideIcon } from "lucide-react"

export function Field({
  label,
  icon: Icon,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; icon?: LucideIcon; hint?: string }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        {label}
      </span>
      <input
        {...props}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-500"
      />
      {hint && <span className="block text-xs text-gray-400 mt-1">{hint}</span>}
    </label>
  )
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{message}</div>
  )
}

export function InfoBanner({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg p-3">{message}</div>
  )
}