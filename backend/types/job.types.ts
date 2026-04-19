import type { Job } from "../generated/prisma/client.js";

export type CoverLetterInput = {
  jobId: string;
};

export type CoverLetterResponse = {
  coverLetter: string;
};

export type ScrapedJob = {
  title: string;
  company: string;
  location: string;
  description: string;
  skills: string[];
  sourceUrl: string;
};

export type MatchedJob = {
  job: Job;
  matchScore: number;
  matchedSkills: string[];
};
