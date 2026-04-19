"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Trash2, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { uploadResume } from "@/lib/api";

type UploadState = "idle" | "uploading" | "complete" | "error";

export default function ResumeUploadPage() {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [error, setError] = useState("");

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = async (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF or DOCX file.");
      setUploadState("error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB.");
      setUploadState("error");
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(1) + " MB");
    setUploadState("uploading");
    setError("");

    try {
      await uploadResume(file);
      setUploadState("complete");
    } catch (err: any) {
      setError(err.message || "Failed to upload resume.");
      setUploadState("error");
    }
  };

  const resetUpload = () => {
    setUploadState("idle");
    setFileName("");
    setFileSize("");
    setError("");
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-headline font-extrabold text-3xl lg:text-4xl tracking-tight text-on-surface mb-2">
          Resume Upload
        </h1>
        <p className="text-on-surface-variant text-sm lg:text-base">
          Upload your latest resume for AI analysis and job matching.
        </p>
      </div>

      {/* Upload Zone */}
      {uploadState === "idle" || uploadState === "error" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "bg-surface-container rounded-2xl p-8 lg:p-16 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer border-2 border-dashed",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-outline-variant/20 hover:border-primary/30"
          )}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Upload
              className={cn(
                "w-8 h-8 transition-transform",
                isDragging
                  ? "text-primary scale-110"
                  : "text-on-surface-variant"
              )}
            />
          </div>
          <h3 className="font-headline text-xl font-bold text-white mb-2">
            Drag and drop your resume
          </h3>
          <p className="text-on-surface-variant text-sm mb-6">
            PDF, DOCX up to 10MB
          </p>
          <label className="bg-surface-container-highest text-on-surface px-6 py-3 rounded-xl font-bold text-sm hover:bg-surface-bright transition-colors cursor-pointer btn-press">
            Browse Files
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
          {error && (
            <p className="mt-4 text-error text-sm font-medium">{error}</p>
          )}
        </div>
      ) : (
        /* Upload Progress */
        <div className="bg-surface-container rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{fileName}</p>
              <p className="text-xs text-on-surface-variant">
                {fileSize} • Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
            {uploadState === "complete" && (
              <button
                onClick={resetUpload}
                className="p-2 rounded-xl text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Progress bar */}
          {uploadState === "uploading" && (
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-on-surface-variant">Uploading...</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-500 w-1/2 animate-pulse"
                />
              </div>
            </div>
          )}

          {uploadState === "complete" && (
            <div className="flex items-center gap-2 text-primary text-sm font-bold">
              <Check className="w-4 h-4" />
              Resume processed successfully.
            </div>
          )}
        </div>
      )}

      {/* Resume Uploaded state */}
      {uploadState === "complete" && (
        <div className="mt-8 space-y-6 animate-fade-in-up">

          {/* Continue to Analysis CTA */}
          <Link
            href="/resume/analysis"
            className="flex items-center justify-center gap-2 w-full py-4 gradient-primary text-on-primary-container font-bold rounded-xl text-base hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-primary/20"
          >
            Continue to Analysis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
