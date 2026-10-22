import { useId, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  AtSign,
  Check,
  Hash,
  ListChecks,
  Loader2,
  MessageCircle,
  Phone,
  ShieldCheck,
  Square,
  TriangleAlert,
  Type,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/auth-context";
import {
  BUILT_IN_QUESTIONS,
  missingRequired,
  normalizeQuestions,
  questionsFor,
  splitAnswers,
} from "../../lib/registrationQuestions";
import { isMissingColumnError } from "../../lib/events";
import type { Event, RegistrationQuestion } from "../../types/event";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  eventId: string;
  /** The event, so the form can render the organizer's own questions. */
  event?: Event | null;
  onSuccess: (attendeeId: string, phone: string) => void;
}

/** The icon that represents a question, keyed by question type. */
const TYPE_ICON: Record<RegistrationQuestion["type"], LucideIcon> = {
  short_text: Type,
  long_text: MessageCircle,
  number: Hash,
  email: AtSign,
  phone: Phone,
  select: ListChecks,
  checkbox: Square,
};

/** The questions that sit in the "Your details" block. */
const CORE_IDS = ["full_name", "phone_number"];

const LABEL =
  "flex items-center gap-1.5 text-sm font-medium text-text-muted";
const SECTION_TITLE =
  "font-heading text-xs font-semibold text-text-soft uppercase tracking-wider border-b border-border pb-2";
const TEXTAREA =
  "flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-base sm:text-sm text-text shadow-sm transition-colors placeholder:text-text-soft hover:border-border-strong focus-visible:outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus-soft disabled:cursor-not-allowed disabled:opacity-60";

function formatPhoneNumber(phone: string) {
  const clean = phone.trim().replace(/\s+/g, "");
  if (clean.startsWith("0")) return "+254" + clean.substring(1);
  if (clean.startsWith("254")) return "+" + clean;
  return clean;
}

function Hint({ children }: { children: ReactNode }) {
  return (
    <span className="text-text-soft font-normal text-xs ml-1">{children}</span>
  );
}

export default function RegistrationForm({ eventId, event, onSuccess }: Props) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const { user } = useAuth();

  // The organizer's questions, with anything unusable in the stored JSON
  // filtered out. An event with no `registration_questions` column yet falls
  // back to the built-in set.
  const questions = useMemo(() => {
    const stored = event ? normalizeQuestions(event.registration_questions) : null;
    if (stored) return stored;
    return event ? questionsFor(event) : BUILT_IN_QUESTIONS;
  }, [event]);

  const core = questions.filter((question) => CORE_IDS.includes(question.id));
  const extra = questions.filter((question) => !CORE_IDS.includes(question.id));

  const [values, setValues] = useState<Record<string, string>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setValue = (key: string, value: string) =>
    setValues((previous) => ({ ...previous, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!agreedToTerms) {
      setError("Please agree to the terms before registering.");
      return;
    }

    const missing = missingRequired(questions, values);
    if (missing.length) {
      setError(`Please answer: ${missing.join(", ")}.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { columns, custom } = splitAnswers(questions, values);

      const row = {
        event_id: eventId,
        user_id: user?.id ?? null,
        // The attendees table has these two columns as not-null, so they are
        // always written even if the organizer removed the question.
        full_name: columns.full_name?.trim() || "Guest",
        phone_number: columns.phone_number
          ? formatPhoneNumber(columns.phone_number)
          : "",
        email: columns.email?.trim() || null,
        organization: columns.organization?.trim() || null,
        job_title: columns.job_title?.trim() || null,
        dietary_notes: columns.dietary_notes?.trim() || null,
        referral_source: columns.referral_source || null,
        custom_answers: Object.keys(custom).length ? custom : null,
      };

      let { data, error: supabaseError } = await supabase
        .from("attendees")
        .insert([row])
        .select()
        .single();

      // The custom-answers column arrives with migration 005. If it is not
      // there yet, register without it rather than losing the registration.
      if (supabaseError && isMissingColumnError(supabaseError)) {
        const withoutCustom = { ...row } as Record<string, unknown>;
        delete withoutCustom.custom_answers;

        const retry = await supabase
          .from("attendees")
          .insert([withoutCustom])
          .select()
          .single();

        data = retry.data;
        supabaseError = retry.error;
      }

      if (supabaseError) throw supabaseError;
      onSuccess(data.id, row.phone_number);
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to register. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: RegistrationQuestion) => {
    const Icon = TYPE_ICON[question.type] ?? Type;
    const value = values[question.id] ?? "";

    if (question.type === "long_text") {
      return (
        <div className="space-y-1.5">
          <label htmlFor={id(question.id)} className={LABEL}>
            <Icon className="w-4 h-4 text-text-soft" /> {question.label}
            {question.required && <span className="text-danger">*</span>}
          </label>
          <textarea
            id={id(question.id)}
            rows={2}
            disabled={isSubmitting}
            className={TEXTAREA}
            value={value}
            onChange={(e) => setValue(question.id, e.target.value)}
            placeholder={question.placeholder}
          />
        </div>
      );
    }

    if (question.type === "select") {
      return (
        <div className="space-y-1.5">
          <label className={LABEL}>
            <Icon className="w-4 h-4 text-text-soft" /> {question.label}
            {question.required && <span className="text-danger">*</span>}
          </label>
          <Select
            value={value}
            onValueChange={(next: string | null) =>
              setValue(question.id, next ?? "")
            }
          >
            <SelectTrigger className="w-full" disabled={isSubmitting}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {(question.options ?? []).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (question.type === "checkbox") {
      return (
        <label
          htmlFor={id(question.id)}
          className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-muted cursor-pointer hover:border-brand-border transition-colors"
        >
          <input
            id={id(question.id)}
            type="checkbox"
            disabled={isSubmitting}
            checked={value === "Yes"}
            onChange={(e) => setValue(question.id, e.target.checked ? "Yes" : "")}
            className="w-4 h-4 rounded border-border text-brand focus:ring-focus accent-brand"
          />
          <span className="flex items-center gap-1.5">
            <Icon className="w-4 h-4 text-text-soft" />
            {question.label}
            {question.required && <span className="text-danger">*</span>}
          </span>
        </label>
      );
    }

    const inputType =
      question.type === "email"
        ? "email"
        : question.type === "phone"
          ? "tel"
          : question.type === "number"
            ? "number"
            : "text";

    return (
      <div className="space-y-1.5">
        <label htmlFor={id(question.id)} className={LABEL}>
          <Icon className="w-4 h-4 text-text-soft" /> {question.label}
          {question.required && <span className="text-danger">*</span>}
          {!question.required && question.type === "phone" && (
            <Hint>(for SMS updates)</Hint>
          )}
        </label>
        <Input
          id={id(question.id)}
          type={inputType}
          inputMode={
            question.type === "email"
              ? "email"
              : question.type === "phone"
                ? "tel"
                : question.type === "number"
                  ? "numeric"
                  : undefined
          }
          autoComplete={
            question.id === "full_name"
              ? "name"
              : question.id === "phone_number"
                ? "tel"
                : question.id === "email"
                  ? "email"
                  : question.id === "organization"
                    ? "organization"
                    : undefined
          }
          disabled={isSubmitting}
          value={value}
          onChange={(e) => setValue(question.id, e.target.value)}
          placeholder={question.placeholder}
        />
      </div>
    );
  };

  const hasQuestions = questions.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-surface shadow-sm ring-border">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <CardHeader>
            <CardTitle className="font-heading text-xl text-text">
              Register for this event
            </CardTitle>
            <CardDescription className="text-text-soft">
              {hasQuestions
                ? "Fields marked with * are required."
                : "The organizer has not asked for any details — just confirm below."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 p-3 text-sm text-danger bg-danger-bg border border-danger-border rounded-lg"
              >
                <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {core.length > 0 && (
              <div className="space-y-4">
                <h4 className={SECTION_TITLE}>Your details</h4>
                <div className="space-y-4">{core.map(renderQuestion)}</div>
              </div>
            )}

            {extra.length > 0 && (
              <div className="space-y-4">
                <h4 className={SECTION_TITLE}>Additional information</h4>
                <div className="space-y-4">{extra.map(renderQuestion)}</div>
              </div>
            )}

            {/* Terms */}
            <label
              htmlFor={id("terms")}
              className="flex items-start gap-3 text-sm text-text-muted p-3 rounded-lg bg-surface-muted border border-border cursor-pointer"
            >
              <input
                id={id("terms")}
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-5 h-5 shrink-0 rounded border-border-strong accent-brand cursor-pointer"
              />
              <span className="leading-snug">
                I agree to receive SMS communication about this event and
                confirm the details above are accurate.
              </span>
            </label>

            {event?.is_paid && (
              <p className="flex items-start gap-2 rounded-lg border border-tag-teal/30 bg-tag-teal-bg px-3 py-2.5 text-xs text-text-muted leading-relaxed">
                <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-tag-teal" />
                <span>
                  This is a paid event. After registering, you will be asked to
                  pay{" "}
                  <strong className="text-text">
                    KES {Number(event.ticket_price || 0).toLocaleString("en-KE")}
                  </strong>{" "}
                  by M-Pesa to secure your ticket.
                </span>
              </p>
            )}
          </CardContent>

          <CardFooter className="flex-col items-stretch gap-3 border-border bg-surface-muted/50 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-1.5 text-xs text-text-soft">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              Your details are shared only with the organizer.
            </p>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11 gap-2 shadow-md shadow-shadow-brand"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering…
                </>
              ) : (
                "Secure my spot"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
