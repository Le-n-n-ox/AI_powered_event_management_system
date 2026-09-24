import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Plus, Trash2, MapPin } from "lucide-react"
import { supabase } from "../lib/supabase"
import AddVenueLocationForm from "../components/ui/AddVenueLocationForm"
import type { Event, VenueLocation } from "../types/event"

export default function ManageVenueLocations() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [locations, setLocations] = useState<VenueLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  async function fetchData() {
    if (!id) return
    setLoading(true)

    const { data: eventData } = await supabase.from("events").select("*").eq("id", id).single()
    if (eventData) setEvent(eventData)

    const { data: locationData } = await supabase
      .from("venue_locations")
      .select("*")
      .eq("event_id", id)
      .order("created_at", { ascending: true })

    if (locationData) setLocations(locationData)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  async function handleDelete(locationId: string) {
    if (!confirm("Delete this location?")) return
    const { error } = await supabase.from("venue_locations").delete().eq("id", locationId)
    if (!error) setLocations(locations.filter((l) => l.id !== locationId))
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Loading locations…</div>
  if (!event) return <div className="p-10 text-center text-red-500">Event not found.</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Venue Locations: {event.name}</h1>
          <p className="text-sm text-gray-500">
            {locations.length} location{locations.length !== 1 ? "s" : ""} — used by the AI assistant to answer attendee questions
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Add Location
        </button>
      </div>

      {locations.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-lg border border-gray-200 text-gray-500">
          No locations yet. Add washrooms, halls, registration desks, etc.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between"
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <h3 className="font-heading font-semibold text-gray-900">{loc.label}</h3>
                  {loc.description && <p className="text-sm text-gray-600 mt-1">{loc.description}</p>}
                </div>
              </div>
              <button
                onClick={() => handleDelete(loc.id)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AddVenueLocationForm
          eventId={event.id}
          onLocationAdded={fetchData}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}