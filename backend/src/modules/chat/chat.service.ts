import { Response } from "express";
import { prisma } from "../../infrastructure/prisma";
import { embedText } from "../../infrastructure/embeddings";
import { AppError } from "../../middlewares/errorHandler";
import { ChatMistralAI } from "@langchain/mistralai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import { config } from "../../config";
import {
  buildDocumentPrompt,
  buildSearchFallbackPrompt,
  buildGeneralPrompt,
} from "./chat.prompts";// ─── Gemini Chat Model ───────────────────────────────────────────

const ragModel = new ChatMistralAI({
  apiKey: config.mistralApiKey,
  model: "mistral-large-latest",
  temperature: 0.3,
});

const searchGroundedModel = new ChatMistralAI({
  apiKey: config.mistralApiKey,
  model: "mistral-large-latest",
  temperature: 1,
});



const buildHistory = (messages: any[]): (HumanMessage | AIMessage)[] => {
  return messages
    .map((msg) => {
      if (msg.role === "USER") return new HumanMessage(msg.content);
      if (msg.role === "AI") return new AIMessage(msg.content);
      return null;
    })
    .filter(Boolean) as (HumanMessage | AIMessage)[];
};

const generateResponse = async (
  model: any,
  messages: (SystemMessage | HumanMessage | AIMessage)[],
): Promise<string> => {
  const response = await model.invoke(messages);
  return typeof response.content === "string"
    ? response.content
    : response.content
        ?.filter((c: any) => c.type === "text")
        .map((c: any) => c.text)
        .join("") || "";
};

// ─── Create Chat Session ─────────────────────────────────────────

export const createChat = async (
  userId: string,
  documentId?: string,
  title?: string,
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
  userMessage: string,
) => {
  // 1. Verify chat belongs to user
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId },
    include: {
      messages: { orderBy: { createdAt: "asc" }, take: 20 },
    },
  });
  if (!chat) throw new AppError("Chat not found", 404);

  // 2. Save user message
  await prisma.message.create({
    data: { chatId, role: "USER", content: userMessage },
  });

  // 3. Build chat history
  const history = buildHistory(chat.messages);

  let aiContent = "";
  let sources: any[] = [];

  // ─── Case 1: Document chat ───────────────────────────────────
  if (chat.documentId) {
    const queryEmbedding = await embedText(userMessage);
    const vectorStr = `[${queryEmbedding.join(",")}]`;

    const similarChunks = await prisma.$queryRaw<Array<{
      id: string;
      content: string;
      metadata: any;
    }>>`
      SELECT id, content, metadata
      FROM "Chunk"
      WHERE "documentId" = ${chat.documentId}
      ORDER BY embedding <=> ${vectorStr}::vector
      LIMIT 5
    `;

    const contextChunks = similarChunks.map((c) => c.content);
    const sourceMetadatas = similarChunks.map((c) => ({
      documentId: chat.documentId,
      chunkId: c.id,
      chunkIndex: c.metadata?.chunkIndex,
    }));
    
    const contextText = contextChunks.filter(Boolean).join("\n\n---\n\n");
    const hasContext = contextText.trim().length > 0;

    if (hasContext) {
      // Document context found — use RAG
      aiContent = await generateResponse(
        ragModel,
        [
          new SystemMessage(buildDocumentPrompt(contextText)),
          ...history,
          new HumanMessage(userMessage),
        ],
      );

      sources = sourceMetadatas;
    } else {
      // No document context — fall back to web search
      aiContent = await generateResponse(
        searchGroundedModel,
        [
          new SystemMessage(buildSearchFallbackPrompt()),
          ...history,
          new HumanMessage(userMessage),
        ],
      );
    }
  }
  // ─── Case 2: General chat ─────────────────────────────────────
  else {
    aiContent = await generateResponse(
      searchGroundedModel,
      [
        new SystemMessage(buildGeneralPrompt()),
        ...history,
        new HumanMessage(userMessage),
      ],
    );
  }

  // 4. Save AI message to database
  const aiMessage = await prisma.message.create({
    data: {
      chatId,
      role: "AI",
      content: aiContent,
      sources: sources.length > 0 ? sources : undefined,
    },
  });

  // 5. First message title update
  if (chat.messages.length === 0) {
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        title:
          userMessage.length > 50
            ? userMessage.substring(0, 50) + "..."
            : userMessage,
      },
    });
  }

  return {
    ...aiMessage,
    sources,
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
