import { ChromaClient } from "chromadb";
import { config } from "../config";
import { embedTexts } from "./embeddings";

export const chroma = new ChromaClient({ path: config.chromaUrl });

export const getCollection = async () => {
  return chroma.getOrCreateCollection({
    name: "document_chunks_mistral",
    metadata: { "hnsw:space": "cosine" },
    // embeddingFunction: customEmbeddingFunction,
  });
};
