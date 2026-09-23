// client/src/pages/EventDetail.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import RegistrationForm from '../components/ui/RegistrationForm';
import type { Event } from '../types/event'; // Make sure this matches your type export

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      if (!id) return;
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
      } else {
        setEvent(data);
      }
      setLoading(false);
    }

    fetchEvent();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading event details...</div>;
  if (!event) return <div className="p-10 text-center">Event not found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 grid md:grid-cols-2 gap-12">
      {/* Left: Event Info */}
      <div>
        <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
        <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-100">
          <p className="font-medium text-gray-700 mb-2">📍 {event.venue_name}</p>
          <p className="text-sm text-gray-500">{event.venue_address}</p>
          <hr className="my-3 border-gray-200" />
          <p className="font-medium text-gray-700">📅 {new Date(event.start_date).toLocaleString()}</p>
        </div>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
      </div>

      {/* Right: Registration */}
      <div>
        {isRegistered ? (
          <div className="bg-green-50 border border-green-200 text-green-800 p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-2">You're on the list! ✅</h3>
            <p>You can now interact with our AI Assistant via SMS using the phone number you provided.</p>
          </div>
        ) : (
          <RegistrationForm eventId={event.id} onSuccess={() => setIsRegistered(true)} />
        )}
      </div>
    </div>
  );
}