import { ShieldCheck, CalendarDays, Ticket } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type AuthVariant = "admin" | "organizer" | "attendee"

interface VariantConfig {
  icon: LucideIcon
  label: string
  headline: string
  points: string[]
  panel: string
  accent: string
  btn: string
}

export const VARIANTS: Record<AuthVariant, VariantConfig> = {
  admin: {
    icon: ShieldCheck,
    label: "Admin Portal",
    headline: "Platform administration",
    points: [],
    panel: "bg-slate-900",
    accent: "text-amber-400",
    btn: "bg-slate-900 hover:bg-slate-800",
  },
  organizer: {
    icon: CalendarDays,
    label: "Organizer Portal",
    headline: "Run your event without the chaos",
    points: [
      "Create events with venue, pricing and capacity",
      "Approve registrations and track payments",
      "Manage schedules and venue locations",
      "AI assistant answers attendee questions by SMS",
    ],
    panel: "bg-indigo-600",
    accent: "text-indigo-200",
    btn: "bg-indigo-600 hover:bg-indigo-700",
  },
  attendee: {
    icon: Ticket,
    label: "Attendee Portal",
    headline: "Find events. Show up. Stay informed.",
    points: [
      "Browse and register for upcoming events",
      "Get schedule and venue answers by SMS",
      "One-tap safety check-ins at the venue",
    ],
    panel: "bg-emerald-600",
    accent: "text-emerald-100",
    btn: "bg-emerald-600 hover:bg-emerald-700",
  },
}