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
} from "lucide-react";
import type { Event } from "../../types/event";
import { getCountdown } from "../../utils/dateHelpers";

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
    bar: "bg-info",
  },
  ongoing: {
    variant: "default",
    badge: "bg-success-bg text-success border-success-border hover:bg-success-bg",
    bar: "bg-success",
  },
  cancelled: {
    variant: "destructive",
    badge: "",
    bar: "bg-danger",
  },
  completed: {
    variant: "secondary",
    badge: "",
    bar: "bg-border-strong",
  },
};

const ICON_BTN = "text-text-soft hover:text-text hover:bg-surface-muted";

export default function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`h-full ${showAsPast ? "opacity-80 hover:opacity-100" : ""}`}
    >
      <Card className="h-full relative shadow-sm hover:shadow-md ring-border hover:ring-brand-border transition-all bg-surface">
        <div className={`absolute top-0 left-0 w-full h-1 ${style.bar}`} />

        <CardHeader className="pt-1">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="font-heading text-lg leading-snug text-text">
              {event.name}
            </CardTitle>
            <Badge
              variant={style.variant}
              className={`capitalize shrink-0 ${style.badge}`}
            >
              {statusLabel}
            </Badge>
          </div>
          {event.description && (
            <p className="text-sm text-text-soft line-clamp-2 mt-2">
              {event.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="flex-1">
          <div className="flex flex-col gap-2 text-sm bg-surface-muted rounded-lg p-3 border border-border">
            {event.venue_name && (
              <div className="flex items-center gap-2 text-text-muted">
                <MapPinned className="w-4 h-4 text-text-soft shrink-0" />
                <span className="truncate">{event.venue_name}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-text-muted">
              <CalendarDays className="w-4 h-4 text-text-soft shrink-0" />
              <span>{new Date(event.start_date).toLocaleDateString()}</span>
              <span
                className={`font-medium ml-auto text-xs ${
                  isPastEvent ? "text-text-soft" : "text-brand"
                }`}
              >
                {isPastEvent ? "Ended" : getCountdown(event.start_date)}
              </span>
            </div>
            {event.registration_deadline && !isPastEvent && (
              <div className="flex items-center gap-2 text-warning mt-1">
                <AlarmClock className="w-4 h-4 shrink-0" />
                <span className="text-xs font-medium">
                  Closes {getCountdown(event.registration_deadline)}
                </span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="justify-between gap-1 border-border bg-surface-muted/50">
          <Button
            asChild
            variant="secondary"
            className="flex-1 text-brand-strong bg-surface-alt hover:bg-brand-soft border border-brand-border"
          >
            <Link to={`/events/${event.id}/manage`}>
              <UsersRound className="w-4 h-4 mr-1.5" />
              Attendees
            </Link>
          </Button>

          <div className="flex items-center gap-1">
            {!isPastEvent && (
              <Button
                variant="ghost"
                size="icon"
                className={ICON_BTN}
                onClick={() =>
                  navigate("/organizer/events/edit", { state: { event } })
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
              className={ICON_BTN}
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
              className={ICON_BTN}
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
                  ? "text-success hover:text-success hover:bg-success-bg"
                  : ICON_BTN
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
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}