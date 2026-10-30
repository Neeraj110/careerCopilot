-- Indexes for authenticated list and retrieval query paths.
CREATE INDEX "Document_userId_createdAt_idx" ON "Document"("userId", "createdAt" DESC);
CREATE INDEX "Chunk_documentId_idx" ON "Chunk"("documentId");
CREATE INDEX "Chat_userId_createdAt_idx" ON "Chat"("userId", "createdAt" DESC);
CREATE INDEX "Chat_documentId_idx" ON "Chat"("documentId");
CREATE INDEX "Message_chatId_createdAt_idx" ON "Message"("chatId", "createdAt" DESC);
CREATE INDEX "Resume_userId_updatedAt_idx" ON "Resume"("userId", "updatedAt" DESC);

-- HNSW accelerates vector similarity search while the documentId index narrows
-- the candidate set for document-aware chat retrieval.
CREATE INDEX "Chunk_embedding_hnsw_idx"
  ON "Chunk" USING hnsw ("embedding" vector_cosine_ops);
