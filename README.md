# Noyyal — Attendance & Work Status Reporting

A React + TypeScript app for daily attendance tracking (check-in/check-out) and
employee work status reporting, with separate employee and manager experiences.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS (custom design tokens, light/dark theme)
- React Router v6
- Zustand (state, persisted to `localStorage`)
- Recharts (attendance trend & status charts)
- lucide-react (icons)

## Getting started

This machine doesn't have Node.js installed yet, so dependencies haven't been
installed or the dev server started. Once Node.js 18+ is installed:

```bash
cd noyyal_app
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

## How data works

There's no backend yet — data lives in `localStorage`, seeded on first load
with ~6 weeks of realistic demo attendance and reports for a small team. This
keeps the app fully runnable offline and lets you evaluate the UI/UX
immediately. The data layer (`src/store/useDataStore.ts`) is written as a
self-contained API (`checkIn`, `checkOut`, `submitReport`, `getTeam`, ...) so
it can be swapped for real HTTP calls to a backend later without touching any
page or component.

## Using the app

On launch you'll see a demo login screen — pick a profile to sign in as
(no password, since there's no backend yet):

- **Manager (Anitha Raj)** — team overview dashboard with live stats,
  a 14-day attendance trend chart, today's status breakdown, per-employee
  drill-down (attendance calendar + history + their status reports), team
  attendance table with day/employee filters, and a team reports feed.
- **Employee** (e.g. Kathir Arumparam) — check in/out with a live clock,
  submit a daily work status report (summary, tasks completed, hours,
  work mode, mood, blockers), a personal attendance calendar/history, and
  a log of past reports.

Theme (light/dark) toggles from the top-right and persists across reloads.

## Project structure

```
src/
  components/
    attendance/   check-in card, calendar, attendance table, team status list
    charts/       recharts wrappers (trend area chart, status pie chart)
    layout/       app shell, sidebar, topbar
    reports/      status report form, report list
    ui/           card, button, badge, stat tile, avatar
  lib/            seed data generator, stats helpers, formatting utils
  pages/
    employee/     dashboard, my attendance, my reports
    manager/      overview, team attendance, team reports, team, employee detail
  routes/         protected route + role-based dashboard switch
  store/          zustand stores: auth, theme, data (attendance + reports)
  types/          shared TypeScript types
```

## Next steps (when you're ready)

- Swap `useDataStore`'s in-memory/localStorage implementation for real API
  calls (the action signatures are already backend-shaped).
- Add real authentication in place of the demo profile picker.
- Re-introduce AI features (e.g. AI-written report summaries, anomaly
  detection, a natural-language query assistant) once you're ready to wire
  up a provider — the report/attendance data model already has everything
  an AI feature would need to consume.
