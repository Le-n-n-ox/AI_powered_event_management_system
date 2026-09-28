import { useState } from "react";
import { motion } from "framer-motion";
import UserManagement from "../../components/admin/UserManagement";
import {
  Users,
  Calendar,
  Activity,
  ShieldAlert,
  Ban,
  CheckCircle,
} from "lucide-react";

// Mock data to build the UI before we wire up Supabase
const STATS = [
  {
    label: "Total Users",
    value: "1,248",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Active Organizers",
    value: "42",
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Upcoming Events",
    value: "156",
    icon: Calendar,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    label: "Suspended Accounts",
    value: "3",
    icon: Ban,
    color: "text-red-600",
    bg: "bg-red-50",
  },
];

type AdminTab = "overview" | "users" | "events" | "logs";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              System Admin
            </h1>
            <p className="text-gray-500 mt-1">
              Platform management and security overview.
            </p>
          </div>

          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            {(["overview", "users", "events", "logs"] as AdminTab[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                    activeTab === tab
                      ? "bg-slate-900 text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {tab}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Tab Content Routing */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {STATS.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"
                  >
                    <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions & Recent Activity Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity size={20} className="text-indigo-500" /> System
                  Health
                </h3>
                <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-lg text-gray-400 text-sm">
                  [Chart Placeholder: Registrations over time]
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldAlert size={20} className="text-amber-500" /> Needs
                  Attention
                </h3>
                <ul className="space-y-4">
                  {[
                    "User reported inappropriate event",
                    "Organizer 'TechHub' requested verification",
                    "3 failed login attempts from IP 192.168.1.1",
                  ].map((alert, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-gray-600 bg-amber-50/50 p-3 rounded-lg border border-amber-100"
                    >
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      {alert}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "users" && <UserManagement />}

        {activeTab === "events" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-medium text-gray-900">
                Global Event Control
              </h2>
              <p className="mt-2">
                This is where you will manage, delete, and oversee all platform
                events.
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === "logs" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
              <Activity size={48} className="mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-medium text-gray-900">
                System Audit Logs
              </h2>
              <p className="mt-2">
                This is where we will display the chronological feed of all
                platform actions.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
