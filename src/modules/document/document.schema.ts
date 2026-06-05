import { z } from "zod";

export const uploadDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const getDocumentParamsSchema = z.object({
  id: z.string().uuid("Invalid document ID"),
});
