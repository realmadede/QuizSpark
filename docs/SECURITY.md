# QuizSpark Security Architecture

This document outlines the security controls, policies, and mechanisms currently implemented in the `main` branch of the QuizSpark repository.

## Implemented Security Controls

### 1. Authentication

- **Status:** Implemented
- **Details:** Uses JSON Web Tokens (JWT) stored securely in `HttpOnly`, `SameSite=Lax` cookies. The frontend cannot access the token via JavaScript, mitigating Cross-Site Scripting (XSS) token theft.
- **Passwords:** Hashed securely using `bcryptjs` with a cost factor of 10. Plaintext passwords never touch logs or databases.
- **Session Invalidations:** The database tracks a `tokenVersion` for each user. Changing passwords or emails increments this version, instantly invalidating all previously issued JWTs.

### 2. Authorization (Data Isolation)

- **Status:** Implemented
- **Details:** Strict ownership checks are enforced in the REST API.
- **Example:** A teacher cannot update, delete, or fetch a `Quiz`, `Question`, or `Answer` belonging to a different teacher. The server validates `req.user.userId === quiz.ownerId` before processing mutations.
- **Data Leaks:** Live game state dynamically strips `isCorrect: true` from payloads sent to students until the question timer expires, preventing network-inspection cheating.

### 3. Rate Limiting & Abuse Protection

- **Status:** Implemented
- **Details:** Global rate limiting is implemented utilizing `express-rate-limit`.
- **Infrastructure:** In production, it connects to Redis (`ioredis`) for distributed cross-pod enforcement. In local development, it gracefully falls back to an in-memory `Map()`.
- **Policies:**
  - Login/Registration: 10 requests / 15 minutes
  - Emails/Tokens: 5 requests / 1 hour
  - Generic APIs: 200 requests / 15 minutes per authenticated user
  - Game Actions (Answers): 20 requests / 10 seconds
  - Socket.io connections: 20 joins / 1 minute (custom Lua-scripted Quota manager)

### 4. Quota Enforcement (Paid APIs)

- **Status:** Implemented
- **Details:** NodeMailer SMTP usage is strictly capped to 400 emails globally per 24 hours to prevent account suspension/cost exhaustion. Enforced atomically via Redis.

### 5. Security Headers

- **Status:** Implemented
- **Details:** The backend utilizes `helmet` to enforce strict production headers.
  - **HSTS**: Enforced (`max-age=31536000; includeSubDomains`).
  - **Content-Security-Policy (CSP)**: Highly restrictive. `frame-ancestors 'none'`, explicit `connect-src` limited to the Frontend URL. `unsafe-inline` is permitted strictly for styles (required by Tailwind/React), but scripts are heavily locked down.
  - **Clickjacking**: Prevented via `X-Frame-Options: DENY`.
  - **MIME-Sniffing**: Prevented via `X-Content-Type-Options: nosniff`.

### 6. CORS (Cross-Origin Resource Sharing)

- **Status:** Implemented
- **Details:** Dynamic environment-based CORS.
  - **Development**: Allows `localhost` and `127.0.0.1`.
  - **Production**: Validates strictly against `process.env.FRONTEND_URL`. Strips trailing slashes to prevent bypasses. Rejects all other origins.

### 7. Input Validation & Mass-Assignment

- **Status:** Implemented
- **Details:** All incoming REST payloads and Socket.io events are parsed strictly through `Zod` schemas. Extraneous fields are stripped/ignored, preventing mass-assignment attacks on the Prisma ORM.

### 8. Logging & Security Events

- **Status:** Implemented
- **Details:** Console warnings log critical security boundaries without leaking secrets:
  - `[SECURITY - FAILED LOGIN]` tracks IPs and failed identifiers.
  - `[SECURITY - 403 UNAUTHORIZED]` tracks IDOR attempt IPs.
  - `RATE LIMIT EXCEEDED` tracks abusive IPs.
  - Error 500s mask stack traces from users but log internally.

## Not Implemented / Out of Scope

The following controls are not currently implemented as they fall outside the current feature scope of the repository:

- **File Upload Security:** (No uploads supported).
- **OAuth Integration Security:** (Only email/password supported).
- **Webhook Verification:** (No external webhooks consumed).
- **Automated SIEM Monitoring:** (Logs are standard stdout).

## Security Audit History

During the development of QuizSpark, several comprehensive security audits were performed, and the following specific hardening measures were implemented in the current codebase:

- **Authentication Hardening**: JWTs were migrated from `localStorage` to HttpOnly cookies. Password reset tokens are now securely hashed (`crypto.createHash`) before storage to prevent leakage via database compromises.
- **Authorization & IDOR Protection**: The API was patched to strictly enforce tenant boundaries. For example, `PATCH /api/quizzes/:quizId` now rigorously checks ownership, preventing Insecure Direct Object References (IDOR).
- **Data Leak Prevention**: Session and player endpoints (`GET /api/sessions/:sessionId` and `GET /api/players/state`) were modified to dynamically strip `isCorrect` from questions until the host ends the question. This prevents students from cheating by inspecting network traffic.
- **Input Validation**: All Express routes and Socket.io events were wrapped with strictly-typed `Zod` schemas, preventing mass assignment and invalid payload injections.
- **Rate Limiting**: Distributed rate limiting was implemented across the board (via Redis) to prevent brute force, DoS, and abusive scraping. A dedicated Lua quota script protects paid API limits (SMTP).
- **Deployment Hardening**: Strict CORS, CSP, HSTS, and Frameguard policies were applied to production environments without crippling the `localhost` development workflow.
- **Dependency Updates**: The backend and frontend dependencies (`jsonwebtoken`, `express`, etc.) were audited and upgraded to resolve known vulnerabilities.
