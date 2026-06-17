import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resumesApi } from "../lib/api/resumes-v2";
import { documentsApi } from "../lib/api/documents";
import { dashboardKey } from "./use-dashboard-v2";
import { useToast } from "../providers/ui-provider";

export const resumeKeys = {
  all: ["resumes"],
  list: () => [...resumeKeys.all, "list"],
  detail: (id: string) => [...resumeKeys.all, "detail", id],
  analyses: (id: string) => [...resumeKeys.all, "analyses", id],
  versionAnalysis: (id: string, versionId: string) => [...resumeKeys.all, "analysis", id, versionId],
};

export function useResumesList() {
  return useQuery({
    queryKey: resumeKeys.list(),
    queryFn: () => resumesApi.list().then((d) => d.resumes),
  });
}

export function useResume(id: string) {
  return useQuery({
    queryKey: resumeKeys.detail(id),
    queryFn: () => resumesApi.get(id),
    enabled: !!id,
  });
}

export function useFullVersion(id: string, versionId: string) {
  return useQuery({
    queryKey: ["resumes", "fullVersion", id, versionId],
    queryFn: () => resumesApi.getVersion(id, versionId).then((d) => d.version),
    enabled: !!id && !!versionId,
  });
}

export function useAnalysisForVersion(id: string, versionId: string) {
  return useQuery({
    queryKey: resumeKeys.versionAnalysis(id, versionId),
    queryFn: () => resumesApi.analysisForVersion(id, versionId).then((d) => d.analysis),
    enabled: !!id && !!versionId,
    retry: false,
  });
}

export function useUploadResume() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ file, title }: { file: File; title?: string }) => {
      const res = await documentsApi.upload(file, title || file.name);
      const doc = res.data;
      const docId = doc?.id || (doc as any)?._id;
      if (!docId) throw new Error("Document upload failed");
      return resumesApi.createFromDocument(docId);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: resumeKeys.list() });
      qc.invalidateQueries({ queryKey: dashboardKey });
      toast.success(
        "Resume uploaded",
        `${data?.resume?.title || "Resume"} · parsed and ready as V1`
      );
    },
    onError: (e: any) => toast.error("Upload failed", e?.message),
  });
}

export function useAnalyzeResume(id: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (body: { versionId: string; targetRole?: string }) => resumesApi.analyze(id, body),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: resumeKeys.detail(id) });
      qc.invalidateQueries({ queryKey: resumeKeys.analyses(id) });
      qc.invalidateQueries({ queryKey: dashboardKey });
      if (data?.analysis?.versionId) {
        qc.invalidateQueries({
          queryKey: resumeKeys.versionAnalysis(id, data.analysis.versionId),
        });
      }
      toast.success(
        "Analysis complete",
        `ATS score ${data?.analysis?.atsScore ?? "—"} / 100`
      );
    },
    onError: (e: any) => toast.error("Analysis failed", e?.message),
  });
}

export function useApplyRewrites(id: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (body: { analysisId: string; rewriteIds?: string[] }) => resumesApi.rewrite(id, body),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: resumeKeys.detail(id) });
      qc.invalidateQueries({ queryKey: resumeKeys.list() });
      qc.invalidateQueries({ queryKey: dashboardKey });
      toast.success(
        `${data?.appliedCount || ""} bullet${
          data?.appliedCount === 1 ? "" : "s"
        } applied`.trim(),
        `${data?.version?.label || "New version"} created`
      );
    },
    onError: (e: any) => toast.error("Couldn't apply rewrites", e?.message),
  });
}

export function useDeleteResume() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => resumesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resumeKeys.list() });
      qc.invalidateQueries({ queryKey: dashboardKey });
      toast.info("Resume deleted", "");
    },
    onError: (e: any) => toast.error("Couldn't delete resume", e?.message),
  });
}

export function useDiff(id: string, from: string, to: string, mode: "words" | "lines" = "words") {
  return useQuery({
    queryKey: ["resumes", "diff", id, from, to, mode],
    queryFn: () => resumesApi.diff(id, from, to, mode),
    enabled: !!id && !!from && !!to && from !== to,
  });
}
