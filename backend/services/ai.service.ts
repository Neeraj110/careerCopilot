import { createLLM } from "../libs/ai.js";
import { z } from "zod";

const resourceResponseSchema = z.object({
  resources: z.array(
    z.object({
      title: z.string(),
      detail: z.string(),
      type: z.enum(["Course", "Article", "Documentation", "Video", "Interview Prep", "Learning Path", "Checklist", "Guide"]),
      estimatedTime: z.string(),
      searchQuery: z.string(),
    })
  )
});

class AiService {
  async generateLearningResources(skills: string[]) {
    const llm = createLLM(0.7);
    const skillsList = skills.join(", ");
    
    const prompt = `You are an expert technical career coach and educator. 
The user wants to learn or improve the following skills: ${skillsList}.

Generate a list of exactly 6 high-quality, actionable learning resources to help them master these skills.
Return ONLY valid JSON in the exact following format, with no markdown formatting around it:
{
  "resources": [
    {
      "title": "Resource Name",
      "detail": "Why this is useful and what they will learn.",
      "type": "Course" | "Article" | "Documentation" | "Video" | "Interview Prep" | "Learning Path" | "Checklist" | "Guide",
      "estimatedTime": "e.g., 2 hours, 4 weeks",
      "searchQuery": "A highly specific Google or YouTube search query to find this exact resource"
    }
  ]
}

Ensure the output is strict, parsable JSON. Do not wrap it in \`\`\`json ... \`\`\`.`;

    const response = await llm.invoke(prompt);
    
    try {
      const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
      const cleanedContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedContent);
      return resourceResponseSchema.parse(parsed);
    } catch (error) {
      console.error("Failed to parse LLM resource response:", error);
      throw new Error("Failed to generate resources from AI.");
    }
  }
}

export const aiService = new AiService();
