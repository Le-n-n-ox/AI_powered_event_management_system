// client/src/pages/EventDetail.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import RegistrationForm from '../components/ui/RegistrationForm';
import type { Event } from '../types/event';

// Added interface for schedule items
interface ScheduleItem {
  id: string;
  title: string;
  start_time: string;
  location?: string;
  speaker?: string;
  venue_map_url?: string;
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      if (!id) return;
      
      // Fetch Event Details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventError) {
        console.error('Error fetching event:', eventError);
      } else {
        setEvent(eventData);
      }

      // Fetch Attendee Count
      const { count } = await supabase
        .from('attendees')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id);

      setAttendeeCount(count || 0);

      // Fetch Schedule Items (assuming the table is named 'schedule_items')
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedule_items')
        .select('*')
        .eq('event_id', id)
        .order('start_time', { ascending: true });

      if (scheduleError) {
        console.error('Error fetching schedule:', scheduleError);
      } else if (scheduleData) {
        setScheduleItems(scheduleData);
      }

      setLoading(false);
    }

    fetchEvent();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading event details...</div>;
  if (!event) return <div className="p-10 text-center">Event not found.</div>;

  const spotsLeft = event.capacity ? event.capacity - attendeeCount : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 grid md:grid-cols-2 gap-12">
      {/* Left: Event Info */}
      <div>
        <h1 className="text-4xl font-bold mb-4">{event.name}</h1>

        <div className="bg-gray-50 p-4 rounded-md mb-4 border border-gray-100">
          <p className="font-medium text-gray-700 mb-2">📍 {event.venue_name}</p>
          <p className="text-sm text-gray-500">{event.venue_address}</p>
          {event.venue_map_url && (
            <a
              href={String(event.venue_map_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium inline-block mt-1"
            >
              View on Google Maps →
            </a>
          )}
          <hr className="my-3 border-gray-200" />
          <p className="font-medium text-gray-700">📅 {new Date(event.start_date).toLocaleString()}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {event.capacity && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              isFull ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {isFull ? 'Fully Booked' : `${spotsLeft} spots left`}
            </span>
          )}
          {event.requires_approval && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
              Approval Required
            </span>
          )}
          {event.is_paid ? (
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
              KES {event.ticket_price}
            </span>
          ) : (
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
              Free
            </span>
          )}
        </div>

        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>

        {/* Schedule Section Integrated Here */}
        {scheduleItems.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading text-lg font-bold text-gray-900 mb-3">Schedule</h2>
            <div className="flex flex-col gap-2">
              {scheduleItems.map((item) => (
                <div key={item.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                  <p className="font-medium text-gray-800 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(item.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {item.location && ` · ${item.location}`}
                    {item.speaker && ` · ${item.speaker}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Registration */}
      <div>
        {isRegistered ? (
          <div className="bg-green-50 border border-green-200 text-green-800 p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-2">
              {event.requires_approval ? "Request submitted ✅" : "You're on the list! ✅"}
            </h3>
            <p>
              {event.requires_approval
                ? "The organizer will review your registration. You'll be notified once approved."
                : "You can now interact with our AI Assistant via SMS using the phone number you provided."}
            </p>
          </div>
        ) : isFull ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-8 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-2">Event Full</h3>
            <p>This event has reached its capacity. Registration is closed.</p>
          </div>
        ) : (
          <RegistrationForm eventId={event.id} onSuccess={() => setIsRegistered(true)} />
        )}
      </div>
    </div>
  );
}