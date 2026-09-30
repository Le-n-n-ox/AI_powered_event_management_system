import { useEffect, useState, type FormEvent } from "react";
import { User, Phone, Mail, Lock, Loader2, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { formatPhoneNumber } from "../utils/phone";
import { Field, ErrorBanner, InfoBanner } from "../components/auth/AuthUI";

const BTN =
  "flex items-center justify-center gap-2 h-11 px-4 rounded-lg text-sm font-semibold text-text-on-dark bg-brand hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors";

export default function Profile() {
  const { user, role } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileInfo, setProfileInfo] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordInfo, setPasswordInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, phone_number")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setFullName(data?.full_name ?? "");
        setPhone(data?.phone_number ?? "");
        setLoadingProfile(false);
      });
  }, [user?.id]);

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setProfileError(null);
    setProfileInfo(null);
    setSavingProfile(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone_number: phone ? formatPhoneNumber(phone) : null,
      })
      .eq("id", user.id);

    setSavingProfile(false);
    if (error) return setProfileError(error.message);
    setProfileInfo("Profile updated.");
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordInfo(null);

    if (newPassword.length < 6) {
      return setPasswordError("Password must be at least 6 characters.");
    }
    if (newPassword !== confirmPassword) {
      return setPasswordError("Passwords do not match.");
    }

    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);

    if (error) return setPasswordError(error.message);
    setPasswordInfo("Password changed.");
    setNewPassword("");
    setConfirmPassword("");
  }

  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : "";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text tracking-tight">
            My Profile
          </h1>
          {roleLabel && <p className="text-sm text-text-soft mt-1">{roleLabel} account</p>}
        </div>

        <div className="bg-surface-muted border border-border rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-heading text-lg font-semibold text-text mb-4">Account details</h2>

          {loadingProfile ? (
            <div className="flex items-center gap-2 text-text-soft text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
              <Field
                label="Full name"
                icon={User}
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <Field
                label="Email"
                icon={Mail}
                value={user?.email ?? ""}
                disabled
                hint="Email can't be changed here."
              />
              <Field
                label="Phone number"
                icon={Phone}
                type="tel"
                placeholder="e.g. 0711223344"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <ErrorBanner message={profileError} />
              <InfoBanner message={profileInfo} />

              <button type="submit" disabled={savingProfile} className={BTN}>
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingProfile ? "Saving…" : "Save changes"}
              </button>
            </form>
          )}
        </div>

        <div className="bg-surface-muted border border-border rounded-xl shadow-sm p-6">
          <h2 className="font-heading text-lg font-semibold text-text mb-4">Change password</h2>

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <Field
              label="New password"
              icon={Lock}
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Field
              label="Confirm new password"
              icon={Lock}
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <ErrorBanner message={passwordError} />
            <InfoBanner message={passwordInfo} />

            <button type="submit" disabled={savingPassword} className={BTN}>
              {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {savingPassword ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}