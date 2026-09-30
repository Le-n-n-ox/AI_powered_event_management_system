import { useId } from "react";
import { CalendarRange, Hourglass, TriangleAlert } from "lucide-react";

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

function describeDuration(start: string, end: string): string | null {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (Number.isNaN(ms) || ms <= 0) return null;

  const totalMins = Math.round(ms / 60000);
  const days = Math.floor(totalMins / 1440);
  const hours = Math.floor((totalMins % 1440) / 60);
  const mins = totalMins % 60;

  const parts: string[] = [];
  if (days) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hr${hours !== 1 ? "s" : ""}`);
  if (mins) parts.push(`${mins} min`);
  return parts.join(" ");
}

export default function DateTimeSection({
  data,
  updateData,
  inputCls,
  isEdit,
}: Props) {
  const startId = useId();
  const endId = useId();
  const errorId = useId();

  const minStart = isEdit ? undefined : toLocalInput(new Date());

  const endBeforeStart =
    !!data.startDate &&
    !!data.endDate &&
    new Date(data.endDate).getTime() <= new Date(data.startDate).getTime();
  const duration = describeDuration(data.startDate, data.endDate);

  function handleStartChange(value: string) {
    updateData("startDate", value);
    // If the new start is at or after the current end, clear the end so it can't stay invalid
    if (
      value &&
      data.endDate &&
      new Date(data.endDate).getTime() <= new Date(value).getTime()
    ) {
      updateData("endDate", "");
    }
  }

  return (
    <div className="relative overflow-hidden bg-surface p-6 pt-7 rounded-xl shadow-md shadow-shadow-soft border border-border flex flex-col gap-4">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-tag-violet to-tag-sky" />

      <h3 className="font-heading text-lg font-semibold text-text flex items-center gap-3">
        <span className="inline-flex p-2 rounded-lg bg-tag-violet-bg text-tag-violet">
          <CalendarRange className="w-5 h-5" />
        </span>
        Date & Time
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor={startId}
            className="block text-sm font-medium text-text-muted mb-1"
          >
            Start Date & Time
          </label>
          <input
            id={startId}
            type="datetime-local"
            value={data.startDate}
            onChange={(e) => handleStartChange(e.target.value)}
            min={minStart}
            max={data.endDate || undefined}
            required
            className={`w-full ${inputCls}`}
          />
        </div>
        <div>
          <label
            htmlFor={endId}
            className="block text-sm font-medium text-text-muted mb-1"
          >
            End Date & Time
          </label>
          <input
            id={endId}
            type="datetime-local"
            value={data.endDate}
            onChange={(e) => updateData("endDate", e.target.value)}
            min={data.startDate || minStart}
            required
            aria-invalid={endBeforeStart || undefined}
            aria-describedby={endBeforeStart ? errorId : undefined}
            className={`w-full ${inputCls}`}
          />
        </div>
      </div>

      {endBeforeStart && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-2 text-sm text-danger bg-danger-bg border border-danger-border rounded-lg px-3 py-2"
        >
          <TriangleAlert className="w-4 h-4 shrink-0" />
          End time must be after the start time.
        </p>
      )}

      {duration && !endBeforeStart && (
        <p className="flex items-center gap-2 text-sm font-medium text-tag-sky bg-tag-sky-bg rounded-lg px-3 py-2 w-fit">
          <Hourglass className="w-4 h-4 shrink-0" />
          Runs for {duration}
        </p>
      )}
    </div>
  );
}