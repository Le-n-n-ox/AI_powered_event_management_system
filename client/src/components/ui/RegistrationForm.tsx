import { useId, useState, type FormEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  Briefcase,
  Utensils,
  MessageCircle,
  TriangleAlert,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

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
  onSuccess: () => void;
}

const REFERRAL_OPTIONS = [
  "Social Media",
  "Friend or Colleague",
  "Email",
  "Event Website",
  "Search Engine",
  "Other",
];

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

export default function RegistrationForm({ eventId, onSuccess }: Props) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!agreedToTerms) {
      setError("Please agree to the terms before registering.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: supabaseError } = await supabase.from("attendees").insert([
        {
          event_id: eventId,
          full_name: fullName.trim(),
          phone_number: formatPhoneNumber(phoneNumber),
          email: email.trim() || null,
          organization: organization.trim() || null,
          job_title: jobTitle.trim() || null,
          dietary_notes: dietaryNotes.trim() || null,
          referral_source: referralSource || null,
        },
      ]);

      if (supabaseError) throw supabaseError;
      onSuccess();
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
              Fields marked with * are required.
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

            {/* Your details */}
            <div className="space-y-4">
              <h4 className={SECTION_TITLE}>Your details</h4>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor={id("name")} className={LABEL}>
                    <User className="w-4 h-4 text-text-soft" /> Full name *
                  </label>
                  <Input
                    id={id("name")}
                    required
                    autoComplete="name"
                    disabled={isSubmitting}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={id("phone")} className={LABEL}>
                    <Phone className="w-4 h-4 text-text-soft" /> Phone number *
                    <Hint>(for SMS updates)</Hint>
                  </label>
                  <Input
                    id={id("phone")}
                    required
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    disabled={isSubmitting}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 0711223344"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={id("email")} className={LABEL}>
                    <Mail className="w-4 h-4 text-text-soft" /> Email
                    <Hint>(optional)</Hint>
                  </label>
                  <Input
                    id={id("email")}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    disabled={isSubmitting}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Professional info */}
            <div className="space-y-4">
              <h4 className={SECTION_TITLE}>Professional info (optional)</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor={id("org")} className={LABEL}>
                    <Briefcase className="w-4 h-4 text-text-soft" />{" "}
                    Organization
                  </label>
                  <Input
                    id={id("org")}
                    autoComplete="organization"
                    disabled={isSubmitting}
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor={id("job")} className={LABEL}>
                    Job title
                  </label>
                  <Input
                    id={id("job")}
                    autoComplete="organization-title"
                    disabled={isSubmitting}
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Additional info */}
            <div className="space-y-4">
              <h4 className={SECTION_TITLE}>Additional info (optional)</h4>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor={id("diet")} className={LABEL}>
                    <Utensils className="w-4 h-4 text-text-soft" /> Dietary or
                    accessibility needs
                  </label>
                  <textarea
                    id={id("diet")}
                    rows={2}
                    disabled={isSubmitting}
                    className={TEXTAREA}
                    value={dietaryNotes}
                    onChange={(e) => setDietaryNotes(e.target.value)}
                    placeholder="e.g. Vegetarian, wheelchair access needed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={LABEL}>
                    <MessageCircle className="w-4 h-4 text-text-soft" /> How did
                    you hear about this event?
                  </label>
                  <Select
                    value={referralSource}
                    onValueChange={(value) => setReferralSource(value ?? "")}
                  >
                    <SelectTrigger className="w-full" disabled={isSubmitting}>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {REFERRAL_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

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