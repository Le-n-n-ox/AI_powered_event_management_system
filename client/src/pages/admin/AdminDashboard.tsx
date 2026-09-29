import { useState } from "react";
import { motion } from "framer-motion";
import UserManagement from "../../components/admin/UserManagement";
import EventCard from "@/components/ui/EventCard";
import { useEvents } from "../../hooks/useEvents";
import type { Event } from "../../types/event";
import {
  UsersRound,
  CalendarDays,
  LineChart,
  TriangleAlert,
  Ban,
  CheckCircle,
  Loader2,
} from "lucide-react";

const STATS = [
  {
    label: "Total Users",
    value: "1,248",
    icon: UsersRound,
    color: "text-info",
    bg: "bg-info-bg",
  },
  {
    label: "Active Organizers",
    value: "42",
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success-bg",
  },
  {
    label: "Upcoming Events",
    value: "156",
    icon: CalendarDays,
    color: "text-brand",
    bg: "bg-brand-soft",
  },
  {
    label: "Suspended Accounts",
    value: "3",
    icon: Ban,
    color: "text-danger",
    bg: "bg-danger-bg",
  },
];

const ALERTS = [
  "User reported inappropriate event",
  "Organizer 'TechHub' requested verification",
  "3 failed login attempts from IP 192.168.1.1",
];

const TABS = ["overview", "users", "events", "logs"] as const;
type AdminTab = (typeof TABS)[number];

const CARD = "bg-surface rounded-xl border border-border shadow-sm";

function GlobalEventControl() {
  const { events, loading, error } = useEvents();
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  function handleDeleted(id: string) {
    setRemovedIds((prev) => new Set(prev).add(id));
  }

  const visibleEvents = events.filter((e: Event) => !removedIds.has(e.id));

  if (loading) {
    return (
      <div className={`${CARD} p-12 flex items-center justify-center gap-2 text-text-soft`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading all events…
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${CARD} p-6 text-danger text-sm`}>Error: {error}</div>
    );
  }

  if (visibleEvents.length === 0) {
    return (
      <div className={`${CARD} p-12 text-center text-text-muted`}>
        <CalendarDays size={48} className="mx-auto mb-4 text-border-strong" />
        <h2 className="text-xl font-medium text-text">No events on the platform</h2>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {visibleEvents.map((event: Event) => (
        <EventCard key={event.id} event={event} onDeleted={handleDeleted} />
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text tracking-tight">
              System Admin
            </h1>
            <p className="text-text-soft mt-1">
              Platform management and security overview.
            </p>
          </div>

          <div
            role="tablist"
            className="flex bg-surface rounded-lg p-1 shadow-sm border border-border overflow-x-auto"
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                  activeTab === tab
                    ? "bg-panel-admin text-text-on-dark"
                    : "text-text-soft hover:text-text hover:bg-surface-muted"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {STATS.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={`${CARD} p-6 flex items-center gap-4`}
                  >
                    <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-soft">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-text">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-2 ${CARD} p-6`}>
                <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <LineChart size={20} className="text-brand" />
                  System Health
                </h3>
                <div className="h-48 flex items-center justify-center border-2 border-dashed border-border-strong rounded-lg text-text-soft text-sm bg-surface-muted">
                  [Chart Placeholder: Registrations over time]
                </div>
              </div>

              <div className={`${CARD} p-6`}>
                <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <TriangleAlert size={20} className="text-warning" />
                  Needs Attention
                </h3>
                <ul className="space-y-3">
                  {ALERTS.map((alert) => (
                    <li
                      key={alert}
                      className="flex items-start gap-3 text-sm text-warning bg-warning-bg p-3 rounded-lg border border-warning-border"
                    >
                      <div className="w-2 h-2 rounded-full bg-warning mt-1.5 shrink-0" />
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
            <GlobalEventControl />
          </motion.div>
        )}

        {activeTab === "logs" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={`${CARD} p-12 text-center text-text-muted`}>
              <LineChart
                size={48}
                className="mx-auto mb-4 text-border-strong"
              />
              <h2 className="text-xl font-medium text-text">
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