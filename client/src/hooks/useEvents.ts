import { useEffect, useState, useCallback } from "react"
import { supabase } from "../lib/supabase"
import type { Event } from "../types/event"

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("start_date", { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setEvents(data as Event[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return { events, loading, error, refetch: fetchEvents }
}