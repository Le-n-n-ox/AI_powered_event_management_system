import { useState } from "react";
import { Search, MoreVertical, Ban, CheckCircle, Shield, User, CalendarDays, Filter } from "lucide-react";
import { motion } from "framer-motion";

// --- Mock Data (To visualize before connecting Supabase) ---
const MOCK_USERS = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "organizer", status: "active", joined: "2026-01-15" },
  { id: "2", name: "Bob Smith", email: "bob@techhub.ke", role: "organizer", status: "suspended", joined: "2026-03-22" },
  { id: "3", name: "Charlie Davis", email: "charlie@gmail.com", role: "attendee", status: "active", joined: "2026-08-10" },
  { id: "4", name: "Diana Prince", email: "admin@platform.com", role: "admin", status: "active", joined: "2025-11-05" },
  { id: "5", name: "Evan Wright", email: "evan.w@yahoo.com", role: "attendee", status: "active", joined: "2026-09-12" },
];

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  // Local state for mock data manipulation (suspending/activating)
  const [users, setUsers] = useState(MOCK_USERS);

  // Filter logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                          user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Mock action handlers
  const toggleUserStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
  };

  const roleStyles: Record<string, { icon: any, color: string }> = {
    admin: { icon: Shield, color: "text-purple-600 bg-purple-50 ring-purple-200" },
    organizer: { icon: CalendarDays, color: "text-indigo-600 bg-indigo-50 ring-indigo-200" },
    attendee: { icon: User, color: "text-emerald-600 bg-emerald-50 ring-emerald-200" },
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
    >
      {/* Toolbar */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="organizer">Organizers</option>
            <option value="attendee">Attendees</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const RoleIcon = roleStyles[user.role].icon;
                return (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 capitalize ${roleStyles[user.role].color}`}>
                        <RoleIcon className="w-3.5 h-3.5" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.status === "active" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium">
                          <Ban className="w-3.5 h-3.5" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(user.joined).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Actions Dropdown / Buttons */}
                      <div className="flex items-center justify-end gap-2">
                        {user.role !== "admin" && (
                          <button 
                            onClick={() => toggleUserStatus(user.id, user.status)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                              user.status === "active" 
                                ? "text-red-600 bg-red-50 hover:bg-red-100" 
                                : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                            }`}
                          >
                            {user.status === "active" ? "Suspend" : "Activate"}
                          </button>
                        )}
                        <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
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