# QuizSpark Technical Documentation

This document covers the complete technical architecture and internal workflows of the QuizSpark application.

## System Architecture

QuizSpark follows a decoupled Client-Server architecture utilizing a real-time event-driven layer.

```text
       Browser (React / TanStack)
                 │
   ┌─────────────┴─────────────┐
   │ HTTP (REST)               │ WebSocket (Socket.io)
   ▼                           ▼
 Express.js API           Socket Handlers
   │                           │
   └─────────────┬─────────────┘
                 │
           Prisma ORM
                 │
            PostgreSQL
```

## Frontend Architecture

The frontend is built with React 19, Vite, and TanStack Start for file-based routing.

### Key Directories

- **`src/routes/`**: File-based routing definitions. Maps URLs to React components.
  - `__root.tsx`: The root layout provider.
  - `index.tsx`: Landing page.
  - `(auth)/`: Authentication routes (login, register).
  - `(teacher)/`: Protected routes for quiz management.
  - `play/`: Dynamic routes (`/play/$sessionId`) for live game participation.
- **`src/components/`**: Reusable UI primitives built with Radix UI and Tailwind CSS.
- **`src/hooks/`**: Custom logic, notably `useSocket.ts` which manages the lifecycle of the Socket.io client connection.
- **`src/lib/`**: Utilities, including `api-client.ts` which handles normalized HTTP requests and credential inclusion.

## Backend Architecture

The backend is an Express server running in Node.js, written in TypeScript.

### Application Routes (Frontend)

The frontend leverages TanStack Router for file-based routing. The routes are logically grouped:

**Public Routes**
- `/` - Landing page. Introduces the application.
- `/join` - Student entry point. Allows joining a live session via a 6-digit PIN.

**Authentication Routes**
- `/auth` - Login and registration for teachers.
- `/forgot-password` - Request a password reset link.
- `/reset-password` - Set a new password (requires token).
- `/verify-email` - Verify a new email address.

**Teacher/Host Routes (Authenticated)**
- `/dashboard` - Overview of the teacher's created quizzes and recent sessions.
- `/quizzes/$quizId` - Quiz editor. Create, edit, and manage questions/answers.
- `/host/$sessionId` - Live game host view. Controls the progression of the live game.
- `/results/$sessionId` - Post-game results and detailed analytics for the teacher.

**Player Routes (Game-Scoped)**
- `/play/$sessionId` - Live student view. Renders the interactive answer buttons synced with the host's current question.

**Spectator/Projector Routes**
- `/projector/$sessionId` - Read-only big-screen view for classrooms. Displays the PIN, current question, and live leaderboards without showing the host controls.

**Legal Routes**
- `/terms` - Terms of Service.
- `/privacy` - Privacy Policy.

### Application Routes (REST API)

| Route Prefix    | Purpose                                                        | Authentication           |
| --------------- | -------------------------------------------------------------- | ------------------------ |
| `/api/auth`     | User registration, login, token refresh, and profile fetching. | Mixed (Public/Protected) |
| `/api/quizzes`  | CRUD operations for Quizzes and nested Questions/Answers.      | Protected (Teacher)      |
| `/api/sessions` | Creating live game sessions and fetching session states.       | Protected (Host)         |
| `/api/players`  | Joining sessions, renaming, and submitting answers.            | Public / Game-Scoped     |

### Real-Time Architecture (Socket.io)

WebSocket connections handle the live, stateful gameplay.
Handlers are located in `backend/src/socket/handlers.ts`.

- **`join_session`**: Validates a player's token and assigns them to the `session:UUID` room.
- **`join_host`**: Extracts the teacher's JWT HttpOnly cookie or header, verifies ownership of the session, and assigns them to the `session:UUID:host` room.
- **`join_spectator`**: Assigns projector views to a read-only event stream.
- **Disconnections**: Tracks when users drop off to notify the lobby, without instantly deleting their session data.

_Note: Answer submissions (`/api/players/answer`) are handled via REST POST requests to easily enforce distributed rate limits, and the server subsequently broadcasts the updated state via Socket.io._

## Database Schema (Prisma)

The database utilizes PostgreSQL, managed via Prisma.

### Core Models

- **`Profile`**: Teacher accounts (UUID, email, hashed password).
- **`Quiz`**: A collection of questions. Relates to a `Profile` (owner).
- **`Question`**: Contains the prompt, time limit, and points. Belongs to a `Quiz`.
- **`Answer`**: Represents the multiple-choice options. Boolean `isCorrect` indicates the right choice.
- **`GameSession`**: A live instance of a quiz. Holds the `status` (lobby, active, finished), the `currentQuestionIndex`, and the 6-digit `pin`.
- **`Player`**: A student who joined a `GameSession`.
- **`PlayerAnswer`**: A record of a player's choice for a specific question, including points earned based on speed.

### Migrations Workflow

Migrations are stored in `backend/prisma/migrations/`.

- **Development**: Run `npx prisma db push` or `npx prisma migrate dev`.
- **Production**: Run `npx prisma migrate deploy` during the build/release phase.

## Environment Variables

### Frontend (`.env`)

- `VITE_API_URL`: The URL of the backend API (e.g., `http://localhost:5000/api`). _Note: In development, Vite's proxy handles this seamlessly._

### Backend (`backend/.env`)

| Variable                       | Required   | Purpose                                                                         |
| ------------------------------ | ---------- | ------------------------------------------------------------------------------- |
| `DATABASE_URL`                 | Yes        | PostgreSQL connection string.                                                   |
| `JWT_SECRET`                   | Yes        | Cryptographic secret for signing HttpOnly cookies.                              |
| `FRONTEND_URL`                 | Yes (Prod) | Used to configure strict CORS enforcement.                                      |
| `REDIS_URL`                    | Optional   | Used for distributed rate limiting in production. Falls back to memory locally. |
| `SMTP_EMAIL` / `SMTP_PASSWORD` | Optional   | NodeMailer configuration. If omitted, emails print to the console.              |

## Known Limitations & Not-Implemented Features

To ensure developers understand the current boundaries of the repository:

- **File Uploads**: Not implemented. (Images for questions are not currently supported).
- **OAuth**: Google/GitHub login are not currently implemented.
- **Webhooks**: Not implemented (No external integrations requiring webhooks).
- **Automated Security Monitoring**: No external SIEM/DataDog integrations are pre-configured. Logs are output to `stdout/stderr`.
- **Admin Panel**: Not implemented. (All authenticated users are "Teachers" managing their own quizzes).
