import { useState } from "react"
import { Plus } from "lucide-react"
import EventCard from "../components/ui/EventCard"
import AddEventForm from "../components/ui/AddEventForm"
import { useEvents } from "../hooks/useEvents"

function Dashboard() {
  const { events, loading, error, refetch } = useEvents()
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900">Organizer Dashboard</h1>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {showForm && (
        <AddEventForm
          onEventAdded={refetch}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

export default Dashboard