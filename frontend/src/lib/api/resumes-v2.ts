import { api } from "../api";

// ─── Normalizers ──────────────────────────────────────────────────────────────
// The backend returns slightly different field names than what the UI components
// expect (copied from demo-frontend). We normalize here so no component changes
// are needed.

function normalizeResume(r: any) {
  return {
    ...r,
    id: r.id ?? r._id,
    _id: r.id ?? r._id,
  };
}

function normalizeVersion(v: any) {
  return {
    ...v,
    id: v.id ?? v._id,
    _id: v.id ?? v._id,
  };
}

function normalizeScoreBreakdown(sb: any) {
  if (!sb) return sb;
  // Backend returns { formatting, keywords, experience, skills, overall }
  // Component expects { keywords, formatting, impact, clarity }
  return {
    keywords: sb.keywords ?? 0,
    formatting: sb.formatting ?? 0,
    // Map backend fields to what the radar chart expects
    impact: sb.experience ?? sb.impact ?? 0,
    clarity: sb.skills ?? sb.clarity ?? 0,
  };
}

function normalizeIssue(issue: any) {
  return {
    ...issue,
    // Backend uses "description" and has no "fix" — map to component's expected keys
    explanation: issue.explanation ?? issue.description ?? "",
    fix: issue.fix ?? issue.section ? `Focus on the ${issue.section} section.` : undefined,
  };
}

function normalizeRewrite(rw: any) {
  return {
    ...rw,
    // Backend uses "id" and "reason" — components check "id" already (updated)
    // but also map "reason" → "rationale" for the tooltip
    id: rw.id ?? rw._id,
    rationale: rw.rationale ?? rw.reason ?? "",
  };
}

function normalizeAnalysis(a: any) {
  if (!a) return a;
  return {
    ...a,
    id: a.id ?? a._id,
    _id: a.id ?? a._id,
    scoreBreakdown: normalizeScoreBreakdown(a.scoreBreakdown),
    issues: (a.issues || []).map(normalizeIssue),
    strengths: (a.strengths || []).map((s: any) => ({
      ...s,
      // Backend uses "description", component uses "note"
      note: s.note ?? s.description ?? "",
    })),
    bulletRewrites: (a.bulletRewrites || []).map(normalizeRewrite),
    keywordsPresent: a.keywordsPresent || [],
    keywordsMissing: a.keywordsMissing || [],
  };
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const resumesApi = {
  list: () =>
    api
      .get<any>("/resumes")
      .then((r) => ({ resumes: (r.data?.resumes ?? r.resumes ?? []).map(normalizeResume) })),

  get: (id: string) =>
    api.get<any>(`/resumes/${id}`).then((r) => {
      const payload = r.data ?? r;
      return {
        resume: normalizeResume(payload.resume),
        versions: (payload.versions || []).map(normalizeVersion),
      };
    }),

  getVersion: (id: string, versionId: string) =>
    api
      .get<any>(`/resumes/${id}/versions/${versionId}`)
      .then((r) => ({ version: normalizeVersion(r.data?.version ?? r.version) })),

  createFromDocument: (documentId: string) =>
    api
      .post<any>("/resumes", { documentId })
      .then((r) => ({ resume: normalizeResume(r.data?.resume ?? r.resume ?? r) })),

  remove: (id: string) => api.delete<any>(`/resumes/${id}`).then((r) => r.data ?? r),

  analyze: (id: string, body: { versionId: string; targetRole?: string }) =>
    api
      .post<any>(`/resumes/${id}/analyze`, body)
      .then((r) => ({ analysis: normalizeAnalysis(r.data?.analysis ?? r.analysis) })),

  analysisForVersion: (id: string, versionId: string) =>
    api
      .get<any>(`/resumes/${id}/versions/${versionId}/analysis`)
      .then((r) => ({ analysis: normalizeAnalysis(r.data?.analysis ?? r.analysis) })),

  rewrite: (id: string, body: { analysisId: string; rewriteIds?: string[] }) =>
    api.post<any>(`/resumes/${id}/rewrite`, body).then((r) => {
      const payload = r.data ?? r;
      return {
        version: normalizeVersion(payload.version),
        appliedCount: payload.appliedCount,
      };
    }),

  diff: (id: string, from: string, to: string, mode = "words") =>
    api
      .get<any>(`/resumes/${id}/diff?from=${from}&to=${to}&mode=${mode}`)
      .then((r) => {
        // Backend: { status, data: { parts, stats } }
        // Fetch wrapper returns raw JSON, so r = { status, data: {...} }
        return r.data ?? r;
      }),
};
