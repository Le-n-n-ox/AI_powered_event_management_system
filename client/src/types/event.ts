export interface Event {
  id: string;
  organizer_id: string;
  name: string;
  description: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  venue_name: string;
  venue_address: string;
  venue_map_url?: string;
  start_date: string;
  end_date: string;
  registration_deadline?: string | null;
  capacity: number | null;
  requires_approval: boolean;
  is_paid: boolean;
  ticket_price: number | null;
  knowledge_text?: string | null;
  created_at: string;
}

export interface Attendee {
  id: string;
  event_id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  status: "pending" | "approved" | "waitlisted" | "rejected";
  payment_status: "unpaid" | "paid" | "refunded";
  checked_in: boolean;
  registered_at: string;
  registration_deadline?: string | null;
  organization?: string;
  job_title?: string;
  dietary_notes?: string;
  referral_source?: string;
}

export interface ScheduleItem {
  id: string;
  event_id: string;
  title: string;
  speaker?: string;
  location?: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface VenueLocation {
  id: string;
  event_id: string;
  label: string;
  description?: string;
  created_at: string;
}
