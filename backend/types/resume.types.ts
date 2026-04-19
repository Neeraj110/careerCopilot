export type JobDescriptionInput = {
  jobDescription: string;
};

export type UploadCvResponse = {
  message: string;
  resumeId: string;
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
