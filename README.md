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