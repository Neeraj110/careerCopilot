import { ChatGroq } from "@langchain/groq";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { TaskType } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";

import { requireEnv } from "./env.js";

const GROQ_API_KEY = requireEnv("GROQ_API_KEY");
const GOOGLE_API_KEY = requireEnv("GOOGLE_API_KEY");
const PINECONE_API_KEY = requireEnv("PINECONE_API_KEY");
const PINECONE_INDEX = requireEnv("PINECONE_INDEX");

export function createLLM(temperature = 0) {
  return new ChatGroq({
    apiKey: GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature,
  });
}

export function createEmbeddings() {
  return new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-2",
    taskType: TaskType.RETRIEVAL_DOCUMENT,
  });
}

let pineconeInstance: Pinecone | null = null;
export function createPineconeClient() {
  if (!pineconeInstance) {
    pineconeInstance = new Pinecone({ apiKey: PINECONE_API_KEY });
  }
  return pineconeInstance;
}

export function getPineconeIndexName() {
  return PINECONE_INDEX;
}

export type PineconeStoreOptions = {
  namespace?: string;
  maxConcurrency?: number;
};

export async function createPineconeStore(options: PineconeStoreOptions = {}) {
  const pineconeClient = createPineconeClient();
  const pineconeIndex = pineconeClient.Index(getPineconeIndexName());

  const storeOptions = {
    pineconeIndex,
    maxConcurrency: options.maxConcurrency ?? 5,
    ...(options.namespace ? { namespace: options.namespace } : {}),
  };

  return PineconeStore.fromExistingIndex(createEmbeddings(), storeOptions);
}
