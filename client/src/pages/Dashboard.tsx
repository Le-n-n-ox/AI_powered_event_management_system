import { useNavigate } from "react-router-dom";
import { CirclePlus, CalendarDays, Loader2, TriangleAlert } from "lucide-react";
import EventCard from "@/components/ui/EventCard";
import { useEvents } from "../hooks/useEvents";
import { useAuth } from "../context/AuthContext";
import { groupEventsByPeriod } from "../utils/dateHelpers";
import type { Event } from "../types/event";
import { Button } from "@/components/ui/button";

import AdminDashboard from "./admin/AdminDashboard";

function EventSection({ title, events }: { title: string; events: Event[] }) {
  return (
    <section className="mb-10">
      <h2 className="font-heading text-sm font-semibold text-text-soft uppercase tracking-wide mb-4 flex items-center gap-2">
        {title}
        <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-brand-soft text-brand-strong text-xs font-medium normal-case tracking-normal">
          {events.length}
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}

function Dashboard() {
  const { events, loading, error } = useEvents();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  if (isAdmin) {
    return <AdminDashboard />;
  }

  const { groups, order } = groupEventsByPeriod(events);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text tracking-tight">
              My Events
            </h1>
            <p className="text-text-soft text-sm mt-1">
              Manage schedules, attendees and registration links.
            </p>
          </div>
          <Button
            onClick={() => navigate("/organizer/events/new")}
            className="gap-2 shadow-lg shadow-shadow-brand"
          >
            <CirclePlus className="w-4 h-4" />
            New Event
          </Button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-text-soft">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading events…
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 p-4 rounded-lg border border-danger-border bg-danger-bg text-danger text-sm"
          >
            <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Error: {error}</span>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="flex flex-col items-center text-center bg-surface border border-dashed border-border-strong rounded-xl p-12">
            <div className="p-3 rounded-lg bg-brand-soft text-brand mb-4">
              <CalendarDays className="w-8 h-8" />
            </div>
            <h2 className="font-heading text-lg font-semibold text-text">
              No events yet
            </h2>
            <p className="text-sm text-text-soft mt-1 mb-5">
              Create your first event to get started.
            </p>
            <Button
              onClick={() => navigate("/organizer/events/new")}
              className="gap-2"
            >
              <CirclePlus className="w-4 h-4" />
              Create Event
            </Button>
          </div>
        )}

        {order.map((key) => (
          <EventSection key={key} title={key} events={groups[key]} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;