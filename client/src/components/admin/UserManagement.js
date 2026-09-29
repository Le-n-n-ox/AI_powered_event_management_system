import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { Search, MoreVertical, Ban, CheckCircle, Shield, User, CalendarDays, Filter, Loader2, TriangleAlert, } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
const ROLE_STYLES = {
    admin: {
        icon: Shield,
        color: "text-role-admin bg-role-admin-bg ring-role-admin-border",
    },
    organizer: {
        icon: CalendarDays,
        color: "text-role-organizer bg-role-organizer-bg ring-role-organizer-border",
    },
    attendee: {
        icon: User,
        color: "text-success bg-success-bg ring-success-border",
    },
};
const FALLBACK_ROLE = {
    icon: User,
    color: "text-text-muted bg-surface-muted ring-border",
};
const FIELD = "border border-border rounded-lg bg-surface text-base sm:text-sm text-text h-10 transition-colors hover:border-border-strong focus:outline-none focus:border-focus focus:ring-2 focus:ring-focus-soft";
const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2";
function initials(user) {
    const source = (user.name || user.email || "?").trim();
    const parts = source.split(/\s+/);
    const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
    return letters.toUpperCase();
}
export default function UserManagement() {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pendingId, setPendingId] = useState(null);
    useEffect(() => {
        fetchUsers();
    }, []);
    async function fetchUsers() {
        setLoading(true);
        setError(null);
        const { data, error: dbError } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });
        if (dbError) {
            setError(dbError.message);
        }
        else if (data) {
            setUsers(data);
        }
        setLoading(false);
    }
    async function toggleUserStatus(id, current) {
        const next = current === "active" ? "suspended" : "active";
        setPendingId(id);
        setError(null);
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: next } : u)));
        const { error: updateError } = await supabase
            .from("profiles")
            .update({ status: next })
            .eq("id", id);
        if (updateError) {
            setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: current } : u)));
            setError("Failed to update user status. Please try again.");
        }
        setPendingId(null);
    }
    const filteredUsers = useMemo(() => {
        const q = search.trim().toLowerCase();
        return users.filter((user) => {
            const matchesSearch = (user.name?.toLowerCase() || "").includes(q) ||
                (user.email?.toLowerCase() || "").includes(q);
            const matchesRole = roleFilter === "all" || user.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, search, roleFilter]);
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "bg-surface rounded-xl border border-border shadow-sm overflow-hidden", children: [_jsxs("div", { className: "p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-surface-muted", children: [_jsxs("div", { className: "relative w-full sm:w-96 group", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-soft transition-colors group-focus-within:text-brand" }), _jsx("input", { type: "search", "aria-label": "Search users", placeholder: "Search by name or email", value: search, onChange: (e) => setSearch(e.target.value), className: `${FIELD} w-full pl-9 pr-3 placeholder:text-text-soft` })] }), _jsxs("div", { className: "flex items-center gap-2 w-full sm:w-auto", children: [_jsx(Filter, { className: "w-4 h-4 text-text-soft shrink-0" }), _jsxs("select", { "aria-label": "Filter by role", value: roleFilter, onChange: (e) => setRoleFilter(e.target.value), className: `${FIELD} px-3 cursor-pointer w-full sm:w-auto`, children: [_jsx("option", { value: "all", children: "All roles" }), _jsx("option", { value: "admin", children: "Admins" }), _jsx("option", { value: "organizer", children: "Organizers" }), _jsx("option", { value: "attendee", children: "Attendees" })] })] })] }), error && (_jsxs("div", { role: "alert", className: "flex items-start gap-2 p-4 bg-danger-bg text-danger text-sm border-b border-danger-border", children: [_jsx(TriangleAlert, { className: "w-4 h-4 mt-0.5 shrink-0" }), _jsx("span", { children: error })] })), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full min-w-[34rem] text-left text-sm text-text-muted", children: [_jsx("thead", { className: "bg-surface-muted border-b border-border text-text-soft uppercase text-xs font-semibold tracking-wide", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-4 sm:px-6 py-3", children: "User" }), _jsx("th", { scope: "col", className: "px-4 sm:px-6 py-3", children: "Role" }), _jsx("th", { scope: "col", className: "px-4 sm:px-6 py-3", children: "Status" }), _jsx("th", { scope: "col", className: "px-6 py-3 hidden md:table-cell", children: "Joined" }), _jsx("th", { scope: "col", className: "px-4 sm:px-6 py-3 text-right", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-border", children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "px-6 py-12 text-center text-text-muted", children: _jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx(Loader2, { className: "w-5 h-5 animate-spin text-brand" }), "Loading users\u2026"] }) }) })) : filteredUsers.length > 0 ? (filteredUsers.map((user) => {
                                const role = ROLE_STYLES[user.role] ?? FALLBACK_ROLE;
                                const RoleIcon = role.icon;
                                const active = user.status === "active";
                                const busy = pendingId === user.id;
                                return (_jsxs("tr", { className: "hover:bg-surface-muted transition-colors", children: [_jsx("td", { className: "px-4 sm:px-6 py-3", children: _jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [_jsx("div", { "aria-hidden": true, className: "w-9 h-9 shrink-0 rounded-full bg-brand-soft text-brand-strong text-xs font-semibold flex items-center justify-center", children: initials(user) }), _jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "font-medium text-text truncate", children: user.name || "Unnamed user" }), _jsx("div", { className: "text-text-soft text-xs mt-0.5 truncate", children: user.email })] })] }) }), _jsx("td", { className: "px-4 sm:px-6 py-3", children: _jsxs("span", { className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 capitalize ${role.color}`, children: [_jsx(RoleIcon, { className: "w-3.5 h-3.5" }), user.role] }) }), _jsx("td", { className: "px-4 sm:px-6 py-3", children: active ? (_jsxs("span", { className: "inline-flex items-center gap-1 text-success text-xs font-medium", children: [_jsx(CheckCircle, { className: "w-3.5 h-3.5" }), " Active"] })) : (_jsxs("span", { className: "inline-flex items-center gap-1 text-danger text-xs font-medium", children: [_jsx(Ban, { className: "w-3.5 h-3.5" }), " Suspended"] })) }), _jsx("td", { className: "px-6 py-3 text-text-muted hidden md:table-cell whitespace-nowrap", children: new Date(user.created_at).toLocaleDateString() }), _jsx("td", { className: "px-4 sm:px-6 py-3 text-right", children: _jsxs("div", { className: "flex items-center justify-end gap-2", children: [user.role !== "admin" && (_jsx("button", { type: "button", disabled: busy, onClick: () => toggleUserStatus(user.id, user.status), className: `min-w-20 px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${FOCUS} ${active
                                                            ? "text-danger bg-danger-bg hover:bg-danger-hover"
                                                            : "text-success bg-success-bg hover:bg-success-hover"}`, children: busy ? (_jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin mx-auto" })) : active ? ("Suspend") : ("Activate") })), _jsx("button", { type: "button", "aria-label": `More actions for ${user.name || user.email}`, className: `p-1.5 text-text-soft hover:text-text hover:bg-surface-strong rounded-md transition-colors ${FOCUS}`, children: _jsx(MoreVertical, { className: "w-4 h-4" }) })] }) })] }, user.id));
                            })) : (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "px-6 py-12 text-center text-text-muted", children: "No users match your filters." }) })) })] }) }), !loading && (_jsxs("div", { className: "px-4 sm:px-6 py-3 border-t border-border bg-surface-muted text-xs text-text-soft", children: ["Showing ", filteredUsers.length, " of ", users.length, " users"] }))] }));
}
