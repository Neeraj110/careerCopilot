import { prisma } from "../../infrastructure/prisma";
import { getCollection } from "../../infrastructure/chroma";
import { embedText } from "../../infrastructure/embeddings";
import { AppError } from "../../middlewares/errorHandler";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { config } from "../../config";

// ─── Gemini Chat Model ───────────────────────────────────────────

const chatModel = new ChatGoogleGenerativeAI({
  apiKey: config.geminiApiKey,
  model: "gemini-2.5-flash",
  temperature: 0.3,
});

// ─── Create Chat Session ─────────────────────────────────────────

export const createChat = async (
  userId: string,
  documentId?: string,
  title?: string
) => {
  // Verify document belongs to user if provided
  if (documentId) {
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new AppError("Document not found", 404);
    }

    if (document.status !== "COMPLETED") {
      throw new AppError("Document is still being processed", 400);
    }
  }

  return prisma.chat.create({
    data: {
      userId,
      documentId: documentId || null,
      title: title || "New Chat",
    },
  });
};

// ─── Send Message + Get AI Response (RAG) ────────────────────────

export const sendMessage = async (
  userId: string,
  chatId: string,
  userMessage: string
) => {
  // 1. Verify chat belongs to user
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId },
    include: {
      messages: { orderBy: { createdAt: "asc" }, take: 20 },
    },
  });

  if (!chat) {
    throw new AppError("Chat not found", 404);
  }

  // 2. Save user message to DB
  await prisma.message.create({
    data: {
      chatId,
      role: "USER",
      content: userMessage,
    },
  });

  // 3. Retrieve relevant chunks from ChromaDB
  const queryEmbedding = await embedText(userMessage);
  const collection = await getCollection();

  const whereFilter = chat.documentId
    ? { documentId: chat.documentId }
    : undefined;

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: 5,
    where: whereFilter,
  });

  const contextChunks = results.documents?.[0] || [];
  const sourceMetadatas = results.metadatas?.[0] || [];
  const contextText = contextChunks.filter(Boolean).join("\n\n---\n\n");

  // 4. Build message history for Gemini
  const systemPrompt = `You are a helpful AI assistant for Smart Desk — a document analysis tool.
You answer questions based on the provided context from the user's documents.
If the context doesn't contain relevant information, say so honestly.
Always cite which part of the context you're referencing.
Be concise and accurate.

CONTEXT FROM DOCUMENTS:
${contextText || "No relevant context found."}`;

  const messages: (SystemMessage | HumanMessage | AIMessage)[] = [
    new SystemMessage(systemPrompt),
  ];

  // Add chat history (last 20 messages)
  for (const msg of chat.messages) {
    if (msg.role === "USER") {
      messages.push(new HumanMessage(msg.content));
    } else if (msg.role === "AI") {
      messages.push(new AIMessage(msg.content));
    }
  }

  // Add current user message
  messages.push(new HumanMessage(userMessage));

  // 5. Call Gemini
  const aiResponse = await chatModel.invoke(messages);
  const aiContent =
    typeof aiResponse.content === "string"
      ? aiResponse.content
      : JSON.stringify(aiResponse.content);

  // 6. Build sources array
  const sources = sourceMetadatas
    .filter((m): m is Record<string, any> => m !== null)
    .map((m) => ({
      documentId: m.documentId,
      chunkId: m.chunkId,
      chunkIndex: m.chunkIndex,
    }));

  // 7. Save AI message to DB
  const aiMessage = await prisma.message.create({
    data: {
      chatId,
      role: "AI",
      content: aiContent,
      sources: sources.length > 0 ? sources : undefined,
    },
  });

  // 8. Update chat title if it's the first message
  if (chat.messages.length === 0) {
    const titleText =
      userMessage.length > 50
        ? userMessage.substring(0, 50) + "..."
        : userMessage;

    await prisma.chat.update({
      where: { id: chatId },
      data: { title: titleText },
    });
  }

  return {
    userMessage: { role: "USER", content: userMessage },
    aiMessage: { id: aiMessage.id, role: "AI", content: aiContent, sources },
  };
};

// ─── Get User's Chats ────────────────────────────────────────────

export const getUserChats = async (userId: string) => {
  return prisma.chat.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      document: { select: { id: true, title: true } },
      _count: { select: { messages: true } },
    },
  });
};

// ─── Get Chat with Messages ──────────────────────────────────────

export const getChatById = async (userId: string, chatId: string) => {
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      document: { select: { id: true, title: true, status: true } },
    },
  });

  if (!chat) {
    throw new AppError("Chat not found", 404);
  }

  return chat;
};

// ─── Delete Chat ─────────────────────────────────────────────────

export const deleteChat = async (userId: string, chatId: string) => {
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId },
  });

  if (!chat) {
    throw new AppError("Chat not found", 404);
  }

  await prisma.chat.delete({ where: { id: chatId } });

  return { message: "Chat deleted successfully" };
};
