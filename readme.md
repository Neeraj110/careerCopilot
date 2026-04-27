# JobFinder

JobFinder is a full-stack AI-assisted job matching platform.

It lets a user upload a resume, extracts resume intelligence, scrapes relevant jobs, and ranks jobs by resume fit.

## What This Code Actually Does

### 1) User uploads resume (PDF)

- Endpoint: backend `POST /api/resume/upload`
- The server extracts raw text from the PDF.
- Resume metadata and raw text are saved in the database.
- Optional form field: `preferredLocation` (for nearby-country job targeting).

### 2) CV pipeline runs automatically

File: `backend/agent/cvPipeline.ts`

Pipeline stages:

1. `skillExtractorNode`
   - Uses LLM to extract skills from resume text.
   - Stores skills into the `resume` record.
2. `vectorUpsertNode`
   - Embeds resume text and upserts to Pinecone.
   - Saves vector id in DB for semantic matching.
3. `jobScraperNode`
   - Evaluates resume text to determine best seniority + role query.
   - Targets levels such as: internship, fresher, junior, mid-level, senior, lead, staff.
   - Reads user `preferredLocation` (if provided on upload).
   - Always fetches remote jobs in addition to location-based jobs.
   - Starts background scraping using that query and stores results.
   - If LLM parsing fails, uses heuristic fallback from resume text + extracted skills.

### 3) Tech job scraping and storage

File: `backend/services/scraper.ts`

- Uses Puppeteer + stealth plugin to scrape Indeed.
- Keeps scraping focused on tech roles.
- Searches multiple location buckets: preferred location + Remote + India fallback.
- If no query is provided, uses seniority-aware defaults.
- Cleans and normalizes job fields (title, company, location, description).
- Extracts skill tags from description.
- Saves jobs to DB via `storeScrapedJobs`.

### 4) Matching and API responses

- `GET /api/jobs/matches` returns matched jobs for logged-in user.
- Matching uses resume-derived data and job content.
- Frontend pages consume these APIs with loading/skeleton states.

## What Was Improved

### CV-driven smart scraping

- Resume is now used to infer best job type and level before scraping.
- Scraping is no longer purely generic; it is user-profile aware.

### Better reliability

- Added fallback query generation when LLM output is invalid.
- Normalized/sanitized generated search query.
- Ensured seniority is present in the final search query.

### Better scraping defaults

- Scraper defaults include internship/fresher/junior/senior coverage.
- Still constrained to tech roles to reduce irrelevant jobs.

## High-Level Structure

- `backend/` Express API, Prisma, CV/job AI pipelines, scraping.
- `frontend/` Next.js App Router UI with dashboard, jobs, resume analysis, and chat.

## Run (Typical Local)

Backend:

- `cd backend`
- `npm install`
- `npm run dev`

Frontend:

- `cd frontend`
- `npm install`
- `npm run dev`

## Notes

- Scraping depends on external site structure and may need selector updates.
- Pinecone and LLM providers require valid environment variables.
- Resume upload triggers asynchronous enrichment; matching quality improves as pipeline completes.
