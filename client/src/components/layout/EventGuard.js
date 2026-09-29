import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import AccessDenied from "./AccessDenied";
function EventGuard({ children }) {
    const { id } = useParams();
    const { user, isAdmin } = useAuth();
    const [status, setStatus] = useState("checking");
    useEffect(() => {
        if (!id || !user)
            return;
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
            .then(({ data }) => setStatus(data?.organizer_id === user.id ? "allowed" : "denied"));
    }, [id, user?.id, isAdmin]);
    if (status === "checking")
        return (_jsx("p", { className: "p-6 text-[var(--color-text-muted)]", children: "Checking access\u2026" }));
    if (status === "denied")
        return _jsx(AccessDenied, { message: "You can only manage events you created." });
    return _jsx(_Fragment, { children: children });
}
export default EventGuard;
