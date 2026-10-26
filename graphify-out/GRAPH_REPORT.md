# Graph Report - smart-help-desk  (2026-10-26)

## Corpus Check
- 128 files · ~65,112 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .css 1, .tsbuildinfo 1)

## Summary
- 844 nodes · 1937 edges · 46 communities (41 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `debf2bed`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RegistrationForm.tsx
- Statistics.tsx
- MyEvents.tsx
- event.ts
- App.tsx
- EventDetail.tsx
- AdminDashboard.tsx
- dependencies
- LoginForm.tsx
- ManageSchedule.tsx
- components.json
- supabase.ts
- compilerOptions
- devDependencies
- useAuth
- format.ts
- client/package.json
- @supabase/server
- compilerOptions
- index.js
- rateLimits.js
- Transactions.tsx
- SignupForm.tsx
- AI-Powered Event Management System
- paystack.js
- AddScheduleItemForm.tsx
- server/package.json
- vite.config.ts
- mpesa.js
- package.json
- CheckIn
- ai.js
- React + TypeScript + Vite
- AGENTS.md
- admin.js
- Profile.tsx
- UserManagement.tsx
- axios
- scripts
- scripts
- createUssdHandler
- tsconfig.json
- devDependencies
- vercel.json
- Landing.tsx
- AuthProvider

## God Nodes (most connected - your core abstractions)
1. `react` - 59 edges
2. `lucide-react` - 50 edges
3. `framer-motion` - 39 edges
4. `cn()` - 36 edges
5. `react-router-dom` - 33 edges
6. `useAuth()` - 33 edges
7. `App()` - 31 edges
8. `supabase` - 25 edges
9. `RegistrationForm()` - 23 edges
10. `Button` - 23 edges

## Surprising Connections (you probably didn't know these)
- `Features` --references--> `Statistics()`  [INFERRED]
  README.md → client/src/pages/organizer/Statistics.tsx
- `Features` --references--> `Transactions()`  [INFERRED]
  README.md → client/src/pages/organizer/Transactions.tsx
- `changeRole()` --calls--> `apiFetch()`  [EXTRACTED]
  client/src/components/admin/UserManagement.tsx → client/src/lib/api.ts
- `App()` --calls--> `Navbar()`  [EXTRACTED]
  client/src/App.tsx → client/src/components/layout/Navbar.tsx
- `App()` --calls--> `ProtectedRoute()`  [EXTRACTED]
  client/src/App.tsx → client/src/components/layout/ProtectedRoute.tsx

## Import Cycles
- None detected.

## Communities (46 total, 5 thin omitted)

### Community 0 - "RegistrationForm.tsx"
Cohesion: 0.08
Nodes (52): @base-ui/react@^1.8.0, Badge(), badgeVariants, Button, ButtonProps, buttonVariants, Card(), CardAction() (+44 more)

### Community 1 - "Statistics.tsx"
Cohesion: 0.06
Nodes (57): BarChart(), BarDatum, barPath(), Props, truncate(), axisTicks(), ChartInk, ChartPalette (+49 more)

### Community 2 - "MyEvents.tsx"
Cohesion: 0.08
Nodes (40): EventFilterBar(), EventFilterBarProps, PageHeader(), Props, EventCardProps, Props, TicketQR(), isMissingTableError() (+32 more)

### Community 3 - "event.ts"
Cohesion: 0.09
Nodes (41): AiAutofill(), AiAutofillProps, BasicInfoSection(), Props, DateTimeSection(), describeDuration(), Props, toLocalInput() (+33 more)

### Community 4 - "App.tsx"
Cohesion: 0.13
Nodes (26): AdminCommandCenter, AdminLogin, AdminSignup, App(), AttendeeLogin, AttendeeSignup, CheckIn, Dashboard (+18 more)

### Community 5 - "EventDetail.tsx"
Cohesion: 0.16
Nodes (13): PaymentPrompt(), PaystackInitResponse, Props, Stage, Window, ApiError, apiFetch(), AttendeePayment (+5 more)

### Community 6 - "AdminDashboard.tsx"
Cohesion: 0.13
Nodes (16): useEvents(), AdminDashboard(), AdminTab, Alert, AlertsPanel(), initialLoad(), load(), AuditEntry (+8 more)

### Community 7 - "dependencies"
Cohesion: 0.08
Nodes (24): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cn@^0.4.0, @fontsource-variable/inter@^5.3.0, @fontsource-variable/sora@^5.3.0, framer-motion@^13.4.4, @headlessui/react@^2.2.10 (+16 more)

### Community 8 - "LoginForm.tsx"
Cohesion: 0.17
Nodes (16): AuthLayout(), PanelBackdrop(), Props, AuthVariant, VariantConfig, VARIANTS, containerVariants, itemVariants (+8 more)

### Community 9 - "ManageSchedule.tsx"
Cohesion: 0.13
Nodes (13): BackButton(), BackButtonProps, eventNav(), AttendeeStatus, ManageAttendees(), PAYMENT_STYLES, PaymentStatus, STATUS_STYLES (+5 more)

### Community 10 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 11 - "supabase.ts"
Cohesion: 0.21
Nodes (7): AddScheduleItemFormProps, FMT, AddVenueLocationForm(), AddVenueLocationFormProps, supabase, ManageVenueLocations(), VenueLocation

### Community 12 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 13 - "devDependencies"
Cohesion: 0.15
Nodes (12): eslint@^10.10.0, @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.6, globals@^17.12.0, typescript-eslint@^8.69.0, eslint, @eslint/js (+4 more)

### Community 14 - "useAuth"
Cohesion: 0.22
Nodes (11): Managed(), AccessDenied(), EventGuard(), ProtectedRoute(), RequireAuth(), AuthContext, AuthContextType, Role (+3 more)

### Community 15 - "format.ts"
Cohesion: 0.19
Nodes (17): CURRENCY, daysUntil(), formatCountdown(), formatDate(), formatDateShort(), formatDateTime(), formatDayLabel(), formatNumber() (+9 more)

### Community 16 - "client/package.json"
Cohesion: 0.13
Nodes (14): qrcode.react@^4.2.0, @radix-ui/react-slot@^1.3.3, shadcn@^4.21.0, @supabase/supabase-js@^2.117.1, tw-animate-css@^1.4.0, @supabase/supabase-js, name, private (+6 more)

### Community 17 - "@supabase/server"
Cohesion: 0.11
Nodes (17): Calling from database with pg_net, Cloudflare Workers, Cookie-based environments (compose with `@supabase/ssr`), Documentation, Edge Function recipes, Entry points, Function-to-function calls, Hono (+9 more)

### Community 18 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 19 - "index.js"
Cohesion: 0.09
Nodes (13): activeEventSessions, AfricasTalking, app, credentials, io, server, supabase, tasks (+5 more)

### Community 20 - "rateLimits.js"
Cohesion: 0.38
Nodes (3): requireAuth(), supabaseAdmin, router

### Community 21 - "Transactions.tsx"
Cohesion: 0.21
Nodes (10): AppShell(), AppShellNavItem, AppShellProps, ORGANIZER_NAV, ScanResult, STATUS_ICONS, STATUS_STYLES, STATUS_LABELS (+2 more)

### Community 22 - "SignupForm.tsx"
Cohesion: 0.18
Nodes (16): containerVariants, EyeToggle(), itemVariants, ModernInput(), ModernInputProps, passwordStrength(), SignupForm(), handleSubmit() (+8 more)

### Community 23 - "AI-Powered Event Management System"
Cohesion: 0.25
Nodes (7): AI-Powered Event Management System, Code navigation (graphify), Database migrations, M-Pesa (Daraja) payments, Prerequisites, Setup, Start the app

### Community 24 - "paystack.js"
Cohesion: 0.17
Nodes (7): handleUssd, initializeUssdPaystackCheckout(), settlePaystackTransaction(), verifyPaystackReference(), TRANSACTION, ATTENDEE, EVENT

### Community 25 - "AddScheduleItemForm.tsx"
Cohesion: 0.36
Nodes (5): AddScheduleItemForm(), handleSubmit(), pad(), toDatetimeLocal(), validateSessionTimes()

### Community 26 - "server/package.json"
Cohesion: 0.07
Nodes (40): africastalking, bcryptjs, body-parser, cors, dotenv, express-rate-limit, jsonwebtoken, multer (+32 more)

### Community 27 - "vite.config.ts"
Cohesion: 0.20
Nodes (7): @tailwindcss/vite@^4.3.3, vite@^8.3.0, @vitejs/plugin-react@^6.1.1, __dirname, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 28 - "mpesa.js"
Cohesion: 0.42
Nodes (9): credentialsFor(), DEFAULTS, getAccessToken(), isConfigured(), normaliseCallbackUrl(), paybillCredentials(), queryTransaction(), settings() (+1 more)

### Community 29 - "package.json"
Cohesion: 0.20
Nodes (11): dependencies, pdf-parse@^2.4.5, devDependencies, @types/node@^26.6.3, pdf-parse, @types/node, scripts, graph:build (+3 more)

### Community 30 - "CheckIn"
Cohesion: 0.31
Nodes (5): CheckIn(), checkInAttendee(), handleDecoded(), manualCheckIn(), startScanning()

### Community 31 - "ai.js"
Cohesion: 0.15
Nodes (16): openai, aiTools, buildSystemPrompt(), draftBroadcastMessage(), executeToolCall(), extractEventFromText(), processMessageWithAI(), stripJsonFences() (+8 more)

### Community 32 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 34 - "admin.js"
Cohesion: 0.25
Nodes (5): express, express@^5.2.1, ROLES, router, supabaseAdmin

### Community 35 - "Profile.tsx"
Cohesion: 0.36
Nodes (6): ErrorBanner(), Field(), InfoBanner(), ForgotPassword(), Profile(), ResetPassword()

### Community 36 - "UserManagement.tsx"
Cohesion: 0.20
Nodes (8): FALLBACK_ROLE, initials(), Profile, ROLE_STYLES, RoleFilter, RoleStyle, UserManagement(), changeRole()

### Community 38 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 39 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, dev, start, test

### Community 40 - "createUssdHandler"
Cohesion: 0.36
Nodes (7): createUssdHandler(), eventLabel(), isEventAvailable(), normalizePhoneNumber(), createHarness(), FREE_EVENT, PAID_EVENT

### Community 42 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, autoprefixer@^10.6.1, postcss@^8.5.28, tailwindcss@^4.3.3, @types/node@^24.19.0, @types/react@^19.2.18, @types/react-dom@^19.2.7, typescript@~6.0.2 (+7 more)

### Community 44 - "Landing.tsx"
Cohesion: 0.29
Nodes (7): fadeUp, FEATURES, HeroPreview(), Landing(), METRICS, ROLES, STEPS

## Knowledge Gaps
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Statistics.tsx` to `RegistrationForm.tsx`, `MyEvents.tsx`, `Profile.tsx`, `App.tsx`, `UserManagement.tsx`, `event.ts`, `dependencies`, `LoginForm.tsx`, `EventDetail.tsx`, `AdminDashboard.tsx`, `supabase.ts`, `ManageSchedule.tsx`, `useAuth`, `client/package.json`, `Transactions.tsx`, `SignupForm.tsx`?**
  _High betweenness centrality (0.153) - this node is a cross-community bridge._
- **Should `RegistrationForm.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08028846153846154 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `event.ts` to `RegistrationForm.tsx`, `Statistics.tsx`, `MyEvents.tsx`, `Profile.tsx`, `UserManagement.tsx`, `EventDetail.tsx`, `AdminDashboard.tsx`, `dependencies`, `LoginForm.tsx`, `ManageSchedule.tsx`, `App.tsx`, `supabase.ts`, `Landing.tsx`, `useAuth`, `client/package.json`, `Transactions.tsx`, `SignupForm.tsx`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Should `Statistics.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.061621621621621624 - nodes in this community are weakly interconnected._
- **Why does `framer-motion` connect `Statistics.tsx` to `RegistrationForm.tsx`, `MyEvents.tsx`, `event.ts`, `UserManagement.tsx`, `App.tsx`, `EventDetail.tsx`, `dependencies`, `LoginForm.tsx`, `AdminDashboard.tsx`, `Profile.tsx`, `supabase.ts`, `Landing.tsx`, `ManageSchedule.tsx`, `client/package.json`, `Transactions.tsx`, `SignupForm.tsx`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Should `MyEvents.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07541478129713423 - nodes in this community are weakly interconnected._
- **Should `event.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0861952861952862 - nodes in this community are weakly interconnected._