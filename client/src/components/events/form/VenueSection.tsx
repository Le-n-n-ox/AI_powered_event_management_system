interface Props {
  data: any;
  updateData: (field: string, value: any) => void;
  inputCls: string;
}

export default function VenueSection({ data, updateData, inputCls }: Props) {
  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm border border-[var(--color-border)] flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-[var(--color-text)]">
        Location & Venue
      </h3>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
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
        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
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
        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
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
