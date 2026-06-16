import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "../lib/api/documents";
import { useToast } from "../providers/ui-provider";

export const documentKeys = {
  all: ["documents"],
  list: () => [...documentKeys.all, "list"],
  detail: (id: string) => [...documentKeys.all, "detail", id],
};

export function useDocumentsList() {
  return useQuery({
    queryKey: documentKeys.list(),
    queryFn: () => documentsApi.getAll().then((res) => res.data || []),
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ file, title }: { file: File; title: string }) =>
      documentsApi.upload(file, title).then((r) => r.data ?? r),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: documentKeys.list() });
      toast.success(
        "Document uploaded",
        `Successfully uploaded ${data?.title || "file"}`
      );
    },
    onError: (e: any) => toast.error("Upload failed", e?.message),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentKeys.list() });
      toast.info("Document deleted", "");
    },
    onError: (e: any) => toast.error("Couldn't delete document", e?.message),
  });
}
