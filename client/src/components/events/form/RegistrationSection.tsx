import { Ticket, Wallet, Info } from "lucide-react";
import { motion } from "framer-motion";
import type { EventFormData, EventFormUpdater } from "../../../types/event";
import QuestionBuilder from "./QuestionBuilder";

interface Props {
  data: EventFormData;
  updateData: EventFormUpdater;
  inputCls: string;
  isEdit?: boolean;
}

function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const CHECKBOX =
  "w-4 h-4 rounded border-border text-brand focus:ring-focus accent-brand";

export default function RegistrationSection({
  data,
  updateData,
  inputCls,
  isEdit,
}: Props) {
  const minDeadline = isEdit ? undefined : toLocalInput(new Date());

  return (
    <div className="relative overflow-hidden bg-surface p-6 pt-7 rounded-2xl shadow-md shadow-shadow-soft border border-border flex flex-col gap-4">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-tag-sky to-brand" />

      <h3 className="font-heading text-lg font-semibold text-text flex items-center gap-3">
        <span className="inline-flex p-2 rounded-lg bg-tag-sky-bg text-tag-sky">
          <Ticket className="w-5 h-5" />
        </span>
        Tickets & Registration
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">
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
          <label className="block text-sm font-medium text-text-muted mb-1">
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
        <label className="flex items-center gap-3 text-sm text-text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={data.requiresApproval}
            onChange={(e) => updateData("requiresApproval", e.target.checked)}
            className={CHECKBOX}
          />
          Require organizer approval to register
        </label>

        <label className="flex items-center gap-3 text-sm text-text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={data.isPaid}
            onChange={(e) => updateData("isPaid", e.target.checked)}
            className={CHECKBOX}
          />
          This is a paid event
        </label>
      </div>

      {data.isPaid && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-2 flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
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
                className={`w-full ${inputCls}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                M-Pesa Paybill / Accno
                <span className="text-text-soft font-normal text-xs ml-1">
                  (optional)
                </span>
              </label>
              <div className="relative">
                <Wallet className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-soft pointer-events-none" />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 522533"
                  value={data.mpesaAccno}
                  onChange={(e) =>
                    updateData("mpesaAccno", e.target.value.replace(/\D/g, ""))
                  }
                  className={`w-full !pl-9 ${inputCls}`}
                />
              </div>
            </div>
          </div>

          <p className="flex items-start gap-2 text-xs text-text-soft leading-relaxed">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-tag-sky" />
            <span>
              Attendees are prompted to pay by M-Pesa STK push, and the money
              is credited to this accno. Leave it blank to use the
              platform&rsquo;s default paybill.
            </span>
          </p>
        </motion.div>
      )}

      <QuestionBuilder
        data={data}
        updateData={updateData}
        inputCls={inputCls}
      />
    </div>
  );
}
