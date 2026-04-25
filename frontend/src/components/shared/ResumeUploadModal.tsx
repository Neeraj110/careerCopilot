"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, FileText, CheckCircle2, X, Sparkles, AlertCircle } from "lucide-react";
import { uploadResume, getResumeStatus } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface Props {
  onClose: () => void;
}

type UploadState = "idle" | "dragging" | "uploading" | "processing" | "success" | "error";

export default function ResumeUploadModal({ onClose }: Props) {
  const [state, setState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Animate progress bar during upload/processing
  useEffect(() => {
    if (state === "uploading") {
      setProgress(0);
      const timer = setInterval(() => {
        setProgress((p) => Math.min(p + 3, 70));
      }, 100);
      return () => clearInterval(timer);
    }
    if (state === "processing") {
      const timer = setInterval(() => {
        setProgress((p) => Math.min(p + 1, 95));
      }, 200);
      return () => clearInterval(timer);
    }
    if (state === "success") {
      setProgress(100);
    }
  }, [state]);

  const handleFile = useCallback(async (f: File) => {
    if (f.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      setState("error");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB.");
      setState("error");
      return;
    }

    setFile(f);
    setError("");
    setState("uploading");

    try {
      await uploadResume(f);
      setState("processing");

      // Poll until skills are extracted (backend is async)
      let attempts = 0;
      const poll = async () => {
        attempts++;
        const status = await getResumeStatus();
        if (status.skills.length > 0 || attempts >= 12) {
          setState("success");
          // Invalidate all job queries so the new resume's matches load fresh
          await queryClient.invalidateQueries({ queryKey: ["matchedJobs"] });
          setTimeout(onClose, 1800);
        } else {
          setTimeout(poll, 2500);
        }
      };
      setTimeout(poll, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setState("error");
    }
  }, [onClose, queryClient]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setState("idle");
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const isWorking = state === "uploading" || state === "processing";

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
    >
      {/* Card */}
      <div className="relative w-full max-w-lg bg-[#131c30] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden animate-fade-in">
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-white text-lg">Upload Your Resume</h2>
              <p className="text-on-surface-variant text-xs mt-0.5">
                We &apos ll extract your skills and find matching jobs
              </p>
            </div>
          </div>
          {!isWorking && state !== "success" && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          {/* Drop zone */}
          {state !== "success" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setState("dragging"); }}
              onDragLeave={() => setState("idle")}
              onDrop={onDrop}
              onClick={() => !isWorking && inputRef.current?.click()}
              className={cn(
                "relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center py-10 gap-3",
                state === "dragging"
                  ? "border-primary bg-primary/10 scale-[1.01]"
                  : isWorking
                  ? "border-primary/30 bg-primary/5 cursor-default"
                  : state === "error"
                  ? "border-error/50 bg-error/5 hover:border-error/70"
                  : "border-white/10 bg-white/3 hover:border-primary/40 hover:bg-primary/5",
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={onInputChange}
              />

              {isWorking ? (
                <>
                  <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                  <p className="text-sm font-medium text-on-surface-variant">
                    {state === "uploading" ? "Uploading resume…" : "Extracting skills with AI…"}
                  </p>
                </>
              ) : state === "error" ? (
                <>
                  <AlertCircle className="w-10 h-10 text-error" />
                  <p className="text-sm text-error font-medium">{error}</p>
                  <p className="text-xs text-on-surface-variant">Click to try again</p>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-primary/60" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">
                      Drop your PDF here
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      or <span className="text-primary underline underline-offset-2">browse files</span>
                    </p>
                  </div>
                  {file && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-lg text-xs text-on-surface-variant mt-1">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      <span className="truncate max-w-[200px]">{file.name}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Progress bar */}
          {(isWorking || state === "success") && (
            <div className="space-y-2">
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-on-surface-variant">
                <span>
                  {state === "uploading"
                    ? "Uploading to cloud…"
                    : state === "processing"
                    ? "AI is reading your resume…"
                    : "Done! Finding your job matches…"}
                </span>
                <span className="font-mono">{progress}%</span>
              </div>
            </div>
          )}

          {/* Success state */}
          {state === "success" && (
            <div className="flex flex-col items-center py-4 gap-3 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-bold text-white">Resume processed!</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Finding your best job matches…
                </p>
              </div>
            </div>
          )}

          {/* Format hint */}
          {!isWorking && state !== "success" && (
            <p className="text-center text-[11px] text-outline">
              PDF format only · Max 10MB · Your data is encrypted and private
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
