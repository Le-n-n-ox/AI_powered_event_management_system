import { useState } from "react"
import { Plus, ShieldCheck } from "lucide-react"
import EventCard from "../components/ui/EventCard"
import AddEventForm from "../components/ui/AddEventForm"
import { useEvents } from "../hooks/useEvents"
import { useAuth } from "../context/AuthContext"
import { groupEventsByPeriod } from "../utils/dateHelpers"
import type { Event } from "../types/event"

function EventSection({
  title,
  events,
  onEdit,
}: {
  title: string
  events: Event[]
  onEdit: (event: Event) => void
}) {
  return (
    <div className="mb-8">
      <h2 className="font-heading text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {title} <span className="text-gray-400 font-normal">({events.length})</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} onEdit={onEdit} />
        ))}
      </div>
    </div>
  )
}

function Dashboard() {
  const { events, loading, error, refetch } = useEvents()
  const { isAdmin } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Event | null>(null)

  const { groups, order } = groupEventsByPeriod(events)

  function closeForm() {
    setShowForm(false)
    setEditing(null)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">
            {isAdmin ? "Admin Dashboard" : "My Events"}
          </h1>
          {isAdmin && (
            <p className="flex items-center gap-1 text-xs font-medium text-indigo-600 mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Viewing all organizers' events
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading events…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      {!loading && !error && events.length === 0 && (
        <p className="text-gray-500">No events yet. Create one to get started.</p>
      )}

      {order.map((key) => (
        <EventSection key={key} title={key} events={groups[key]} onEdit={setEditing} />
      ))}

      {(showForm || editing) && (
        <AddEventForm
          key={editing?.id ?? "new"}
          event={editing}
          onSaved={refetch}
          onClose={closeForm}
        />
      )}
    </div>
  )
}

export default Dashboard