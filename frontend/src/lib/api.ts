import { useAuthStore } from "./store/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Types ──
export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  jobType?: string;
  description: string;
  skills: string[];
  sourceUrl: string;
  scrapedAt?: string;
  expiresAt?: string;
};

export type MatchedJob = {
  job: Job;
  matchScore: number;
  matchedSkills: string[];
};

export type ATSAnalysisResult = {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
};

export type ResumeSuggestedEdit = {
  section: string;
  original: string;
  improved: string;
};

export type ResumeAlignmentResult = {
  alignmentScore: number;
  strongMatches: string[];
  gaps: string[];
  suggestedEdits: ResumeSuggestedEdit[];
  summaryAdvice: string;
};

// ── Fetch helpers ──

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
  _retry = false,
): Promise<T> {
  const token =
    typeof window !== "undefined" ? useAuthStore.getState().accessToken : null;
  const headers = new Headers(options?.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && !(options?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  if (
    res.status === 401 &&
    !_retry &&
    path !== "/api/users/refresh" &&
    path !== "/api/users/login"
  ) {
    if (typeof window !== "undefined") {
      await useAuthStore.getState().hydrate();
      const newToken = useAuthStore.getState().accessToken;
      if (newToken) {
        headers.set("Authorization", `Bearer ${newToken}`);
        const retryRes = await fetch(`${API_BASE}${path}`, {
          credentials: "include",
          ...options,
          headers,
        });
        if (!retryRes.ok) {
          throw new Error("API Error after retry");
        }
        return retryRes.json();
      }
    }
  }

  if (!res.ok) {
    let msg = `API Error: ${res.statusText}`;
    try {
      const data = await res.json();
      msg = data.message || data.error || msg;
    } catch {}
    throw new Error(msg);
  }

  return res.json();
}

// ── API Functions ──

export async function uploadResume(
  file: File,
): Promise<{ message: string; resumeId: string }> {
  const formData = new FormData();
  formData.append("cv", file);

  return apiFetch<{ message: string; resumeId: string }>(`/api/resume/upload`, {
    method: "POST",
    body: formData,
  });
}

export async function getMatchedJobs(
  page = 1,
  limit = 5,
): Promise<{ jobs: MatchedJob[]; totalPages: number; totalJobs: number }> {
  return apiFetch<{
    jobs: MatchedJob[];
    totalPages: number;
    totalJobs: number;
  }>(`/api/jobs/matches?page=${page}&limit=${limit}`);
}

export async function getAtsScore(
  jobDescription: string,
): Promise<ATSAnalysisResult> {
  return apiFetch<ATSAnalysisResult>(`/api/resume/ats-score`, {
    method: "POST",
    body: JSON.stringify({ jobDescription }),
  });
}

export async function alignResume(
  jobDescription: string,
): Promise<ResumeAlignmentResult> {
  return apiFetch<ResumeAlignmentResult>(`/api/resume/align`, {
    method: "POST",
    body: JSON.stringify({ jobDescription }),
  });
}

export type ResumeStatus = {
  hasResume: boolean;
  activeResumeId: string | null;
  skills: string[];
  fileName: string | null;
  fileUrl: string | null;
  hasVector: boolean;
  resumes: Array<{
    id: string;
    fileName: string;
    fileUrl: string | null;
    createdAt: string;
    updatedAt: string;
    skillsCount: number;
    hasVector: boolean;
    isActive: boolean;
  }>;
};

export async function getResumeStatus(): Promise<ResumeStatus> {
  return apiFetch<ResumeStatus>(`/api/resume/status`);
}

export async function selectActiveResume(
  resumeId: string,
): Promise<ResumeStatus> {
  return apiFetch<ResumeStatus>(`/api/resume/select`, {
    method: "POST",
    body: JSON.stringify({ resumeId }),
  });
}

export type JobDetail = {
  job: Job;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  application: { status: string; matchScore: number } | null;
};

export async function getJobById(id: string): Promise<JobDetail> {
  return apiFetch<JobDetail>(`/api/jobs/${id}`);
}

export type JobInsights = {
  improvements: string[];
  missingSkills: string[];
  studyPlan: string[];
  fitSummary: string;
  atsScore: number;
};

export async function getJobInsights(id: string): Promise<JobInsights> {
  return apiFetch<JobInsights>(`/api/jobs/${id}/insights`, { method: "POST" });
}

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function sendChatMessage(
  message: string,
  jobId?: string,
  conversationHistory: ChatMessage[] = [],
): Promise<{ message: string; jobId: string | null }> {
  return apiFetch<{ message: string; jobId: string | null }>(`/api/ai/chat`, {
    method: "POST",
    body: JSON.stringify({ message, jobId, conversationHistory }),
  });
}
