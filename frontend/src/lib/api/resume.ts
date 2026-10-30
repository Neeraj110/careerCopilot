import { api } from "../api";
import type { ApiResponse, ATSResult, JDMatchResult, ImproveResult } from "@/types";

export const resumeApi = {
  checkATS: (documentId: string) =>
    api.post<ApiResponse<ATSResult>>(
      "/resume/ats-check",
      { documentId },
      { timeout: 120000 },
    ),

  jdMatch: (documentId: string, jd: string) =>
    api.post<ApiResponse<JDMatchResult>>(
      "/resume/jd-match",
      { documentId, jd },
      { timeout: 120000 },
    ),

  improve: (documentId: string, jdText: string) =>
    api.post<ApiResponse<ImproveResult>>(
      "/resume/improve",
      { documentId, jdText },
      { timeout: 180000 },
    ),
};
