import { useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, Mail, Briefcase, Utensils, MessageCircle, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";

// Shadcn UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  const formatPhoneNumber = (phone: string) => {
    let cleanPhone = phone.trim().replace(/\s+/g, "");
    if (cleanPhone.startsWith("0")) return "+254" + cleanPhone.substring(1);
    if (cleanPhone.startsWith("254")) return "+" + cleanPhone;
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-slate-200 shadow-sm bg-white">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Register for this Event</CardTitle>
            <CardDescription>Fields marked with * are required.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Section 1: Your Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
                Your Details
              </h4>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <User className="w-4 h-4 text-slate-400" /> Full Name *
                  </label>
                  <Input 
                    required 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400" /> Phone Number *
                    <span className="text-slate-400 font-normal text-xs ml-1">(for SMS updates)</span>
                  </label>
                  <Input 
                    required 
                    type="tel"
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    placeholder="e.g. 0711223344"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400" /> Email
                    <span className="text-slate-400 font-normal text-xs ml-1">(optional)</span>
                  </label>
                  <Input 
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Professional Info */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
                Professional Info (Optional)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <Briefcase className="w-4 h-4 text-slate-400" /> Organization
                  </label>
                  <Input 
                    value={organization} 
                    onChange={(e) => setOrganization(e.target.value)} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    Job Title
                  </label>
                  <Input 
                    value={jobTitle} 
                    onChange={(e) => setJobTitle(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Additional Info */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
                Additional Info (Optional)
              </h4>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <Utensils className="w-4 h-4 text-slate-400" /> Dietary or Accessibility Needs
                  </label>
                  {/* Using standard Shadcn Input classes for the textarea */}
                  <textarea
                    rows={2}
                    className="flex w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    value={dietaryNotes}
                    onChange={(e) => setDietaryNotes(e.target.value)}
                    placeholder="e.g. Vegetarian, wheelchair access needed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <MessageCircle className="w-4 h-4 text-slate-400" /> How did you hear about this event?
                  </label>
                  <Select value={referralSource} onValueChange={setReferralSource}>
                    <SelectTrigger className="w-full">
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

            {/* Terms Checkbox */}
            <label className="flex items-start gap-2.5 text-sm text-slate-600 pt-2">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="leading-snug">
                I agree to receive SMS communication about this event and confirm the details above are accurate.
              </span>
            </label>
          </CardContent>

          <CardFooter className="pt-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSubmitting ? "Registering…" : "Secure My Spot"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}