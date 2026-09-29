import { ShieldCheck, CalendarDays, Ticket } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AuthVariant = "admin" | "organizer" | "attendee";

interface VariantConfig {
  icon: LucideIcon;
  label: string;
  headline: string;
  points: string[];
  panel: string;
  accent: string;
  btn: string;
}

export const VARIANTS: Record<AuthVariant, VariantConfig> = {
  admin: {
    icon: ShieldCheck,
    label: "Admin Portal",
    headline: "Platform administration",
    points: [],
    panel: "bg-[var(--color-panel-admin)]",
    accent: "text-[var(--color-accent-admin)]",
    btn: "bg-[var(--color-panel-admin)] hover:bg-[var(--color-panel-admin-hover)]",
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
    panel: "bg-[var(--color-panel-organizer)]",
    accent: "text-[var(--color-accent-organizer)]",
    btn: "bg-[var(--color-panel-organizer)] hover:bg-[var(--color-panel-organizer-hover)]",
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
    panel: "bg-[var(--color-panel-attendee)]",
    accent: "text-[var(--color-accent-attendee)]",
    btn: "bg-[var(--color-panel-attendee)] hover:bg-[var(--color-panel-attendee-hover)]",
  },
};
