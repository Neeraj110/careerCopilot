import { config } from "../config";

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 1024;
const EMBEDDING_ENDPOINT =
  `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}`;

type EmbeddingResponse = {
  embedding?: { values?: number[] };
  embeddings?: Array<{ values?: number[] }>;
};

async function requestEmbedding(
  path: "embedContent" | "batchEmbedContents",
  body: object,
): Promise<EmbeddingResponse> {
  if (!config.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is required for document embeddings");
  }

  const response = await fetch(
    `${EMBEDDING_ENDPOINT}:${path}?key=${encodeURIComponent(config.geminiApiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Gemini embedding request failed (${response.status}): ${message}`);
  }

  return response.json() as Promise<EmbeddingResponse>;
}

function assertDimensions(vector: number[]): number[] {
  if (vector.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Gemini returned ${vector.length} embedding dimensions; expected ${EMBEDDING_DIMENSIONS}`,
    );
  }
  return vector;
}

function contentRequest(text: string) {
  return {
    content: { parts: [{ text: text.replace(/\n/g, " ") }] },
    outputDimensionality: EMBEDDING_DIMENSIONS,
  };
}

export const embedText = async (text: string): Promise<number[]> => {
  const result = await requestEmbedding("embedContent", contentRequest(text));
  return assertDimensions(result.embedding?.values ?? []);
};

export const embedTexts = async (texts: string[]): Promise<number[][]> => {
  if (texts.length === 0) return [];

  const result = await requestEmbedding("batchEmbedContents", {
    requests: texts.map((text) => ({
      model: `models/${EMBEDDING_MODEL}`,
      ...contentRequest(text),
    })),
  });

  const vectors = result.embeddings ?? [];
  if (vectors.length !== texts.length) {
    throw new Error(
      `Gemini returned ${vectors.length} embeddings for ${texts.length} document chunks`,
    );
  }

  return vectors.map((embedding) => assertDimensions(embedding.values ?? []));
};
