import { MistralAIEmbeddings } from "@langchain/mistralai";
import { config } from "../config";

const embeddings = new MistralAIEmbeddings({
  apiKey: config.mistralApiKey,
  model: "mistral-embed", // 1024 dimensions
});

/**
 * Embed a single text string (e.g. a user query).
 */
export const embedText = async (text: string): Promise<number[]> => {
  return embeddings.embedQuery(text);
};

/**
 * Embed multiple texts in batch (e.g. document chunks).
 */
export const embedTexts = async (texts: string[]): Promise<number[][]> => {
  return embeddings.embedDocuments(texts);
};
