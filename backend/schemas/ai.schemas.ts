import { z } from "zod";

export const generateResourcesSchema = z.object({
  skills: z.array(z.string()).min(1, "At least one skill must be provided"),
});
