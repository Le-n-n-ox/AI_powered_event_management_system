import { QRCodeSVG } from "qrcode.react";
import { Ticket } from "lucide-react";

interface Props {
  attendeeId: string;
  eventId: string;
  eventName: string;
}

export default function TicketQR({ attendeeId, eventId, eventName }: Props) {
  const payload = JSON.stringify({ a: attendeeId, e: eventId });

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm p-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Ticket className="w-5 h-5 text-brand" />
        <h3 className="font-heading font-semibold text-text">Your ticket</h3>
      </div>
      <div className="inline-block bg-white p-4 rounded-lg">
        <QRCodeSVG value={payload} size={180} />
      </div>
      <p className="text-sm text-text-soft mt-4">
        Show this at the door for {eventName}.
      </p>
    </div>
  );
}