# Barber Time

A full-stack barbershop booking platform built with **Next.js 14 App Router**, enabling users to discover local barbershops, browse services, and schedule appointments — all in a responsive, mobile-first interface.

## Tech Stack

| Layer             | Technology                                                  |
| ----------------- | ----------------------------------------------------------- |
| **Framework**     | Next.js 14 (App Router, React Server Components)            |
| **Language**      | TypeScript 5                                                |
| **Database**      | PostgreSQL via Docker                                       |
| **ORM**           | Prisma 5                                                    |
| **Auth**          | NextAuth v4 + Google OAuth + Prisma Adapter                 |
| **UI**            | Radix UI primitives + Tailwind CSS + shadcn/ui              |
| **Forms**         | React Hook Form + Zod                                       |
| **Date handling** | date-fns + react-day-picker                                 |
| **Notifications** | Sonner (toast)                                              |
| **Code quality**  | ESLint, Prettier, Husky, lint-staged, git-commit-msg-linter |

## Architecture

The project follows the **React Server Components** model introduced in Next.js 13+. Data is fetched directly from PostgreSQL via Prisma inside Server Components — eliminating unnecessary API round-trips and reducing client-side JavaScript.

```
app/
├── page.tsx                   # RSC: home feed, featured barbershops
├── barbershops/
│   ├── page.tsx               # RSC: filtered search results
│   └── [id]/page.tsx          # RSC: barbershop detail + service list
├── api/auth/[...nextauth]/    # NextAuth catch-all route
└── _components/               # Shared client + server components
    ├── service-item.tsx       # Client: booking sheet flow
    ├── sidebar-sheet.tsx      # Client: auth-aware nav drawer
    └── ...
prisma/
├── schema.prisma              # Data model
└── seed.ts                    # Database seeder
```

**Key architectural decisions:**

- **Server Components by default** — pages fetch data at the server level, reducing bundle size and improving TTFB
- **Component co-location** — UI logic lives next to the routes that use it under `_components/`
- **Prisma as the single data access layer** — no intermediate REST layer for reads; mutations go through Next.js Server Actions (in progress)
- **Adapter-based auth persistence** — OAuth sessions are stored in PostgreSQL via `@auth/prisma-adapter`, keeping the auth state durable across deploys

## Data Model

```prisma
User         — linked to OAuth accounts, sessions, and bookings
Barbershop   — name, address, phones[], description, imageUrl
BarbershopService — name, description, price (Decimal), imageUrl → Barbershop
Booking      — date, User → BarbershopService (many-to-many join)
Account      — NextAuth OAuth token storage
Session      — NextAuth session persistence
```

## Features

- **Barbershop discovery** — browse recommended and popular shops via server-rendered carousels
- **Full-text search** — case-insensitive filtering across barbershop names and service categories
- **Service booking flow** — date picker (pt-BR locale), 30-minute time-slot grid, booking summary sheet
- **Google OAuth** — one-click sign-in with persistent sessions stored in PostgreSQL
- **Auth-aware UI** — sidebar dynamically renders user avatar or login prompt
- **Phone copy-to-clipboard** — with toast feedback via Sonner
- **Containerized DB** — PostgreSQL runs in Docker for zero-friction local setup

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for the database)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/barber-time.git
cd barber-time

# 2. Install dependencies
npm install

# 3. Start PostgreSQL
docker-compose up -d

# 4. Configure environment
cp .env.example .env
# Fill in DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET

# 5. Run migrations and seed
npx prisma migrate dev
npx prisma db seed

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable               | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string                       |
| `GOOGLE_CLIENT_ID`     | Google OAuth app client ID                         |
| `GOOGLE_CLIENT_SECRET` | Google OAuth app client secret                     |
| `NEXTAUTH_SECRET`      | Random secret for session signing                  |
| `NEXTAUTH_URL`         | Base URL of the app (e.g. `http://localhost:3000`) |

## Scripts

```bash
npm run dev        # Start development server with hot-reload
npm run build      # Production build
npm run start      # Run production build
npm run lint       # ESLint check
```

## Roadmap

- [ ] Server Actions for booking confirmation
- [ ] Booking management dashboard (cancel / reschedule)
- [ ] Availability conflict detection at the DB level
- [ ] Push notifications for appointment reminders
- [ ] Admin panel for barbershop owners
