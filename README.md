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