import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Event } from '../types/event';

export default function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error: supabaseError } = await supabase
          .from('events')
          .select('*')
          .order('start_date', { ascending: true }); // Show upcoming events first

        if (supabaseError) throw supabaseError;
        setEvents(data || []);
      } catch (err: any) {
        console.error('Error fetching events:', err);
        setError(err.message || 'Failed to load events.');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-600">Loading events...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-8">Upcoming Events</h1>

      {events.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg">No events found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="p-6 grow">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold line-clamp-2">{event.name}</h2>
                  <span className={`text-xs px-2 py-1 rounded-full uppercase font-semibold ${
                    event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  📅 {new Date(event.start_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  📍 {event.venue_name}
                </p>
                
                <p className="text-gray-700 text-sm line-clamp-3">
                  {event.description}
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                <Link 
                  to={`/events/${event.id}`}
                  className="block w-full text-center bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}