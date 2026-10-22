import { MapPinned } from "lucide-react";
import type { EventFormData, EventFormUpdater } from "../../../types/event";

interface Props {
  data: EventFormData;
  updateData: EventFormUpdater;
  inputCls: string;
}

export default function VenueSection({ data, updateData, inputCls }: Props) {
  return (
    <div className="relative overflow-hidden bg-surface p-6 pt-7 rounded-2xl shadow-md shadow-shadow-soft border border-border flex flex-col gap-4">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-tag-teal to-tag-sky" />

      <h3 className="font-heading text-lg font-semibold text-text flex items-center gap-3">
        <span className="inline-flex p-2 rounded-lg bg-tag-teal-bg text-tag-teal">
          <MapPinned className="w-5 h-5" />
        </span>
        Location & Venue
      </h3>

      <div>
        <label className="block text-sm font-medium text-text-muted mb-1">
          Venue Name
        </label>
        <input
          type="text"
          placeholder="e.g., KICC"
          value={data.venueName}
          onChange={(e) => updateData("venueName", e.target.value)}
          className={`w-full ${inputCls}`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-muted mb-1">
          Full Address
        </label>
        <input
          type="text"
          placeholder="e.g., Harambee Avenue, Nairobi"
          value={data.venueAddress}
          onChange={(e) => updateData("venueAddress", e.target.value)}
          className={`w-full ${inputCls}`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-muted mb-1">
          Google Maps Link (Optional)
        </label>
        <input
          type="url"
          placeholder="https://maps.google.com/..."
          value={data.venueMapUrl}
          onChange={(e) => updateData("venueMapUrl", e.target.value)}
          className={`w-full ${inputCls}`}
        />
      </div>
    </div>
  );
}
