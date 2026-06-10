import { Annotation, START, END, StateGraph } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { TavilySearch } from "@langchain/tavily";
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



const gemini = new ChatGoogleGenerativeAI({
  apiKey: config.geminiApiKey,
  model: "gemini-2.5-flash",
  temperature: 0.3,
});

const tavily = new TavilySearch({
  maxResults: 5,
  topic: "general",
  searchDepth: "advanced",
});

const invokeJSON = async (prompt: string): Promise<any> => {
  const response = await gemini.invoke(prompt);
  const text =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  // Strip ```json ... ``` blocks
  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned);
};

export async function queryGeneratorNode(state: RoadmapAgentState) {
  console.log("[Node 1] queryGeneratorNode running...");

  const prompt = `
You are an expert learning coach.
Generate exactly 4 specific Google search queries to find the BEST learning resources for:

Skill: ${state.skill}
Level: ${state.level}
Goal: ${state.targetGoal}

Rules:
- Queries should target different resource types (courses, tutorials, projects, docs)
- Include year 2024 or 2025 for recency
- Be specific, not generic

Return ONLY a JSON array of 4 strings. No explanation.
Example: ["best Next.js course for beginners 2024", "Next.js projects for practice github"]
  `;

  const queries = await invokeJSON(prompt);

  console.log("[Node 1] Generated queries:", queries);
  return { searchQueries: queries };
}

export async function webSearcherNode(
  state: RoadmapAgentState,
): Promise<Partial<RoadmapAgentState>> {
  console.log("[Node 2] webSearcherNode running...");

  const allResults: { title: string; url: string; snippet: string }[] = [];

  for (const query of state.searchQueries) {
    try {
      // Invoke Tavily search — returns JSON string
      const resultStr = await tavily.invoke({ query });
      const parsed =
        typeof resultStr === "string" ? JSON.parse(resultStr) : resultStr;

      // Extract results array
      const results = parsed.results || [];

      for (const r of results) {
        allResults.push({
          title: r.title || "",
          url: r.url || "",
          snippet: r.content || "",
        });
      }
    } catch (err) {
      console.error(`[Node 2] Search failed for query: "${query}"`, err);
      // Don't stop the whole node if one query fails
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

  const prompt = `
You are a learning resource curator.
From the resources below, select the BEST 8 for learning "${state.skill}" at "${state.level}" level.

Resources:
${JSON.stringify(state.rawResources, null, 2)}

For each selected resource:
1. Assign type: "Course" | "Article" | "Video" | "Documentation" | "Book"
2. Give relevanceScore: 0-100
3. Write whyUseful: one line explaining why

Return ONLY a JSON array like:
[
  {
    "title": "...",
    "url": "...",
    "type": "Course",
    "relevanceScore": 92,
    "whyUseful": "Step-by-step beginner course with projects"
  }
]
  `;

  const ranked = await invokeJSON(prompt);

  // Sort by relevance score descending
  const sorted = ranked.sort(
    (a: any, b: any) => b.relevanceScore - a.relevanceScore,
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

  const prompt = `
You are an expert learning path designer.
Create a ${weeks}-week structured roadmap for:

Skill: ${state.skill}
Level: ${state.level}
Goal: ${state.targetGoal}

Available resources:
${JSON.stringify(state.rankedResources, null, 2)}

Rules:
- Each week should build on the previous
- Assign 2-3 resources per week from the list above
- Give 1 practical project idea per week
- Give 2 interview questions per week relevant to that week's topic

Return ONLY this JSON structure:
{
  "skill": "${state.skill}",
  "totalWeeks": ${weeks},
  "milestones": [
    {
      "week": 1,
      "focus": "Topic name",
      "topics": ["subtopic1", "subtopic2"],
      "resources": [
        { "title": "...", "url": "...", "type": "Course" }
      ],
      "project": "Build a simple...",
      "interviewQuestions": ["What is...?", "How does...?"]
    }
  ]
}
  `;

  const roadmap = await invokeJSON(prompt);

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
