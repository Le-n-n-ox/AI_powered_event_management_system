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

```
AI_powered_event_management_system
├─ client
│  ├─ components.json
│  ├─ dist
│  │  ├─ assets
│  │  │  ├─ geist-cyrillic-ext-wght-normal-DjL33-gN.woff2
│  │  │  ├─ geist-cyrillic-wght-normal-BEAKL7Jp.woff2
│  │  │  ├─ geist-latin-ext-wght-normal-DC-KSUi6.woff2
│  │  │  ├─ geist-latin-wght-normal-BgDaEnEv.woff2
│  │  │  ├─ geist-vietnamese-wght-normal-6IgcOCM7.woff2
│  │  │  ├─ index-CbZ26YW1.css
│  │  │  └─ index-DgxrVY_9.js
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
│  │  │  │     ├─ RegistrationSection.tsx
│  │  │  │     └─ VenueSection.tsx
│  │  │  ├─ layout
│  │  │  │  ├─ AccessDenied.tsx
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
   ├─ config
   │  ├─ db.js
   │  └─ initDB.js
   ├─ index.js
   ├─ package-lock.json
   ├─ package.json
   ├─ routes
   │  ├─ auth.js
   │  └─ events.js
   ├─ skills-lock.json
   └─ test-api.js
```
