"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Upload,
  FileText,
  Trash2,
  ArrowRight,
  Check,
  LocateFixed,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  detectPreferredLocation,
  getResumeStatus,
  selectActiveResume,
  uploadResume,
  type ResumeStatus,
} from "@/lib/api";
import Skeleton from "@/components/shared/Skeleton";

type UploadState = "idle" | "uploading" | "complete" | "error";

export default function ResumeUploadPage() {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [error, setError] = useState("");
  const [resumeStatus, setResumeStatus] = useState<ResumeStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isSwitchingResume, setIsSwitchingResume] = useState(false);
  const [preferredLocation, setPreferredLocation] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [latestLocationFetch, setLatestLocationFetch] = useState<{
    location: string;
    source: string;
    fetchedAt: string;
    ip: string;
  } | null>(null);
  const [locationFetchError, setLocationFetchError] = useState("");

  const setDetectedLocationResult = (
    location: string,
    source: string,
    ip = "",
    fetchedAtIso = new Date().toISOString(),
  ) => {
    if (location) {
      setPreferredLocation(location);
    }
    setLatestLocationFetch({
      location: location || "Not found",
      source,
      fetchedAt: new Date(fetchedAtIso).toLocaleString(),
      ip,
    });
  };

  const detectLocationFromBrowser = async (): Promise<boolean> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return false;
    }

    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 600000,
      });
    }).catch(() => null);

    if (!position) {
      return false;
    }

    const { latitude, longitude } = position.coords;
    const reverseRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!reverseRes.ok) {
      return false;
    }

    const payload = (await reverseRes.json()) as {
      address?: {
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        country?: string;
      };
    };

    const city =
      payload.address?.city ||
      payload.address?.town ||
      payload.address?.village ||
      payload.address?.state ||
      "";
    const country = payload.address?.country || "";
    const location = city && country ? `${city}, ${country}` : country;

    if (!location) {
      return false;
    }

    setDetectedLocationResult(
      location,
      "browser-geolocation",
      "",
      new Date().toISOString(),
    );
    return true;
  };

  const fetchLatestLocation = useCallback(async (showError = false) => {
    if (showError) {
      setIsDetectingLocation(true);
      setLocationFetchError("");
    }

    try {
      const detected = await detectPreferredLocation();
      if (detected.location || detected.source !== "accept-language") {
        setDetectedLocationResult(
          detected.location,
          detected.source,
          detected.ip || "",
          detected.fetchedAt,
        );
      }
    } catch (err: unknown) {
      if (showError) {
        const message =
          err instanceof Error ? err.message : "Failed to auto-detect location.";
        setLocationFetchError(message);
      }
    } finally {
      if (showError) {
        setIsDetectingLocation(false);
      }
    }
  }, []);

  const loadResumeStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const status = await getResumeStatus();
      setResumeStatus(status);
    } catch {
      // Keep upload flow usable even if status fetch fails
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    void loadResumeStatus();
  }, [loadResumeStatus]);

  useEffect(() => {
    void fetchLatestLocation(false);
  }, [fetchLatestLocation]);

  const processFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
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
      await uploadResume(file, preferredLocation);
      setUploadState("complete");
      await loadResumeStatus();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to upload resume.");
      setUploadState("error");
    }
  }, [loadResumeStatus, preferredLocation]);

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationFetchError("");
    try {
      const browserDetected = await detectLocationFromBrowser();
      if (!browserDetected) {
        await fetchLatestLocation(false);
      }
    } catch {
      await fetchLatestLocation(false);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleResumeSelect = async (resumeId: string) => {
    if (!resumeId) return;
    setIsSwitchingResume(true);
    setError("");
    try {
      const status = await selectActiveResume(resumeId);
      setResumeStatus(status);
      setUploadState("complete");
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to switch resume.");
    } finally {
      setIsSwitchingResume(false);
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

      {isLoadingStatus && (
        <div className="mb-6 bg-surface-container rounded-2xl p-5 lg:p-6 border border-primary/15 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-full sm:w-80 rounded-xl" />
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <Skeleton className="h-16 rounded-lg w-full" />
            <Skeleton className="h-16 rounded-lg w-full" />
            <Skeleton className="h-16 rounded-lg w-full" />
          </div>
        </div>
      )}

      {!isLoadingStatus && resumeStatus?.hasResume && (
        <div className="mb-6 bg-surface-container rounded-2xl p-5 lg:p-6 border border-primary/15">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-headline text-lg font-bold text-white mb-1">
                Existing Resume In Database
              </h3>
              <p className="text-xs text-on-surface-variant">
                Active CV: {resumeStatus.fileName ?? "N/A"}
              </p>
            </div>

            <div className="w-full sm:w-80">
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">
                Select CV (Unique ID)
              </label>
              <select
                className="w-full bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
                value={resumeStatus.activeResumeId ?? ""}
                onChange={(e) => void handleResumeSelect(e.target.value)}
                disabled={isSwitchingResume}
              >
                {resumeStatus.resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.fileName} ({resume.id.slice(0, 8)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-surface-container-high rounded-lg p-3">
              <p className="text-on-surface-variant">Resume ID</p>
              <p className="text-white font-mono mt-1 break-all">
                {resumeStatus.activeResumeId ?? "-"}
              </p>
            </div>
            <div className="bg-surface-container-high rounded-lg p-3">
              <p className="text-on-surface-variant">Skills Extracted</p>
              <p className="text-white font-bold mt-1">{resumeStatus.skills.length}</p>
            </div>
            <div className="bg-surface-container-high rounded-lg p-3">
              <p className="text-on-surface-variant">Vector Status</p>
              <p className="text-white font-bold mt-1">
                {resumeStatus.hasVector ? "Available" : "Pending / Failed"}
              </p>
            </div>
          </div>
        </div>
      )}

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
            PDF up to 10MB
          </p>
          <label className="bg-surface-container-highest text-on-surface px-6 py-3 rounded-xl font-bold text-sm hover:bg-surface-bright transition-colors cursor-pointer btn-press">
            Browse Files
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
          {error && (
            <p className="mt-4 text-error text-sm font-medium">{error}</p>
          )}

          <div className="w-full max-w-xl mt-6 text-left">
            <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">
              Preferred Location (Country or City)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
                placeholder="e.g. India, Bengaluru, Germany"
                className="flex-1 bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
                className="px-3 py-2 rounded-xl bg-surface-container-highest text-on-surface text-sm font-semibold hover:bg-surface-bright transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                <LocateFixed className="w-4 h-4" />
                {isDetectingLocation ? "Detecting..." : "Auto Detect"}
              </button>
            </div>
            <p className="mt-2 text-xs text-on-surface-variant">
              We always fetch remote jobs, and also fetch nearby jobs for this location.
            </p>
            <p className="mt-1 text-[11px] text-on-surface-variant/80">
              Tip: Allow browser location permission for accurate Auto Detect results.
            </p>
            {latestLocationFetch && (
              <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-on-surface-variant">
                <p className="font-semibold text-on-surface">Latest fetch</p>
                <p className="mt-1">Location: {latestLocationFetch.location}</p>
                <p>
                  Source: {latestLocationFetch.source}
                  {latestLocationFetch.ip ? ` • IP: ${latestLocationFetch.ip}` : ""}
                </p>
                <p>Fetched at: {latestLocationFetch.fetchedAt}</p>
              </div>
            )}
            {locationFetchError && (
              <p className="mt-2 text-xs text-error">{locationFetchError}</p>
            )}
          </div>
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
      {(uploadState === "complete" || !!resumeStatus?.hasResume) && (
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
