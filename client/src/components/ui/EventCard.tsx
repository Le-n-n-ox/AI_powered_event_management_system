import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPinned, CalendarDays, UsersRound, AlarmClock, SquarePen, Link as LinkIcon, Check } from "lucide-react";
import type { Event } from "../../types/event";
import { getCountdown } from "../../utils/dateHelpers";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const isPastEvent = new Date(event.end_date) < new Date();

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "upcoming":
        return { variant: "default" as const, className: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200" };
      case "ongoing":
        return { variant: "default" as const, className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200" };
      case "cancelled":
        return { variant: "destructive" as const, className: "" };
      case "completed":
      default:
        return { variant: "secondary" as const, className: "" };
    }
  };

  function handleCopyLink() {
    const url = `${window.location.origin}/events/${event.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const statusStyle = getStatusStyles(event.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full flex flex-col overflow-hidden relative border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
        
        <div className={`absolute top-0 left-0 w-full h-1 ${
          event.status === 'ongoing' ? 'bg-emerald-500' : 
          event.status === 'cancelled' ? 'bg-red-500' : 
          event.status === 'upcoming' ? 'bg-blue-500' : 'bg-slate-300'
        }`} />

        <CardHeader className="pb-3 pt-6">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg leading-snug text-slate-900">
              {event.name}
            </CardTitle>
            <Badge 
              variant={statusStyle.variant} 
              className={`capitalize shrink-0 ${statusStyle.className}`}
            >
              {event.status}
            </Badge>
          </div>
          {event.description && (
            <p className="text-sm text-slate-500 line-clamp-2 mt-2">
              {event.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="flex-1 pb-4">
          <div className="flex flex-col gap-2 text-sm bg-slate-50 rounded-lg p-3 border border-slate-100">
            {event.venue_name && (
              <div className="flex items-center gap-2 text-slate-600">
                <MapPinned className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{event.venue_name}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-600">
              <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{new Date(event.start_date).toLocaleDateString()}</span>
              <span className="text-indigo-600 font-medium ml-auto text-xs">
                {getCountdown(event.start_date)}
              </span>
            </div>
            {event.registration_deadline && (
              <div className="flex items-center gap-2 text-amber-600 mt-1">
                <AlarmClock className="w-4 h-4 shrink-0" />
                <span className="text-xs font-medium">
                  Closes {getCountdown(event.registration_deadline)}
                </span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1 bg-slate-50/50">
          <Button asChild variant="secondary" className="flex-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100">
            <Link to={`/events/${event.id}/manage`}>
              <UsersRound className="w-4 h-4 mr-1.5" />
              Attendees
            </Link>
          </Button>

          <div className="flex items-center gap-1">
            {!isPastEvent && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-500 hover:text-slate-900"
                onClick={() => navigate("/organizer/events/edit", { state: { event } })}
                title="Edit Event"
              >
                <SquarePen className="w-4 h-4" />
              </Button>
            )}
            
            <Button asChild variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900" title="Manage Schedule">
              <Link to={`/events/${event.id}/schedule`}>
                <AlarmClock className="w-4 h-4" />
              </Link>
            </Button>
            
            <Button asChild variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900" title="Manage Locations">
              <Link to={`/events/${event.id}/locations`}>
                <MapPinned className="w-4 h-4" />
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className={copied ? "text-emerald-600 hover:text-emerald-700" : "text-slate-500 hover:text-slate-900"}
              onClick={handleCopyLink}
              title="Copy Registration Link"
            >
              {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}