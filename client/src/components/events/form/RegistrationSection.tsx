interface Props {
  data: any;
  updateData: (field: string, value: any) => void;
  inputCls: string;
  isEdit?: boolean;
}

function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function RegistrationSection({
  data,
  updateData,
  inputCls,
  isEdit,
}: Props) {
  const minDeadline = isEdit ? undefined : toLocalInput(new Date());

  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm border border-[var(--color-border)] flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-[var(--color-text)]">
        Tickets & Registration
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
            Registration Deadline
          </label>
          <input
            type="datetime-local"
            value={data.registrationDeadline}
            onChange={(e) => updateData("registrationDeadline", e.target.value)}
            min={minDeadline}
            max={data.startDate || undefined}
            className={`w-full ${inputCls}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
            Capacity (Max Attendees)
          </label>
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
        <label className="flex items-center gap-3 text-sm text-[var(--color-text-muted)] cursor-pointer">
          <input
            type="checkbox"
            checked={data.requiresApproval}
            onChange={(e) => updateData("requiresApproval", e.target.checked)}
            className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-focus)]"
          />
          Require organizer approval to register
        </label>

        <label className="flex items-center gap-3 text-sm text-[var(--color-text-muted)] cursor-pointer">
          <input
            type="checkbox"
            checked={data.isPaid}
            onChange={(e) => updateData("isPaid", e.target.checked)}
            className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-focus)]"
          />
          This is a paid event
        </label>
      </div>

      {data.isPaid && (
        <div className="mt-2 animate-in fade-in slide-in-from-top-2">
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
            Ticket Price (KES)
          </label>
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