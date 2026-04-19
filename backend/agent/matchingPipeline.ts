import { END, START, Annotation, StateGraph } from "@langchain/langgraph";
import { PineconeStore } from "@langchain/pinecone";
import { Document } from "@langchain/core/documents";
import type { Job } from "../generated/prisma/client.js";
import type { MatchedJob } from "../types/job.types.js";
import {
  createEmbeddings,
  createPineconeClient,
  getPineconeIndexName,
} from "../libs/ai.js";
import { prisma } from "../libs/prisma.js";

const MatchingPipelineState = Annotation.Root({
  userId: Annotation<string>(),
  resumeSkills: Annotation<string[]>(),
  resumeText: Annotation<string>(),
  allJobs: Annotation<Job[]>(),
  matchedJobs: Annotation<MatchedJob[]>(),
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

  return { matchedJobs };
}

async function vectorRerankNode(
  state: MatchingAgentState,
): Promise<Partial<MatchingAgentState>> {
  if (state.matchedJobs.length === 0) {
    return { matchedJobs: [] };
  }

  try {
    const embeddings = createEmbeddings();
    const pineconeClient = createPineconeClient();
    const pineconeIndex = pineconeClient.Index(getPineconeIndexName());
    const vectorStore = await PineconeStore.fromExistingIndex(
      embeddings,
      {
        pineconeIndex,
      },
    );

    const topJobs = state.matchedJobs.slice(0, 20);

    await vectorStore.addDocuments(
      topJobs.map(
        (item) =>
          new Document({
            pageContent: item.job.description,
            metadata: {
              type: "job",
              jobId: item.job.id,
            },
          }),
      ),
      {
        ids: topJobs.map((item) => `job-${item.job.id}`),
      },
    );

    const queryEmbedding = await embeddings.embedQuery(state.resumeText);

    const reranked = await Promise.all(
      topJobs.map(async (item) => {
        const [result] = await vectorStore.similaritySearchVectorWithScore(
          queryEmbedding,
          1,
          {
            type: "job",
            jobId: item.job.id,
          },
        );

        const similarity = result?.[1] ?? 0;
        const adjustedScore = item.matchScore + similarity * 10;

        return {
          ...item,
          matchScore: Number(adjustedScore.toFixed(2)),
        };
      }),
    );

    reranked.sort((a, b) => b.matchScore - a.matchScore);
    return { matchedJobs: reranked };
  } catch (error) {
    // If Pinecone/embedding fails, gracefully fall back to skill-only matching
    console.error("vectorRerankNode failed, using skill-match results:", error);
    return { matchedJobs: state.matchedJobs };
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
