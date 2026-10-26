# Graph Report - smart-help-desk  (2026-10-26)

## Corpus Check
- 128 files · ~65,072 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .css 1, .tsbuildinfo 1)

## Summary
- 846 nodes · 1940 edges · 36 communities (32 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9a4a47e3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RegistrationForm.tsx
- Statistics.tsx
- MyEvents.tsx
- EventFormPage.tsx
- App.tsx
- AdminDashboard.tsx
- auth-context.ts
- dependencies
- LoginForm.tsx
- scripts
- components.json
- compilerOptions
- devDependencies
- format.ts
- client/package.json
- @supabase/server
- compilerOptions
- index.js
- rateLimits.js
- react
- paystack.js
- server/package.json
- vite.config.ts
- mpesa.js
- package.json
- CheckIn
- ai.js
- React + TypeScript + Vite
- AGENTS.md
- admin.js
- axios
- scripts
- createUssdHandler
- tsconfig.json
- devDependencies
- vercel.json

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
- `useCategoricalColors()` --calls--> `useTheme()`  [EXTRACTED]
  client/src/components/charts/chart-utils.ts → client/src/context/theme-context.ts
- `Props` --references--> `Event`  [EXTRACTED]
  client/src/components/ui/RegistrationForm.tsx → client/src/types/event.ts
- `EventRow` --references--> `Event`  [EXTRACTED]
  client/src/pages/organizer/Statistics.tsx → client/src/types/event.ts

## Import Cycles
- None detected.

## Communities (36 total, 4 thin omitted)

### Community 0 - "RegistrationForm.tsx"
Cohesion: 0.08
Nodes (48): Badge(), badgeVariants, Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader() (+40 more)

### Community 1 - "Statistics.tsx"
Cohesion: 0.08
Nodes (41): BarChart(), BarDatum, barPath(), Props, truncate(), axisTicks(), ChartInk, ChartPalette (+33 more)

### Community 2 - "MyEvents.tsx"
Cohesion: 0.07
Nodes (50): EventFilterBar(), EventFilterBarProps, PageHeader(), Props, EventCardProps, MONTHS, STATUS_STYLES, StatusStyle (+42 more)

### Community 3 - "EventFormPage.tsx"
Cohesion: 0.09
Nodes (36): AiAutofill(), AiAutofillProps, BasicInfoSection(), Props, DateTimeSection(), describeDuration(), Props, toLocalInput() (+28 more)

### Community 4 - "App.tsx"
Cohesion: 0.08
Nodes (39): AdminCommandCenter, AdminLogin, AdminSignup, App(), AttendeeLogin, AttendeeSignup, CheckIn, Dashboard (+31 more)

### Community 5 - "AdminDashboard.tsx"
Cohesion: 0.06
Nodes (33): FALLBACK_ROLE, initials(), Profile, ROLE_STYLES, RoleFilter, RoleStyle, UserManagement(), changeRole() (+25 more)

### Community 6 - "auth-context.ts"
Cohesion: 0.11
Nodes (15): Navbar(), ROLE_LABEL, ThemeToggle(), AuthContext, AuthContextType, Role, SignUpInput, AuthProvider() (+7 more)

### Community 7 - "dependencies"
Cohesion: 0.08
Nodes (24): dependencies, @base-ui/react@^1.8.0, cn@^0.4.0, @fontsource-variable/inter@^5.3.0, @fontsource-variable/sora@^5.3.0, framer-motion@^13.4.4, html5-qrcode@^2.3.8, lucide-react@^1.47.0 (+16 more)

### Community 8 - "LoginForm.tsx"
Cohesion: 0.08
Nodes (37): AuthLayout(), PanelBackdrop(), Props, ErrorBanner(), Field(), InfoBanner(), AuthVariant, VariantConfig (+29 more)

### Community 9 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, dev, start, test

### Community 10 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 12 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 13 - "devDependencies"
Cohesion: 0.15
Nodes (12): eslint@^10.10.0, @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.6, globals@^17.12.0, typescript-eslint@^8.69.0, eslint, @eslint/js (+4 more)

### Community 15 - "format.ts"
Cohesion: 0.19
Nodes (17): CURRENCY, daysUntil(), formatCountdown(), formatDate(), formatDateShort(), formatDateTime(), formatDayLabel(), formatNumber() (+9 more)

### Community 16 - "client/package.json"
Cohesion: 0.12
Nodes (16): class-variance-authority@^0.7.1, clsx@^2.1.1, @headlessui/react@^2.2.10, qrcode.react@^4.2.0, shadcn@^4.21.0, tailwind-merge@^3.7.0, name, private (+8 more)

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

### Community 21 - "react"
Cohesion: 0.05
Nodes (51): Props, TableData, Props, StackedBarChart(), StackedBarDatum, StackedSegment, Props, TONES (+43 more)

### Community 24 - "paystack.js"
Cohesion: 0.17
Nodes (7): handleUssd, initializeUssdPaystackCheckout(), settlePaystackTransaction(), verifyPaystackReference(), TRANSACTION, ATTENDEE, EVENT

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

### Community 38 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 40 - "createUssdHandler"
Cohesion: 0.29
Nodes (9): createUssdHandler(), loadEvents(), showEvents(), eventLabel(), isEventAvailable(), normalizePhoneNumber(), createHarness(), FREE_EVENT (+1 more)

### Community 42 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, autoprefixer@^10.6.1, postcss@^8.5.28, tailwindcss@^4.3.3, @types/node@^24.19.0, @types/react@^19.2.18, @types/react-dom@^19.2.7, typescript@~6.0.2 (+7 more)

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `RegistrationForm.tsx`, `Statistics.tsx`, `MyEvents.tsx`, `EventFormPage.tsx`, `App.tsx`, `AdminDashboard.tsx`, `auth-context.ts`, `dependencies`, `LoginForm.tsx`, `client/package.json`?**
  _High betweenness centrality (0.153) - this node is a cross-community bridge._
- **Should `RegistrationForm.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08361581920903954 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `react` to `RegistrationForm.tsx`, `Statistics.tsx`, `MyEvents.tsx`, `EventFormPage.tsx`, `App.tsx`, `AdminDashboard.tsx`, `auth-context.ts`, `dependencies`, `LoginForm.tsx`, `client/package.json`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Should `Statistics.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0782312925170068 - nodes in this community are weakly interconnected._
- **Why does `framer-motion` connect `react` to `RegistrationForm.tsx`, `Statistics.tsx`, `MyEvents.tsx`, `EventFormPage.tsx`, `App.tsx`, `AdminDashboard.tsx`, `auth-context.ts`, `dependencies`, `LoginForm.tsx`, `client/package.json`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Should `MyEvents.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06680080482897384 - nodes in this community are weakly interconnected._
- **Should `EventFormPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08843537414965986 - nodes in this community are weakly interconnected._