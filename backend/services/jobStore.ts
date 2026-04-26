import { prisma } from "../libs/prisma.js";
import { logger } from "../libs/logger.js";
import type { ScrapedJob } from "../types/job.types.js";

export async function storeScrapedJobs(jobs: ScrapedJob[]): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  for (const job of jobs) {
    try {
      await prisma.job.upsert({
        where: { sourceUrl: job.sourceUrl },
        create: {
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary ?? null,
          jobType: job.jobType ?? null,
          description: job.description,
          skills: job.skills,
          sourceUrl: job.sourceUrl,
          expiresAt,
        },
        update: {
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary ?? null,
          jobType: job.jobType ?? null,
          description: job.description,
          skills: job.skills,
          expiresAt,
        },
      });
    } catch (error) {
      logger.error(
        { error, sourceUrl: job.sourceUrl },
        "Failed to upsert scraped job",
      );
    }
  }
}

export async function deleteExpiredJobs(): Promise<void> {
  const result = await prisma.job.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  logger.info({ deletedCount: result.count }, "Expired jobs cleanup completed");
}
