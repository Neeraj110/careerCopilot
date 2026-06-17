import { Annotation, START, END, StateGraph } from "@langchain/langgraph";
import { ChatMistralAI } from "@langchain/mistralai";
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

const rawLlm = new ChatMistralAI({
  apiKey: config.mistralApiKey,
  model: "mistral-large-latest",
  temperature: 0.3,
  maxRetries: 2,
});

const tavily = new TavilySearch({
  maxResults: 6,
  topic: "general",
  searchDepth: "advanced",
  tavilyApiKey: config.tavilyApiKey,
});

export async function queryGeneratorNode(state: RoadmapAgentState) {
  console.log("[Node 1] queryGeneratorNode running...");

  const querySchema = z.object({
    queries: z.array(z.string()).length(6).describe("Exactly 6 specific Google search queries")
  });

  const structuredLlm = rawLlm.withStructuredOutput(querySchema, { name: "QueryGenerator" });

  const prompt = `
You are an expert learning coach.
Generate exactly 6 specific Google search queries to find the BEST learning resources (documentation, courses, tutorials, github projects, medium/blog) for:

Skill: ${state.skill}
Level: ${state.level}
Goal: ${state.targetGoal}

Rules:
- Queries should target different resource types (official documentation, top video tutorials, step-by-step guides, GitHub practice repositories, articles, and interactive courses)
- Include year 2025 or 2026 for recency
- Be specific, not generic
  `;

  const result = await structuredLlm.invoke(prompt);
  const queries = result.queries;

  console.log("[Node 1] Generated queries:", queries);
  return { searchQueries: queries };
}

export async function webSearcherNode(
  state: RoadmapAgentState,
): Promise<Partial<RoadmapAgentState>> {
  console.log("[Node 2] webSearcherNode running...");

  const allResults: { title: string; url: string; snippet: string }[] = [];

  // Execute searches in parallel to avoid timeouts
  const searchPromises = state.searchQueries.map(async (query) => {
    try {
      const resultStr = await tavily.invoke({ query });
      const parsed =
        typeof resultStr === "string" ? JSON.parse(resultStr) : resultStr;
      return parsed.results || [];
    } catch (err) {
      console.error(`[Node 2] Search failed for query: "${query}"`, err);
      return [];
    }
  });

  const resultsArray = await Promise.all(searchPromises);

  for (const results of resultsArray) {
    for (const r of results) {
      allResults.push({
        title: r.title || "",
        url: r.url || "",
        snippet: r.content || "",
      });
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const unique = allResults.filter((r) => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  console.log(`[Node 2] Total unique resources found: ${unique.length}`);
  return { rawResources: unique };
}

export async function resourceRankerNode(
  state: RoadmapAgentState,
): Promise<Partial<RoadmapAgentState>> {
  console.log("[Node 3] resourceRankerNode running...");

  if (state.rawResources.length === 0) {
    console.warn("[Node 3] No resources to rank!");
    return { rankedResources: [] };
  }

  const rankSchema = z.object({
    resources: z.array(z.object({
      title: z.string(),
      url: z.string(),
      type: z.enum(["Course", "Article", "Video", "Documentation", "Book"]),
      relevanceScore: z.number().min(0).max(100),
      whyUseful: z.string()
    })).describe("The BEST 16 learning resources selected from the raw list")
  });

  const structuredLlm = rawLlm.withStructuredOutput(rankSchema, { name: "ResourceRanker" });

  const prompt = `
You are a learning resource curator.
From the resources below, select the BEST 16 for learning "${state.skill}" at "${state.level}" level.

Resources:
${JSON.stringify(state.rawResources, null, 2)}

For each selected resource:
1. Assign type: "Course" | "Article" | "Video" | "Documentation" | "Book"
2. Give relevanceScore: 0-100
3. Write whyUseful: one line explaining why
  `;

  const result = await structuredLlm.invoke(prompt);
  const ranked = result.resources;

  // Sort by relevance score descending
  const sorted = ranked.sort(
    (a, b) => b.relevanceScore - a.relevanceScore,
  );

  console.log(`[Node 3] Ranked ${sorted.length} resources`);
  return { rankedResources: sorted };
}

export async function roadmapFormatterNode(
  state: RoadmapAgentState,
): Promise<Partial<RoadmapAgentState>> {
  console.log("[Node 4] roadmapFormatterNode running...");

  const weeks =
    state.level === "beginner" ? 4 : state.level === "intermediate" ? 6 : 8;

  const roadmapSchema = z.object({
    skill: z.string(),
    totalWeeks: z.number(),
    milestones: z.array(z.object({
      week: z.number(),
      focus: z.string().describe("Detailed Topic name"),
      topics: z.array(z.string()).describe("subtopics with details"),
      resources: z.array(z.object({
        title: z.string(),
        url: z.string(),
        type: z.string()
      })),
      project: z.string().describe("Project idea and features"),
      interviewQuestions: z.array(z.string())
    }))
  });

  const structuredLlm = rawLlm.withStructuredOutput(roadmapSchema, { name: "RoadmapFormatter" });

  const prompt = `
You are an expert learning path designer.
Create a structured ${weeks}-week roadmap for:

Skill: ${state.skill}
Level: ${state.level}
Goal: ${state.targetGoal}

Available resources (choose from this list to assign real, high-quality links to each week):
${JSON.stringify(state.rankedResources, null, 2)}

Rules:
- Keep all descriptions, topics, and project ideas brief and concise (1-2 sentences max).
- Each week should build on the previous, covering the topic incrementally.
- Assign 1-2 highly relevant, distinct resources per week from the list above.
- Include a brief description for each key topic of the week.
- Provide 1 simple practical project idea per week, explaining briefly what to build.
- Provide 2 interview questions per week relevant to that week's topic.
  `;

  const roadmap = await structuredLlm.invoke(prompt);

  console.log(`[Node 4] Roadmap generated: ${roadmap.totalWeeks} weeks`);
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
