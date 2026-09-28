import { useCallback, useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import type { Event } from "../types/event"

export function useEvents() {
  const { user, isAdmin } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    if (!user) {
      setEvents([])
      setLoading(false)
      return
    }

    setLoading(true)
    let query = supabase.from("events").select("*").order("start_date", { ascending: true })
    if (!isAdmin) query = query.eq("organizer_id", user.id)

    const { data, error } = await query
    if (error) {
      setError(error.message)
    } else {
      setError(null)
      setEvents(data as Event[])
    }
    setLoading(false)
  }, [user?.id, isAdmin])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return { events, loading, error, refetch: fetchEvents }
}