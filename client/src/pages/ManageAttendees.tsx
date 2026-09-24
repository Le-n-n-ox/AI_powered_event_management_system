import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Attendee, Event } from '../types/event';

export default function ManageAttendees() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      
      // Fetch Event Details
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
        
      if (eventData) setEvent(eventData);

      // Fetch Attendees
      const { data: attendeeData } = await supabase
        .from('attendees')
        .select('*')
        .eq('event_id', id)
        .order('registered_at', { ascending: true });

      if (attendeeData) setAttendees(attendeeData);
      
      setLoading(false);
    }

    fetchData();
  }, [id]);

  const updateAttendeeStatus = async (attendeeId: string, newStatus: string) => {
    // Optimistic UI update
    setAttendees(attendees.map(a => a.id === attendeeId ? { ...a, status: newStatus as any } : a));

    const { error } = await supabase
      .from('attendees')
      .update({ status: newStatus })
      .eq('id', attendeeId);

    if (error) {
      console.error('Failed to update status:', error);
      // Revert on failure (in a production app, you'd show a toast notification here)
    }
  };

  const updatePaymentStatus = async (attendeeId: string, newStatus: string) => {
    setAttendees(attendees.map(a => a.id === attendeeId ? { ...a, payment_status: newStatus as any } : a));

    await supabase
      .from('attendees')
      .update({ payment_status: newStatus })
      .eq('id', attendeeId);
  };

  if (loading) return <div className="p-10 text-center">Loading attendees...</div>;
  if (!event) return <div className="p-10 text-center text-red-500">Event not found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Attendees: {event.name}</h1>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Capacity: {event.capacity || 'Unlimited'}</span>
          <span>•</span>
          <span>Approval Required: {event.requires_approval ? 'Yes' : 'No'}</span>
          <span>•</span>
          <span>Paid Event: {event.is_paid ? `Yes (KES ${event.ticket_price})` : 'No'}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-700">Name</th>
              <th className="p-4 font-semibold text-gray-700">Contact</th>
              <th className="p-4 font-semibold text-gray-700">Registration Date</th>
              <th className="p-4 font-semibold text-gray-700">Approval Status</th>
              {event.is_paid && <th className="p-4 font-semibold text-gray-700">Payment</th>}
              <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {attendees.map((attendee) => (
              <tr key={attendee.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{attendee.full_name}</td>
                <td className="p-4 text-gray-600">
                  {attendee.phone_number} <br />
                  <span className="text-xs text-gray-400">{attendee.email}</span>
                </td>
                <td className="p-4 text-gray-600">
                  {new Date(attendee.registered_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <select 
                    value={attendee.status}
                    onChange={(e) => updateAttendeeStatus(attendee.id, e.target.value)}
                    className={`border rounded p-1 text-sm ${
                      attendee.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                      attendee.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      attendee.status === 'waitlisted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="waitlisted">Waitlisted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                {event.is_paid && (
                  <td className="p-4">
                    <select 
                      value={attendee.payment_status}
                      onChange={(e) => updatePaymentStatus(attendee.id, e.target.value)}
                      className={`border rounded p-1 text-sm ${
                        attendee.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                )}
                <td className="p-4 text-right">
                  <button 
                    onClick={() => updateAttendeeStatus(attendee.id, 'approved')}
                    className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                    disabled={attendee.status === 'approved'}
                  >
                    Quick Approve
                  </button>
                </td>
              </tr>
            ))}
            {attendees.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No attendees registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}