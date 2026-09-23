import { motion } from "framer-motion"
import { MapPin, Calendar } from "lucide-react"
import type { Event } from "../../types/event"

interface EventCardProps {
  event: Event
}

function EventCard({ event }: EventCardProps) {
  const statusColors = {
    upcoming: "bg-blue-100 text-blue-700",
    ongoing: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-600",
    cancelled: "bg-red-100 text-red-700",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-heading font-semibold text-lg text-gray-900">{event.name}</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[event.status]}`}>
          {event.status}
        </span>
      </div>
      {event.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{event.description}</p>
      )}
      <div className="flex flex-col gap-1 text-sm text-gray-600">
        {event.venue_name && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {event.venue_name}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {new Date(event.start_date).toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  )
}

export default EventCard