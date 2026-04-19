import { ChatGroq } from "@langchain/groq";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is missing in environment variables`);
  }
  return value;
}

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
    apiKey: GOOGLE_API_KEY,
    model: "gemini-embedding-001",
    taskType: TaskType.RETRIEVAL_DOCUMENT,
  });
}

export function createPineconeClient() {
  return new Pinecone({ apiKey: PINECONE_API_KEY });
}

export function getPineconeIndexName() {
  return PINECONE_INDEX;
}
