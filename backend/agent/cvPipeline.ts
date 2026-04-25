import { Document } from "@langchain/core/documents";
import { END, START, Annotation, StateGraph } from "@langchain/langgraph";
import { prisma } from "../libs/prisma.js";
import {
  createEmbeddings,
  createLLM,
  createPineconeStore,
} from "../libs/ai.js";
import { parseJsonFromText } from "../libs/json.js";

const CVPipelineState = Annotation.Root({
  resumeId: Annotation<string>(),
  userId: Annotation<string>(),
  rawText: Annotation<string>(),
  skills: Annotation<string[]>(),
  vectorId: Annotation<string>(),
});

export type CVAgentState = typeof CVPipelineState.State;

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

export function buildCVPipeline() {
  return new StateGraph(CVPipelineState)
    .addNode("skillExtractorNode", skillExtractorNode)
    .addNode("vectorUpsertNode", vectorUpsertNode)
    .addEdge(START, "skillExtractorNode")
    .addEdge("skillExtractorNode", "vectorUpsertNode")
    .addEdge("vectorUpsertNode", END)
    .compile();
}
