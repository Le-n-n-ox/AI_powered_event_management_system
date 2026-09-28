// client/src/components/ui/RegistrationForm.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  Briefcase,
  Utensils,
  MessageCircle,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

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

export default function RegistrationForm({ eventId, onSuccess }: Props) {
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

  // Helper function to format the phone number to +254
  const formatPhoneNumber = (phone: string) => {
    let cleanPhone = phone.trim().replace(/\s+/g, "");
    if (cleanPhone.startsWith("0")) {
      return "+254" + cleanPhone.substring(1);
    }
    if (cleanPhone.startsWith("254")) {
      return "+" + cleanPhone;
    }
    return cleanPhone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError("Please agree to the terms before registering.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formattedPhone = formatPhoneNumber(phoneNumber);

    try {
      const { error: supabaseError } = await supabase.from("attendees").insert([
        {
          event_id: eventId,
          full_name: fullName,
          phone_number: formattedPhone,
          email: email || null,
          organization: organization || null,
          job_title: jobTitle || null,
          dietary_notes: dietaryNotes || null,
          referral_source: referralSource || null,
        },
      ]);

      if (supabaseError) throw supabaseError;

      onSuccess();
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-[var(--color-surface)] p-6 rounded-xl shadow-sm border border-[var(--color-border)]"
    >
      <div>
        <h3 className="text-xl font-heading font-bold text-[var(--color-text)]">
          Register for this Event
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Fields marked with * are required.
        </p>
      </div>

      {error && (
        <div className="text-[var(--color-danger)] text-sm p-3 bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] rounded-lg">
          {error}
        </div>
      )}

      <div className="border-t border-[var(--color-border)] pt-4">
        <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-3">
          Your Details
        </p>

        <div className="flex flex-col gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] mb-1">
              <User className="w-3.5 h-3.5 text-[var(--color-text-soft)]" />
              Full Name *
            </label>
            <input
              required
              type="text"
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] mb-1">
              <Phone className="w-3.5 h-3.5 text-[var(--color-text-soft)]" />
              Phone Number *{" "}
              <span className="text-[var(--color-text-soft)] font-normal">
                (for SMS updates)
              </span>
            </label>
            <input
              required
              type="tel"
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 0711223344"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] mb-1">
              <Mail className="w-3.5 h-3.5 text-[var(--color-text-soft)]" />
              Email{" "}
              <span className="text-[var(--color-text-soft)] font-normal">
                (optional)
              </span>
            </label>
            <input
              type="email"
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] pt-4">
        <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-3">
          Professional Info (Optional)
        </p>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] mb-1">
              <Briefcase className="w-3.5 h-3.5 text-[var(--color-text-soft)]" />
              Organization
            </label>
            <input
              type="text"
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
              Job Title
            </label>
            <input
              type="text"
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] pt-4">
        <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-3">
          Additional Info (Optional)
        </p>

        <div className="flex flex-col gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] mb-1">
              <Utensils className="w-3.5 h-3.5 text-[var(--color-text-soft)]" />
              Dietary or Accessibility Needs
            </label>
            <textarea
              rows={2}
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
              value={dietaryNotes}
              onChange={(e) => setDietaryNotes(e.target.value)}
              placeholder="e.g. Vegetarian, wheelchair access needed"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] mb-1">
              <MessageCircle className="w-3.5 h-3.5 text-[var(--color-text-soft)]" />
              How did you hear about this event?
            </label>
            <select
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] bg-[var(--color-surface)]"
              value={referralSource}
              onChange={(e) => setReferralSource(e.target.value)}
            >
              <option value="">Select an option</option>
              {REFERRAL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-4">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-0.5 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-focus)]"
        />
        I agree to receive SMS communication about this event and confirm the
        details above are accurate.
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 bg-[var(--color-brand)] text-[var(--color-text-on-dark)] py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-[var(--color-brand-hover)] disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? "Registering…" : "Secure My Spot"}
      </button>
    </motion.form>
  );
}
