import { Document } from "@langchain/core/documents";
import { END, START, Annotation, StateGraph } from "@langchain/langgraph";
import { prisma } from "../libs/prisma.js";
import {
  createEmbeddings,
  createLLM,
  createPineconeStore,
} from "../libs/ai.js";
import { parseJsonFromText } from "../libs/json.js";
import { scrapeJobListings } from "../services/scraper.js";
import { storeScrapedJobs } from "../services/jobStore.js";
import { logger } from "../libs/logger.js";

const CVPipelineState = Annotation.Root({
  resumeId: Annotation<string>(),
  userId: Annotation<string>(),
  rawText: Annotation<string>(),
  skills: Annotation<string[]>(),
  vectorId: Annotation<string>(),
  jobTypeQuery: Annotation<string>(),
  preferredLocation: Annotation<string>(),
});

export type CVAgentState = typeof CVPipelineState.State;

const PROFILE_LEVELS = [
  "internship",
  "fresher",
  "junior",
  "mid-level",
  "senior",
  "lead",
  "staff",
] as const;

function normalizeSearchQuery(input: string): string {
  return input
    .replace(/[\r\n]+/g, " ")
    .replace(/["'`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}

function inferSeniority(rawText: string): string {
  const lower = rawText.toLowerCase();

  if (/(intern|internship|student)/.test(lower)) return "internship";
  if (/(fresher|entry level|entry-level)/.test(lower)) return "fresher";
  if (/(junior|jr\.?\b|0-1 years|1 year)/.test(lower)) return "junior";
  if (/(senior|sr\.?\b|principal|architect|7\+ years|8\+ years)/.test(lower)) {
    return "senior";
  }
  if (/(lead|team lead|tech lead)/.test(lower)) return "lead";
  if (/(staff|10\+ years|12\+ years)/.test(lower)) return "staff";
  return "mid-level";
}

function inferRole(skills: string[], rawText: string): string {
  const lower = rawText.toLowerCase();
  const skillSet = new Set(skills.map((s) => s.toLowerCase()));

  if (
    skillSet.has("react") ||
    skillSet.has("next.js") ||
    skillSet.has("html") ||
    skillSet.has("css")
  ) {
    return "frontend developer";
  }
  if (
    skillSet.has("node") ||
    skillSet.has("express") ||
    skillSet.has("postgresql") ||
    skillSet.has("mongodb") ||
    skillSet.has("prisma")
  ) {
    return "backend developer";
  }
  if (
    skillSet.has("docker") ||
    skillSet.has("kubernetes") ||
    skillSet.has("aws") ||
    skillSet.has("gcp") ||
    skillSet.has("azure")
  ) {
    return "devops engineer";
  }
  if (
    skillSet.has("machine learning") ||
    skillSet.has("ai") ||
    skillSet.has("python") ||
    /data scientist|ml engineer|ai engineer/.test(lower)
  ) {
    return "machine learning engineer";
  }
  return "software engineer";
}

function buildFallbackQuery(state: CVAgentState): string {
  const seniority = inferSeniority(state.rawText);
  const role = inferRole(state.skills, state.rawText);
  return `${seniority} ${role}`;
}

function ensureLevelInQuery(query: string, fallbackQuery: string): string {
  const hasLevel = PROFILE_LEVELS.some((level) =>
    query.toLowerCase().includes(level),
  );
  return hasLevel ? query : `${fallbackQuery} ${query}`.trim();
}

async function skillExtractorNode(
  state: CVAgentState,
): Promise<Partial<CVAgentState>> {
  const llm = createLLM(0);

  const response = await llm.invoke(
    `Extract a JSON array of technical and soft skills from this resume text. Return ONLY the JSON array, no explanation: ${state.rawText}`,
  );

  const content =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  const parsedSkills = parseJsonFromText<string[]>(content)
    .map((skill) => skill.trim())
    .filter(Boolean);

  await prisma.resume.update({
    where: { id: state.resumeId },
    data: { skills: parsedSkills },
  });

  return { skills: parsedSkills };
}

async function vectorUpsertNode(
  state: CVAgentState,
): Promise<Partial<CVAgentState>> {
  // Validate input before embedding
  if (!state.rawText || state.rawText.trim().length < 10) {
    throw new Error(
      "Resume text too short or empty for vectorization. Please upload a valid PDF.",
    );
  }

  const embeddings = createEmbeddings();
  const vectorStore = await createPineconeStore();

  // Test embedding to ensure it returns valid dimensions
  const testEmbedding = await embeddings.embedQuery(
    state.rawText.slice(0, 100),
  );
  if (!testEmbedding || testEmbedding.length === 0) {
    throw new Error("Embedding model returned empty vectors. Check API keys.");
  }
  console.log(`✓ Embedding dimension: ${testEmbedding.length}`);

  // Add document with validation
  try {
    await vectorStore.addDocuments(
      [
        new Document({
          pageContent: state.rawText,
          metadata: {
            userId: state.userId,
            resumeId: state.resumeId,
            type: "resume",
          },
        }),
      ],
      {
        ids: [state.userId],
      },
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg.includes("dimension") || errorMsg.includes("Vector")) {
      throw new Error(
        `Pinecone dimension mismatch. Verify index dimension matches embedding model (Google: 768 dims). Error: ${errorMsg}`,
      );
    }
    throw error;
  }

  await prisma.resume.update({
    where: { id: state.resumeId },
    data: { vectorId: state.userId },
  });

  return { vectorId: state.userId };
}

async function jobScraperNode(
  state: CVAgentState,
): Promise<Partial<CVAgentState>> {
  const fallbackQuery = buildFallbackQuery(state);

  try {
    const llm = createLLM(0);
    const response = await llm.invoke(
      `Analyze this resume and return JSON only in this shape:
{
  "seniority": "internship | fresher | junior | mid-level | senior | lead | staff",
  "role": "short role name",
  "searchQuery": "a concise job search query"
}
Rules:
- Must include a seniority value.
- Focus on tech roles only.
- Keep searchQuery under 12 words.

Resume:\n\n${state.rawText.slice(0, 3000)}`,
    );

    const content =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    const parsed = parseJsonFromText<{
      seniority?: string;
      role?: string;
      searchQuery?: string;
    }>(content);

    const llmQuery = normalizeSearchQuery(parsed.searchQuery ?? "");
    const llmRole = normalizeSearchQuery(parsed.role ?? "");
    const llmSeniority = normalizeSearchQuery(parsed.seniority ?? "");

    const composed = normalizeSearchQuery(
      llmQuery || `${llmSeniority} ${llmRole}`.trim(),
    );
    const query = ensureLevelInQuery(composed || fallbackQuery, fallbackQuery);

    logger.info(
      { userId: state.userId, query, fallbackQuery },
      "Evaluated job search query from CV",
    );

    void (async () => {
      try {
        logger.info(
          { query, preferredLocation: state.preferredLocation || "" },
          "Starting background job scraping for user's CV profile",
        );
        const scrapedJobs = await scrapeJobListings(query, {
          preferredLocation: state.preferredLocation,
          includeRemote: true,
        });
        if (scrapedJobs.length > 0) {
          await storeScrapedJobs(scrapedJobs);
          logger.info(
            { count: scrapedJobs.length, query },
            "Stored new jobs matching user CV profile",
          );
        } else {
          logger.info({ query }, "No jobs found for user CV profile");
        }
      } catch (error) {
        logger.error(
          { error, query },
          "Failed to scrape jobs for user CV profile",
        );
      }
    })();

    return { jobTypeQuery: query };
  } catch (error) {
    const query = fallbackQuery;
    logger.warn(
      { error, userId: state.userId, query },
      "Falling back to heuristic job query from CV",
    );

    void (async () => {
      try {
        const scrapedJobs = await scrapeJobListings(query, {
          preferredLocation: state.preferredLocation,
          includeRemote: true,
        });
        if (scrapedJobs.length > 0) {
          await storeScrapedJobs(scrapedJobs);
        }
      } catch (scrapeError) {
        logger.error(
          { scrapeError, query },
          "Failed fallback scrape for user CV profile",
        );
      }
    })();

    return { jobTypeQuery: query };
  }
}

export function buildCVPipeline() {
  const g = new StateGraph(CVPipelineState)
    .addNode("skillExtractorNode", skillExtractorNode)
    .addNode("vectorUpsertNode", vectorUpsertNode)
    .addNode("jobScraperNode", jobScraperNode)
    .addEdge(START, "skillExtractorNode")
    .addEdge("skillExtractorNode", "vectorUpsertNode")
    .addEdge("vectorUpsertNode", "jobScraperNode")
    .addEdge("jobScraperNode", END)
    .compile();
  return g;
}
