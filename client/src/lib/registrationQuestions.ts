import type {
  Event,
  RegistrationQuestion,
  RegistrationQuestionType,
} from "../types/event";

/**
 * The questions the organizer can choose from.
 *
 * `column` marks the questions that write into an existing attendees column,
 * so the reports that read `organization` or `dietary_notes` keep working.
 * Everything else lands in `attendees.custom_answers`, keyed by question id.
 */
export const BUILT_IN_QUESTIONS: RegistrationQuestion[] = [
  {
    id: "full_name",
    label: "Full name",
    type: "short_text",
    required: true,
    builtin: true,
    column: "full_name",
    placeholder: "e.g. Amina Wanjiru",
  },
  {
    id: "phone_number",
    label: "Phone number",
    type: "phone",
    required: true,
    builtin: true,
    column: "phone_number",
    placeholder: "e.g. 0712 345 678",
  },
  {
    id: "email",
    label: "Email address",
    type: "email",
    required: false,
    builtin: true,
    column: "email",
    placeholder: "e.g. amina@example.com",
  },
  {
    id: "organization",
    label: "Organization",
    type: "short_text",
    required: false,
    builtin: true,
    column: "organization",
  },
  {
    id: "job_title",
    label: "Job title",
    type: "short_text",
    required: false,
    builtin: true,
    column: "job_title",
  },
  {
    id: "dietary_notes",
    label: "Dietary or accessibility needs",
    type: "long_text",
    required: false,
    builtin: true,
    column: "dietary_notes",
    placeholder: "e.g. Vegetarian, wheelchair access needed",
  },
  {
    id: "referral_source",
    label: "How did you hear about this event?",
    type: "select",
    required: false,
    builtin: true,
    column: "referral_source",
    options: [
      "Social Media",
      "Friend or Colleague",
      "Email",
      "Event Website",
      "Search Engine",
      "Other",
    ],
  },
];

/** The question types the organizer can pick from when adding a question. */
export const QUESTION_TYPES: {
  value: RegistrationQuestionType;
  label: string;
  description: string;
}[] = [
  { value: "short_text", label: "Short answer", description: "One line of text" },
  { value: "long_text", label: "Long answer", description: "A paragraph" },
  { value: "email", label: "Email", description: "Validated email address" },
  { value: "phone", label: "Phone", description: "Phone number" },
  { value: "number", label: "Number", description: "Numeric value" },
  { value: "select", label: "Choice", description: "Pick from a list" },
  { value: "checkbox", label: "Yes / No", description: "A single tick box" },
];

/**
 * The questions an event asks when the organizer has not configured any.
 *
 * `registration_questions` of `null` means "not configured yet", so the
 * attendee form falls back to this set. An empty array means the organizer
 * deliberately removed every question.
 */
export function questionsFor(event: Pick<Event, "registration_questions">) {
  return event.registration_questions ?? BUILT_IN_QUESTIONS;
}

/** True when the organizer has stripped the form down to nothing. */
export function hasNoQuestions(
  event: Pick<Event, "registration_questions">,
): boolean {
  return questionsFor(event).length === 0;
}

/** A stable-ish id for a question the organizer just added. */
export function newQuestionId() {
  return `q_${Math.random().toString(36).slice(2, 8)}${Date.now()
    .toString(36)
    .slice(-4)}`;
}

/**
 * Normalises a stored question list.
 *
 * The column is JSON, so it can hold anything; this trims it back to the
 * shape the form expects and drops anything unusable.
 */
export function normalizeQuestions(
  raw: unknown,
): RegistrationQuestion[] | null {
  if (!Array.isArray(raw)) return null;

  const questions: RegistrationQuestion[] = [];

  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;

    const item = entry as Partial<RegistrationQuestion>;
    const id = typeof item.id === "string" ? item.id.trim() : "";
    const label =
      typeof item.label === "string" ? item.label.trim() : "";

    if (!id || !label) continue;

    const type = QUESTION_TYPES.some((t) => t.value === item.type)
      ? (item.type as RegistrationQuestionType)
      : "short_text";

    const question: RegistrationQuestion = {
      id,
      label,
      type,
      required: Boolean(item.required),
    };

    if (Array.isArray(item.options)) {
      const options = item.options
        .filter((option): option is string => typeof option === "string")
        .map((option) => option.trim())
        .filter(Boolean);
      if (options.length) question.options = options;
    }

    if (typeof item.placeholder === "string" && item.placeholder.trim()) {
      question.placeholder = item.placeholder.trim();
    }

    const builtin = BUILT_IN_QUESTIONS.find((q) => q.id === id);
    if (builtin) {
      question.builtin = true;
      question.column = builtin.column;
    }

    questions.push(question);
  }

  return questions;
}

/**
 * Splits the collected answers into the two places they are stored:
 * the built-in attendees columns, and the custom-answers blob.
 */
export function splitAnswers(
  questions: RegistrationQuestion[],
  values: Record<string, string>,
): { columns: Record<string, string>; custom: Record<string, string> } {
  const columns: Record<string, string> = {};
  const custom: Record<string, string> = {};

  for (const question of questions) {
    const value = (values[question.id] ?? "").trim();
    if (!value) continue;

    if (question.builtin && question.column) {
      columns[question.column] = value;
    } else {
      custom[question.id] = value;
    }
  }

  return { columns, custom };
}

/** Checks that every required question has an answer. */
export function missingRequired(
  questions: RegistrationQuestion[],
  values: Record<string, string>,
): string[] {
  return questions
    .filter((question) => question.required)
    .filter((question) => !(values[question.id] ?? "").trim())
    .map((question) => question.label);
}
