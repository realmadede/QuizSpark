# QuizSpark

QuizSpark is an interactive, real-time multiplayer classroom quiz application. Designed to let instructors create quizzes, host live games, and allow students to join instantly via a Game PIN—delivering a seamless, synchronized educational experience.

## The QuizSpark Story

QuizSpark was developed as part of a hands-on practical software development training initiative at **SAFCO FinTech**. Emerging from an educational technology learning environment, it focuses on real-time WebSocket communication, modern React architecture, and secure backend principles to solve the practical use case of live classroom assessment.

_Note: QuizSpark is an independent, open-source educational project and is not an official SAFCO commercial product, nor is it affiliated with Kahoot!._

## Features

**For Teachers (Hosts)**

- **Secure Accounts**: Registration, login, password reset, and email verification.
- **Quiz Management**: Create, edit, and store drafts of custom quizzes.
- **Question Controls**: Configurable timers and dynamic point values per question.
- **Live Game Hosting**: Generate unique Game PINs and manage the lobby.
- **Real-time Results**: Live leaderboards and session analytics.

**For Students (Players)**

- **Instant Join**: No account required—just a Game PIN and a nickname.
- **Real-Time Gameplay**: Questions appear synchronized with the host.
- **Interactive Answers**: Fast, engaging answer submission.
- **Live Scoring**: See points and leaderboard standing instantly.

## Technology Stack

**Frontend**

- **React 19** + **Vite**
- **TanStack Start & TanStack Router** (Full-stack SSR routing)
- **TanStack Query** (Data fetching & state management)
- **Tailwind CSS** + **Radix UI** (Accessible, beautiful components)
- **Socket.io Client** (Real-time events)
- **Zod** (Schema validation)

**Backend**

- **Node.js** + **Express** (TypeScript)
- **PostgreSQL** + **Prisma ORM**
- **Socket.io** (Real-time WebSocket server)
- **JWT** (HttpOnly Cookie-based authentication)
- **bcryptjs** (Password hashing)
- **ioredis** (Distributed rate limiting)

## Repository Structure

```text
QuizSpark/
├── backend/                  # Node.js / Express backend
│   ├── prisma/               # Database schema and migrations
│   ├── src/                  # Backend source code
│   │   ├── middleware/       # Auth and Rate Limit middleware
│   │   ├── routes/           # Express API endpoints
│   │   ├── socket/           # Socket.io event handlers
│   │   └── utils/            # JWT, mailer, and quotas
│   └── tests/                # Native Node.js test suite
├── src/                      # React Frontend (TanStack Start)
│   ├── components/           # Reusable UI components (Radix/Tailwind)
│   ├── hooks/                # Custom React hooks (e.g. useSocket)
│   ├── lib/                  # Utilities and API client
│   └── routes/               # TanStack file-based routing
├── docs/                     # Detailed technical & security documentation
├── production.md             # Production deployment guide
├── vite.config.ts            # Vite bundler configuration
└── package.json              # Workspace/Frontend dependencies
```

## Local Development

QuizSpark is optimized for a seamless `localhost` developer experience.

### Prerequisites

- Node.js (v18+)
- PostgreSQL (Running locally or via Docker)

### 1. Database Setup

```bash
cd backend
cp .env.example .env
# Edit .env to set your DATABASE_URL (e.g., postgresql://user:pass@localhost:5432/quizspark)
npm install
npm run prisma:generate
npm run prisma:migrate
```

### 2. Start the Backend

```bash
# Still in the backend/ directory
npm run dev
# The backend will start on http://localhost:5000
```

### 3. Start the Frontend

```bash
# Open a new terminal in the repository root
npm install
npm run dev
# The frontend will start on http://localhost:3000
# API requests are automatically proxied to port 5000
```

## Documentation Matrix

| Concern               | Status                    | Where documented                                            |
| --------------------- | ------------------------- | ----------------------------------------------------------- |
| Local development     | Implemented & Documented  | [README.md](./README.md)                                    |
| Production deployment | Documented                | [production.md](./production.md)                            |
| Database              | Implemented               | [PROJECT_DOCUMENTATION.md](./docs/PROJECT_DOCUMENTATION.md) |
| Authentication        | Implemented & Verified    | [SECURITY.md](./docs/SECURITY.md)                           |
| Authorization         | Implemented & Verified    | [SECURITY.md](./docs/SECURITY.md)                           |
| Rate limiting         | Implemented (Redis + Mem) | [SECURITY.md](./docs/SECURITY.md)                           |
| Security headers      | Implemented (Helmet)      | [SECURITY.md](./docs/SECURITY.md)                           |
| CORS                  | Configured                | [SECURITY.md](./docs/SECURITY.md)                           |
| Real-time / Socket.io | Implemented               | [PROJECT_DOCUMENTATION.md](./docs/PROJECT_DOCUMENTATION.md) |
| Open source           | Public Repository         | [README.md](./README.md)                                    |

## Open Source & Contributing

QuizSpark is an open-source educational project. We welcome developers to clone, explore, and run the project locally.

**Workflow:**

- `npm run lint` - Run ESLint on the frontend
- `npm run format` - Format code with Prettier
- `cd backend && npm run lint` - Lint backend code
- `cd backend && npx tsx tests/authz.test.ts` - Run security/authorization tests
- `cd backend && npx tsx tests/rate-limit.test.ts` - Run rate-limit regression tests

