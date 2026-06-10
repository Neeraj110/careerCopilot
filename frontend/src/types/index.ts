// ─── User ────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  googleId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: { id: string; email: string };
  token: string;
}

// ─── Document ────────────────────────────────────────────────────

export type DocType = "PDF" | "DOCX" | "TXT";
export type DocStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface Document {
  id: string;
  userId: string;
  title: string;
  fileUrl: string;
  publicId: string;
  type: DocType;
  status: DocStatus;
  createdAt: string;
  updatedAt: string;
  _count?: {
    chunks: number;
    chats: number;
  };
}

export interface DocumentWithChunks extends Document {
  chunks: Chunk[];
}

export interface Chunk {
  id: string;
  documentId: string;
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// ─── Chat ────────────────────────────────────────────────────────

export type MsgRole = "USER" | "AI" | "SYSTEM";

export interface Chat {
  id: string;
  userId: string;
  documentId: string | null;
  title: string | null;
  createdAt: string;
  document?: { id: string; title: string; status?: string } | null;
  _count?: { messages: number };
}

export interface Message {
  id: string;
  chatId: string;
  role: MsgRole;
  content: string;
  sources: ChatSource[] | null;
  createdAt: string;
}

export interface ChatSource {
  documentId: string;
  chunkId: string;
  chunkIndex: number;
}

export interface ChatWithMessages extends Chat {
  messages: Message[];
}

// ─── Resume ──────────────────────────────────────────────────────

export interface ATSResult {
  atsScore: number;
  role: string;
  missingKeywords: string[];
  presentKeywords: string[];
  industryTrends: string[];
  formattingIssues: string[];
  improvements: ATSImprovement[];
  overallFeedback: string;
}

export interface ATSImprovement {
  section: string;
  current: string;
  suggested: string;
  reason: string;
}

export interface JDMatchResult {
  matchScore: number;
  role: string;
  strengths: string[];
  missingSkills: string[];
  partialMatches: PartialMatch[];
  recommendations: JDRecommendation[];
  keywordsMissing: string[];
  overallFeedback: string;
}

export interface PartialMatch {
  required: string;
  candidate: string;
  gap: string;
}

export interface JDRecommendation {
  skill: string;
  reason: string;
  resource: string;
}

export interface ImproveResult {
  originalBullets: string[];
  improvedBullets: string[];
  validationScore: number;
  gaps: string[];
  retryCount: number;
}

// ─── Roadmap ─────────────────────────────────────────────────────

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export interface RoadmapResource {
  title: string;
  url: string;
  type: string;
  score?: number;
}

export interface RoadmapWeek {
  week: number;
  title: string;
  topics: string[];
  resources: RoadmapResource[];
  project?: string;
  interviewQuestions?: string[];
}

export interface RoadmapResult {
  roadmap: {
    skill: string;
    level: string;
    goal: string;
    weeks: RoadmapWeek[];
  };
  resources: RoadmapResource[];
}

// ─── API Response Wrapper ────────────────────────────────────────

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}
