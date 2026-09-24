export interface Event {
  venue_map_url?: string;
  id: string;
  organizer_id: string;
  name: string;
  description: string;
  venue_name: string;
  venue_address: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  requires_approval: boolean;
  is_paid: boolean;
  ticket_price: number;
  capacity: number | null;
  created_at: string;
}

export interface Attendee {
  id: string;
  event_id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  status: 'pending' | 'approved' | 'waitlisted' | 'rejected';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  checked_in: boolean;
  registered_at: string;
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