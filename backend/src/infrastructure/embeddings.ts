import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { config } from "../config";
import { TaskType } from "@google/generative-ai";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: config.geminiApiKey,
  model: "gemini-embedding-001", // 768 dimensions
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  title: "Document title",
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
