import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPinned,
  CalendarDays,
  UsersRound,
  AlarmClock,
  SquarePen,
  Link as LinkIcon,
  Check,
  Trash2,
  ScanLine,
  Sparkles,
  Banknote,
  Ticket,
} from "lucide-react";
import type { Event, Attendee } from "../../types/event";
import { getCountdown } from "../../utils/dateHelpers";
import { supabase } from "../../lib/supabase";
import { RSVP_LABELS, RSVP_STYLES, rsvpState } from "../../lib/events";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  event: Event;
  onDeleted?: (id: string) => void;
  /**
   * The current attendee's registration status, when they have one.
   * Renders a Going / Pending / Waitlisted / Cancelled badge on the card.
   */
  registrationStatus?: Attendee["status"];
}

interface StatusStyle {
  variant: "default" | "secondary" | "destructive";
  badge: string;
  bar: string;
  /** The soft wash behind the card's top panel. */
  wash: string;
  /** The icon tile colour. */
  tile: string;
}

const STATUS_STYLES: { [key: string]: StatusStyle } = {
  upcoming: {
    variant: "default",
    badge: "bg-info-bg text-info border-info-border hover:bg-info-bg",
    bar: "bg-linear-to-r from-info via-tag-sky to-brand",
    wash: "from-info/20 via-tag-sky/10 to-transparent",
    tile: "bg-info-bg text-info border-info-border",
  },
  ongoing: {
    variant: "default",
    badge:
      "bg-success-bg text-success border-success-border hover:bg-success-bg",
    bar: "bg-linear-to-r from-success via-tag-teal to-brand",
    wash: "from-success/20 via-tag-teal/10 to-transparent",
    tile: "bg-success-bg text-success border-success-border",
  },
  cancelled: {
    variant: "destructive",
    badge: "bg-danger-bg text-danger border-danger-border hover:bg-danger-bg",
    bar: "bg-linear-to-r from-danger via-tag-pink to-tag-violet",
    wash: "from-danger/20 via-tag-pink/10 to-transparent",
    tile: "bg-danger-bg text-danger border-danger-border",
  },
  completed: {
    variant: "secondary",
    badge: "bg-surface-strong text-text-soft border-border",
    bar: "bg-linear-to-r from-border-strong via-text-soft to-border-strong",
    wash: "from-border-strong/25 via-text-soft/10 to-transparent",
    tile: "bg-surface-strong text-text-soft border-border",
  },
};

const ICON_BASE =
  "text-text-soft rounded-lg transition-all duration-200 hover:scale-110 active:scale-95";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function EventCard({
  event,
  onDeleted,
  registrationStatus,
}: EventCardProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isPastEvent = new Date(event.end_date) < new Date();
  const isCancelled = event.status === "cancelled";
  const showAsPast = isPastEvent && !isCancelled;

  const rsvp = registrationStatus ? rsvpState(registrationStatus) : null;

  const style = showAsPast
    ? STATUS_STYLES.completed
    : (STATUS_STYLES[event.status] ?? STATUS_STYLES.completed);
  const statusLabel = showAsPast ? "past" : event.status;

  const start = new Date(event.start_date);
  const day = Number.isNaN(start.getTime()) ? "--" : start.getDate();
  const month = Number.isNaN(start.getTime())
    ? "---"
    : MONTHS[start.getMonth()];

  async function handleCopyLink() {
    const url = `${window.location.origin}/events/${event.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        `Delete "${event.name}"? This will also remove its attendees, schedule, and venue locations. This cannot be undone.`,
      )
    ) {
      return;
    }

    setDeleting(true);
    const { error } = await supabase.from("events").delete().eq("id", event.id);
    setDeleting(false);

    if (error) {
      alert(error.message);
      return;
    }

    onDeleted?.(event.id);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`h-full group ${showAsPast ? "opacity-85 hover:opacity-100" : ""}`}
    >
      <Card className="h-full flex flex-col relative bg-surface rounded-2xl overflow-hidden border border-border shadow-lg shadow-shadow-soft hover:shadow-2xl hover:shadow-shadow-brand/30 hover:border-brand-border transition-all duration-300">
        {/* Status colour bar */}
        <div className={`absolute top-0 left-0 w-full h-1.5 ${style.bar}`} />

        {/* The coloured wash behind the top of the card */}
        <div
          className={`absolute inset-x-0 top-0 h-40 bg-linear-to-b ${style.wash} pointer-events-none`}
          aria-hidden
        />
        <div
          className="absolute -top-16 -right-10 w-44 h-44 rounded-full bg-brand/10 blur-2xl transition-all duration-500 group-hover:bg-brand/20 group-hover:scale-125 pointer-events-none"
          aria-hidden
        />

        <CardHeader className="pt-7 pb-3 relative">
          <div className="flex items-start gap-3.5">
            {/* The floating date tile */}
            <div
              className={`shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-2xl border shadow-md shadow-shadow-soft ${style.tile}`}
            >
              <span className="font-heading text-xl font-bold leading-none">
                {day}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">
                {month}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <CardTitle className="font-heading text-lg leading-snug text-text line-clamp-2 min-h-14">
                {event.name}
              </CardTitle>

              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <Badge
                  variant={style.variant}
                  className={`capitalize shrink-0 font-semibold shadow-sm rounded-md px-2.5 py-0.5 ${style.badge}`}
                >
                  {statusLabel}
                </Badge>
                {rsvp && (
                  <Badge
                    className={`shrink-0 font-semibold rounded-md px-2.5 py-0.5 ${RSVP_STYLES[rsvp]}`}
                  >
                    {RSVP_LABELS[rsvp]}
                  </Badge>
                )}
                {event.category && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-tag-violet bg-tag-violet-bg border border-tag-violet/20 rounded-full px-2.5 py-0.5">
                    <Sparkles className="w-3 h-3" />
                    {event.category}
                  </span>
                )}
                {event.is_paid ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success-bg border border-success-border rounded-full px-2.5 py-0.5">
                    <Banknote className="w-3 h-3" />
                    KES {Number(event.ticket_price || 0).toLocaleString("en-KE")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-tag-teal bg-tag-teal-bg border border-tag-teal/30 rounded-full px-2.5 py-0.5">
                    <Ticket className="w-3 h-3" />
                    Free
                  </span>
                )}
              </div>
            </div>
          </div>

          {event.description && (
            <p className="text-sm text-text-soft line-clamp-2 h-10 mt-3 leading-relaxed">
              {event.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="flex-1 pb-4 relative">
          <div className="flex flex-col gap-2.5 text-sm bg-surface-muted/70 rounded-xl p-3.5 border border-border">
            {event.venue_name && (
              <div className="flex items-center gap-2.5 text-text-muted">
                <MapPinned className="w-4 h-4 text-tag-teal shrink-0" />
                <span className="truncate">{event.venue_name}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-text-muted">
              <CalendarDays className="w-4 h-4 text-tag-violet shrink-0" />
              <span>
                {Number.isNaN(start.getTime())
                  ? "Date to be announced"
                  : start.toLocaleDateString(undefined, {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
              </span>
              <span
                className={`font-semibold ml-auto text-xs px-2 py-0.5 rounded-full ${
                  isPastEvent
                    ? "bg-surface-strong text-text-soft"
                    : "bg-tag-sky-bg text-tag-sky"
                }`}
              >
                {isPastEvent ? "Ended" : getCountdown(event.start_date)}
              </span>
            </div>
            {event.registration_deadline && !isPastEvent && (
              <div className="flex items-center gap-2.5 text-warning mt-1">
                <AlarmClock className="w-4 h-4 shrink-0" />
                <span className="text-xs font-semibold">
                  Closes {getCountdown(event.registration_deadline)}
                </span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="justify-between gap-1 border-t border-border bg-surface-alt/60 py-3.5">
          <Button
            asChild
            className="flex-1 text-text-on-dark bg-linear-to-r from-brand to-panel-organizer border-0 rounded-lg shadow-md shadow-shadow-brand/30 transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-shadow-brand/50 active:scale-95"
          >
            <Link to={`/events/${event.id}/manage`}>
              <UsersRound className="w-4 h-4 mr-1.5" />
              Attendees
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon"
            className={`${ICON_BASE} hover:text-warning hover:bg-warning-bg`}
            title="Check-in"
          >
            <Link to={`/events/${event.id}/checkin`} aria-label="Check-in">
              <ScanLine className="w-4 h-4" />
            </Link>
          </Button>

          <div className="flex items-center gap-0.5 ml-1">
            {!isPastEvent && (
              <Button
                variant="ghost"
                size="icon"
                className={`${ICON_BASE} hover:text-brand-strong hover:bg-brand-soft`}
                onClick={() =>
                  navigate(`/organizer/events/${event.id}/edit`, {
                    state: { event },
                  })
                }
                title="Edit Event"
                aria-label="Edit Event"
              >
                <SquarePen className="w-4 h-4" />
              </Button>
            )}

            <Button
              asChild
              variant="ghost"
              size="icon"
              className={`${ICON_BASE} hover:text-tag-violet hover:bg-tag-violet-bg`}
              title="Manage Schedule"
            >
              <Link
                to={`/events/${event.id}/schedule`}
                aria-label="Manage Schedule"
              >
                <AlarmClock className="w-4 h-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="icon"
              className={`${ICON_BASE} hover:text-tag-teal hover:bg-tag-teal-bg`}
              title="Manage Locations"
            >
              <Link
                to={`/events/${event.id}/locations`}
                aria-label="Manage Locations"
              >
                <MapPinned className="w-4 h-4" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={
                copied
                  ? "text-success bg-success-bg rounded-lg transition-all duration-200 scale-110"
                  : `${ICON_BASE} hover:text-tag-sky hover:bg-tag-sky-bg`
              }
              onClick={handleCopyLink}
              title="Copy Registration Link"
              aria-label="Copy Registration Link"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <LinkIcon className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`${ICON_BASE} hover:text-danger hover:bg-danger-bg`}
              onClick={handleDelete}
              disabled={deleting}
              title="Delete Event"
              aria-label="Delete Event"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
