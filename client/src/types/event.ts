export interface Event {
  id: string
  name: string
  description?: string
  venue_name?: string
  start_date: string
  end_date: string
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
}