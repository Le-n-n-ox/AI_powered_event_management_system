# AI_powered_event_management_system
An offline-inclusive, AI-powered Event Concierge &amp; Operations Engine using Africa's Talking (SMS/USSD/Voice/Airtime) &amp; Gemini API. Built for the AT Women in Tech Nairobi Hackathon.

```
smart-help-desk
├─ client
│  ├─ dist
│  │  ├─ assets
│  │  │  ├─ index-CpzrXMKg.js
│  │  │  └─ index-noXVEcIp.css
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
│  │  │  │  ├─ EventGuard.tsx
│  │  │  │  ├─ Navbar.tsx
│  │  │  │  └─ ProtectedRoute.tsx
│  │  │  └─ ui
│  │  │     ├─ AddScheduleItemForm.tsx
│  │  │     ├─ AddVenueLocationForm.tsx
│  │  │     ├─ EventCard.tsx
│  │  │     └─ RegistrationForm.tsx
│  │  ├─ context
│  │  │  └─ AuthContext.tsx
│  │  ├─ hooks
│  │  │  └─ useEvents.ts
│  │  ├─ index.css
│  │  ├─ lib
│  │  │  └─ supabase.ts
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
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  └─ vite.config.ts
├─ package-lock.json
├─ README.md
└─ server
   ├─ .agents
   │  └─ skills
   │     └─ supabase-server
   │        └─ SKILL.md
   ├─ ai.js
   ├─ config
   ├─ emergency.js
   ├─ index.js
   ├─ package-lock.json
   ├─ package.json
   ├─ routes
   ├─ skills-lock.json
   └─ test-emergency.js

```