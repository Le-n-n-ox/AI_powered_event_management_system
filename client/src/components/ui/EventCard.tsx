import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import type { Event } from "../../types/event";
import { getCountdown } from "../../utils/dateHelpers";

interface EventCardProps {
  event: Event;
}

function EventCard({ event }: EventCardProps) {
  const [copied, setCopied] = useState(false);

  const statusStyles = {
    upcoming: { badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200", accent: "bg-blue-500" },
    ongoing: { badge: "bg-green-50 text-green-700 ring-1 ring-green-200", accent: "bg-green-500" },
    completed: { badge: "bg-gray-100 text-gray-600 ring-1 ring-gray-200", accent: "bg-gray-400" },
    cancelled: { badge: "bg-red-50 text-red-700 ring-1 ring-red-200", accent: "bg-red-500" },
  };

  function handleCopyLink() {
    const url = `${window.location.origin}/events/${event.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const style = statusStyles[event.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="relative rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
    >
      {/* Status accent bar */}
      <div className={`absolute top-0 left-0 w-1 h-full ${style.accent}`} />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between mb-2 gap-2">
          <h3 className="font-heading font-semibold text-lg text-gray-900 leading-snug">
            {event.name}
          </h3>
          <span
            className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${style.badge}`}
          >
            {event.status}
          </span>
        </div>

        {event.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        <div className="flex flex-col gap-1.5 text-sm mb-4 bg-gray-50 rounded-lg p-3">
          {event.venue_name && (
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate">{event.venue_name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{new Date(event.start_date).toLocaleDateString()}</span>
            <span className="text-indigo-600 font-medium">
              · {getCountdown(event.start_date)}
            </span>
          </div>
          {event.registration_deadline && (
            <div className="flex items-center gap-2 text-amber-700">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Registration closes {getCountdown(event.registration_deadline)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
          <Link
            to={`/events/${event.id}/manage`}
            title="Manage Attendees"
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg py-2 hover:bg-indigo-100 transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            Attendees
          </Link>
          <Link
            to={`/events/${event.id}/schedule`}
            title="Manage Schedule"
            className="flex items-center justify-center w-9 h-9 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <Clock className="w-4 h-4" />
          </Link>
          <Link
            to={`/events/${event.id}/locations`}
            title="Manage Locations"
            className="flex items-center justify-center w-9 h-9 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <MapPin className="w-4 h-4" />
          </Link>
          <button
            onClick={handleCopyLink}
            title="Copy Registration Link"
            className="flex items-center justify-center w-9 h-9 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <LinkIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default EventCard;