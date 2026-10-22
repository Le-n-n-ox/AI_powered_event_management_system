import {
  CalendarClock,
  CalendarDays,
  ChartColumn,
  MapPinned,
  ScanLine,
  UsersRound,
  Wallet,
} from "lucide-react";
import type { AppShellNavItem } from "./AppShell";

/**
 * The organizer's section list. Shared by the dashboard, the statistics
 * screen and the transactions ledger so the side bar never changes shape
 * between them.
 */
export const ORGANIZER_NAV: AppShellNavItem[] = [
  {
    key: "events",
    label: "My events",
    icon: CalendarDays,
    to: "/dashboard",
  },
  {
    key: "statistics",
    label: "Statistics",
    icon: ChartColumn,
    to: "/organizer/statistics",
  },
  {
    key: "transactions",
    label: "Transactions",
    icon: Wallet,
    to: "/organizer/transactions",
  },
];

/**
 * The event-scoped section list. Every page that manages one event — the
 * attendee roster, the door scanner, the schedule and the venue map — shares
 * this side bar so moving between them never loses the context of which
 * event you are working on.
 */
export function eventNav(eventId: string): AppShellNavItem[] {
  return [
    {
      key: "attendees",
      label: "Attendees",
      icon: UsersRound,
      to: `/events/${eventId}/manage`,
    },
    {
      key: "checkin",
      label: "Check-in",
      icon: ScanLine,
      to: `/events/${eventId}/checkin`,
    },
    {
      key: "schedule",
      label: "Schedule",
      icon: CalendarClock,
      to: `/events/${eventId}/schedule`,
    },
    {
      key: "locations",
      label: "Venues",
      icon: MapPinned,
      to: `/events/${eventId}/locations`,
    },
  ];
}
