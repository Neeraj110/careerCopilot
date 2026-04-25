import { END, START, Annotation, StateGraph } from "@langchain/langgraph";
import { PineconeStore } from "@langchain/pinecone";
import {
  createEmbeddings,
  createLLM,
  createPineconeClient,
  getPineconeIndexName,
} from "../libs/ai.js";
import { prisma } from "../libs/prisma.js";

// ── Types ──────────────────────────────────────────────────────────────────
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const ChatPipelineState = Annotation.Root({
  userId: Annotation<string>(),
  message: Annotation<string>(),
  jobId: Annotation<string | undefined>(),
  conversationHistory: Annotation<ChatMessage[]>(),
  resumeContext: Annotation<string>(),
  jobContext: Annotation<string>(),
  ragContext: Annotation<string>(),
  response: Annotation<string>(),
});

export type ChatAgentState = typeof ChatPipelineState.State;

// ── Node 1: Load DB context (resume + job data) ────────────────────────────
async function loadContextNode(
  state: ChatAgentState,
): Promise<Partial<ChatAgentState>> {
  const activeResumePromise = prisma.resume.findFirst({
    where: { userId: state.userId, isActive: true },
    orderBy: { updatedAt: "desc" },
    select: { rawText: true, skills: true },
  });

  const latestResumePromise = prisma.resume.findFirst({
    where: { userId: state.userId },
    orderBy: { updatedAt: "desc" },
    select: { rawText: true, skills: true },
  });

  const [resume, job] = await Promise.all([
    activeResumePromise.then((active) => active ?? latestResumePromise),
    state.jobId
      ? prisma.job.findUnique({
          where: { id: state.jobId },
          select: {
            title: true,
            company: true,
            description: true,
            skills: true,
          },
        })
      : Promise.resolve(null),
  ]);

  const resumeContext = resume
    ? `Candidate Skills: ${resume.skills.join(", ")}\nResume Summary:\n${resume.rawText.slice(0, 2000)}`
    : "No resume uploaded yet.";

  const jobContext = job
    ? `Target Job: ${job.title} at ${job.company}\nRequired Skills: ${job.skills.join(", ")}\nJob Description:\n${job.description.slice(0, 1500)}`
    : "";

  return { resumeContext, jobContext };
}

// ── Node 2: RAG retrieval from Pinecone ────────────────────────────────────
async function retrieveNode(
  state: ChatAgentState,
): Promise<Partial<ChatAgentState>> {
  try {
    const embeddings = createEmbeddings();
    const pineconeClient = createPineconeClient();
    const pineconeIndex = pineconeClient.Index(getPineconeIndexName());
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
    });

    // Search for relevant resume chunks and optionally job chunks
    const results = await vectorStore.similaritySearch(state.message, 3, {
      userId: state.userId,
    });

    const ragContext = results
      .map((doc, i) => `[Context ${i + 1}]: ${doc.pageContent.slice(0, 400)}`)
      .join("\n\n");

    return { ragContext: ragContext || "" };
  } catch {
    // RAG retrieval is best-effort; fall back to empty context
    return { ragContext: "" };
  }
}

// ── Node 3: Generate response with full context ────────────────────────────
async function generateResponseNode(
  state: ChatAgentState,
): Promise<Partial<ChatAgentState>> {
  const llm = createLLM(0.5);

  const historyText = state.conversationHistory
    .slice(-6) // last 3 turns
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const systemPrompt = `You are CareerCopilot, an expert AI career coach. You help candidates understand their job fit, improve their resume, and prepare for interviews.

You have access to the candidate's resume data and optionally a specific job they are asking about.

${state.resumeContext ? `=== CANDIDATE RESUME ===\n${state.resumeContext}` : ""}
${state.jobContext ? `\n=== TARGET JOB ===\n${state.jobContext}` : ""}
${state.ragContext ? `\n=== RELEVANT CONTEXT ===\n${state.ragContext}` : ""}

Guidelines:
- Be specific and actionable (not generic career advice)
- Reference actual skills from their resume when possible
- If asked about a job, compare their profile to that specific job
- Keep responses focused and use bullet points where helpful
- Be encouraging but honest about gaps`;

  const userMessage = historyText
    ? `${historyText}\nUser: ${state.message}`
    : state.message;

  const response = await llm.invoke(
    `${systemPrompt}\n\n${userMessage}\n\nAssistant:`,
  );

  const content =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  return { response: content.trim() };
}

// ── Build pipeline ─────────────────────────────────────────────────────────
export function buildChatPipeline() {
  return new StateGraph(ChatPipelineState)
    .addNode("loadContextNode", loadContextNode)
    .addNode("retrieveNode", retrieveNode)
    .addNode("generateResponseNode", generateResponseNode)
    .addEdge(START, "loadContextNode")
    .addEdge("loadContextNode", "retrieveNode")
    .addEdge("retrieveNode", "generateResponseNode")
    .addEdge("generateResponseNode", END)
    .compile();
}
