interface Props {
  data: any;
  updateData: (field: string, value: any) => void;
  inputCls: string;
}

export default function RegistrationSection({ data, updateData, inputCls }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-gray-900">Tickets & Registration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline</label>
          <input
            type="datetime-local"
            value={data.registrationDeadline}
            onChange={(e) => updateData("registrationDeadline", e.target.value)}
            className={`w-full ${inputCls}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Max Attendees)</label>
          <input
            type="number"
            placeholder="Leave blank for unlimited"
            value={data.capacity}
            onChange={(e) => updateData("capacity", e.target.value)}
            min="1"
            className={`w-full ${inputCls}`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={data.requiresApproval}
            onChange={(e) => updateData("requiresApproval", e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Require organizer approval to register
        </label>

        <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={data.isPaid}
            onChange={(e) => updateData("isPaid", e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          This is a paid event
        </label>
      </div>

      {data.isPaid && (
        <div className="mt-2 animate-in fade-in slide-in-from-top-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Price (KES)</label>
          <input
            type="number"
            placeholder="e.g. 1500"
            value={data.ticketPrice}
            onChange={(e) => updateData("ticketPrice", e.target.value)}
            min="0"
            step="0.01"
            required={data.isPaid}
            className={`w-full md:w-1/2 ${inputCls}`}
          />
        </div>
      )}
    </div>
  );
}