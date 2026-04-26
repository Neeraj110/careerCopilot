import type { Response } from "express";
import { buildChatPipeline, type ChatMessage } from "../agent/chatPipeline.js";
import { generateResourcesSchema } from "../schemas/ai.schemas.js";
import { aiService } from "../services/ai.service.js";
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

  async generateResources(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const parsedBody = generateResourcesSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }

      const result = await aiService.generateLearningResources(
        parsedBody.data.skills
      );
      return res.json(result);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Failed to generate resources";
      return res.status(500).json({ message });
    }
  }
}

export const aiController = new AiController();
