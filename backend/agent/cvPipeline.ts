import { Document } from "@langchain/core/documents";
import { END, START, Annotation, StateGraph } from "@langchain/langgraph";
import { PineconeStore } from "@langchain/pinecone";
import { prisma } from "../libs/prisma.js";
import {
  createEmbeddings,
  createLLM,
  createPineconeClient,
  getPineconeIndexName,
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
  const pineconeClient = createPineconeClient();
  const pineconeIndex = pineconeClient.Index(getPineconeIndexName());
  const vectorStore = await PineconeStore.fromExistingIndex(createEmbeddings(), {
    pineconeIndex,
  });

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
