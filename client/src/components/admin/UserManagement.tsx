import { useState, useEffect, useMemo } from "react";
import {
  Search,
  MoreVertical,
  Ban,
  CheckCircle,
  Shield,
  User,
  CalendarDays,
  Filter,
  Loader2,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: "admin" | "organizer" | "attendee" | "floor_manager";
  suspended: boolean;
  created_at: string;
}

type RoleFilter = "all" | Profile["role"];

interface RoleStyle {
  icon: LucideIcon;
  color: string;
}

const ROLE_STYLES: { [key: string]: RoleStyle } = {
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

const FALLBACK_ROLE: RoleStyle = {
  icon: User,
  color: "text-text-muted bg-surface-muted ring-border",
};

const FIELD =
  "border border-border rounded-lg bg-surface text-base sm:text-sm text-text h-10 transition-colors hover:border-border-strong focus:outline-none focus:border-focus focus:ring-2 focus:ring-focus-soft";

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function initials(user: Profile) {
  const source = (user.full_name || user.email || "?").trim();
  const parts = source.split(/\s+/);
  const letters =
    parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    const { data, error: dbError } = await supabase.rpc("admin_list_users");

    if (dbError) {
      setError(dbError.message);
    } else if (data) {
      setUsers(data);
    }
    setLoading(false);
  }

  async function toggleUserStatus(id: string, currentlySuspended: boolean) {
    const next = !currentlySuspended;

    setPendingId(id);
    setError(null);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, suspended: next } : u)));

    const {
      data: { session },
    } = await supabase.auth.getSession();

    try {
      const response = await fetch(`${API_URL}/api/admin/users/${id}/suspend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ suspended: next }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }
    } catch {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, suspended: currentlySuspended } : u)),
      );
      setError("Failed to update user status. Please try again.");
    }
    setPendingId(null);
  }

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        (user.full_name?.toLowerCase() || "").includes(q) ||
        (user.email?.toLowerCase() || "").includes(q);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden"
    >
      {/* Toolbar */}
      <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-surface-muted">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-soft transition-colors group-focus-within:text-brand" />
          <input
            type="search"
            aria-label="Search users"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${FIELD} w-full pl-9 pr-3 placeholder:text-text-soft`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-text-soft shrink-0" />
          <select
            aria-label="Filter by role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
            className={`${FIELD} px-3 cursor-pointer w-full sm:w-auto`}
          >
            <option value="all">All roles</option>
            <option value="admin">Admins</option>
            <option value="organizer">Organizers</option>
            <option value="attendee">Attendees</option>
          </select>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 p-4 bg-danger-bg text-danger text-sm border-b border-danger-border"
        >
          <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-sm text-text-muted">
          <thead className="bg-surface-muted border-b border-border text-text-soft uppercase text-xs font-semibold tracking-wide">
            <tr>
              <th scope="col" className="px-4 sm:px-6 py-3">User</th>
              <th scope="col" className="px-4 sm:px-6 py-3">Role</th>
              <th scope="col" className="px-4 sm:px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 hidden md:table-cell">Joined</th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-brand" />
                    Loading users…
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const role = ROLE_STYLES[user.role] ?? FALLBACK_ROLE;
                const RoleIcon = role.icon;
                const active = !user.suspended;
                const busy = pendingId === user.id;
                return (
                  <tr
                    key={user.id}
                    className="hover:bg-surface-muted transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          aria-hidden
                          className="w-9 h-9 shrink-0 rounded-full bg-brand-soft text-brand-strong text-xs font-semibold flex items-center justify-center"
                        >
                          {initials(user)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-text truncate">
                            {user.full_name || "Unnamed user"}
                          </div>
                          <div className="text-text-soft text-xs mt-0.5 truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 capitalize ${role.color}`}
                      >
                        <RoleIcon className="w-3.5 h-3.5" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      {active ? (
                        <span className="inline-flex items-center gap-1 text-success text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-danger text-xs font-medium">
                          <Ban className="w-3.5 h-3.5" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-text-muted hidden md:table-cell whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.role !== "admin" && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => toggleUserStatus(user.id, user.suspended)}
                            className={`min-w-20 px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${FOCUS} ${
                              active
                                ? "text-danger bg-danger-bg hover:bg-danger-hover"
                                : "text-success bg-success-bg hover:bg-success-hover"
                            }`}
                          >
                            {busy ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                            ) : active ? (
                              "Suspend"
                            ) : (
                              "Activate"
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          aria-label={`More actions for ${user.full_name || user.email}`}
                          className={`p-1.5 text-text-soft hover:text-text hover:bg-surface-strong rounded-md transition-colors ${FOCUS}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                  No users match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && (
        <div className="px-4 sm:px-6 py-3 border-t border-border bg-surface-muted text-xs text-text-soft">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      )}
    </motion.div>
  );
}