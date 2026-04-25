import { prisma } from "./libs/prisma.js";
async function main() {
  const jobs = await prisma.job.findMany();
  console.log("Total jobs:", jobs.length);
  if (jobs.length > 0) {
    console.log("First job expiresAt:", jobs[0].expiresAt);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
