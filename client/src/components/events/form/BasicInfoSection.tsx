import { FileText } from "lucide-react";
import type { Event, EventFormData, EventFormUpdater } from "../../../types/event";
import { EVENT_CATEGORIES } from "../../../lib/events";

interface Props {
  data: EventFormData;
  updateData: EventFormUpdater;
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
    <div className="relative overflow-hidden bg-surface p-6 pt-7 rounded-2xl shadow-md shadow-shadow-soft border border-border flex flex-col gap-4">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-brand to-tag-violet" />

      <h3 className="font-heading text-lg font-semibold text-text flex items-center gap-3">
        <span className="inline-flex p-2 rounded-lg bg-brand-soft text-brand-strong">
          <FileText className="w-5 h-5" />
        </span>
        Basic Information
      </h3>

      <div>
        <label className="block text-sm font-medium text-text-muted mb-1">
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
        <label className="block text-sm font-medium text-text-muted mb-1">
          Niche / Category
        </label>
        <input
          type="text"
          list="event-categories"
          placeholder="e.g., Technology"
          value={data.category ?? ""}
          onChange={(e) => updateData("category", e.target.value)}
          className={`w-full ${inputCls}`}
        />
        <datalist id="event-categories">
          {EVENT_CATEGORIES.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
        <p className="text-xs text-text-soft mt-1">
          Attendees filter events by niche, so pick the closest match.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-muted mb-1">
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
          <label className="block text-sm font-medium text-text-muted mb-1">
            Status
          </label>
          <select
            value={data.status}
            onChange={(e) =>
              updateData("status", e.target.value as Event["status"])
            }
            className={`w-full bg-surface ${inputCls}`}
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
