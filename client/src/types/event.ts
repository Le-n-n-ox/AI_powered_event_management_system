/**
 * One question on the registration form.
 *
 * The organizer builds the list; the attendee form renders it. `id` is
 * stable across edits so answers stay attached to their question, and
 * `builtin` marks the questions that map onto an existing attendees column
 * (so they keep working with the reports that read those columns).
 */
export type RegistrationQuestionType =
  | "short_text"
  | "long_text"
  | "number"
  | "email"
  | "phone"
  | "select"
  | "checkbox";

export interface RegistrationQuestion {
  id: string;
  label: string;
  type: RegistrationQuestionType;
  required: boolean;
  /** Choices, for `select` questions. */
  options?: string[];
  /** Hint shown under the input. */
  placeholder?: string;
  /** True for the questions that map onto a built-in attendees column. */
  builtin?: boolean;
  /** The attendees column a built-in question writes to. */
  column?: string;
}

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
  /** Niche / topic. Added by migration 001 — optional until that is applied. */
  category?: string | null;
  /**
   * The questions the organizer asks on the registration form. Added by
   * migration 005 — optional until that is applied. `null` means "use the
   * built-in default set"; an empty array means "ask nothing extra".
   */
  registration_questions?: RegistrationQuestion[] | null;
  /**
   * The paybill / accno the organizer wants ticket payments credited to.
   * Added by migration 005 — optional until that is applied.
   */
  mpesa_accno?: string | null;
  created_at: string;
}

export interface Attendee {
  id: string;
  event_id: string;
  user_id?: string | null;
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
  /**
   * Answers to the organizer's custom questions, keyed by question id.
   * Added by migration 005 — optional until that is applied.
   */
  custom_answers?: Record<string, string> | null;
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

export type TransactionStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "cancelled";

export type PaymentMethod = "mpesa" | "cash" | "bank" | "card" | "other";

/** A row in the payment ledger. Added by migration 002. */
export interface Transaction {
  id: string;
  event_id: string;
  attendee_id: string | null;
  organizer_id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  method: PaymentMethod;
  provider: string;
  provider_reference: string | null;
  receipt_number: string | null;
  payer_name: string | null;
  phone_number: string | null;
  paid_at: string | null;
  created_at: string;
}

/** How an attendee's RSVP reads on an event card. */
export type RsvpState = "going" | "pending" | "waitlisted" | "cancelled";

export interface EventStats {
  registered: number;
  approved: number;
  pending: number;
  waitlisted: number;
  rejected: number;
  checkedIn: number;
  revenue: number;
  capacity: number | null;
}

/**
 * The shape of the create/edit event form. Form fields keep their own
 * names here (venueName, not venue_name) because they drive the inputs
 * directly; the save handler maps them onto the database columns.
 */
export interface EventFormData {
  name: string;
  description: string;
  category: string;
  status: Event["status"];
  venueName: string;
  venueAddress: string;
  venueMapUrl: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  capacity: string;
  requiresApproval: boolean;
  isPaid: boolean;
  ticketPrice: string;
  knowledgeText: string;
  /** The questions the attendee will be asked, in order. */
  registrationQuestions: RegistrationQuestion[];
  /** The paybill / accno the organizer wants ticket money credited to. */
  mpesaAccno: string;
}

/** Updates one field of the event form, keeping the field/value pair typed. */
export type EventFormUpdater = <K extends keyof EventFormData>(
  field: K,
  value: EventFormData[K],
) => void;
