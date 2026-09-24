import { useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "../../lib/supabase"

interface AddVenueLocationFormProps {
  eventId: string
  onLocationAdded: () => void
  onClose: () => void
}

function AddVenueLocationForm({ eventId, onLocationAdded, onClose }: AddVenueLocationFormProps) {
  const [label, setLabel] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error } = await supabase.from("venue_locations").insert({
      event_id: eventId,
      label,
      description: description || null,
    })

    setSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }

    onLocationAdded()
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="font-heading text-xl font-bold text-gray-900 mb-4">Add Venue Location</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Label (e.g. Washroom - 2nd Floor)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <textarea
            placeholder="Directions (e.g. Near the elevator, left of Hall B)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Adding…" : "Add Location"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default AddVenueLocationForm