import { END, START, Annotation, StateGraph } from "@langchain/langgraph";
import {
  createGeminiModel,
  recordAiCall,
  withAiGuardrails,
} from "../../../infrastructure/ai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { z } from "zod";
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
    partial: { requirement: string; foundAs: string }[];
    present: string[];
  }>(),
  matchScore: Annotation<number>(),
  role: Annotation<string>(),
  matchSummary: Annotation<string>(),
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

const rawModel = createGeminiModel(config.geminiApiKey);

function formatBullets(bullets: string[]): string {
  return bullets.map((bullet, index) => `${index + 1}. ${bullet}`).join("\n");
}

async function analyzeResumeAndJDNode(state: ImprovementAgentState) {
  const schema = z.object({
    bullets: z.array(z.string()).describe("Achievement-oriented bullets extracted exactly as written"),
    jdRequirements: z.object({
      keywords: z.array(z.string()).describe("Exact technical keywords that an ATS would scan for"),
      mustHave: z.array(z.string()).describe("Must-have requirements explicitly stated as required/mandatory"),
      niceToHave: z.array(z.string()).describe("Nice-to-have requirements stated as preferred/bonus/plus"),
    }),
    gaps: z.object({
      missing: z.array(z.string()).describe("Requirements not mentioned in the resume bullets"),
      partial: z.array(z.object({
        requirement: z.string(),
        foundAs: z.string(),
      })).describe("Requirements hinted at but not explicitly stated"),
      present: z.array(z.string()).describe("Requirements clearly demonstrated in at least one bullet"),
    }),
    matchScore: z.number().min(0).max(100).describe("Evidence-based resume match score for this job description"),
    role: z.string().describe("Role described by the job description"),
    matchSummary: z.string().describe("Brief, evidence-based explanation of the match score"),
  });
  const structuredModel = rawModel.withStructuredOutput(schema, {
    name: "AnalyzeResumeAndJD",
  });

  recordAiCall("gemini-resume", "resume.improvement.analyze");
  const response = await structuredModel.invoke([
    new SystemMessage(withAiGuardrails(`
      You are a resume parser and senior technical recruiter.

      Analyze the resume and job description together:
      1. Extract every achievement-oriented bullet from Experience, Projects, and
         Internship sections. Skip headers, education, contact information, and
         skill lists. Preserve wording exactly and merge bullets split across lines.
      2. Extract exact ATS keywords, must-have requirements, and nice-to-have
         requirements from the job description.
      3. Compare the extracted resume bullets against all job-description
         requirements and classify each as missing, partial, or present.
      4. Score how well the original resume matches this job description from
         0 to 100, identify the role, and summarize the score using only evidence
         from the resume.

      Keep keywords and requirements concise. Do not invent resume experience or
      job requirements. Include weak or vague achievement bullets; they will be
      improved in a later step.
    `)),
    new HumanMessage(`
      RESUME:
      ${state.resumeText}

      JOB DESCRIPTION:
      ${state.jdText}
    `),
  ]);

  return {
    parsedBullets: response.bullets,
    jdRequirements: response.jdRequirements,
    gaps: response.gaps,
    matchScore: response.matchScore,
    role: response.role,
    matchSummary: response.matchSummary,
  };
}

async function rewriteBulletsNode(state: ImprovementAgentState) {
  const schema = z.object({
    bullets: z.array(z.object({
      original: z.string(),
      improved: z.string(),
      reason: z.string()
    }))
  });
  const structuredModel = rawModel.withStructuredOutput(schema, { name: "RewriteBullets" });

  const retryContext =
    state.retryCount > 0
      ? `
      IMPORTANT — Previous rewrite scored ${state.validationScore}/100.
      That is below 70. This is retry #${state.retryCount}.
      Reasons it failed: bullets likely too vague, missing keywords, or no metrics.
      This time:
      - Use a JD keyword only when the original resume supports it
      - Keep metrics only when they are supported by the original resume
      - Start with a strong action verb (Built, Reduced, Designed, Migrated, Led)
      - Do not claim experience for gaps that are unsupported by the resume
    `
      : "";

  recordAiCall("gemini-resume", "resume.improvement.rewrite");
  const response = await structuredModel.invoke([
    new SystemMessage(withAiGuardrails(`
      You are an expert resume writer who specializes in tech roles.
      Rewrite each resume bullet to be stronger and more aligned with the JD.

      Rewriting rules:
      1. Start every bullet with a strong past-tense action verb
         (Built, Designed, Reduced, Implemented, Migrated, Led, Optimized)
      2. Naturally embed missing JD keywords where truthful and relevant
         — do NOT fabricate experience the candidate does not have
      3. Keep existing metrics only when supported by the original bullet. Do not
         add numbers, outcomes, or claims that the candidate did not provide.
      4. Keep each bullet to 1-2 lines max
      5. Clarify partial matches only when the original resume explicitly supports
         the skill; do not infer a vendor or platform from a generic description

      ${retryContext}
    `)),
    new HumanMessage(`
      ORIGINAL BULLETS:
      ${formatBullets(state.parsedBullets)}

      GAPS TO ADDRESS:
      Missing: ${JSON.stringify(state.gaps.missing)}
      Partial matches: ${JSON.stringify(state.gaps.partial)}

      JD KEYWORDS TO EMBED: ${JSON.stringify(state.jdRequirements.keywords)}
      JD MUST-HAVES: ${JSON.stringify(state.jdRequirements.mustHave)}
    `),
  ]);

  return { improvedBullets: response.bullets };
}

async function validateNode(state: ImprovementAgentState) {
  const schema = z.object({
    score: z.number().min(0).max(100),
    breakdown: z.object({
      keywordCoverage: z.number(),
      specificity: z.number(),
      actionVerbs: z.number(),
      mustHaveCoverage: z.number()
    }),
    weakestBullets: z.array(z.string())
  });
  const structuredModel = rawModel.withStructuredOutput(schema, { name: "Validate" });

  recordAiCall("gemini-resume", "resume.improvement.validate");
  const response = await structuredModel.invoke([
    new SystemMessage(withAiGuardrails(`
      You are a strict ATS scoring system evaluating improved resume bullets
      against a job description.

      Score from 0 to 100 based on:
      - Keyword coverage: how many JD keywords appear in improved bullets (40 pts)
      - Specificity: are bullets concrete with tools/metrics vs vague (30 pts)
      - Action verbs: do bullets start with strong past-tense verbs (15 pts)
      - Must-have coverage: are mandatory requirements addressed (15 pts)

      Be strict — a score of 70+ means the bullets are genuinely strong.
      Do not inflate scores.
    `)),
    new HumanMessage(`
      IMPROVED BULLETS:
      ${formatBullets(state.improvedBullets.map((bullet) => bullet.improved))}
      JD KEYWORDS: ${JSON.stringify(state.jdRequirements.keywords)}
      JD MUST-HAVES: ${JSON.stringify(state.jdRequirements.mustHave)}
    `),
  ]);

  return {
    validationScore: response.score,
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
    .addNode("analyze", analyzeResumeAndJDNode)
    .addNode("rewrite", rewriteBulletsNode)
    .addNode("validate", validateNode)
    .addEdge(START, "analyze")
    .addEdge("analyze", "rewrite")
    .addEdge("rewrite", "validate")
    .addConditionalEdges("validate", shouldRetry, {
      rewrite: "rewrite",
      [END]: END,
    })
    .compile();
}
