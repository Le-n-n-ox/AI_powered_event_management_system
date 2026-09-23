// client/src/components/ui/RegistrationForm.tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Props {
  eventId: string;
  onSuccess: () => void;
}

export default function RegistrationForm({ eventId, onSuccess }: Props) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: supabaseError } = await supabase
        .from('attendees')
        .insert([
          { 
            event_id: eventId, 
            full_name: fullName, 
            phone_number: phoneNumber, 
            email: email || null 
          }
        ]);

      if (supabaseError) throw supabaseError;
      
      onSuccess();
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow border border-gray-100">
      <h3 className="text-xl font-semibold mb-2">Register for this Event</h3>
      
      {error && <div className="text-red-500 text-sm p-2 bg-red-50 rounded">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input required type="text" className="w-full p-2 border rounded" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phone Number (For SMS/AI Bot)</label>
        <input required type="tel" className="w-full p-2 border rounded" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email (Optional)</label>
        <input type="email" className="w-full p-2 border rounded" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <button type="submit" disabled={isSubmitting} className="mt-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50">
        {isSubmitting ? 'Registering...' : 'Secure My Spot'}
      </button>
    </form>
  );
}