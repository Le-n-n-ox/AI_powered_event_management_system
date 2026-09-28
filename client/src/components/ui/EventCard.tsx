import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // 1. Added useNavigate
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  Pencil,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import type { Event } from "../../types/event";
import { getCountdown } from "../../utils/dateHelpers";

interface EventCardProps {
  event: Event;
  // onEdit can be removed since we use router state now, or kept optional if used elsewhere
}

export default function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate(); // 2. Initialize navigation hook
  const [copied, setCopied] = useState(false);

  const statusStyles = {
    upcoming: {
      badge:
        "bg-[var(--color-info-bg)] text-[var(--color-info)] ring-1 ring-[var(--color-info-border)]",
      accent: "bg-[var(--color-info)]",
    },
    ongoing: {
      badge:
        "bg-[var(--color-success-bg)] text-[var(--color-success)] ring-1 ring-[var(--color-success-border)]",
      accent: "bg-[var(--color-success)]",
    },
    completed: {
      badge:
        "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]",
      accent: "bg-[var(--color-text-soft)]",
    },
    cancelled: {
      badge:
        "bg-[var(--color-danger-bg)] text-[var(--color-danger)] ring-1 ring-[var(--color-danger-border)]",
      accent: "bg-[var(--color-danger)]",
    },
  };

  function handleCopyLink() {
    const url = `${window.location.origin}/events/${event.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const style = statusStyles[event.status];
  const iconBtn =
    "flex items-center justify-center w-9 h-9 text-[var(--color-text-soft)] rounded-lg hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)] transition-colors";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${style.accent}`} />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between mb-2 gap-2">
          <h3 className="font-heading font-semibold text-lg text-[var(--color-text)] leading-snug">
            {event.name}
          </h3>
          <span
            className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${style.badge}`}
          >
            {event.status}
          </span>
        </div>

        {event.description && (
          <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        <div className="flex flex-col gap-1.5 text-sm mb-4 bg-[var(--color-surface-muted)] rounded-lg p-3">
          {event.venue_name && (
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <MapPin className="w-4 h-4 text-[var(--color-text-soft)] shrink-0" />
              <span className="truncate">{event.venue_name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
            <Calendar className="w-4 h-4 text-[var(--color-text-soft)] shrink-0" />
            <span>{new Date(event.start_date).toLocaleDateString()}</span>
            <span className="text-[var(--color-brand)] font-medium">
              · {getCountdown(event.start_date)}
            </span>
          </div>
          {event.registration_deadline && (
            <div className="flex items-center gap-2 text-[var(--color-warning)]">
              <Clock className="w-4 h-4 text-[var(--color-warning)] shrink-0" />
              <span>
                Registration closes {getCountdown(event.registration_deadline)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 pt-3 border-t border-[var(--color-border)]">
          <Link
            to={`/events/${event.id}/manage`}
            title="Manage Attendees"
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--color-brand)] bg-[var(--color-brand-soft)] rounded-lg py-2 hover:bg-[var(--color-brand-soft)] transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            Attendees
          </Link>

          {/* 3. Updated Edit Button to route directly to our new EventFormPage with the event data */}
          <button
            onClick={() =>
              navigate("/organizer/events/edit", { state: { event } })
            }
            title="Edit Event"
            className={iconBtn}
          >
            <Pencil className="w-4 h-4" />
          </button>

          <Link
            to={`/events/${event.id}/schedule`}
            title="Manage Schedule"
            className={iconBtn}
          >
            <Clock className="w-4 h-4" />
          </Link>
          <Link
            to={`/events/${event.id}/locations`}
            title="Manage Locations"
            className={iconBtn}
          >
            <MapPin className="w-4 h-4" />
          </Link>
          <button
            onClick={handleCopyLink}
            title="Copy Registration Link"
            className={iconBtn}
          >
            {copied ? (
              <Check className="w-4 h-4 text-[var(--color-success)]" />
            ) : (
              <LinkIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
