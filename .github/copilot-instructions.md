# CareerCopilot Repository Instructions

## Repository layout

This is a two-application TypeScript repository:

- `backend/` contains the Express 5 API, Prisma/PostgreSQL persistence, authentication, document processing, and AI workflows.
- `frontend/` contains the Next.js App Router application, React UI, client-side data fetching, and resume/dashboard experiences.

Keep changes scoped to the relevant application, but check both sides of an API change. The frontend and backend are deployed and validated independently in `.github/workflows/ci-cd.yml`.

## Build, validation, and development commands

Run commands from the application directory, not the repository root.

### Backend

```powershell
cd backend
npm install
npm run db:generate
npm run typecheck
npm run build
npm run dev
```

- `npm run db:generate` regenerates the Prisma client and may require a valid `DATABASE_URL`.
- `npm run typecheck` runs `tsc --noEmit`.
- `npm run build` runs Prisma generation followed by the TypeScript compiler and writes to `backend/dist`.
- `npm run db:push` applies the current Prisma schema without creating a migration; use `npm run db:migrate` when a migration is intended.

### Frontend

```powershell
cd frontend
npm install
npm run lint
npm run build
npm run dev
```

- `npm run lint` runs the configured ESLint command.
- `npm run build` performs the production Next.js build and includes Next.js type validation.

There is currently no test script or test runner configured in either `package.json`. Do not invent a single-test command; if tests are added, document the runner-specific file/test-name command alongside the new test setup and update CI as appropriate.

## Architecture and integration points

The browser application uses the Next.js App Router under `frontend/src/app` and shared UI/components under `frontend/src/components`. Client data access is centralized in `frontend/src/lib/api.ts` and feature hooks under `frontend/src/hooks`.

The backend entrypoint is `backend/src/server.ts`, which connects Prisma before listening. `backend/src/app.ts` configures security/parsing middleware, Passport, Swagger, the health endpoint, and feature routers. API routes are grouped by feature under `backend/src/modules`:

- `auth` handles local/JWT and Google OAuth flows.
- `document` handles uploaded documents and their processing.
- `chat` handles document-aware conversations.
- `resume` and `resume-v2` handle resume parsing, versioning, analysis, and dashboard data.
- `roadmap` handles AI-generated learning roadmaps.

Controllers receive HTTP requests, schemas validate input with Zod, and services contain feature logic. Prisma models in `backend/prisma/schema.prisma` persist users, documents/chunks, chats/messages, resume versions/analyses, and roadmaps in PostgreSQL. The `Chunk.embedding` field uses PostgreSQL vector storage for semantic retrieval. AI integrations and agent workflows are kept in the backend feature agents/infrastructure rather than in React components.

## API and client conventions

- Mount new backend routes under `/api/v1` and register them in `backend/src/app.ts`.
- Protect user-specific endpoints with the existing `requireAuth` middleware and use the authenticated user identity rather than trusting a client-supplied user id.
- Add or update the feature Zod schema when changing request or response boundaries.
- Use the shared frontend API wrapper rather than duplicating `fetch` setup. It sends `credentials: "include"` for cookie-based authentication and converts non-2xx responses to `ApiError`.
- For `FormData` uploads, use the upload helper or pass `FormData` to the wrapper. Do not manually set `Content-Type`; the browser must add the multipart boundary.
- Keep backend/frontend API paths and response shapes synchronized, including the distinction between `/api/v1/resume` and `/api/v1/resumes`.
- Preserve the backend error-handler pattern and surface failures through the existing error response flow rather than returning success-shaped fallbacks.

## Runtime and environment

- CI uses Node.js 20; use Node 20 or newer locally.
- Backend development requires PostgreSQL, a valid `DATABASE_URL`, and Prisma client generation before typechecking/building.
- Backend configuration is loaded from `backend/.env`; frontend public configuration uses `frontend/.env` and `NEXT_PUBLIC_API_URL`.
- Authentication and AI/document features may additionally require JWT, Google OAuth, Gemini/Groq/Mistral, Tavily, and Cloudinary variables. Follow the names used in `backend/src/config/index.ts`.
- Never read, print, commit, or expose values from `.env` files. Use placeholders in documentation and tests.
- Keep CORS and cookie behavior aligned with `FRONTEND_URL` and the `credentials: "include"` client convention.
