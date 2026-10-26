# AI-Powered Event Management System

An offline-inclusive, AI-powered event concierge and operations engine using Africa's Talking SMS/USSD/Voice services and AI integrations. Built for the AT Women in Tech Nairobi Hackathon.

## Prerequisites

- Node.js and npm
- Supabase project credentials for the frontend and backend

## Setup

Install dependencies from the repository root:

```powershell
cd server
npm install
cd ..\client
npm install
```

Create `server/.env` with the backend configuration:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3000
```

Create `client/.env` with the frontend configuration:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Add any integration credentials you use (such as Africa's Talking or an AI provider) to `server/.env` as well.

## Start the app

Run the backend and frontend in separate terminals from the repository root.

Terminal 1, backend:

```powershell
cd server
npm run dev
```

Terminal 2, frontend:

```powershell
cd client
npm run dev
```

Vite prints the frontend URL in its terminal, usually `http://localhost:5173`. The backend API is available at `http://localhost:3000`.

## Code navigation (graphify)

The repo is mapped into a queryable knowledge graph in `graphify-out/` — every function, component, route, and module with its cross-file relationships. Instead of grepping through files, open `graphify-out/graph.html` in a browser and click around, or query the graph from a terminal:

```powershell
graphify query "how does event registration work"   # scoped subgraph for a question
graphify explain "useAuth"                          # a component/function and its neighbours
graphify path "RegistrationForm.tsx" "useAuth"      # how two things connect
graphify god-nodes                                  # the most connected hubs
```

The graph is generated from code only (local AST parsing, no API key, nothing leaves the machine). Rebuild or refresh it with:

```powershell
npm run graph:build     # full rebuild after large changes
npm run graph:update    # fast AST-only refresh after editing code
npm run graph:open      # regenerate graphify-out/graph.html
```

Git hooks installed by `graphify hook install` refresh the graph automatically after commits, checkouts, merges, and rebases, so it stays current. `graphify-out/GRAPH_REPORT.md` holds the architecture summary (communities, hub files, suggested questions) if you want a written tour instead. AI assistants working in this repo are pointed at the graph by `AGENTS.md`.

## Database migrations

Some features need new database objects. The SQL lives in `server/db/migrations/` and is meant to be pasted into the **Supabase SQL editor**, in this order:

| File | What it adds |
|------|--------------|
| `000_helpers.sql` | `public.is_admin(uid uuid)` — a `SECURITY DEFINER` helper used by the RLS policies below |
| `001_event_category.sql` | `events.category` — the niche/category of an event, plus an index |
| `002_transactions.sql` | The `transactions` payment ledger, with RLS so organizers only see their own money |
| `003_admin_role_management.sql` | `public.admin_set_user_role(...)` and `public.admin_platform_analytics()` |
| `004_audit_triggers.sql` | Triggers that write event/attendee changes into `admin_audit_log` |

Running them is optional in the sense that **the app still works without them** — every feature that depends on a migration degrades instead of breaking:

- No `events.category` yet → the niche filter is hidden and event saves silently drop the niche (with a notice on the form).
- No `transactions` table yet → the Transactions page derives the ledger from each attendee's `payment_status` and the event's ticket price, and labels itself as derived.
- No `admin_platform_analytics()` yet → the admin analytics tab computes the same numbers in the browser.

## M-Pesa (Daraja) payments

Paid-event tickets are collected through Safaricom's M-Pesa Daraja. Add these to `server/.env`:

```env
# sandbox (default) or production
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
# must be reachable from Safaricom's servers
MPESA_CALLBACK_URL=https://your-public-host/api/payments/callback
```

Notes:

- Sandbox defaults (`MPESA_SHORTCODE=174379`, `MPESA_PASSKEY=passkey`, `MPESA_TIMESTAMP=20191213`) are applied automatically; set them explicitly for production.
- `MPESA_CALLBACK_URL` has to point at a publicly reachable server. In production, use your deployed backend URL, not `localhost`.
- Daraja does **not** sign its callbacks, so the server never trusts the callback body: it calls the Transaction Status Query API and only marks a ticket paid when Safaricom confirms `ResultCode 0`.
- If M-Pesa is not configured, the API answers `503 mpesa_not_configured` and the organizer can still mark payments manually (cash, bank transfer) from the Transactions page.

New payment endpoints (all require a signed-in user):

| Endpoint | Purpose |
|----------|---------|
| `POST /api/payments/stk-push` | Send an STK push to an attendee's phone for an event ticket |
| `POST /api/payments/callback` | Daraja's confirmation webhook (verified against Daraja before acting) |
| `GET /api/payments/transactions` | The organizer's ledger (admin sees all) |
| `PATCH /api/payments/transactions/:id` | Mark a payment paid, refunded, or cancelled |

## Features

**Organizer**

- `Statistics` (`/organizer/statistics`) — registrations over time, registration status breakdown, revenue by event, capacity used, and a per-event breakdown table.
- `Transactions` (`/organizer/transactions`) — the payment ledger with search/filter, STK push requests, manual mark-paid/refund, and CSV export.
- `Check-in` (`/events/:id/checkin`) — QR scanner for the door, with live counters, arrival progress, manual search, and undo.
- Attendees can be listed per event and their status changed (approve, reject, waitlist, check in).

**Attendee**

- `My Events` (`/my-events`) — upcoming / past / all tabs, filtered by search, location, niche, and RSVP status.
- `Find Events` (`/events`) — upcoming and past sections with location/niche/time filters; each card shows whether you are **Going**, **Pending**, **Waitlisted**, or **Cancelled**.

**Admin**

- User and role management (change any account's role; admins cannot demote themselves).
- Platform analytics — registrations over time, top organizers, and account health.
- An audit trail of admin actions and event/attendee changes.

```
smart-help-desk
├─ client
│  ├─ components.json
│  ├─ dist
│  │  ├─ assets
│  │  │  ├─ index-B8G384Mr.css
│  │  │  └─ index-CtJWz2I0.js
│  │  ├─ favicon.svg
│  │  ├─ icons.svg
│  │  └─ index.html
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ favicon.svg
│  │  └─ icons.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.js
│  │  ├─ App.tsx
│  │  ├─ assets
│  │  │  ├─ hero.png
│  │  │  ├─ react.svg
│  │  │  └─ vite.svg
│  │  ├─ components
│  │  │  ├─ admin
│  │  │  │  ├─ UserManagement.js
│  │  │  │  └─ UserManagement.tsx
│  │  │  ├─ auth
│  │  │  │  ├─ AuthLayout.js
│  │  │  │  ├─ AuthLayout.tsx
│  │  │  │  ├─ AuthUI.js
│  │  │  │  ├─ AuthUI.tsx
│  │  │  │  ├─ authVariants.js
│  │  │  │  ├─ authVariants.ts
│  │  │  │  ├─ LoginForm.js
│  │  │  │  ├─ LoginForm.tsx
│  │  │  │  ├─ SignupForm.js
│  │  │  │  └─ SignupForm.tsx
│  │  │  ├─ events
│  │  │  │  └─ form
│  │  │  │     ├─ AiAutofill.js
│  │  │  │     ├─ AiAutofill.tsx
│  │  │  │     ├─ BasicInfoSection.js
│  │  │  │     ├─ BasicInfoSection.tsx
│  │  │  │     ├─ DateTimeSection.js
│  │  │  │     ├─ DateTimeSection.tsx
│  │  │  │     ├─ KnowledgeSection.js
│  │  │  │     ├─ KnowledgeSection.tsx
│  │  │  │     ├─ RegistrationSection.js
│  │  │  │     ├─ RegistrationSection.tsx
│  │  │  │     ├─ VenueSection.js
│  │  │  │     └─ VenueSection.tsx
│  │  │  ├─ layout
│  │  │  │  ├─ AccessDenied.js
│  │  │  │  ├─ AccessDenied.tsx
│  │  │  │  ├─ EventGuard.js
│  │  │  │  ├─ EventGuard.tsx
│  │  │  │  ├─ Navbar.js
│  │  │  │  ├─ Navbar.tsx
│  │  │  │  ├─ ProtectedRoute.js
│  │  │  │  └─ ProtectedRoute.tsx
│  │  │  ├─ pages
│  │  │  │  ├─ RoleSelect.js
│  │  │  │  └─ RoleSelect.tsx
│  │  │  └─ ui
│  │  │     ├─ AddScheduleItemForm.js
│  │  │     ├─ AddScheduleItemForm.tsx
│  │  │     ├─ AddVenueLocationForm.js
│  │  │     ├─ AddVenueLocationForm.tsx
│  │  │     ├─ badge.js
│  │  │     ├─ badge.tsx
│  │  │     ├─ button.js
│  │  │     ├─ button.tsx
│  │  │     ├─ card.js
│  │  │     ├─ card.tsx
│  │  │     ├─ EventCard.js
│  │  │     ├─ EventCard.tsx
│  │  │     ├─ input.js
│  │  │     ├─ input.tsx
│  │  │     ├─ RegistrationForm.js
│  │  │     ├─ RegistrationForm.tsx
│  │  │     ├─ select.js
│  │  │     ├─ select.tsx
│  │  │     ├─ table.js
│  │  │     └─ table.tsx
│  │  ├─ context
│  │  │  ├─ AuthContext.js
│  │  │  └─ AuthContext.tsx
│  │  ├─ hooks
│  │  │  ├─ useEvents.js
│  │  │  └─ useEvents.ts
│  │  ├─ index.css
│  │  ├─ lib
│  │  │  ├─ supabase.js
│  │  │  ├─ supabase.ts
│  │  │  ├─ utils.js
│  │  │  └─ utils.ts
│  │  ├─ main.js
│  │  ├─ main.tsx
│  │  ├─ pages
│  │  │  ├─ admin
│  │  │  │  ├─ AdminDashboard.js
│  │  │  │  ├─ AdminDashboard.tsx
│  │  │  │  ├─ AdminLogin.js
│  │  │  │  ├─ AdminLogin.tsx
│  │  │  │  ├─ AdminSignup.js
│  │  │  │  └─ AdminSignup.tsx
│  │  │  ├─ attendee
│  │  │  │  ├─ AttendeeLogin.js
│  │  │  │  ├─ AttendeeLogin.tsx
│  │  │  │  ├─ AttendeeSignup.js
│  │  │  │  └─ AttendeeSignup.tsx
│  │  │  ├─ Dashboard.js
│  │  │  ├─ Dashboard.tsx
│  │  │  ├─ EventDetail.js
│  │  │  ├─ EventDetail.tsx
│  │  │  ├─ EventsList.js
│  │  │  ├─ EventsList.tsx
│  │  │  ├─ Landing.js
│  │  │  ├─ Landing.tsx
│  │  │  ├─ ManageAttendees.js
│  │  │  ├─ ManageAttendees.tsx
│  │  │  ├─ ManageSchedule.js
│  │  │  ├─ ManageSchedule.tsx
│  │  │  ├─ ManageVenueLocations.js
│  │  │  ├─ ManageVenueLocations.tsx
│  │  │  ├─ organizer
│  │  │  │  ├─ EventFormPage.js
│  │  │  │  ├─ EventFormPage.tsx
│  │  │  │  ├─ OrganizerLogin.js
│  │  │  │  ├─ OrganizerLogin.tsx
│  │  │  │  ├─ OrganizerSignup.js
│  │  │  │  └─ OrganizerSignup.tsx
│  │  │  ├─ RoleSelect.js
│  │  │  └─ RoleSelect.tsx
│  │  ├─ types
│  │  │  ├─ event.js
│  │  │  └─ event.ts
│  │  └─ utils
│  │     ├─ dateHelpers.js
│  │     ├─ dateHelpers.ts
│  │     ├─ phone.js
│  │     └─ phone.ts
│  ├─ tailwind.config.js
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  ├─ tsconfig.tsbuildinfo
│  └─ vite.config.ts
├─ package-lock.json
├─ package.json
├─ README.md
└─ server
   ├─ .agents
   │  └─ skills
   │     └─ supabase-server
   │        └─ SKILL.md
   ├─ ai.js
   ├─ emergency.js
   ├─ index.js
   ├─ package-lock.json
   ├─ package.json
   ├─ skills-lock.json
   └─ test-emergency.js
```

```
smart-help-desk
├─ client
│  ├─ components.json
│  ├─ dist
│  │  ├─ assets
│  │  │  ├─ index-CJQKm5Ns.js
│  │  │  └─ index-DVy33Hw5.css
│  │  ├─ favicon.svg
│  │  ├─ icons.svg
│  │  └─ index.html
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ favicon.svg
│  │  └─ icons.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.tsx
│  │  ├─ assets
│  │  │  ├─ hero.png
│  │  │  ├─ react.svg
│  │  │  └─ vite.svg
│  │  ├─ components
│  │  │  ├─ admin
│  │  │  │  └─ UserManagement.tsx
│  │  │  ├─ auth
│  │  │  │  ├─ AuthLayout.tsx
│  │  │  │  ├─ AuthUI.tsx
│  │  │  │  ├─ authVariants.ts
│  │  │  │  ├─ LoginForm.tsx
│  │  │  │  └─ SignupForm.tsx
│  │  │  ├─ events
│  │  │  │  └─ form
│  │  │  │     ├─ AiAutofill.tsx
│  │  │  │     ├─ BasicInfoSection.tsx
│  │  │  │     ├─ DateTimeSection.tsx
│  │  │  │     ├─ KnowledgeSection.tsx
│  │  │  │     ├─ RegistrationSection.tsx
│  │  │  │     └─ VenueSection.tsx
│  │  │  ├─ layout
│  │  │  │  ├─ AccessDenied.tsx
│  │  │  │  ├─ BackButton.tsx
│  │  │  │  ├─ EventGuard.tsx
│  │  │  │  ├─ Navbar.tsx
│  │  │  │  └─ ProtectedRoute.tsx
│  │  │  ├─ pages
│  │  │  │  └─ RoleSelect.tsx
│  │  │  └─ ui
│  │  │     ├─ AddScheduleItemForm.tsx
│  │  │     ├─ AddVenueLocationForm.tsx
│  │  │     ├─ badge.tsx
│  │  │     ├─ button.tsx
│  │  │     ├─ card.tsx
│  │  │     ├─ EventCard.tsx
│  │  │     ├─ input.tsx
│  │  │     ├─ RegistrationForm.tsx
│  │  │     ├─ select.tsx
│  │  │     └─ table.tsx
│  │  ├─ context
│  │  │  └─ AuthContext.tsx
│  │  ├─ hooks
│  │  │  └─ useEvents.ts
│  │  ├─ index.css
│  │  ├─ lib
│  │  │  ├─ supabase.ts
│  │  │  └─ utils.ts
│  │  ├─ main.tsx
│  │  ├─ pages
│  │  │  ├─ admin
│  │  │  │  ├─ AdminDashboard.tsx
│  │  │  │  ├─ AdminLogin.tsx
│  │  │  │  └─ AdminSignup.tsx
│  │  │  ├─ attendee
│  │  │  │  ├─ AttendeeLogin.tsx
│  │  │  │  └─ AttendeeSignup.tsx
│  │  │  ├─ Dashboard.tsx
│  │  │  ├─ EventDetail.tsx
│  │  │  ├─ EventsList.tsx
│  │  │  ├─ Landing.tsx
│  │  │  ├─ ManageAttendees.tsx
│  │  │  ├─ ManageSchedule.tsx
│  │  │  ├─ ManageVenueLocations.tsx
│  │  │  ├─ organizer
│  │  │  │  ├─ EventFormPage.tsx
│  │  │  │  ├─ OrganizerLogin.tsx
│  │  │  │  └─ OrganizerSignup.tsx
│  │  │  └─ RoleSelect.tsx
│  │  ├─ types
│  │  │  └─ event.ts
│  │  └─ utils
│  │     ├─ dateHelpers.ts
│  │     └─ phone.ts
│  ├─ tailwind.config.js
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  ├─ tsconfig.tsbuildinfo
│  ├─ vercel.json
│  └─ vite.config.ts
├─ package-lock.json
├─ package.json
├─ README.md
└─ server
   ├─ .agents
   │  └─ skills
   │     └─ supabase-server
   │        └─ SKILL.md
   ├─ ai.js
   ├─ chat_messages.sql
   ├─ emergency.js
   ├─ index.js
   ├─ package-lock.json
   ├─ package.json
   ├─ skills-lock.json
   └─ test-emergency.js

```