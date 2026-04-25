-- Allow multiple resumes per user and track active resume
ALTER TABLE "Resume"
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Drop previous one-resume-per-user unique constraint/index
DROP INDEX IF EXISTS "Resume_userId_key";

-- Helpful query indexes
CREATE INDEX IF NOT EXISTS "Resume_userId_idx" ON "Resume"("userId");
CREATE INDEX IF NOT EXISTS "Resume_userId_isActive_idx" ON "Resume"("userId", "isActive");

-- Ensure existing rows are active by default
UPDATE "Resume"
SET "isActive" = true
WHERE "isActive" IS DISTINCT FROM true;
