import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  MessageSquareText,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: MessageSquareText,
    title: "AI Attendee Assistant",
    description:
      "Attendees text questions about venue, schedule, and logistics — answered instantly by AI, no app download needed.",
    tile: "bg-tag-violet-bg text-tag-violet group-hover:bg-tag-violet group-hover:text-text-on-dark",
    card: "hover:border-tag-violet/50 hover:shadow-tag-violet/25",
  },
  {
    icon: PhoneCall,
    title: "Emergency Escalation",
    description:
      "Emergency keywords trigger an automatic voice call to your floor manager, plus SMS confirmation to the attendee.",
    tile: "bg-tag-pink-bg text-tag-pink group-hover:bg-tag-pink group-hover:text-text-on-dark",
    card: "hover:border-tag-pink/50 hover:shadow-tag-pink/25",
  },
  {
    icon: CalendarDays,
    title: "Full Event Management",
    description:
      "Create events, manage schedules, track attendees, and monitor everything from one organizer dashboard.",
    tile: "bg-tag-sky-bg text-tag-sky group-hover:bg-tag-sky group-hover:text-text-on-dark",
    card: "hover:border-tag-sky/50 hover:shadow-tag-sky/25",
  },
  {
    icon: ShieldCheck,
    title: "Real-Time Safety Check-ins",
    description:
      "Attendees can text 'SAFE' with their location for instant status logging during large events.",
    tile: "bg-tag-teal-bg text-tag-teal group-hover:bg-tag-teal group-hover:text-text-on-dark",
    card: "hover:border-tag-teal/50 hover:shadow-tag-teal/25",
  },
];

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2";

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Soft colour blobs behind the hero */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-tag-violet/20 blur-3xl" />
          <div className="absolute top-10 -right-24 h-96 w-96 rounded-full bg-tag-sky/25 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-tag-teal/20 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-28 pb-20 text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 text-xs font-semibold rounded-full bg-surface text-brand-strong border border-brand-border shadow-sm shadow-shadow-soft"
          >
            <span className="w-2 h-2 rounded-full bg-linear-to-br from-tag-pink to-tag-violet" />
            AI-powered event help desk
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="font-heading text-4xl sm:text-6xl font-bold mb-5 tracking-tight bg-linear-to-r from-brand via-tag-violet to-tag-teal bg-clip-text text-transparent"
          >
            Run your event without the chaos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-lg text-text-muted max-w-2xl mx-auto mb-9"
          >
            An AI-powered help desk for event organizers — attendees get instant
            answers over SMS, emergencies get escalated automatically, and you
            get one dashboard to run it all.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/signup"
              className={`px-7 py-3 text-sm font-semibold text-text-on-dark bg-linear-to-r from-brand to-panel-organizer rounded-lg shadow-lg shadow-shadow-brand transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-xl active:translate-y-0 active:scale-95 ${FOCUS}`}
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className={`px-7 py-3 text-sm font-semibold text-brand-strong bg-surface border border-brand-border rounded-lg shadow-sm shadow-shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-soft hover:shadow-md active:translate-y-0 active:scale-95 ${FOCUS}`}
            >
              Log In
            </Link>
            <Link
              to="/events"
              className={`group inline-flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-brand-strong rounded-lg transition-colors hover:text-tag-violet ${FOCUS}`}
            >
              Browse Events
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className={`group bg-surface rounded-xl border border-border p-6 shadow-md shadow-shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${feature.card}`}
            >
              <div
                className={`mb-4 inline-flex p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 ${feature.tile}`}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-text mb-1.5">
                {feature.title}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA footer */}
      <section className="bg-linear-to-r from-panel-admin via-brand to-panel-attendee-hover">
        <div className="max-w-5xl mx-auto px-6 py-14 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-text-on-dark mb-5">
            Ready to run a smoother event?
          </h2>
          <Link
            to="/signup"
            className={`inline-block px-7 py-3 text-sm font-semibold text-brand-strong bg-surface rounded-lg shadow-lg shadow-shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-strong hover:shadow-xl active:translate-y-0 active:scale-95 focus-visible:ring-offset-panel-admin outline-none focus-visible:ring-2 focus-visible:ring-text-on-dark focus-visible:ring-offset-2`}
          >
            Create Your First Event
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Landing;