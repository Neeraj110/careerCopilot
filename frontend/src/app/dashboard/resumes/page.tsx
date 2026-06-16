"use client";

import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardTitle, CardDescription, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ResumeRow } from "@/components/resume/resume-row";
import { useResumesList } from "@/hooks/use-resumes";
import { documentsApi } from "@/lib/api/documents";
import { resumeApi } from "@/lib/api/resume";
import { resumesApi } from "@/lib/api/resumes-v2";
import type { Document } from "@/types";
import { useState, useEffect } from "react";

export default function Resumes() {
  const router = useRouter();
  const { data: resumes, isLoading: isLoadingResumes } = useResumesList();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    documentsApi.getAll().then(res => setDocuments((res.data as unknown as Document[]) || [])).catch(console.error);
  }, []);

  async function handleCreate() {
    if (!selectedDocId) return;
    setIsCreating(true);
    try {
      const res = await resumesApi.createFromDocument(selectedDocId);
      const newResumeId = res?.resume?.id || res?.resume?._id || res?.id || res?._id;
      if (newResumeId) {
        router.push(`/dashboard/resumes/${newResumeId}`);
      } else {
        console.error("No resume ID found in response", res);
      }
    } catch (err) {
      console.error(err);
      setIsCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your Resumes"
        description="Upload a new one or pick up where you left off."
        actions={
          <Button onClick={() => router.push("/dashboard/documents")}>
            Upload Document
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5">
          <Card className="h-fit">
            <CardHeader>
              <div>
                <CardTitle className="text-base">Create a Resume</CardTitle>
                <CardDescription className="mt-1">
                  Select a document to extract text and create version V1.
                </CardDescription>
              </div>
            </CardHeader>
            <div className="p-6 pt-0 space-y-4">
              <Select onValueChange={setSelectedDocId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an uploaded document" />
                </SelectTrigger>
                <SelectContent>
                  {documents.map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="text-xs text-ink-muted text-center">
                Don't see your document?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/documents")}
                  className="text-primary hover:underline font-medium cursor-pointer"
                >
                  Upload one in Documents
                </button>
              </div>

              <Button 
                onClick={handleCreate} 
                disabled={!selectedDocId || isCreating} 
                className="w-full"
              >
                {isCreating ? "Creating..." : "Start Building"}
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-3">
          {isLoadingResumes && (
            <>
              <Skeleton className="h-[88px] rounded-2xl" />
              <Skeleton className="h-[88px] rounded-2xl" />
              <Skeleton className="h-[88px] rounded-2xl" />
            </>
          )}

          {!isLoadingResumes && resumes?.length === 0 && (
            <EmptyState
              icon={FileText}
              title="No resumes yet"
              description="Drop your first PDF on the left to get started — we'll parse it, score it, and suggest stronger bullets."
            />
          )}

          {!isLoadingResumes &&
            resumes?.map((r: any) => <ResumeRow key={r._id || r.id} resume={r} />)}
        </div>
      </div>
    </div>
  );
}
