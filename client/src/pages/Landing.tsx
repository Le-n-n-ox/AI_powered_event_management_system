import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { CalendarDays, MessageSquareText, PhoneCall, ShieldCheck } from "lucide-react"

function Landing() {
  const features = [
    {
      icon: MessageSquareText,
      title: "AI Attendee Assistant",
      description: "Attendees text questions about venue, schedule, and logistics — answered instantly by AI, no app download needed.",
    },
    {
      icon: PhoneCall,
      title: "Emergency Escalation",
      description: "Emergency keywords trigger an automatic voice call to your floor manager, plus SMS confirmation to the attendee.",
    },
    {
      icon: CalendarDays,
      title: "Full Event Management",
      description: "Create events, manage schedules, track attendees, and monitor everything from one organizer dashboard.",
    },
    {
      icon: ShieldCheck,
      title: "Real-Time Safety Check-ins",
      description: "Attendees can text 'SAFE' with their location for instant status logging during large events.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-heading text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
        >
          Run your event without the chaos
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-lg text-gray-600 max-w-2xl mx-auto mb-8"
        >
          An AI-powered help desk for event organizers — attendees get instant answers over SMS, emergencies get escalated automatically, and you get one dashboard to run it all.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/signup"
            className="px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/events"
            className="px-6 py-3 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Browse Events →
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
              <feature.icon className="w-8 h-8 text-indigo-600 mb-3" />
              <h3 className="font-heading font-semibold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA footer */}
      <section className="border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-12 text-center">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-3">
            Ready to run a smoother event?
          </h2>
          <Link
            to="/signup"
            className="inline-block px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Your First Event
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Landing