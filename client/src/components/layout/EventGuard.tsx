import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import AccessDenied from "./AccessDenied";

function EventGuard({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const [status, setStatus] = useState<"checking" | "allowed" | "denied">(
    "checking",
  );

  useEffect(() => {
    if (!id || !user) return;
    if (isAdmin) {
      setStatus("allowed");
      return;
    }
    setStatus("checking");
    supabase
      .from("events")
      .select("organizer_id")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) =>
        setStatus(data?.organizer_id === user.id ? "allowed" : "denied"),
      );
  }, [id, user?.id, isAdmin]);

  if (status === "checking")
    return (
      <p className="p-6 text-[var(--color-text-muted)]">Checking access…</p>
    );
  if (status === "denied")
    return <AccessDenied message="You can only manage events you created." />;

  return <>{children}</>;
}

export default EventGuard;
