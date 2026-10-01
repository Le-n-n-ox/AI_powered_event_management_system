import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import UserManagement from "../../components/admin/UserManagement";
import EventCard from "@/components/ui/EventCard";
import { useEvents } from "../../hooks/useEvents";
import { supabase } from "../../lib/supabase";
import type { Event } from "../../types/event";
import {
  UsersRound,
  CalendarDays,
  LineChart,
  TriangleAlert,
  Ban,
  CheckCircle,
  Loader2,
  UserRound,
  Check,
} from "lucide-react";

const TABS = ["overview", "users", "events", "logs"] as const;
type AdminTab = (typeof TABS)[number];

const CARD = "bg-surface rounded-xl border border-border shadow-sm";

interface Stats {
  totalUsers: number | null;
  activeOrganizers: number | null;
  upcomingEvents: number | null;
  suspendedAccounts: number | null;
}

interface Alert {
  id: string;
  type: string;
  message: string;
  resolved: boolean;
  created_at: string;
}

interface AuditEntry {
  id: string;
  action: string;
  target_type: string | null;
  detail: string | null;
  created_at: string;
  actor_id: string | null;
}

function useAdminStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: null,
    activeOrganizers: null,
    upcomingEvents: null,
    suspendedAccounts: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [usersRes, organizersRes, eventsRes, suspendedRes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "organizer"),
        supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("status", "upcoming"),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("suspended", true),
      ]);

      if (cancelled) return;

      setStats({
        totalUsers: usersRes.count,
        activeOrganizers: organizersRes.count,
        upcomingEvents: eventsRes.count,
        suspendedAccounts: suspendedRes.count,
      });
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading };
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  icon: typeof UsersRound;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${CARD} p-6 flex items-center gap-4`}>
      <div className={`p-3 rounded-lg ${bg} ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-text-soft">{label}</p>
        <p className="text-2xl font-bold text-text">{value}</p>
      </div>
    </div>
  );
}

function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("admin_alerts")
      .select("*")
      .eq("resolved", false)
      .order("created_at", { ascending: false })
      .limit(10);
    setAlerts(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function resolve(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    await supabase.from("admin_alerts").update({ resolved: true }).eq("id", id);
  }

  return (
    <div className={`${CARD} p-6`}>
      <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
        <TriangleAlert size={20} className="text-warning" />
        Needs Attention
      </h3>

      {loading ? (
        <div className="flex items-center gap-2 text-text-soft text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading…
        </div>
      ) : alerts.length === 0 ? (
        <p className="text-sm text-text-soft">Nothing needs attention right now.</p>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="flex items-start justify-between gap-2 text-sm text-warning bg-warning-bg p-3 rounded-lg border border-warning-border"
            >
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-warning mt-1.5 shrink-0" />
                <span>{alert.message}</span>
              </div>
              <button
                onClick={() => resolve(alert.id)}
                title="Mark resolved"
                aria-label="Mark resolved"
                className="text-warning hover:text-success shrink-0"
              >
                <Check className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AuditLogTab() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("admin_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setEntries(data ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={`${CARD} p-12 flex items-center justify-center gap-2 text-text-soft`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading audit log…
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={`${CARD} p-12 text-center text-text-muted`}>
        <LineChart size={48} className="mx-auto mb-4 text-border-strong" />
        <h2 className="text-xl font-medium text-text">No actions logged yet</h2>
        <p className="mt-2 text-sm">
          Admin actions like suspending an account will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className={`${CARD} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted border-b border-border text-text-soft uppercase text-xs">
            <tr>
              <th className="px-4 py-3 font-semibold">Action</th>
              <th className="px-4 py-3 font-semibold">Target</th>
              <th className="px-4 py-3 font-semibold">Detail</th>
              <th className="px-4 py-3 font-semibold">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-4 py-3 font-medium text-text capitalize">
                  {entry.action.replace(/_/g, " ")}
                </td>
                <td className="px-4 py-3 text-text-muted">{entry.target_type ?? "—"}</td>
                <td className="px-4 py-3 text-text-muted">{entry.detail ?? "—"}</td>
                <td className="px-4 py-3 text-text-soft whitespace-nowrap">
                  {new Date(entry.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
    return <div className={`${CARD} p-6 text-danger text-sm`}>Error: {error}</div>;
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
  const { stats, loading: statsLoading } = useAdminStats();

  const fmt = (n: number | null) => (statsLoading || n === null ? "…" : n.toLocaleString());

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text tracking-tight">System Admin</h1>
            <p className="text-text-soft mt-1">Platform management and security overview.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-text-soft hover:text-text rounded-lg hover:bg-surface transition-colors"
            >
              <UserRound className="w-4 h-4" />
              My Profile
            </Link>
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
        </div>

        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Users"
                value={fmt(stats.totalUsers)}
                icon={UsersRound}
                color="text-info"
                bg="bg-info-bg"
              />
              <StatCard
                label="Organizers"
                value={fmt(stats.activeOrganizers)}
                icon={CheckCircle}
                color="text-success"
                bg="bg-success-bg"
              />
              <StatCard
                label="Upcoming Events"
                value={fmt(stats.upcomingEvents)}
                icon={CalendarDays}
                color="text-brand"
                bg="bg-brand-soft"
              />
              <StatCard
                label="Suspended Accounts"
                value={fmt(stats.suspendedAccounts)}
                icon={Ban}
                color="text-danger"
                bg="bg-danger-bg"
              />
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

              <AlertsPanel />
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
            <AuditLogTab />
          </motion.div>
        )}
      </div>
    </div>
  );
}