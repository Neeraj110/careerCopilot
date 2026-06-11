import { END, START, Annotation, StateGraph } from "@langchain/langgraph";
import { ChatMistralAI } from "@langchain/mistralai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { config } from "../../../config";

const ResumeImprovementState = Annotation.Root({
  resumeText: Annotation<string>(),
  jdText: Annotation<string>(),
  parsedBullets: Annotation<string[]>(),
  jdRequirements: Annotation<{
    keywords: string[];
    mustHave: string[];
    niceToHave: string[];
  }>(),
  gaps: Annotation<{
    missing: string[];
    partial: string[];
    present: string[];
  }>(),
  improvedBullets: Annotation<
    {
      original: string;
      improved: string;
      reason: string;
    }[]
  >(),
  validationScore: Annotation<number>(),
  retryCount: Annotation<number>(),
});

export type ImprovementAgentState = typeof ResumeImprovementState.State;

const model = new ChatMistralAI({
  apiKey: config.mistralApiKey,
  model: "mistral-large-latest",
  temperature: 0.4,
});

const parseJSON = (content: string) => {
  const cleaned = content.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
};

async function parseResumeNode(state: ImprovementAgentState) {
  const response = await model.invoke([
    new SystemMessage(`
      You are a resume parser. Extract every achievement-oriented bullet point
      from the resume — only from Experience, Projects, and Internship sections.

      Rules:
      - Skip section headers, education degrees, contact info, and skill lists
      - Keep bullets exactly as written — do NOT paraphrase or fix grammar yet
      - If a bullet spans multiple lines, merge into one string
      - Include bullets even if they are weak or vague (they will be improved later)

      Return ONLY this JSON, no markdown:
      {
        "bullets": [
          "Built a REST API for user authentication",
          "Reduced page load time by optimizing queries"
        ]
      }
    `),
    new HumanMessage(`RESUME:\n${state.resumeText}`),
  ]);

  const { bullets } = parseJSON(response.content as string);
  return { parsedBullets: bullets };
}

async function analyzeJDNode(state: ImprovementAgentState) {
  const response = await model.invoke([
    new SystemMessage(`
      You are a senior technical recruiter analyzing a job description.

      Your task:
      1. Extract exact technical keywords that an ATS would scan for
         (tools, frameworks, languages, methodologies — e.g. "React", "CI/CD", "REST APIs")
      2. Identify must-have requirements — things explicitly stated as required/mandatory
      3. Identify nice-to-have — things stated as preferred/bonus/plus

      Important:
      - keywords should be short exact terms, not sentences
      - mustHave and niceToHave should be skill/requirement phrases, not full sentences
      - Do not invent requirements not present in the JD

      Return ONLY this JSON, no markdown:
      {
        "keywords": ["Next.js", "TypeScript", "PostgreSQL", "REST APIs"],
        "mustHave": ["3+ years React experience", "Node.js backend", "SQL databases"],
        "niceToHave": ["GraphQL", "AWS", "Docker", "system design experience"]
      }
    `),
    new HumanMessage(`JOB DESCRIPTION:\n${state.jdText}`),
  ]);

  return { jdRequirements: parseJSON(response.content as string) };
}

async function findGapsNode(state: ImprovementAgentState) {
  const response = await model.invoke([
    new SystemMessage(`
      You are a resume gap analyst. Compare resume bullets against JD requirements.

      Classify each JD requirement into one of three buckets:
      - missing:  requirement not mentioned anywhere in the resume bullets
      - partial:  requirement is hinted at but not explicitly stated
                  (e.g. JD says "AWS" but resume says "deployed on cloud")
      - present:  requirement is clearly demonstrated in at least one bullet

      Return ONLY this JSON, no markdown:
      {
        "missing": ["GraphQL", "Docker", "system design"],
        "partial": [
          { "requirement": "AWS", "foundAs": "deployed on cloud platform" }
        ],
        "present": ["REST APIs", "PostgreSQL", "TypeScript"]
      }
    `),
    new HumanMessage(`
      RESUME BULLETS:
      ${state.parsedBullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}

      JD REQUIREMENTS:
      Must-have: ${JSON.stringify(state.jdRequirements.mustHave)}
      Nice-to-have: ${JSON.stringify(state.jdRequirements.niceToHave)}
      ATS Keywords: ${JSON.stringify(state.jdRequirements.keywords)}
    `),
  ]);

  return { gaps: parseJSON(response.content as string) };
}

async function rewriteBulletsNode(state: ImprovementAgentState) {
  const retryContext =
    state.retryCount > 0
      ? `
      IMPORTANT — Previous rewrite scored ${state.validationScore}/100.
      That is below 70. This is retry #${state.retryCount}.
      Reasons it failed: bullets likely too vague, missing keywords, or no metrics.
      This time:
      - Every bullet MUST contain at least one JD keyword
      - Add realistic metrics (%, ms, users, requests/sec) where possible
      - Start with a strong action verb (Built, Reduced, Designed, Migrated, Led)
      - Address missing gaps more aggressively
    `
      : "";

  const response = await model.invoke([
    new SystemMessage(`
      You are an expert resume writer who specializes in tech roles.
      Rewrite each resume bullet to be stronger and more aligned with the JD.

      Rewriting rules:
      1. Start every bullet with a strong past-tense action verb
         (Built, Designed, Reduced, Implemented, Migrated, Led, Optimized)
      2. Naturally embed missing JD keywords where truthful and relevant
         — do NOT fabricate experience the candidate does not have
      3. Add quantified impact wherever possible
         (e.g. "reduced latency by 40%", "serving 500+ daily users")
      4. Keep each bullet to 1-2 lines max
      5. For partial matches — strengthen the wording to explicitly name the skill
         (e.g. "deployed on cloud platform" → "deployed on AWS EC2")
         only if the original bullet makes it reasonable to assume

      ${retryContext}

      Return ONLY this JSON, no markdown:
      {
        "bullets": [
          {
            "original": "Made the app faster",
            "improved": "Optimized PostgreSQL query performance, reducing API response time by 42% for 1000+ daily active users",
            "reason": "Added metric, named the DB (JD keyword), added user scale context"
          }
        ]
      }
    `),
    new HumanMessage(`
      ORIGINAL BULLETS:
      ${state.parsedBullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}

      GAPS TO ADDRESS:
      Missing: ${JSON.stringify(state.gaps.missing)}
      Partial matches: ${JSON.stringify(state.gaps.partial)}

      JD KEYWORDS TO EMBED: ${JSON.stringify(state.jdRequirements.keywords)}
      JD MUST-HAVES: ${JSON.stringify(state.jdRequirements.mustHave)}
    `),
  ]);

  const { bullets } = parseJSON(response.content as string);
  return { improvedBullets: bullets };
}

async function validateNode(state: ImprovementAgentState) {
  const response = await model.invoke([
    new SystemMessage(`
      You are a strict ATS scoring system evaluating improved resume bullets
      against a job description.

      Score from 0 to 100 based on:
      - Keyword coverage: how many JD keywords appear in improved bullets (40 pts)
      - Specificity: are bullets concrete with tools/metrics vs vague (30 pts)
      - Action verbs: do bullets start with strong past-tense verbs (15 pts)
      - Must-have coverage: are mandatory requirements addressed (15 pts)

      Be strict — a score of 70+ means the bullets are genuinely strong.
      Do not inflate scores.

      Return ONLY this JSON, no markdown:
      {
        "score": 74,
        "breakdown": {
          "keywordCoverage": 32,
          "specificity": 24,
          "actionVerbs": 12,
          "mustHaveCoverage": 6
        },
        "weakestBullets": [
          "bullet text that still needs work"
        ]
      }
    `),
    new HumanMessage(`
      IMPROVED BULLETS:
      ${state.improvedBullets.map((b, i) => `${i + 1}. ${b.improved}`).join("\n")}
      JD KEYWORDS: ${JSON.stringify(state.jdRequirements.keywords)}
      JD MUST-HAVES: ${JSON.stringify(state.jdRequirements.mustHave)}
    `),
  ]);

  const result = parseJSON(response.content as string);
  return {
    validationScore: result.score,
    retryCount: (state.retryCount ?? 0) + 1,
  };
}

function shouldRetry(state: ImprovementAgentState): string {
  if (state.validationScore < 70 && state.retryCount < 2) {
    return "rewrite";
  }
  return END;
}

export function buildImprovementAgent() {
  return new StateGraph(ResumeImprovementState)
    .addNode("parseResume", parseResumeNode)
    .addNode("analyzeJD", analyzeJDNode)
    .addNode("findGaps", findGapsNode)
    .addNode("rewrite", rewriteBulletsNode)
    .addNode("validate", validateNode)
    .addEdge(START, "parseResume")
    .addEdge("parseResume", "analyzeJD")
    .addEdge("analyzeJD", "findGaps")
    .addEdge("findGaps", "rewrite")
    .addEdge("rewrite", "validate")
    .addConditionalEdges("validate", shouldRetry, {
      rewrite: "rewrite",
      [END]: END,
    })
    .compile();
}
