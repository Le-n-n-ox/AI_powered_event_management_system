import { useEffect, useMemo, useState } from "react";
import {
  UsersRound,
  CalendarDays,
  Ticket,
  Wallet,
  Ban,
  CircleCheckBig,
  Loader2,
  TriangleAlert,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { formatMoney } from "../../lib/events";
import StatTile from "../../components/charts/StatTile";
import LineChart from "../../components/charts/LineChart";
import BarChart from "../../components/charts/BarChart";
import ChartCard from "../../components/charts/ChartCard";
import { useChartPalette } from "../../components/charts/chart-utils";

interface AnalyticsShape {
  totals: {
    users: number;
    organizers: number;
    attendees: number;
    suspended: number;
    events: number;
    upcoming_events: number;
    registrations: number;
    paid_transactions: number;
  };
  revenue: { gross: number; refunded: number };
  registrations_by_day: { day: string; count: number }[];
  top_organizers: {
    id: string;
    name: string;
    events: number;
    registrations: number;
  }[];
}

const EMPTY: AnalyticsShape = {
  totals: {
    users: 0,
    organizers: 0,
    attendees: 0,
    suspended: 0,
    events: 0,
    upcoming_events: 0,
    registrations: 0,
    paid_transactions: 0,
  },
  revenue: { gross: 0, refunded: 0 },
  registrations_by_day: [],
  top_organizers: [],
};

const CARD = "bg-surface rounded-xl border border-border shadow-sm";

/**
 * Computes the same shape as the admin_platform_analytics() RPC by reading
 * the tables directly. Used when the migrations have not been applied yet.
 */
async function computeFallback(): Promise<AnalyticsShape> {
  const [profilesRes, eventsRes, attendeesRes, transactionsRes] =
    await Promise.all([
      supabase.from("profiles").select("id, role, suspended, full_name"),
      supabase.from("events").select("id, name, organizer_id, status, start_date"),
      supabase.from("attendees").select("id, event_id, registered_at, status"),
      supabase.from("transactions").select("id, amount, status, event_id"),
    ]);

  const profiles = (profilesRes.data ?? []) as {
    id: string;
    role: string;
    suspended: boolean;
    full_name: string | null;
  }[];
  const events = (eventsRes.data ?? []) as {
    id: string;
    name: string;
    organizer_id: string;
    status: string;
  }[];
  const attendees = (attendeesRes.data ?? []) as {
    id: string;
    event_id: string;
    registered_at: string;
    status: string;
  }[];
  const transactions = (transactionsRes.data ?? []) as {
    id: string;
    amount: number;
    status: string;
    event_id: string;
  }[];

  const nameById = new Map(
    profiles.map((p) => [p.id, p.full_name || p.id] as const),
  );
  const organizerNameByEvent = new Map(
    events.map((e) => [e.id, e.organizer_id] as const),
  );

  const byDay = new Map<string, number>();
  for (const attendee of attendees) {
    const day = attendee.registered_at.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }

  const perOrganizer = new Map<
    string,
    { events: number; registrations: number }
  >();
  for (const event of events) {
    const owner = organizerNameByEvent.get(event.id);
    if (!owner) continue;
    const entry = perOrganizer.get(owner) ?? { events: 0, registrations: 0 };
    entry.events += 1;
    perOrganizer.set(owner, entry);
  }
  for (const attendee of attendees) {
    const owner = organizerNameByEvent.get(attendee.event_id);
    if (!owner) continue;
    const entry = perOrganizer.get(owner) ?? { events: 0, registrations: 0 };
    entry.registrations += 1;
    perOrganizer.set(owner, entry);
  }

  return {
    totals: {
      users: profiles.length,
      organizers: profiles.filter((p) => p.role === "organizer").length,
      attendees: profiles.filter((p) => p.role === "attendee").length,
      suspended: profiles.filter((p) => p.suspended).length,
      events: events.length,
      upcoming_events: events.filter((e) => e.status === "upcoming").length,
      registrations: attendees.length,
      paid_transactions: transactions.filter((t) => t.status === "paid").length,
    },
    revenue: {
      gross: transactions
        .filter((t) => t.status === "paid")
        .reduce((sum, t) => sum + Number(t.amount), 0),
      refunded: transactions
        .filter((t) => t.status === "refunded")
        .reduce((sum, t) => sum + Number(t.amount), 0),
    },
    registrations_by_day: [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, count]) => ({ day, count })),
    top_organizers: [...perOrganizer.entries()]
      .map(([id, entry]) => ({ id, name: nameById.get(id) ?? id, ...entry }))
      .sort((a, b) => b.registrations - a.registrations)
      .slice(0, 6),
  };
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsShape>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"rpc" | "direct">("rpc");
  const palette = useChartPalette();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          "admin_platform_analytics",
        );

        if (!cancelled && !rpcError && rpcData) {
          setData(rpcData as AnalyticsShape);
          setSource("rpc");
          setLoading(false);
          return;
        }

        // The RPC needs the migrations — fall back to reading the tables.
        const fallback = await computeFallback();
        if (!cancelled) {
          setData(fallback);
          setSource("direct");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load analytics.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const trend = useMemo(
    () =>
      data.registrations_by_day.map((entry) => ({
        label: new Date(entry.day).toLocaleDateString("en-KE", {
          day: "2-digit",
          month: "short",
        }),
        value: entry.count,
      })),
    [data.registrations_by_day],
  );

  const organizerBars = useMemo(
    () =>
      data.top_organizers.map((organizer) => ({
        label: organizer.name,
        value: organizer.registrations,
        hint: `${organizer.events} event${organizer.events === 1 ? "" : "s"}`,
      })),
    [data.top_organizers],
  );

  if (loading) {
    return (
      <div className={`${CARD} p-12 flex items-center justify-center gap-2 text-text-soft`}>
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading analytics…
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className={`${CARD} p-6 flex items-start gap-2 text-danger text-sm`}
      >
        <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Total Users"
          value={data.totals.users}
          icon={<UsersRound className="w-5 h-5" />}
          tone="brand"
          hint={`${data.totals.organizers} organizers · ${data.totals.attendees} attendees`}
        />
        <StatTile
          label="Events"
          value={data.totals.events}
          icon={<CalendarDays className="w-5 h-5" />}
          tone="info"
          hint={`${data.totals.upcoming_events} upcoming`}
        />
        <StatTile
          label="Registrations"
          value={data.totals.registrations}
          icon={<Ticket className="w-5 h-5" />}
          tone="success"
          hint={`${data.totals.paid_transactions} paid tickets`}
        />
        <StatTile
          label="Gross Revenue"
          value={formatMoney(data.revenue.gross)}
          icon={<Wallet className="w-5 h-5" />}
          tone="brand"
          hint={
            data.revenue.refunded > 0
              ? `${formatMoney(data.revenue.refunded)} refunded`
              : "No refunds"
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          className="lg:col-span-2"
          title="Registrations over time"
          subtitle="Sign-ups across the whole platform"
          table={{
            columns: ["Day", "Sign-ups"],
            rows: trend.map((point) => [point.label, point.value]),
          }}
        >
          <LineChart
            data={trend}
            color={palette.series.brand}
            emptyMessage="No registrations yet."
          />
        </ChartCard>

        <div className="space-y-6">
          <ChartCard
            title="Top organizers"
            subtitle="By registrations pulled in"
            table={{
              columns: ["Organizer", "Registrations", "Events"],
              rows: data.top_organizers.map((organizer) => [
                organizer.name,
                organizer.registrations,
                organizer.events,
              ]),
            }}
          >
            <BarChart
              data={organizerBars}
              color={palette.series.violet}
              emptyMessage="No organizer activity yet."
            />
          </ChartCard>

          <div className={`${CARD} p-6`}>
            <h3 className="text-lg font-semibold text-text mb-3">
              Account health
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-text-muted">
                  <CircleCheckBig className="w-4 h-4 text-success" />
                  Active accounts
                </span>
                <span className="font-semibold text-text tabular-nums">
                  {data.totals.users - data.totals.suspended}
                </span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-text-muted">
                  <Ban className="w-4 h-4 text-danger" />
                  Suspended
                </span>
                <span className="font-semibold text-text tabular-nums">
                  {data.totals.suspended}
                </span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-text-muted">
                  <Building2 className="w-4 h-4 text-brand" />
                  Organizers
                </span>
                <span className="font-semibold text-text tabular-nums">
                  {data.totals.organizers}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {source === "direct" && (
        <p className="text-xs text-text-soft">
          Showing figures read directly from the database. Run the migrations in{" "}
          <code className="font-mono">server/db/migrations</code> for the
          server-side rollup.
        </p>
      )}
    </motion.div>
  );
}
