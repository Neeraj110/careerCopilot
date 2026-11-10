import { Annotation, START, END, StateGraph } from "@langchain/langgraph";
import { createGeminiModel, recordAiCall } from "../../../infrastructure/ai";
import { TavilySearch } from "@langchain/tavily";
import { z } from "zod";
import { config } from "../../../config";

export const RoadmapState = Annotation.Root({
  skill: Annotation<string>(),
  level: Annotation<"beginner" | "intermediate" | "advanced">(),
  targetGoal: Annotation<string>(),
  searchQueries: Annotation<string[]>(),
  rawResources: Annotation<
    {
      title: string;
      url: string;
      snippet: string;
    }[]
  >(),
  rankedResources: Annotation<
    {
      title: string;
      url: string;
      type: "Course" | "Article" | "Video" | "Documentation" | "Book";
      relevanceScore: number;
      whyUseful: string;
    }[]
  >(),
  roadmap: Annotation<{
    skill: string;
    totalWeeks: number;
    milestones: {
      week: number;
      focus: string;
      topics: string[];
      resources: { title: string; url: string; type: string }[];
      project: string;
      interviewQuestions: string[];
    }[];
  } | null>(),
});

export type RoadmapAgentState = typeof RoadmapState.State;

const rawLlm = createGeminiModel(config.geminiApiKey2);

const tavily = new TavilySearch({
  maxResults: 6,
  topic: "general",
  searchDepth: "advanced",
  tavilyApiKey: config.tavilyApiKey,
});

export async function queryGeneratorNode(state: RoadmapAgentState) {
  const querySchema = z.object({
    queries: z
      .array(z.string())
      .length(6)
      .describe("Exactly 6 specific Google search queries"),
  });

  const structuredLlm = rawLlm.withStructuredOutput(querySchema, {
    name: "QueryGenerator",
  });

  const prompt = `
You are an expert learning coach.
Generate exactly 6 specific Google search queries to find the BEST learning resources for:

Skill: ${state.skill}
Level: ${state.level}
Goal: ${state.targetGoal}

Rules:
- Target: official documentation, top video tutorials, GitHub practice repositories, and deep-dive guides.
- Include years 2025 or 2026 for recency.
- Be specific, technical, and precise.
  `;

  recordAiCall("gemini-general", "roadmap.query-generator");
  const result = await structuredLlm.invoke(prompt);
  return { searchQueries: result.queries };
}

export async function webSearcherNode(
  state: RoadmapAgentState,
): Promise<Partial<RoadmapAgentState>> {
  const allResults: { title: string; url: string; snippet: string }[] = [];

  const searchPromises = (state.searchQueries || []).map(async (query) => {
    try {
      const resultStr = await tavily.invoke({ query });
      const parsed =
        typeof resultStr === "string" ? JSON.parse(resultStr) : resultStr;
      return parsed.results || [];
    } catch (err) {
      console.error(`[Search Error] Query: "${query}"`, err);
      return [];
    }
  });

  const resultsArray = await Promise.all(searchPromises);

  for (const results of resultsArray) {
    for (const r of results) {
      if (r.url) {
        allResults.push({
          title: r.title || "Untitled",
          url: r.url,
          snippet: r.content || "",
        });
      }
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const unique = allResults.filter((r) => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  return { rawResources: unique };
}

export async function resourceRankerNode(
  state: RoadmapAgentState,
): Promise<Partial<RoadmapAgentState>> {
  if (!state.rawResources || state.rawResources.length === 0) {
    return { rankedResources: [] };
  }

  const rankSchema = z.object({
    resources: z
      .array(
        z.object({
          title: z.string(),
          url: z.string(),
          type: z.enum(["Course", "Article", "Video", "Documentation", "Book"]),
          relevanceScore: z.number().min(0).max(100),
          whyUseful: z.string(),
        }),
      )
      .max(16)
      .describe(
        "The top curated learning resources chosen strictly from the input",
      ),
  });

  const structuredLlm = rawLlm.withStructuredOutput(rankSchema, {
    name: "ResourceRanker",
  });

  const prompt = `
You are a learning resource curator.
From the resources below, select up to 16 of the highest quality resources for learning "${state.skill}" at "${state.level}" level.

Raw Resources:
${JSON.stringify(state.rawResources, null, 2)}

Requirements:
1. ONLY select items that exist in the raw list.
2. Filter out paywalls, low-effort SEO spam, or dead homepages.
3. Assign relevanceScore between 0 and 100.
  `;

  recordAiCall("gemini-general", "roadmap.resource-ranker");
  const result = await structuredLlm.invoke(prompt);

  const sorted = [...result.resources].sort(
    (a, b) => b.relevanceScore - a.relevanceScore,
  );
  return { rankedResources: sorted };
}

export async function roadmapFormatterNode(
  state: RoadmapAgentState,
): Promise<Partial<RoadmapAgentState>> {
  const weeks =
    state.level === "beginner" ? 4 : state.level === "intermediate" ? 6 : 8;

  const roadmapSchema = z.object({
    skill: z.string(),
    totalWeeks: z.number(),
    milestones: z.array(
      z.object({
        week: z.number(),
        focus: z.string().describe("Main focus area for the week"),
        topics: z.array(z.string()).describe("Detailed concepts covered"),
        resources: z.array(
          z.object({
            title: z.string(),
            url: z.string(),
            type: z.string(),
          }),
        ),
        project: z.string().describe("Practical hands-on task"),
        interviewQuestions: z.array(z.string()).length(2),
      }),
    ),
  });

  const structuredLlm = rawLlm.withStructuredOutput(roadmapSchema, {
    name: "RoadmapFormatter",
  });

  const prompt = `
You are an expert learning path designer.
Create a structured ${weeks}-week roadmap for:

Skill: ${state.skill}
Level: ${state.level}
Goal: ${state.targetGoal}

Available Resources to Map:
${JSON.stringify(state.rankedResources, null, 2)}

Strict Rules:
- Only assign resource URLs that exist verbatim in the "Available Resources" list above. Do NOT hallucinate URLs.
- Provide 1 actionable project per week.
- Exactly 2 interview questions per week.
- All descriptions should be concise and direct.
  `;

  recordAiCall("gemini-general", "roadmap.formatter");
  const roadmap = await structuredLlm.invoke(prompt);
  return { roadmap };
}

export function buildRoadmapPipeline() {
  return new StateGraph(RoadmapState)
    .addNode("queryGenerator", queryGeneratorNode)
    .addNode("webSearcher", webSearcherNode)
    .addNode("resourceRanker", resourceRankerNode)
    .addNode("roadmapFormatter", roadmapFormatterNode)
    .addEdge(START, "queryGenerator")
    .addEdge("queryGenerator", "webSearcher")
    .addEdge("webSearcher", "resourceRanker")
    .addEdge("resourceRanker", "roadmapFormatter")
    .addEdge("roadmapFormatter", END)
    .compile();
}
