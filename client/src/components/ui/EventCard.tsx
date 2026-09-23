import { Link } from "react-router-dom"
import { Users, Calendar, MapPin, Edit2 } from "lucide-react"
import type { Event } from "../../types/event"

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-1" title={event.name}>
            {event.name}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
            event.status === 'upcoming' ? 'bg-blue-50 text-blue-700' :
            event.status === 'ongoing' ? 'bg-green-50 text-green-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {event.status}
          </span>
        </div>
        
        <div className="text-sm text-gray-600 flex flex-col gap-2 mt-3">
          <p className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="truncate" title={event.venue_name}>{event.venue_name}</span>
          </p>
        </div>
      </div>

      {/* Organizer Action Buttons */}
      <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
        <Link
          to={`/dashboard/events/${event.id}/attendees`}
          className="flex-1 flex justify-center items-center gap-2 bg-indigo-50 text-indigo-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
        >
          <Users className="w-4 h-4" />
          Attendees
        </Link>
        
        {/* Optional Edit Button for later */}
        <button 
          className="flex justify-center items-center gap-2 bg-gray-50 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200"
          title="Edit Event"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}