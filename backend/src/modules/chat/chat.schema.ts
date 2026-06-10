import { z } from "zod";

export const createChatSchema = z.object({
  documentId: z.string().uuid("Invalid document ID").optional(),
  title: z.string().optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

export const chatParamsSchema = z.object({
  chatId: z.string().uuid("Invalid chat ID"),
});
