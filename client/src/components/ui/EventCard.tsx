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
} from "lucide-react";
import type { Event } from "../../types/event";
import { getCountdown } from "../../utils/dateHelpers";
import { supabase } from "../../lib/supabase";

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
}

interface StatusStyle {
  variant: "default" | "secondary" | "destructive";
  badge: string;
  bar: string;
}

const STATUS_STYLES: { [key: string]: StatusStyle } = {
  upcoming: {
    variant: "default",
    badge: "bg-info-bg text-info border-info-border hover:bg-info-bg",
    bar: "bg-linear-to-r from-info to-brand",
  },
  ongoing: {
    variant: "default",
    badge: "bg-success-bg text-success border-success-border hover:bg-success-bg",
    bar: "bg-linear-to-r from-success to-tag-teal",
  },
  cancelled: {
    variant: "destructive",
    badge: "bg-danger-bg text-danger border-danger-border hover:bg-danger-bg",
    bar: "bg-linear-to-r from-danger to-tag-pink",
  },
  completed: {
    variant: "secondary",
    badge: "bg-surface-strong text-text-soft border-border",
    bar: "bg-border-strong",
  },
};

const ICON_BASE =
  "text-text-soft rounded-lg transition-all duration-200 hover:scale-110 active:scale-95";

export default function EventCard({ event, onDeleted }: EventCardProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isPastEvent = new Date(event.end_date) < new Date();
  const isCancelled = event.status === "cancelled";
  const showAsPast = isPastEvent && !isCancelled;

  const style = showAsPast
    ? STATUS_STYLES.completed
    : STATUS_STYLES[event.status] ?? STATUS_STYLES.completed;
  const statusLabel = showAsPast ? "past" : event.status;

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
        `Delete "${event.name}"? This will also remove its attendees, schedule, and venue locations. This cannot be undone.`
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`h-full ${showAsPast ? "opacity-80 hover:opacity-100" : ""}`}
    >
      <Card className="h-full flex flex-col relative bg-surface rounded-xl overflow-hidden border border-border shadow-lg shadow-shadow-soft hover:shadow-xl hover:shadow-shadow-brand/40 hover:border-brand-border transition-all duration-300">
        {/* Status colour bar */}
        <div className={`absolute top-0 left-0 w-full h-2 ${style.bar}`} />

        <CardHeader className="pt-6 pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="font-heading text-lg leading-snug text-text">
              {event.name}
            </CardTitle>
            <Badge
              variant={style.variant}
              className={`capitalize shrink-0 font-semibold shadow-sm rounded-md px-2.5 py-0.5 ${style.badge}`}
            >
              {statusLabel}
            </Badge>
          </div>
          {event.description && (
            <p className="text-sm text-text-soft line-clamp-2 mt-2 leading-relaxed">
              {event.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="flex-1 pb-4">
          <div className="flex flex-col gap-2.5 text-sm bg-surface-muted rounded-lg p-3.5 border border-border mt-1">
            {event.venue_name && (
              <div className="flex items-center gap-2.5 text-text-muted">
                <MapPinned className="w-4 h-4 text-tag-teal shrink-0" />
                <span className="truncate">{event.venue_name}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-text-muted">
              <CalendarDays className="w-4 h-4 text-tag-violet shrink-0" />
              <span>{new Date(event.start_date).toLocaleDateString()}</span>
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

          <div className="flex items-center gap-0.5 ml-1">
            {!isPastEvent && (
              <Button
                variant="ghost"
                size="icon"
                className={`${ICON_BASE} hover:text-brand-strong hover:bg-brand-soft`}
                onClick={() =>
                  navigate(`/organizer/events/${event.id}/edit`, { state: { event } })
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