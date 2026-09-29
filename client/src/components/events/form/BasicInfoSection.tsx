import type { Event } from "../../../types/event";

interface Props {
  data: any;
  updateData: (field: string, value: any) => void;
  isEdit: boolean;
  inputCls: string;
}

export default function BasicInfoSection({
  data,
  updateData,
  isEdit,
  inputCls,
}: Props) {
  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm border border-[var(--color-border)] flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-[var(--color-text)]">
        Basic Information
      </h3>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
          Event Name
        </label>
        <input
          type="text"
          placeholder="e.g., Tech Innovators Summit 2026"
          value={data.name}
          onChange={(e) => updateData("name", e.target.value)}
          required
          className={`w-full ${inputCls}`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
          Description
        </label>
        <textarea
          placeholder="What is this event about?"
          value={data.description}
          onChange={(e) => updateData("description", e.target.value)}
          rows={4}
          className={`w-full ${inputCls}`}
        />
      </div>

      {isEdit && (
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
            Status
          </label>
          <select
            value={data.status}
            onChange={(e) =>
              updateData("status", e.target.value as Event["status"])
            }
            className={`w-full bg-[var(--color-surface)] ${inputCls}`}
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )}
    </div>
  );
}
