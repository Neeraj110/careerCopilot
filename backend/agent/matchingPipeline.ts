import { END, START, Annotation, StateGraph } from "@langchain/langgraph";
import { Document } from "@langchain/core/documents";
import { randomUUID } from "node:crypto";
import type { Job } from "../generated/prisma/client.js";
import type { MatchedJob } from "../types/job.types.js";
import {
  createPineconeStore,
} from "../libs/ai.js";
import { prisma } from "../libs/prisma.js";

const MatchingPipelineState = Annotation.Root({
  userId: Annotation<string>(),
  resumeSkills: Annotation<string[]>(),
  resumeText: Annotation<string>(),
  allJobs: Annotation<Job[]>(),
  matchedJobs: Annotation<MatchedJob[]>(),
  totalMatches: Annotation<number>(),
  page: Annotation<number>(),
  limit: Annotation<number>(),
});

export type MatchingAgentState = typeof MatchingPipelineState.State;

async function fetchJobsNode(
  _state: MatchingAgentState,
): Promise<Partial<MatchingAgentState>> {
  const allJobs = await prisma.job.findMany({
    where: {
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  return { allJobs };
}

async function skillMatchNode(
  state: MatchingAgentState,
): Promise<Partial<MatchingAgentState>> {
  const resumeSkillSet = new Set(
    state.resumeSkills.map((skill) => skill.toLowerCase().trim()),
  );

  const matchedJobs = state.allJobs
    .map((job) => {
      const jobSkills = job.skills.map((skill) => skill.toLowerCase().trim());
      const matchedSkills = jobSkills.filter((skill) =>
        resumeSkillSet.has(skill),
      );
      const denominator = Math.max(jobSkills.length, 1);
      const matchScore = (matchedSkills.length / denominator) * 100;

      return {
        job,
        matchedSkills,
        matchScore,
      };
    })
    .filter((item) => item.matchScore >= 30)
    .sort((a, b) => b.matchScore - a.matchScore);

  const totalMatches = matchedJobs.length;

  return { matchedJobs, totalMatches };
}

async function vectorRerankNode(
  state: MatchingAgentState,
): Promise<Partial<MatchingAgentState>> {
  if (state.matchedJobs.length === 0) {
    return { matchedJobs: [] };
  }

  // Paginate BEFORE the expensive vector operations
  const skip = ((state.page || 1) - 1) * (state.limit || 5);
  const topJobs = state.matchedJobs.slice(skip, skip + (state.limit || 5));

  try {
    const namespace = `matching-${state.userId}-${randomUUID()}`;
    const vectorStore = await createPineconeStore({ namespace });

    // FIX: Filter out jobs with empty/null descriptions to prevent
    // "Vector dimension 0" Pinecone error caused by empty-string embeddings
    const jobsWithContent = topJobs.filter(
      (item) => item.job.description && item.job.description.trim().length > 10,
    );

    if (jobsWithContent.length === 0) {
      // No valid descriptions — skip vector rerank, return skill-match order
      return { matchedJobs: topJobs };
    }

    const jobIds = jobsWithContent.map(
      (item, index) => `job-${item.job.id}-${index}`,
    );

    await vectorStore.addDocuments(
      jobsWithContent.map(
        (item) =>
          new Document({
            pageContent: item.job.description,
            metadata: { type: "job", jobId: item.job.id },
          }),
      ),
      { ids: jobIds },
    );

    const scoredResults = await vectorStore.similaritySearchWithScore(
      state.resumeText,
      jobsWithContent.length,
      { type: "job" },
    );

    const similarityByJobId = new Map<string, number>();
    for (const [doc, score] of scoredResults) {
      const jobId =
        typeof doc.metadata?.jobId === "string"
          ? doc.metadata.jobId
          : undefined;
      if (jobId && !similarityByJobId.has(jobId)) {
        similarityByJobId.set(jobId, score);
      }
    }

    const reranked = jobsWithContent.map((item) => {
      const similarity = similarityByJobId.get(item.job.id) ?? 0;
      const adjustedScore = item.matchScore + similarity * 10;

      return {
        ...item,
        matchScore: Number(adjustedScore.toFixed(2)),
      };
    });

    // Cleanup: delete job vectors to prevent accumulation
    try {
      await vectorStore.delete({ ids: jobIds });
    } catch (err) {
      console.warn("Failed to delete job vectors from Pinecone", err);
    }

    // Merge back any jobs that were skipped (no description) at end of list
    const rerankedIds = new Set(jobsWithContent.map((j) => j.job.id));
    const skippedJobs = topJobs.filter((j) => !rerankedIds.has(j.job.id));

    reranked.sort((a, b) => b.matchScore - a.matchScore);
    return { matchedJobs: [...reranked, ...skippedJobs] };
  } catch (error) {
    // If Pinecone/embedding fails, gracefully fall back to skill-only matching
    console.error("vectorRerankNode failed, using skill-match results:", error);
    return { matchedJobs: topJobs };
  }
}

export function buildMatchingPipeline() {
  return new StateGraph(MatchingPipelineState)
    .addNode("fetchJobsNode", fetchJobsNode)
    .addNode("skillMatchNode", skillMatchNode)
    .addNode("vectorRerankNode", vectorRerankNode)
    .addEdge(START, "fetchJobsNode")
    .addEdge("fetchJobsNode", "skillMatchNode")
    .addEdge("skillMatchNode", "vectorRerankNode")
    .addEdge("vectorRerankNode", END)
    .compile();
}
