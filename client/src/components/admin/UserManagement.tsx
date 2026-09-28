import { useState, useEffect } from "react";
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
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";

interface Profile {
  id: string;
  name: string;
  email: string;
  role: "admin" | "organizer" | "attendee";
  status: "active" | "suspended";
  created_at: string;
}

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from Supabase on load
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
    } else if (data) {
      setUsers(data);
    }
    setLoading(false);
  }

  // Toggle user status in Supabase database
  const toggleUserStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";

    // Optimistic UI update
    setUsers(users.map((u) => (u.id === id ? { ...u, status: newStatus } : u)));

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("id", id);

    if (updateError) {
      setError("Failed to update user status in database.");
      // Revert if error occurs
      fetchUsers();
    }
  };

  // Filter logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleStyles: Record<string, { icon: any; color: string }> = {
    admin: {
      icon: Shield,
      color:
        "text-[var(--color-role-admin)] bg-[var(--color-role-admin-bg)] ring-[var(--color-role-admin-border)]",
    },
    organizer: {
      icon: CalendarDays,
      color:
        "text-[var(--color-role-organizer)] bg-[var(--color-role-organizer-bg)] ring-[var(--color-role-organizer-border)]",
    },
    attendee: {
      icon: User,
      color:
        "text-[var(--color-success)] bg-[var(--color-success-bg)] ring-[var(--color-success-border)]",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden"
    >
      {/* Toolbar */}
      <div className="p-5 border-b border-[var(--color-border)] flex flex-col sm:flex-row gap-4 justify-between items-center bg-[var(--color-surface-muted)]">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-soft)] group-focus-within:text-[var(--color-brand)]" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[var(--color-text-soft)]" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] bg-[var(--color-surface)] cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="organizer">Organizers</option>
            <option value="attendee">Attendees</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[var(--color-danger-bg)] text-[var(--color-danger)] text-sm border-b border-[var(--color-danger-border)]">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[var(--color-text-muted)]">
          <thead className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border)] text-[var(--color-text-soft)] uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-[var(--color-text-muted)]"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[var(--color-brand)]" />
                    Loading users from database...
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const RoleIcon = roleStyles[user.role]?.icon || User;
                return (
                  <tr
                    key={user.id}
                    className="hover:bg-[var(--color-surface-muted)] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--color-text)]">
                        {user.name || "Unnamed User"}
                      </div>
                      <div className="text-[var(--color-text-muted)] text-xs mt-0.5">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 capitalize ${roleStyles[user.role]?.color || "text-[var(--color-text-muted)] bg-[var(--color-surface-muted)] ring-[var(--color-border)]"}`}
                      >
                        <RoleIcon className="w-3.5 h-3.5" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.status === "active" ? (
                        <span className="inline-flex items-center gap-1 text-[var(--color-success)] text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[var(--color-danger)] text-xs font-medium">
                          <Ban className="w-3.5 h-3.5" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.role !== "admin" && (
                          <button
                            onClick={() =>
                              toggleUserStatus(user.id, user.status)
                            }
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                              user.status === "active"
                                ? "text-[var(--color-danger)] bg-[var(--color-danger-bg)] hover:bg-[var(--color-danger-hover)]"
                                : "text-[var(--color-success)] bg-[var(--color-success-bg)] hover:bg-[var(--color-success-hover)]"
                            }`}
                          >
                            {user.status === "active" ? "Suspend" : "Activate"}
                          </button>
                        )}
                        <button className="p-1.5 text-[var(--color-text-soft)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] rounded-md transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-[var(--color-text-muted)]"
                >
                  No users found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
