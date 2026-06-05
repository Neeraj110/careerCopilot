import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { config } from "../config";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: config.geminiApiKey,
  model: "text-embedding-004",
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
