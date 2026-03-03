# DSA Tracker — Project Plan

A spaced repetition web app for mastering DSA problems. Schedules reviews at increasing intervals, adapts to difficulty ratings, and tracks your progress over time.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Data Model](#data-model)
4. [Database Schema (Prisma)](#database-schema-prisma)
5. [Core Features](#core-features)
6. [Spaced Repetition Algorithm](#spaced-repetition-algorithm)
7. [Pages & UI](#pages--ui)
8. [API Endpoints](#api-endpoints)
9. [Authentication](#authentication)
10. [Frontend Architecture](#frontend-architecture)
11. [Backend Bootstrap](#backend-bootstrap)
12. [Project Structure](#project-structure)
13. [Development Phases](#development-phases)

---

## Overview

**Goal:** Help users retain DSA knowledge by scheduling problem reviews at scientifically-backed intervals. The app is a retention/scheduling layer on top of LeetCode — it doesn't solve problems, explain solutions, or grade code.

**Core loop:**
1. User marks a problem as completed.
2. Problem enters the revision queue with an auto-generated schedule.
3. Each day, user sees what's due and overdue.
4. User reviews the problem on LeetCode, comes back and rates difficulty.
5. System adjusts the next review date based on the rating.

---

## Tech Stack

| Layer        | Technology                  | Rationale                                                        |
| ------------ | --------------------------- | ---------------------------------------------------------------- |
| **Frontend** | React 18 + Vite             | Fast dev experience, component-based UI                          |
| **Styling**  | Tailwind CSS                | Utility-first, rapid prototyping, easy responsive design         |
| **Backend**  | Node.js + Express           | Lightweight, JS everywhere, large ecosystem                      |
| **Database** | PostgreSQL                  | Relational data (users ↔ problems ↔ reviews), strong SQL support |
| **ORM**      | Prisma                      | Type-safe queries, easy migrations, works great with Postgres    |
| **Auth**     | JWT (access + refresh tokens) + Passport.js | Stateless auth; Passport handles Google OAuth strategy  |
| **Validation** | Zod | Schema validation for all API request bodies; catches bad input before it reaches the DB |
| **Hosting**  | Railway / Render (backend + DB), Vercel (frontend) | Free/cheap tiers, easy deploys        |

### Why PostgreSQL over MongoDB?

The data is inherently relational: users have problems, problems have review histories, problems belong to categories. SQL makes queries like "get all problems due today for user X, ordered by overdue first" trivial and performant with proper indexing.

---

## Data Model

### `users`

| Column          | Type         | Notes                                              |
| --------------- | ------------ | -------------------------------------------------- |
| `id`            | UUID (PK)    | Auto-generated                                     |
| `email`         | VARCHAR(255) | Unique, indexed                                    |
| `password_hash` | VARCHAR(255) | bcrypt hashed — **nullable** if Google-only user   |
| `google_id`     | VARCHAR(255) | Google's unique user ID — **nullable** if email user |
| `avatar_url`    | VARCHAR(500) | Profile picture URL from Google (optional)         |
| `display_name`  | VARCHAR(100) |                                                    |
| `created_at`    | TIMESTAMP    | Default `now()`                                    |
| `updated_at`    | TIMESTAMP    | Auto-updated                                       |

**Constraints:** At least one of `password_hash` or `google_id` must be non-null. A user can have both (linked accounts).

### `problems`

A master list of known DSA problems (seeded from a curated list).

| Column          | Type         | Notes                                      |
| --------------- | ------------ | ------------------------------------------ |
| `id`            | SERIAL (PK)  |                                            |
| `title`         | VARCHAR(255) | e.g. "Two Sum"                             |
| `leetcode_url`  | VARCHAR(500) | Direct link to problem                     |
| `leetcode_number` | INT        | e.g. 1, 121, 200                           |
| `difficulty`    | ENUM         | `easy`, `medium`, `hard`                   |
| `category`      | VARCHAR(100) | e.g. "Arrays", "Dynamic Programming"       |
| `pattern`       | VARCHAR(100) | e.g. "Sliding Window", "Two Pointers"      |

### `user_problems`

Tracks each user's relationship with a problem.

| Column              | Type         | Notes                                           |
| ------------------- | ------------ | ----------------------------------------------- |
| `id`                | UUID (PK)    |                                                 |
| `user_id`           | UUID (FK)    | References `users.id`                           |
| `problem_id`        | INT (FK)     | References `problems.id`                        |
| `status`            | ENUM         | `not_started`, `completed`, `in_review`         |
| `notes`             | TEXT         | User's notes/key insights                        |
| `current_interval`  | INT          | Current interval in days                         |
| `review_count`      | INT          | How many times reviewed (default 0)              |
| `next_review_date`  | DATE         | When the next review is due (nullable)           |
| `ease_factor`       | FLOAT        | Multiplier, starts at 1.0, adjusts per rating   |
| `completed_at`      | TIMESTAMP    | When first marked complete                       |
| `created_at`        | TIMESTAMP    |                                                 |
| `updated_at`        | TIMESTAMP    |                                                 |

**Unique constraint:** `(user_id, problem_id)`

### `review_history`

Immutable log of every review performed.

| Column          | Type       | Notes                                |
| --------------- | ---------- | ------------------------------------ |
| `id`            | UUID (PK)  |                                      |
| `user_problem_id` | UUID (FK) | References `user_problems.id`       |
| `reviewed_at`   | TIMESTAMP  | When the review happened             |
| `rating`        | ENUM       | `easy`, `medium`, `hard`             |
| `interval_used` | INT        | The interval that was active (days)  |
| `next_interval` | INT        | The computed next interval (days)    |

### ER Diagram (text)

```
users 1──────∞ user_problems ∞──────1 problems
                     │
                     1
                     │
                     ∞
              review_history
```

### Key Indexes

- `user_problems(user_id, next_review_date)` — powers the "due today" query
- `user_problems(user_id, status)` — powers dashboard stats
- `problems(category)` — filtering by category
- `problems(pattern)` — filtering by pattern

---

## Database Schema (Prisma)

The full `server/prisma/schema.prisma` file. This is what Prisma reads to generate the database and the TypeScript client.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String?  @map("password_hash")
  googleId     String?  @unique @map("google_id")
  avatarUrl    String?  @map("avatar_url")
  displayName  String?  @map("display_name")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  userProblems UserProblem[]

  @@map("users")
}

model Problem {
  id              Int    @id @default(autoincrement())
  title           String
  leetcodeUrl     String @map("leetcode_url")
  leetcodeNumber  Int    @map("leetcode_number")
  difficulty      String // "easy" | "medium" | "hard"
  category        String
  pattern         String

  userProblems UserProblem[]

  @@map("problems")
}

model UserProblem {
  id             String    @id @default(uuid())
  userId         String    @map("user_id")
  problemId      Int       @map("problem_id")
  status         String    @default("not_started") // "not_started" | "completed" | "in_review"
  notes          String?
  currentInterval Int      @default(0) @map("current_interval")
  reviewCount    Int       @default(0) @map("review_count")
  nextReviewDate DateTime? @map("next_review_date")
  easeFactor     Float     @default(1.0) @map("ease_factor")
  completedAt    DateTime? @map("completed_at")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  problem Problem @relation(fields: [problemId], references: [id])
  reviews ReviewHistory[]

  @@unique([userId, problemId])
  @@index([userId, nextReviewDate])
  @@index([userId, status])
  @@map("user_problems")
}

model ReviewHistory {
  id            String      @id @default(uuid())
  userProblemId String      @map("user_problem_id")
  reviewedAt    DateTime    @default(now()) @map("reviewed_at")
  rating        String      // "easy" | "medium" | "hard"
  intervalUsed  Int         @map("interval_used")
  nextInterval  Int         @map("next_interval")

  userProblem UserProblem @relation(fields: [userProblemId], references: [id], onDelete: Cascade)

  @@map("review_history")
}
```

### Commands

```bash
# First time setup
npx prisma migrate dev --name init

# After changing schema.prisma
npx prisma migrate dev --name <describe_change>

# Seed the problems table
npx prisma db seed

# Open Prisma Studio (visual DB browser)
npx prisma studio
```

### Seed File (`server/prisma/seed.js`)

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const problems = [
  { leetcodeNumber: 1,   title: 'Two Sum',                        difficulty: 'easy',   category: 'Arrays',            pattern: 'Hash Map',          leetcodeUrl: 'https://leetcode.com/problems/two-sum/' },
  { leetcodeNumber: 121, title: 'Best Time to Buy and Sell Stock', difficulty: 'easy',   category: 'Arrays',            pattern: 'Sliding Window',    leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
  { leetcodeNumber: 217, title: 'Contains Duplicate',             difficulty: 'easy',   category: 'Arrays',            pattern: 'Hash Map',          leetcodeUrl: 'https://leetcode.com/problems/contains-duplicate/' },
  { leetcodeNumber: 238, title: 'Product of Array Except Self',   difficulty: 'medium', category: 'Arrays',            pattern: 'Prefix Sum',        leetcodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/' },
  { leetcodeNumber: 53,  title: 'Maximum Subarray',               difficulty: 'medium', category: 'Arrays',            pattern: "Kadane's",          leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray/' },
  { leetcodeNumber: 200, title: 'Number of Islands',              difficulty: 'medium', category: 'Graphs',            pattern: 'BFS/DFS',           leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/' },
  { leetcodeNumber: 206, title: 'Reverse Linked List',            difficulty: 'easy',   category: 'Linked Lists',      pattern: 'Two Pointers',      leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/' },
  { leetcodeNumber: 21,  title: 'Merge Two Sorted Lists',         difficulty: 'easy',   category: 'Linked Lists',      pattern: 'Two Pointers',      leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
  { leetcodeNumber: 104, title: 'Maximum Depth of Binary Tree',   difficulty: 'easy',   category: 'Trees',             pattern: 'DFS',               leetcodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
  { leetcodeNumber: 226, title: 'Invert Binary Tree',             difficulty: 'easy',   category: 'Trees',             pattern: 'DFS',               leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/' },
  { leetcodeNumber: 70,  title: 'Climbing Stairs',                difficulty: 'easy',   category: 'Dynamic Programming', pattern: 'DP',              leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/' },
  { leetcodeNumber: 322, title: 'Coin Change',                    difficulty: 'medium', category: 'Dynamic Programming', pattern: 'DP',              leetcodeUrl: 'https://leetcode.com/problems/coin-change/' },
  // ... full Blind 75 + NeetCode 150 list continues
];

async function main() {
  console.log('Seeding problems...');
  for (const problem of problems) {
    await prisma.problem.upsert({
      where: { leetcodeNumber: problem.leetcodeNumber },
      update: {},
      create: problem,
    });
  }
  console.log(`Seeded ${problems.length} problems.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Add to `server/package.json`:
```json
"prisma": {
  "seed": "node prisma/seed.js"
}
```

---

## Core Features

### 1. Problem Library

- Seeded with a curated list of ~200 popular LeetCode problems (Blind 75, NeetCode 150, etc.)
- Browsable by category (Arrays, Trees, Graphs, DP, etc.) and pattern (Sliding Window, BFS, etc.)
- Filterable by difficulty (Easy / Medium / Hard)
- Searchable by title or number
- Users can also add custom problems

### 2. Problem Tracking

- Mark a problem as "completed" → enters the revision queue
- Each problem shows: status, next review date, review count, notes
- Visual indicators:
  - **Green** — completed, not yet due
  - **Purple badge "Due"** — scheduled for today
  - **Red badge "Overdue"** — past due date

### 3. Revision Dashboard

The main daily interface.

- **Summary cards at top:**
  - Total problems in revision queue
  - Due today (count)
  - Overdue (count, highlighted red)
  - Completion rate (% of problems completed)
  - Total reviews done
- **Overdue list** — shown first, sorted oldest-first (most urgent)
- **Due today list** — shown below overdue
- **Upcoming** — next 7 days preview

### 4. Review Flow

1. User clicks "Review" on a due/overdue problem
2. App opens LeetCode problem in a new tab
3. User solves it from memory
4. User returns and clicks a rating button:
   - **Easy** (green) — "Solved quickly, felt confident"
   - **Medium** (yellow) — "Needed some thinking"
   - **Hard** (red) — "Struggled significantly"
5. System computes next review date and updates the record
6. Problem disappears from the due list

### 5. Progress & Stats

- Problems completed over time (line chart)
- Reviews per day (bar chart)
- Category breakdown (how many problems per category, completion %)
- Current streak (consecutive days with at least 1 review)
- Heatmap calendar (like GitHub contributions) showing review activity

### 6. Notes

- Each problem has a notes field (markdown supported)
- Users jot down key insights, patterns, edge cases, time complexity
- Notes displayed during review to aid recall

---

## Spaced Repetition Algorithm

### Base Schedule

Review intervals follow this progression:

| Review # | Interval (days) |
| -------- | --------------- |
| 1        | 1               |
| 2        | 3               |
| 3        | 7               |
| 4        | 14              |
| 5        | 30              |
| 6        | 90              |
| 7        | 180             |
| 8+       | 365             |

Stored as a constant array: `[1, 3, 7, 14, 30, 90, 180, 365]`

### Difficulty Adjustment

After each review, the next interval is modified by the rating:

```
if rating == "easy":
    next_interval = base_interval × 1.5
elif rating == "medium":
    next_interval = base_interval × 1.0
elif rating == "hard":
    next_interval = base_interval × 0.7
```

The `ease_factor` on `user_problems` accumulates over time:
- Consistently easy → reviews spread further apart
- Consistently hard → reviews stay frequent

### Calculation Logic (pseudocode)

```
function calculateNextReview(userProblem, rating):
    BASE_INTERVALS = [1, 3, 7, 14, 30, 90, 180, 365]
    MULTIPLIERS    = { easy: 1.5, medium: 1.0, hard: 0.7 }
    EASE_DELTA     = { easy: +0.1, medium: 0.0, hard: -0.15 }
    EASE_MIN       = 0.5
    EASE_MAX       = 2.5

    // 1. Update ease_factor based on this rating
    userProblem.ease_factor += EASE_DELTA[rating]
    userProblem.ease_factor  = clamp(userProblem.ease_factor, EASE_MIN, EASE_MAX)

    // 2. Pick base interval from progression
    reviewIndex  = min(userProblem.review_count, BASE_INTERVALS.length - 1)
    baseInterval = BASE_INTERVALS[reviewIndex]

    // 3. Apply rating multiplier AND accumulated ease factor
    adjustedInterval = round(baseInterval * MULTIPLIERS[rating] * userProblem.ease_factor)
    adjustedInterval = max(adjustedInterval, 1)  // minimum 1 day

    // 4. Persist changes
    userProblem.review_count    += 1
    userProblem.current_interval = adjustedInterval
    userProblem.next_review_date = today + adjustedInterval days

    // 5. Log immutable record
    createReviewEntry(userProblem.id, rating, baseInterval, adjustedInterval)
```

**Why ease_factor matters:** Without it, a problem that is always rated Easy will still follow the same base schedule as a Hard one. The ease_factor compounds over reviews:
- After 5 Easy ratings: `ease_factor ≈ 1.5` → intervals are 50% longer than base
- After 5 Hard ratings: `ease_factor ≈ 0.5` (floored) → intervals are halved

### Edge Cases

- **Overdue reviews:** If a problem is 5 days overdue, the next interval still calculates from today (not from when it was due). Being overdue doesn't penalize the schedule.
- **Reset option:** User can reset a problem's review progress if they want to start the schedule over.
- **Skip:** User can skip a review and push it to tomorrow without affecting the schedule.

---

## Pages & UI

### Page Map

| Route              | Page                | Auth Required |
| ------------------ | ------------------- | ------------- |
| `/`                | Landing page        | No            |
| `/login`           | Login               | No            |
| `/register`        | Register            | No            |
| `/dashboard`       | Revision dashboard  | Yes           |
| `/problems`        | Problem library     | Yes           |
| `/problems/:id`    | Problem detail      | Yes           |
| `/stats`           | Progress & stats    | Yes           |
| `/settings`        | User settings       | Yes           |

### Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│  DSA Tracker              [Dashboard] [Problems] [Stats] [Settings]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ In Queue │ │ Due Today│ │ Overdue  │ │ Streak │ │
│  │   47     │ │    5     │ │    2     │ │  12d   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│                                                     │
│  OVERDUE (2)                                  ──red─ │
│  ┌─────────────────────────────────────────────────┐│
│  │ #121 Best Time to Buy and Sell Stock  │ Review ││
│  │ Arrays · Easy · Overdue by 3 days     │        ││
│  ├─────────────────────────────────────────────────┤│
│  │ #200 Number of Islands                │ Review ││
│  │ Graphs · Medium · Overdue by 1 day    │        ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  DUE TODAY (5)                                      │
│  ┌─────────────────────────────────────────────────┐│
│  │ #1 Two Sum                            │ Review ││
│  │ Arrays · Easy · Review #4             │        ││
│  ├─────────────────────  ...  ──────────────────────┤│
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  UPCOMING (next 7 days)                             │
│  Mar 3: 3 problems · Mar 5: 2 problems · ...       │
└─────────────────────────────────────────────────────┘
```

### Review Modal

When clicking "Review":

```
┌──────────────────────────────────┐
│  #121 Best Time to Buy/Sell Stock│
│  Category: Arrays                │
│  Pattern: Sliding Window         │
│  Review #: 4                     │
│  ─────────────────────────────── │
│  Your Notes:                     │
│  "Track min price, compute       │
│   max profit at each step.       │
│   O(n) time, O(1) space."       │
│  ─────────────────────────────── │
│  [Open on LeetCode ↗]           │
│  ─────────────────────────────── │
│  How did it go?                  │
│  [Easy ✓]  [Medium ~]  [Hard ✗] │
│  ─────────────────────────────── │
│  [Skip → Tomorrow]              │
└──────────────────────────────────┘
```

### Problem Library

```
┌─────────────────────────────────────────────────────┐
│  Search: [____________]                             │
│  Category: [All ▾]  Difficulty: [All ▾]  Status: [All ▾]│
│  ─────────────────────────────────────────────────── │
│  #  │ Problem            │ Diff │ Category │ Status │
│  1  │ Two Sum            │ Easy │ Arrays   │ ✅ R4  │
│  2  │ Add Two Numbers    │ Med  │ Linked L │ ──     │
│  3  │ Longest Substring  │ Med  │ Strings  │ 🟣 Due │
│  ...                                                │
│  ─────────────────────────────────────────────────── │
│  [+ Add Custom Problem]                             │
└─────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Auth

| Method | Endpoint                    | Body                          | Response            |
| ------ | --------------------------- | ----------------------------- | ------------------- |
| POST   | `/api/auth/register`        | `{ email, password, name }`   | `{ token, user }`   |
| POST   | `/api/auth/login`           | `{ email, password }`         | `{ token, user }`   |
| POST   | `/api/auth/refresh`         | `{ refreshToken }`            | `{ token }`         |
| GET    | `/api/auth/me`              | —                             | `{ user }`          |
| GET    | `/api/auth/google`          | —                             | Redirects to Google |
| GET    | `/api/auth/google/callback` | —                             | Redirects to frontend with token |

### Problems

| Method | Endpoint                      | Description                           |
| ------ | ----------------------------- | ------------------------------------- |
| GET    | `/api/problems`               | List all problems (filterable)        |
| GET    | `/api/problems/:id`           | Get single problem detail             |
| POST   | `/api/problems`               | Add custom problem                    |

Query params for list: `?category=Arrays&difficulty=medium&search=two+sum&page=1&limit=20`

### User Problems

| Method | Endpoint                              | Description                        |
| ------ | ------------------------------------- | ---------------------------------- |
| GET    | `/api/user/problems`                  | Get all user's tracked problems    |
| POST   | `/api/user/problems/:problemId/complete` | Mark problem as completed       |
| PUT    | `/api/user/problems/:problemId/notes` | Update notes                       |
| DELETE | `/api/user/problems/:problemId`       | Remove from tracking               |
| POST   | `/api/user/problems/:problemId/reset` | Reset review progress              |

### Reviews

| Method | Endpoint                              | Description                        |
| ------ | ------------------------------------- | ---------------------------------- |
| GET    | `/api/reviews/due`                    | Get today's due + overdue problems |
| GET    | `/api/reviews/upcoming?days=7`        | Get upcoming reviews               |
| POST   | `/api/reviews/:userProblemId/submit`  | Submit review rating               |
| POST   | `/api/reviews/:userProblemId/skip`    | Skip to tomorrow                   |

Body for submit: `{ rating: "easy" | "medium" | "hard" }`

### Stats

| Method | Endpoint                  | Description                        |
| ------ | ------------------------- | ---------------------------------- |
| GET    | `/api/stats/overview`     | Summary numbers for dashboard      |
| GET    | `/api/stats/history`      | Review history for charts          |
| GET    | `/api/stats/heatmap`      | Daily review counts for calendar   |
| GET    | `/api/stats/categories`   | Breakdown by category              |

#### Response Shapes

`GET /api/stats/overview`
```json
{
  "totalInQueue": 47,
  "dueToday": 5,
  "overdue": 2,
  "totalCompleted": 63,
  "totalReviews": 210,
  "currentStreak": 12,
  "completionRate": 31.5
}
```

`GET /api/stats/history?days=30`
```json
[
  { "date": "2026-02-01", "reviewCount": 4 },
  { "date": "2026-02-02", "reviewCount": 7 },
  ...
]
```

`GET /api/stats/heatmap?year=2026`
```json
[
  { "date": "2026-01-05", "count": 3 },
  { "date": "2026-01-06", "count": 0 },
  ...
]
```

`GET /api/stats/categories`
```json
[
  { "category": "Arrays",            "total": 25, "completed": 18, "pct": 72 },
  { "category": "Dynamic Programming","total": 20, "completed": 8,  "pct": 40 },
  ...
]
```

#### Streak Calculation Logic
```
streak = 0
currentDate = today

loop:
  reviewsOnDate = count(review_history where date(reviewed_at) == currentDate)
  if reviewsOnDate > 0:
    streak += 1
    currentDate -= 1 day
  else:
    break

return streak
```

#### Standard Error Response Shape

All errors across every endpoint return this consistent shape:
```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

HTTP status codes used:
| Status | When |
|--------|------|
| 400    | Invalid input (Zod validation failed) |
| 401    | Not authenticated / bad token |
| 403    | Authenticated but not authorized (e.g. accessing another user's data) |
| 404    | Resource not found |
| 409    | Conflict (e.g. email already exists) |
| 500    | Unexpected server error |

---

## Authentication

Two methods supported: **Email/Password** and **Google OAuth**. Both result in the same JWT token — the auth method only differs in how you arrive at that token.

### Packages Required

```bash
# server/
npm install bcryptjs jsonwebtoken passport passport-google-oauth20 passport-local cookie-parser
npm install -D @types/passport @types/passport-google-oauth20
```

### Method 1: Email/Password Flow

```
POST /api/auth/register
  → validate input
  → check email not already taken
  → hash password with bcrypt (12 rounds)
  → INSERT into users table
  → return access token + set refresh token cookie

POST /api/auth/login
  → find user by email
  → bcrypt.compare(password, user.password_hash)
  → if match → return access token + set refresh token cookie
  → if no match → 401 Unauthorized
```

### Method 2: Google OAuth Flow

```
User clicks "Sign in with Google"
  → GET /api/auth/google
  → Passport redirects to Google's consent screen
  → User approves → Google redirects to /api/auth/google/callback
  → Passport receives: { googleId, email, displayName, avatarUrl }
  → Look up user by google_id in DB
      → If found: log them in
      → If not found: create new user (google_id set, password_hash null)
  → Issue JWT access token
  → Redirect to frontend: https://yourapp.com/auth/callback?token=<jwt>
  → Frontend extracts token from URL, stores in memory
```

### Google Cloud Console Setup (one-time)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project → **APIs & Services** → **Credentials**
3. Click **Create Credentials** → **OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback` (dev) and `https://yourapi.com/api/auth/google/callback` (prod)
6. Copy the **Client ID** and **Client Secret** into your `.env`

### Environment Variables

```bash
# server/.env  (never commit this file)
DATABASE_URL="postgresql://user:password@localhost:5432/dsa_tracker?connection_limit=5"
JWT_SECRET="your-super-secret-key-change-this"
JWT_REFRESH_SECRET="another-secret-for-refresh-tokens"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:5000/api/auth/google/callback"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
PORT=5000
```

```bash
# client/.env  (never commit this file)
VITE_API_URL=http://localhost:5000/api
```

> **Note on `connection_limit=5`:** Free-tier Postgres hosts (Railway, Supabase, Render) cap simultaneous connections. Without this param, Prisma will try to open up to 10 connections by default and the host will reject them. Set to 5 for free tiers, increase for paid plans.

### Passport Configuration (`server/src/config/passport.js`)

```javascript
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await prisma.user.findUnique({
        where: { googleId: profile.id },
      });

      if (!user) {
        // Check if email is already registered (link accounts)
        user = await prisma.user.findUnique({
          where: { email: profile.emails[0].value },
        });

        if (user) {
          // Link Google to existing email account
          user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId: profile.id, avatarUrl: profile.photos[0]?.value },
          });
        } else {
          // Create brand new user
          user = await prisma.user.create({
            data: {
              email: profile.emails[0].value,
              displayName: profile.displayName,
              googleId: profile.id,
              avatarUrl: profile.photos[0]?.value,
            },
          });
        }
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

module.exports = passport;
```

### Auth Routes (`server/src/routes/auth.js`)

```javascript
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const signTokens = (userId) => ({
  accessToken: jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' }),
  refreshToken: jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' }),
});

// ── Email/Password Register ──────────────────────────────
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, displayName: name },
  });

  const { accessToken, refreshToken } = signTokens(user.id);
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });
  res.json({ accessToken, user: { id: user.id, email: user.email, name: user.displayName } });
});

// ── Email/Password Login ─────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const { accessToken, refreshToken } = signTokens(user.id);
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });
  res.json({ accessToken, user: { id: user.id, email: user.email, name: user.displayName } });
});

// ── Google OAuth ─────────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const { accessToken, refreshToken } = signTokens(req.user.id);
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });
    // Redirect to frontend with token in query param (frontend stores it in memory)
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`);
  }
);

// ── Refresh Token ────────────────────────────────────────
router.post('/refresh', (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });
  try {
    const { userId } = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

module.exports = router;
```

### Frontend: Handling the Google Callback (`client/src/pages/AuthCallback.jsx`)

After Google redirects back, the frontend extracts the token from the URL:

```javascript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setAccessToken(token);       // store in memory via context
      navigate('/dashboard');      // redirect to app
    } else {
      navigate('/login');          // something went wrong
    }
  }, []);

  return <p>Signing you in...</p>;
}
```

Add the route in `App.jsx`:
```jsx
<Route path="/auth/callback" element={<AuthCallback />} />
```

### Frontend: Login Page with Both Options

The login page offers both methods side by side:

```
┌───────────────────────────────────┐
│         Sign in to DSA Tracker    │
│                                   │
│  [G]  Continue with Google        │  ← links to /api/auth/google
│                                   │
│  ─────────── or ───────────       │
│                                   │
│  Email: [___________________]     │
│  Password: [________________]     │
│                                   │
│  [        Sign In        ]        │
│                                   │
│  Don't have an account? Register  │
└───────────────────────────────────┘
```

### Token Storage Security Summary

| What          | Where stored          | Why                                   |
| ------------- | --------------------- | ------------------------------------- |
| Access token  | React state (memory)  | Gone on refresh — safe from XSS       |
| Refresh token | HttpOnly cookie       | JS can't read it — safe from XSS      |
| Google secret | Server `.env` only    | Never sent to frontend                |

### Middleware

- `authMiddleware` — verifies JWT, attaches `req.user`
- Applied to all `/api/user/*`, `/api/reviews/*`, `/api/stats/*` routes

```javascript
// server/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided', code: 'NO_TOKEN' });

  try {
    const { userId } = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    req.user = await prisma.user.findUnique({ where: { id: userId } });
    if (!req.user) return res.status(401).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token', code: 'INVALID_TOKEN' });
  }
};
```

---

## Frontend Architecture

### AuthContext (`client/src/context/AuthContext.jsx`)

Centralizes auth state. Every page and component uses this via the `useAuth()` hook.

```jsx
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);  // { id, email, name, avatarUrl }
  const [accessToken, setAccessToken] = useState(null);  // JWT string, stored in memory only
  const [isLoading, setIsLoading]     = useState(true);  // true during initial auth check
  const accessTokenRef                = useRef(null);     // ref for use inside Axios interceptor

  // Keep ref in sync with state (interceptor reads from ref to avoid stale closures)
  useEffect(() => { accessTokenRef.current = accessToken; }, [accessToken]);

  // On app load: try to restore session using the HttpOnly refresh token cookie
  useEffect(() => {
    async function restoreSession() {
      try {
        const { data } = await api.post('/auth/refresh'); // cookie sent automatically
        setAccessToken(data.accessToken);
        const me = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        });
        setUser(me.data.user);
      } catch {
        // No valid session — user must log in
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = (token, userData) => {
    setAccessToken(token);
    setUser(userData);
  };

  const logout = async () => {
    await api.post('/auth/logout').catch(() => {}); // clears the cookie server-side
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, accessToken, accessTokenRef, isLoading,
      isAuthenticated: !!accessToken,
      login, logout, setAccessToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**What the context exposes:**

| Property / Method | Type | Description |
|---|---|---|
| `user` | `object\|null` | `{ id, email, name, avatarUrl }` |
| `accessToken` | `string\|null` | JWT, in memory only |
| `isAuthenticated` | `boolean` | `true` if accessToken is set |
| `isLoading` | `boolean` | `true` during initial session restore |
| `login(token, user)` | function | Called after email login or Google callback |
| `logout()` | function | Clears state + calls server to clear cookie |
| `setAccessToken(token)` | function | Used by AuthCallback after Google redirect |

---

### Axios Instance & Interceptors (`client/src/services/api.js`)

All API calls go through this single Axios instance. It automatically:
1. Prepends the base URL
2. Attaches the Bearer token to every request
3. On 401: silently calls `/auth/refresh`, updates the token, and retries the failed request
4. If refresh also fails: logs the user out and redirects to `/login`

```javascript
import axios from 'axios';

let accessTokenRef = { current: null }; // injected by AuthProvider after mount
let isRefreshing   = false;
let failedQueue    = [];  // requests queued while refresh is in flight

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  failedQueue = [];
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // send HttpOnly cookie on every request
});

// ── Request interceptor: attach Bearer token ──────────────
api.interceptors.request.use((config) => {
  const token = accessTokenRef.current;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: handle 401 with silent refresh ──
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    if (isRefreshing) {
      // Queue this request until refresh completes
      return new Promise((resolve, reject) =>
        failedQueue.push({ resolve, reject })
      ).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    isRefreshing = true;
    try {
      const { data } = await api.post('/auth/refresh');
      accessTokenRef.current = data.accessToken;
      processQueue(null, data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      accessTokenRef.current = null;
      window.location.href = '/login'; // hard redirect on full auth failure
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Called once by AuthProvider to inject the token ref
export const injectTokenRef = (ref) => { accessTokenRef = ref; };

export default api;
```

In `AuthContext.jsx`, inject the ref after mounting:
```javascript
import { injectTokenRef } from '../services/api';
// inside AuthProvider, after the ref is created:
useEffect(() => { injectTokenRef(accessTokenRef); }, []);
```

---

### Protected Route (`client/src/components/layout/ProtectedRoute.jsx`)

Wraps all auth-required routes. Redirects to `/login` if not authenticated, shows a spinner during the initial session restore.

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-gray-400">Loading...</span>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
```

Used in `App.jsx`:
```jsx
import ProtectedRoute from './components/layout/ProtectedRoute';

<Routes>
  <Route path="/"             element={<Landing />} />
  <Route path="/login"        element={<Login />} />
  <Route path="/register"     element={<Register />} />
  <Route path="/auth/callback" element={<AuthCallback />} />

  <Route path="/dashboard" element={
    <ProtectedRoute><Dashboard /></ProtectedRoute>
  } />
  <Route path="/problems" element={
    <ProtectedRoute><Problems /></ProtectedRoute>
  } />
  <Route path="/problems/:id" element={
    <ProtectedRoute><ProblemDetail /></ProtectedRoute>
  } />
  <Route path="/stats" element={
    <ProtectedRoute><Stats /></ProtectedRoute>
  } />
  <Route path="/settings" element={
    <ProtectedRoute><Settings /></ProtectedRoute>
  } />
</Routes>
```

---

## Backend Bootstrap

### Express Entry Point (`server/src/index.js`)

Wires together all middleware, routes, and the error handler.

```javascript
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const cookieParser = require('cookie-parser');
const passport   = require('./config/passport');

const authRoutes         = require('./routes/auth');
const problemRoutes      = require('./routes/problems');
const userProblemRoutes  = require('./routes/userProblems');
const reviewRoutes       = require('./routes/reviews');
const statsRoutes        = require('./routes/stats');
const authMiddleware     = require('./middleware/auth');
const errorHandler       = require('./middleware/errorHandler');

const app = express();

// ── CORS ─────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,          // required for cookies to be sent cross-origin
}));

// ── Body parsing & cookies ────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ── Passport (no sessions — we use JWT) ───────────────────
app.use(passport.initialize());

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/user',     authMiddleware, userProblemRoutes);
app.use('/api/reviews',  authMiddleware, reviewRoutes);
app.use('/api/stats',    authMiddleware, statsRoutes);

// ── 404 catch-all ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', code: 'NOT_FOUND' });
});

// ── Global error handler (must be last) ──────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Error Handler (`server/src/middleware/errorHandler.js`)

```javascript
module.exports = (err, req, res, next) => {
  console.error(err);

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Resource already exists', code: 'CONFLICT' });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Resource not found', code: 'NOT_FOUND' });
  }

  res.status(500).json({ error: 'Internal server error', code: 'SERVER_ERROR' });
};
```

### Input Validation with Zod

Add to server packages:
```bash
npm install zod
```

Define schemas in a `server/src/schemas/` folder and use them in routes:

```javascript
// server/src/schemas/auth.js
const { z } = require('zod');

const registerSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name:     z.string().min(1, 'Name is required').max(100),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

module.exports = { registerSchema, loginSchema };
```

Use in route handlers — call `.parse()` which throws a `ZodError` on failure (caught by `errorHandler`):

```javascript
// In auth.js route
const { registerSchema } = require('../schemas/auth');

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    // ... rest of handler
  } catch (err) {
    next(err); // passes ZodError to errorHandler
  }
});
```

Add schemas folder to project structure:
```
server/src/schemas/
  ├── auth.js          # register, login schemas
  ├── review.js        # rating submission schema
  └── problem.js       # custom problem creation schema
```

---

## Project Structure

```
dsa-tracker/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Layout.jsx
│   │   │   │   └── ProtectedRoute.jsx  # Redirects to /login if not authed
│   │   │   ├── dashboard/
│   │   │   │   ├── SummaryCards.jsx
│   │   │   │   ├── OverdueList.jsx
│   │   │   │   ├── DueTodayList.jsx
│   │   │   │   └── UpcomingPreview.jsx
│   │   │   ├── problems/
│   │   │   │   ├── ProblemTable.jsx
│   │   │   │   ├── ProblemRow.jsx
│   │   │   │   ├── ProblemFilters.jsx
│   │   │   │   └── AddProblemModal.jsx
│   │   │   ├── review/
│   │   │   │   ├── ReviewModal.jsx
│   │   │   │   └── RatingButtons.jsx
│   │   │   ├── stats/
│   │   │   │   ├── OverviewCards.jsx
│   │   │   │   ├── ReviewChart.jsx
│   │   │   │   ├── CategoryBreakdown.jsx
│   │   │   │   └── HeatmapCalendar.jsx
│   │   │   └── ui/
│   │   │       ├── Badge.jsx
│   │   │       ├── Button.jsx
│   │   │       ├── Card.jsx
│   │   │       ├── Modal.jsx
│   │   │       └── Input.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useProblems.js
│   │   │   ├── useReviews.js
│   │   │   └── useStats.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx           # Email form + Google button
│   │   │   ├── Register.jsx        # Email form + Google button
│   │   │   ├── AuthCallback.jsx    # Handles Google redirect, extracts token
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Problems.jsx
│   │   │   ├── ProblemDetail.jsx
│   │   │   ├── Stats.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/
│   │   │   └── api.js          # Axios instance + interceptors
│   │   ├── utils/
│   │   │   └── formatDate.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css           # Tailwind directives
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Express backend
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (all 4 models)
│   │   ├── migrations/         # Auto-generated by `prisma migrate dev`
│   │   └── seed.js             # Seeds ~150 problems on first run
│   ├── src/
│   │   ├── config/
│   │   │   └── passport.js         # Google OAuth strategy setup
│   │   ├── schemas/
│   │   │   ├── auth.js             # Zod schemas for register/login
│   │   │   ├── review.js           # Zod schema for rating submission
│   │   │   └── problem.js          # Zod schema for custom problem creation
│   │   ├── routes/
│   │   │   ├── auth.js             # register, login, Google OAuth, refresh
│   │   │   ├── problems.js
│   │   │   ├── userProblems.js
│   │   │   ├── reviews.js
│   │   │   └── stats.js
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT verification middleware
│   │   │   └── errorHandler.js
│   │   ├── services/
│   │   │   ├── reviewScheduler.js  # Spaced repetition logic
│   │   │   └── statsService.js
│   │   ├── utils/
│   │   │   └── constants.js    # Intervals, multipliers
│   │   └── index.js            # Express app entry point
│   ├── .env                        # JWT secrets, Google credentials, DB URL
│   ├── .env.example                # Committed template (no real secrets)
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Development Phases

### Phase 1 — Foundation (Days 1–3)

- [ ] Initialize Vite + React frontend with Tailwind CSS
- [ ] Initialize Express backend with `index.js` (CORS, cookie-parser, passport, route wiring)
- [ ] Write `server/prisma/schema.prisma` with all 4 models
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Write and run `prisma/seed.js` to populate the `problems` table
- [ ] Add Zod schemas in `server/src/schemas/`
- [ ] Implement email/password auth routes with Zod validation
- [ ] Configure Passport.js with Google OAuth strategy
- [ ] Create Google OAuth app in Google Cloud Console, copy credentials to `.env`
- [ ] Implement Google OAuth routes (`/api/auth/google`, `/api/auth/google/callback`)
- [ ] Add `POST /api/auth/logout` route (clears refresh token cookie)
- [ ] Wire up global `errorHandler` middleware
- [ ] Set up `AuthContext` with session restore on app load
- [ ] Wire Axios instance (`api.js`) with token interceptor and silent refresh
- [ ] Build `ProtectedRoute.jsx` component
- [ ] Build login/register pages with both email form and "Sign in with Google" button
- [ ] Build `AuthCallback.jsx` page to handle Google redirect
- [ ] Wire all routes in `App.jsx` with `ProtectedRoute` wrapping auth-required pages

### Phase 2 — Core Problem Tracking (Days 4–6)

- [ ] Build problem library page (table, filters, search, pagination)
- [ ] Build "mark as completed" flow
- [ ] Implement `user_problems` CRUD endpoints
- [ ] Build problem detail page with notes
- [ ] Visual status indicators (green/purple/red)

### Phase 3 — Spaced Repetition Engine (Days 7–9)

- [ ] Implement `reviewScheduler.js` with the interval + difficulty logic
- [ ] Build `/api/reviews/due` endpoint (due + overdue query)
- [ ] Build the revision dashboard page (summary cards, overdue list, due list)
- [ ] Build the review modal (open LeetCode, rate difficulty)
- [ ] Implement skip functionality
- [ ] Implement reset functionality
- [ ] Write unit tests for the scheduling algorithm

### Phase 4 — Stats & Polish (Days 10–12)

- [ ] Build stats overview endpoint
- [ ] Build review history chart (line/bar chart with Recharts or Chart.js)
- [ ] Build category breakdown
- [ ] Build heatmap calendar
- [ ] Build current streak calculation
- [ ] Responsive design pass (mobile-friendly)
- [ ] Loading states, error boundaries, empty states

### Phase 5 — Deploy & Extras (Days 13–14)

- [ ] Set up production Postgres (Railway / Supabase)
- [ ] Deploy backend (Railway / Render)
- [ ] Deploy frontend (Vercel)
- [ ] Environment variables + secrets management
- [ ] Add rate limiting on auth routes
- [ ] Optional: email reminders (daily digest of due problems)
- [ ] Optional: import from LeetCode (if feasible via scraping/API)

---

## Key Decisions & Notes

1. **PostgreSQL over MongoDB** — The data is relational. "Get all problems due today for user X joined with problem details" is a natural SQL query. MongoDB would require denormalization or aggregation pipelines.

2. **Prisma over raw SQL** — Type safety, auto-generated client, easy migrations. Could swap for Drizzle if bundle size matters.

3. **JWT over sessions** — Simpler for a SPA. Refresh token in HttpOnly cookie mitigates most security concerns.

4a. **Google OAuth via Passport.js** — Passport is the standard Node.js auth middleware. The `passport-google-oauth20` strategy handles the OAuth handshake. After Google returns the user profile, we issue our own JWT so the rest of the app is auth-provider-agnostic.

4b. **Account linking** — If a user registers with email first, then later clicks "Sign in with Google" using the same email, the system links the `google_id` to their existing account rather than creating a duplicate. Both login methods then work for that account.

5. **Input validation with Zod** — Zod schemas are defined once in `server/src/schemas/` and used in route handlers. Invalid input throws a `ZodError` which the global error handler catches and returns as a consistent `400` response. Never trust `req.body` without parsing it first.

6. **CORS must set `credentials: true`** — The refresh token is in an HttpOnly cookie. Browsers will only send cookies cross-origin if both the server (`credentials: true` in CORS config) and the client (`withCredentials: true` in Axios) opt in. Missing either one breaks the entire silent refresh flow.

7. **Connection pooling** — `?connection_limit=5` in `DATABASE_URL` prevents Prisma from exhausting free-tier Postgres connection limits. Increase for paid plans.

8. **No real-time features needed** — The app is request/response. No WebSockets required.

5. **Seed data** — The `problems` table should be pre-seeded with popular problem sets so users don't have to manually add every problem. Source: curated lists (Blind 75, NeetCode 150, Grind 75).

6. **Overdue handling** — Overdue problems don't compound penalties. If you're 5 days late, you just review and continue the schedule from today. This prevents discouragement.

7. **Chart library** — Recharts (React-native charting) for the stats page. Lightweight and composable.

8. **Future considerations:**
   - Social features (compare progress with friends)
   - LeetCode integration (auto-detect solved problems)
   - Mobile app (React Native, sharing the same API)
   - Problem difficulty auto-adjustment based on community data
