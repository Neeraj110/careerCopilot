// src/types/index.ts

// ==========================================
// 1. User & Auth Types
// ==========================================
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  headline?: string;
  skills?: string[];
  experienceLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface User {
  id: string;
  email: string;
  role: Role;
  profile?: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: Pick<User, 'id' | 'email' | 'role'>;
  token: string;
}

// ==========================================
// 2. Document & Vector Types
// ==========================================
export enum DocType {
  PDF = 'PDF',
  DOCX = 'DOCX',
  TXT = 'TXT',
}

export enum DocStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface DocumentMetadata {
  originalName: string;
  size: number;
  pageCount?: number;
}

export interface ChunkMetadata {
  pageNumber?: number;
  loc?: { lines: { from: number; to: number } };
}

// ==========================================
// 3. Chat & RAG Types
// ==========================================
export enum MsgRole {
  USER = 'USER',
  AI = 'AI',
  SYSTEM = 'SYSTEM',
}

export interface MessageSource {
  documentId: string;
  chunkId: string;
  contentSnippet: string;
  pageNumber?: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: MsgRole;
  content: string;
  sources?: MessageSource[];
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  documentId?: string;
  title?: string;
  messages: ChatMessage[];
  createdAt: Date;
}

// ==========================================
// 4. LangGraph Workflow States
// ==========================================
export interface DocumentChatState {
  question: string;
  chatHistory: ChatMessage[];
  context: string[];
  answer: string;
  sources: MessageSource[];
}

export interface ResumeAnalysisState {
  resumeText: string;
  parsedData: Record<string, any>;
  atsScore: number;
  formattingIssues: string[];
  missingSkills: string[];
  report: ResumeATSReport;
}

export interface ResumeMatchState {
  resumeText: string;
  jdText: string;
  matchScore: number;
  gapAnalysis: Record<string, string>;
  recommendations: string[];
}

export interface RoadmapState {
  skill: string;
  level: string;
  target: string;
  searchQueries: string[];
  resources: LearningResource[];
  roadmap: LearningRoadmap;
}

// ==========================================
// 5. Resume Intelligence Types
// ==========================================
export interface ResumeATSReport {
  score: number;
  readability: string;
  keywordDensity: Record<string, number>;
  actionVerbsUsed: string[];
  missingSections: string[];
  feedback: string[];
}

// ==========================================
// 6. Learning Roadmap Types
// ==========================================
export interface LearningResource {
  title: string;
  url: string;
  type: 'Article' | 'Course' | 'Video' | 'Documentation' | 'Book';
  relevanceScore: number;
}

export interface RoadmapMilestone {
  week: number;
  focus: string;
  resources: LearningResource[];
  projectIdea?: string;
}

export interface LearningRoadmap {
  skill: string;
  targetGoal: string;
  milestones: RoadmapMilestone[];
  interviewPrepPlan?: string[];
}
