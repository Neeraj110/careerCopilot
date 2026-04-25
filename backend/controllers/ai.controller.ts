import type { Response } from "express";
import { buildChatPipeline, type ChatMessage } from "../agent/chatPipeline.js";
import type { AuthenticatedRequest } from "../types/auth.types.js";

class AiController {
  async chat(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { message, jobId, conversationHistory = [] } = req.body as {
        message: string;
        jobId?: string;
        conversationHistory?: ChatMessage[];
      };

      if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ message: "Message is required" });
      }

      const pipeline = buildChatPipeline();
      const output = await pipeline.invoke({
        userId: req.user.id,
        message: message.trim(),
        jobId: jobId || undefined,
        conversationHistory,
        resumeContext: "",
        jobContext: "",
        ragContext: "",
        response: "",
      });

      return res.json({
        message: output.response,
        jobId: jobId || null,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate response";
      return res.status(500).json({ message });
    }
  }
}

export const aiController = new AiController();
