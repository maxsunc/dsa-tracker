# DSA Tracker

A spaced repetition web app for mastering DSA problems. Schedules reviews at increasing intervals, adapts to difficulty ratings, and tracks your progress over time.

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT + Passport.js (Google OAuth)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google OAuth credentials (for Google sign-in)

### Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env with your database URL and secrets
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### Frontend Setup

```bash
cd client
cp .env.example .env
# Edit .env with your API URL
npm install
npm run dev
```

## Features

- **Problem Library** — Browse 150+ curated LeetCode problems by category and pattern
- **Spaced Repetition** — Scientifically-backed review scheduling that adapts to your performance
- **Daily Dashboard** — See what's due, overdue, and upcoming at a glance
- **Review Flow** — Rate difficulty after each review to fine-tune your schedule
- **Progress Stats** — Charts, heatmaps, streaks, and category breakdowns
- **Notes** — Track key insights and patterns for each problem

## License

MIT
