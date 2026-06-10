import { Response } from "express";
import { prisma } from "../../infrastructure/prisma";
import { getCollection } from "../../infrastructure/chroma";
import { embedText } from "../../infrastructure/embeddings";
import { AppError } from "../../middlewares/errorHandler";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import { config } from "../../config";
import {
  DynamicRetrievalMode,
  GoogleSearchRetrievalTool,
} from "@google/generative-ai";

// ─── Gemini Chat Model ───────────────────────────────────────────

const ragModel = new ChatGoogleGenerativeAI({
  apiKey: config.geminiApiKey,
  model: "gemini-2.0-flash",
  temperature: 0.3,
  streaming: true,
});

const searchGroundedModel = new ChatGoogleGenerativeAI({
  apiKey: config.geminiApiKey,
  model: "gemini-2.0-flash",
  temperature: 1,
  streaming: true,
}).bindTools([
  {
    googleSearchRetrieval: {
      dynamicRetrievalConfig: {
        mode: DynamicRetrievalMode.MODE_DYNAMIC,
        dynamicThreshold: 0.3,
      },
    },
  } as GoogleSearchRetrievalTool,
]);

const buildDocumentPrompt = (contextText: string) =>
  `
You are SmartDesk AI — a highly intelligent document analysis assistant.

## Your Capabilities
- Deep document understanding and analysis
- Extracting key insights, patterns, and relationships
- Answering complex questions with precision
- Providing structured, well-formatted responses

## Behavior Rules
1. ALWAYS prioritize information from the document context
2. Quote specific parts of the document when relevant (use > blockquote)
3. If a question is partially answered by the document, answer that part 
   from the document and clearly state what is from your knowledge
4. Structure your response with headers when answering complex questions
5. Be concise but comprehensive — no fluff, no repetition
6. If you find contradictions in the document, point them out
7. For numerical data, always present in a clear format (tables if needed)

## Response Format
- Use markdown formatting (headers, bullets, bold, tables)
- Lead with the direct answer, then provide supporting details
- End with a "Key Takeaway" if the answer is complex

## Document Context
---
${contextText}
---

Remember: You are analyzing THIS specific document. Stay grounded in the provided context.
`.trim();

const buildSearchFallbackPrompt = () =>
  `
You are SmartDesk AI — an intelligent assistant with real-time web access.

## Context
The user has a document uploaded, but their current question goes beyond the document's scope.
You have access to Google Search for real-time, accurate information.

## Behavior Rules
1. Search for current, accurate information using Google Search
2. Clearly distinguish between search results and your own knowledge
3. Always mention the source/context of your information
4. For time-sensitive info (politics, sports, stocks), explicitly note 
   that data is real-time from search
5. Be conversational but precise
6. If asked about the uploaded document AND external info, handle both

## Response Format
- Direct answer first
- Supporting details with sources
- Use markdown for clarity
- For lists of facts, use bullet points
`.trim();

const buildGeneralPrompt = () =>
  `
You are SmartDesk AI — a powerful general-purpose AI assistant.

## Your Personality
- Intelligent, helpful, and direct
- You explain complex topics simply without dumbing them down
- You have opinions but present them as such
- You are curious and thorough

## Capabilities
- General knowledge across all domains
- Real-time information via Google Search
- Code writing, debugging, and explanation
- Mathematical reasoning and calculations  
- Creative writing and brainstorming
- Analysis and critical thinking

## Behavior Rules
1. Answer directly — no unnecessary preamble like "Great question!"
2. For factual queries, use Google Search for current accuracy
3. For coding questions, always provide working code with explanation
4. For complex topics, break down into digestible parts
5. If uncertain, say so explicitly rather than guessing
6. Match the user's tone — technical if they're technical, casual if casual

## Response Format
- Lead with the most important information
- Use markdown: headers for long responses, code blocks for code,
  tables for comparisons, bullets for lists
- Keep responses focused — expand only if necessary
- For multi-part questions, address each part clearly
`.trim();

const buildHistory = (messages: any[]): (HumanMessage | AIMessage)[] => {
  return messages
    .map((msg) => {
      if (msg.role === "USER") return new HumanMessage(msg.content);
      if (msg.role === "AI") return new AIMessage(msg.content);
      return null;
    })
    .filter(Boolean) as (HumanMessage | AIMessage)[];
};

const streamResponse = async (
  model: any,
  messages: (SystemMessage | HumanMessage | AIMessage)[],
  res: Response,
): Promise<string> => {
  let fullContent = "";

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable Nginx buffering

  const stream = await model.stream(messages);

  for await (const chunk of stream) {
    const text =
      typeof chunk.content === "string"
        ? chunk.content
        : chunk.content
            ?.filter((c: any) => c.type === "text")
            .map((c: any) => c.text)
            .join("") || "";

    if (text) {
      fullContent += text;
      // SSE format: "data: <content>\n\n"
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
  }

  // Stream end signal
  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);

  return fullContent;
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
  res: Response,
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
    const collection = await getCollection();

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: 5,
      where: { documentId: chat.documentId },
    });

    const contextChunks = results.documents?.[0] || [];
    const sourceMetadatas = results.metadatas?.[0] || [];
    const contextText = contextChunks.filter(Boolean).join("\n\n---\n\n");
    const hasContext = contextText.trim().length > 0;

    if (hasContext) {
      // Document context found — use RAG
      aiContent = await streamResponse(
        ragModel,
        [
          new SystemMessage(buildDocumentPrompt(contextText)),
          ...history,
          new HumanMessage(userMessage),
        ],
        res,
      );

      sources = sourceMetadatas
        .filter((m): m is Record<string, any> => m !== null)
        .map((m) => ({
          documentId: m.documentId,
          chunkId: m.chunkId,
          chunkIndex: m.chunkIndex,
        }));
    } else {
      // No document context — fall back to web search
      aiContent = await streamResponse(
        searchGroundedModel,
        [
          new SystemMessage(buildSearchFallbackPrompt()),
          ...history,
          new HumanMessage(userMessage),
        ],
        res,
      );
    }
  }
  // ─── Case 2: General chat ─────────────────────────────────────
  else {
    aiContent = await streamResponse(
      searchGroundedModel,
      [
        new SystemMessage(buildGeneralPrompt()),
        ...history,
        new HumanMessage(userMessage),
      ],
      res,
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

  // Send sources and messageId via SSE
  res.write(
    `data: ${JSON.stringify({
      messageId: aiMessage.id,
      sources,
    })}\n\n`,
  );

  res.end(); // Close SSE connection
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
