import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  MessageSquareText,
  PhoneCall,
  ShieldCheck,
  QrCode,
  ChartColumn,
  Wallet,
  Sparkles,
  UsersRound,
  ScanLine,
  CircleCheck,
  Ticket,
  MapPin,
} from "lucide-react";

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

const FEATURES = [
  {
    icon: MessageSquareText,
    title: "AI Attendee Assistant",
    description:
      "Attendees text questions about venue, schedule and logistics — answered instantly by AI, no app download needed.",
    tile: "bg-tag-violet-bg text-tag-violet group-hover:bg-tag-violet group-hover:text-text-on-dark",
    card: "hover:border-tag-violet/50 hover:shadow-tag-violet/25",
    accent: "from-tag-violet to-tag-pink",
    wash: "from-tag-violet/12",
  },
  {
    icon: PhoneCall,
    title: "Emergency Escalation",
    description:
      "Emergency keywords trigger an automatic voice call to your floor manager, plus SMS confirmation to the attendee.",
    tile: "bg-tag-pink-bg text-tag-pink group-hover:bg-tag-pink group-hover:text-text-on-dark",
    card: "hover:border-tag-pink/50 hover:shadow-tag-pink/25",
    accent: "from-tag-pink to-tag-violet",
    wash: "from-tag-pink/12",
  },
  {
    icon: CalendarDays,
    title: "Full Event Management",
    description:
      "Create events, manage schedules, track attendees and monitor everything from one organizer dashboard.",
    tile: "bg-tag-sky-bg text-tag-sky group-hover:bg-tag-sky group-hover:text-text-on-dark",
    card: "hover:border-tag-sky/50 hover:shadow-tag-sky/25",
    accent: "from-tag-sky to-tag-teal",
    wash: "from-tag-sky/12",
  },
  {
    icon: ShieldCheck,
    title: "Real-Time Safety Check-ins",
    description:
      "Attendees can text 'SAFE' with their location for instant status logging during large events.",
    tile: "bg-tag-teal-bg text-tag-teal group-hover:bg-tag-teal group-hover:text-text-on-dark",
    card: "hover:border-tag-teal/50 hover:shadow-tag-teal/25",
    accent: "from-tag-teal to-tag-sky",
    wash: "from-tag-teal/12",
  },
  {
    icon: QrCode,
    title: "QR Ticketing & Door Scanning",
    description:
      "Every registration gets a unique QR code. Scan at the door and the guest is checked in on the spot.",
    tile: "bg-tag-amber-bg text-tag-amber group-hover:bg-tag-amber group-hover:text-text-on-dark",
    card: "hover:border-tag-amber/50 hover:shadow-tag-amber/25",
    accent: "from-tag-amber to-tag-pink",
    wash: "from-tag-amber/12",
  },
  {
    icon: Wallet,
    title: "M-Pesa Payments & Ledger",
    description:
      "Collect ticket payments by STK push, then watch every shilling land in a live transaction ledger.",
    tile: "bg-brand-soft text-brand group-hover:bg-brand group-hover:text-text-on-dark",
    card: "hover:border-brand/50 hover:shadow-shadow-brand/25",
    accent: "from-brand to-tag-violet",
    wash: "from-brand/12",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Create the event",
    body: "Set venue, capacity, ticket price and schedule. Attendees see it immediately.",
    icon: CalendarDays,
  },
  {
    step: "02",
    title: "Registrations roll in",
    body: "Approve or waitlist guests, take M-Pesa payments and send SMS confirmations.",
    icon: UsersRound,
  },
  {
    step: "03",
    title: "Run the door",
    body: "Scan QR codes, track check-ins live and watch the numbers move on your dashboard.",
    icon: ScanLine,
  },
];

const ROLES = [
  {
    to: "/organizer/login",
    title: "Organizer",
    body: "Create events, approve guests, take payments and check people in at the door.",
    icon: CalendarDays,
    cta: "Organizer portal",
    accent: "from-brand to-tag-violet",
    wash: "from-brand/25 via-tag-violet/12 to-transparent",
  },
  {
    to: "/attendee/login",
    title: "Attendee",
    body: "Browse events, register, pay by M-Pesa and carry your ticket as a QR code.",
    icon: Ticket,
    cta: "Attendee portal",
    accent: "from-tag-teal to-tag-sky",
    wash: "from-tag-teal/25 via-tag-sky/12 to-transparent",
  },
  {
    to: "/admin/login",
    title: "Admin",
    body: "Manage users and roles, read platform analytics and audit every admin action.",
    icon: ShieldCheck,
    cta: "Admin portal",
    accent: "from-tag-pink to-tag-violet",
    wash: "from-tag-pink/25 via-tag-violet/12 to-transparent",
  },
];

const METRICS = [
  { value: "24/7", label: "AI help desk on SMS" },
  { value: "< 20s", label: "Average door check-in" },
  { value: "M-Pesa", label: "Native mobile money" },
  { value: "1", label: "Dashboard for it all" },
];

/** Small dashboard mock shown in the hero. */
function HeroPreview() {
  const rows = [
    { name: "Amina W.", tag: "Checked in", tone: "bg-success-bg text-success" },
    { name: "Brian O.", tag: "Approved", tone: "bg-brand-soft text-brand-strong" },
    { name: "Chelsea M.", tag: "Pending", tone: "bg-warning-bg text-warning" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* glow behind the card */}
      <div
        aria-hidden
        className="absolute -inset-8 rounded-[2rem] bg-linear-to-br from-brand/25 via-tag-violet/20 to-tag-teal/20 blur-2xl"
      />

      <div className="relative rounded-2xl border border-border glass shadow-2xl shadow-shadow-soft overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-linear-to-br from-brand to-tag-violet grid place-items-center">
              <ChartColumn className="w-4 h-4 text-text-on-dark" />
            </span>
            <div>
              <p className="text-sm font-semibold text-text leading-none">
                Tonight&apos;s registrations
              </p>
              <p className="text-xs text-text-soft mt-1">Nairobi Design Week</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-success-bg text-success border border-success-border">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Live
          </span>
        </div>

        {/* sparkline */}
        <div className="px-5 pt-5">
          <div className="flex items-end justify-between mb-1">
            <span className="text-3xl font-bold text-text tabular-nums">1,284</span>
            <span className="text-xs font-medium text-success">+18% this week</span>
          </div>
          <svg
            viewBox="0 0 300 70"
            className="w-full h-20"
            role="img"
            aria-label="Registrations trending upward over the last week"
          >
            <defs>
              <linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.32" />
                <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,60 C40,52 60,64 100,44 C140,24 160,42 200,28 C240,14 260,24 300,8 L300,70 L0,70 Z"
              fill="url(#heroArea)"
            />
            <path
              d="M0,60 C40,52 60,64 100,44 C140,24 160,42 200,28 C240,14 260,24 300,8"
              fill="none"
              stroke="var(--color-brand)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              cx="300"
              cy="8"
              r="4"
              fill="var(--color-brand)"
              stroke="var(--color-surface)"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* attendee rows */}
        <ul className="px-3 pb-3 mt-1 space-y-1">
          {rows.map((row) => (
            <li
              key={row.name}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-muted transition-colors"
            >
              <span className="flex items-center gap-2.5 text-sm text-text">
                <span className="w-7 h-7 rounded-full bg-linear-to-br from-tag-sky/40 to-tag-violet/40 grid place-items-center text-[11px] font-semibold text-text">
                  {row.name.charAt(0)}
                </span>
                {row.name}
              </span>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${row.tone}`}
              >
                {row.tag}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-grid grid-fade opacity-70" />
          <div className="absolute -top-28 -left-24 h-96 w-96 rounded-full bg-tag-violet/25 blur-3xl" />
          <div className="absolute top-0 -right-28 h-[28rem] w-[28rem] rounded-full bg-tag-sky/25 blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-tag-teal/20 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-24 lg:pt-20 lg:pb-32">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-10 items-center">
            <div className="text-center lg:text-left">
              <motion.span
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ duration: 0.45 }}
                className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 text-xs font-semibold rounded-full bg-surface text-brand-strong border border-brand-border shadow-sm shadow-shadow-soft"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI-powered event help desk
              </motion.span>

              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ duration: 0.45, delay: 0.06 }}
                className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
              >
                <span className="text-gradient">Run your event</span>
                <br />
                <span className="text-text">without the chaos</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ duration: 0.45, delay: 0.12 }}
                className="text-lg text-text-muted max-w-xl mx-auto lg:mx-0 mb-9"
              >
                An AI-powered help desk for event organizers — attendees get instant
                answers over SMS, emergencies get escalated automatically, and you
                get one dashboard to run it all.
              </motion.p>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ duration: 0.45, delay: 0.18 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-3"
              >
                <Link
                  to="/signup"
                  className={`px-7 py-3 text-sm font-semibold text-text-on-dark bg-linear-to-r from-brand to-tag-violet rounded-xl shadow-lg shadow-shadow-brand transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-xl active:translate-y-0 active:scale-95 ${FOCUS}`}
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className={`px-7 py-3 text-sm font-semibold text-brand-strong bg-surface border border-brand-border rounded-xl shadow-sm shadow-shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-soft hover:shadow-md active:translate-y-0 active:scale-95 ${FOCUS}`}
                >
                  Log In
                </Link>
                <Link
                  to="/events"
                  className={`group inline-flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-brand-strong rounded-xl transition-colors hover:text-tag-violet ${FOCUS}`}
                >
                  Browse Events
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </motion.div>

              <motion.ul
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ duration: 0.45, delay: 0.24 }}
                className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-text-soft"
              >
                {["Free to start", "M-Pesa ready", "No app download"].map((item) => (
                  <li key={item} className="inline-flex items-center gap-1.5">
                    <CircleCheck className="w-4 h-4 text-success" />
                    {item}
                  </li>
                ))}
              </motion.ul>
            </div>

            <HeroPreview />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Metrics                                                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-y border-border bg-surface/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {METRICS.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="text-center lg:text-left"
            >
              <p className="font-heading text-2xl font-bold text-text">
                {metric.value}
              </p>
              <p className="text-sm text-text-soft mt-0.5">{metric.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Features                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-6xl mx-auto px-6 py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto text-center mb-14"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-strong mb-3">
            Everything in one place
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text mb-4">
            Built for the whole event day
          </h2>
          <p className="text-text-muted">
            From the first ticket to the last scan of the night — the tools that
            usually live in five different apps now live here.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: (i % 3) * 0.06 }}
              className={`group relative overflow-hidden bg-surface rounded-2xl border border-border p-6 shadow-sm shadow-shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${feature.card}`}
            >
              {/* The accent bar and the wash behind the card */}
              <div
                className={`absolute top-0 left-0 w-full h-1 bg-linear-to-r ${feature.accent} opacity-70 transition-opacity duration-300 group-hover:opacity-100`}
                aria-hidden
              />
              <div
                className={`absolute -top-16 -right-10 w-40 h-40 rounded-full bg-linear-to-br ${feature.wash} to-transparent blur-2xl transition-all duration-500 group-hover:scale-125 pointer-events-none`}
                aria-hidden
              />

              <div className="relative">
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
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* How it works                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden border-y border-border bg-surface/50">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid grid-fade opacity-40"
        />
        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto text-center mb-14"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-strong mb-3">
              How it works
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text">
              Three steps from idea to check-out
            </h2>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-3 relative">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="relative group bg-surface rounded-2xl border border-border p-6 shadow-sm shadow-shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-border"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="w-11 h-11 rounded-xl bg-brand-soft text-brand-strong grid place-items-center transition-transform duration-300 group-hover:scale-110">
                    <step.icon className="w-5 h-5" />
                  </span>
                  <span className="font-heading text-3xl font-bold text-border-strong/60 select-none">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-lg text-text mb-1.5">
                  {step.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Roles                                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-6xl mx-auto px-6 py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto text-center mb-14"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-strong mb-3">
            Three ways in
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text mb-4">
            Pick the portal that fits you
          </h2>
          <p className="text-text-muted">
            Each role gets a workspace shaped around the job it actually does.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {ROLES.map((role, i) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
            >
              <Link
                to={role.to}
                className={`group relative block h-full overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm shadow-shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-brand-border ${FOCUS}`}
              >
                {/* The role's colour, washing down from the top of the card */}
                <div
                  className={`absolute inset-x-0 top-0 h-40 bg-linear-to-b ${role.wash} transition-opacity duration-300 group-hover:brightness-125 pointer-events-none`}
                  aria-hidden
                />
                <div
                  className={`absolute top-0 left-0 w-full h-1 bg-linear-to-r ${role.accent} opacity-70 transition-opacity duration-300 group-hover:opacity-100`}
                  aria-hidden
                />

                <div className="relative">
                  <span
                    className={`inline-flex w-12 h-12 rounded-2xl bg-linear-to-br ${role.accent} text-text-on-dark grid place-items-center shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <role.icon className="w-6 h-6" />
                  </span>
                  <h3 className="font-heading text-xl font-semibold text-text mt-4 mb-1.5">
                    {role.title}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed mb-5">
                    {role.body}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-strong">
                    {role.cta}
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CTA                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-r from-panel-admin via-brand to-panel-attendee-hover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-grid opacity-20 text-text-on-dark"
        />
        <div
          aria-hidden
          className="absolute -top-20 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative max-w-5xl mx-auto px-6 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-text-on-dark mb-3">
              Ready to run a smoother event?
            </h2>
            <p className="text-text-on-dark/75 mb-7 max-w-xl mx-auto">
              Create your first event in under two minutes. No card, no setup
              call, no spreadsheet.
            </p>
            <Link
              to="/signup"
              className={`inline-block px-7 py-3 text-sm font-semibold text-brand-strong bg-surface rounded-xl shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-strong hover:shadow-xl active:translate-y-0 active:scale-95 ${FOCUS}`}
            >
              Create Your First Event
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                              */}
      {/* ------------------------------------------------------------------ */}
      <footer className="border-t border-border bg-surface/60">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-text-muted">
            <span className="w-8 h-8 rounded-lg bg-linear-to-br from-brand via-tag-violet to-tag-teal grid place-items-center">
              <CalendarDays className="w-4 h-4 text-text-on-dark" />
            </span>
            <span className="font-heading font-semibold text-text">EventOS</span>
            <span className="text-sm text-text-soft">· AI-powered event management</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-text-soft" />
              Nairobi, KE
            </span>
            <Link
              to="/events"
              className="hover:text-brand-strong transition-colors"
            >
              Browse events
            </Link>
            <Link
              to="/login"
              className="hover:text-brand-strong transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
