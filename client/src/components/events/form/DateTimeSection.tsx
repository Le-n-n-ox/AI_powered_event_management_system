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

export default function DateTimeSection({ data, updateData, inputCls, isEdit }: Props) {
  const minStart = isEdit ? undefined : toLocalInput(new Date());

  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm border border-[var(--color-border)] flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-[var(--color-text)]">
        Date & Time
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
            Start Date & Time
          </label>
          <input
            type="datetime-local"
            value={data.startDate}
            onChange={(e) => updateData("startDate", e.target.value)}
            min={minStart}
            required
            className={`w-full ${inputCls}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
            End Date & Time
          </label>
          <input
            type="datetime-local"
            value={data.endDate}
            onChange={(e) => updateData("endDate", e.target.value)}
            min={data.startDate || minStart}
            required
            className={`w-full ${inputCls}`}
          />
        </div>
      </div>
    </div>
  );
}