import { ChromaClient } from "chromadb";
import { config } from "../config";

export const chroma = new ChromaClient({ path: config.chromaUrl });

/**
 * Get or create the main document chunks collection.
 * Uses cosine similarity for semantic search.
 */
export const getCollection = async () => {
  return chroma.getOrCreateCollection({
    name: "document_chunks",
    metadata: { "hnsw:space": "cosine" },
  });
};
