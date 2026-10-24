import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/auth-context";
import AccessDenied from "./AccessDenied";

function EventGuard({ children }: { children: ReactNode }) {
  const params = useParams();
  const id = params.id || params.eventId;
  const { user, isAdmin } = useAuth();
  const userId = user?.id ?? null;
  const [status, setStatus] = useState<"checking" | "allowed" | "denied">(
    "checking",
  );

  useEffect(() => {
    if (!id || !userId) return;

    const currentUserId = userId;
    let cancelled = false;

    async function checkAccess() {
      // Yield first so the effect never sets state synchronously.
      await Promise.resolve();
      if (cancelled) return;

      if (isAdmin) {
        setStatus("allowed");
        return;
      }

      const { data } = await supabase
        .from("events")
        .select("organizer_id")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;

      setStatus(
        data?.organizer_id === currentUserId ? "allowed" : "denied",
      );
    }

    void checkAccess();

    return () => {
      cancelled = true;
    };
  }, [id, userId, isAdmin]);

  if (status === "checking")
    return (
      <p className="p-6 text-[var(--color-text-muted)]">Checking access…</p>
    );
  if (status === "denied")
    return <AccessDenied message="You can only manage events you created." />;

  return <>{children}</>;
}

export default EventGuard;
