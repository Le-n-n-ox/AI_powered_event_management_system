import { useCallback, useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/auth-context"
import type { Event } from "../types/event"

export function useEvents() {
  const { user, isAdmin } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [error, setError] = useState<string | null>(null)
  // The user id the current `events` were loaded for. `loading` is derived
  // from it, so switching accounts goes back to the loading state without a
  // second piece of state to keep in sync.
  const [loadedFor, setLoadedFor] = useState<string | null>(null)

  const userId = user?.id ?? null

  const fetchEvents = useCallback(async () => {
    if (!userId) return

    let query = supabase.from("events").select("*").order("start_date", { ascending: true })
    if (!isAdmin) query = query.eq("organizer_id", userId)

    const { data, error } = await query
    if (error) {
      setError(error.message)
    } else {
      setError(null)
      setEvents(data as Event[])
    }
    setLoadedFor(userId)
  }, [userId, isAdmin])

  useEffect(() => {
    if (!userId) return

    let cancelled = false

    async function load() {
      let query = supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: true })
      if (!isAdmin) query = query.eq("organizer_id", userId)

      const { data, error } = await query
      if (cancelled) return

      if (error) {
        setError(error.message)
      } else {
        setError(null)
        setEvents(data as Event[])
      }
      setLoadedFor(userId)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [userId, isAdmin])

  const loading = userId !== null && loadedFor !== userId

  return { events, loading, error, refetch: fetchEvents }
}
