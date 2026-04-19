"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import {
  XCircle,
  AlertTriangle,
  Copy,
  Sparkles,
  ArrowLeft,
  Loader2,
  FileSearch,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getAtsScore, alignResume, ATSAnalysisResult, ResumeAlignmentResult } from "@/lib/api";

const AtsScoreGauge = dynamic(
  () => import("@/components/resume/AtsScoreGauge"),
  { ssr: false }
);

export default function ResumeAnalysisPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsData, setAtsData] = useState<ATSAnalysisResult | null>(null);
  const [alignmentData, setAlignmentData] = useState<ResumeAlignmentResult | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError("Please paste a job description first.");
      return;
    }
    setError("");
    setIsAnalyzing(true);
    setAtsData(null);
    setAlignmentData(null);

    try {
      const [ats, align] = await Promise.all([
        getAtsScore(jobDescription),
        alignResume(jobDescription)
      ]);
      setAtsData(ats);
      setAlignmentData(align);
    } catch (err: any) {
      setError(err.message || "Failed to analyze resume.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href="/resume/upload"
            className="inline-flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Upload
          </Link>
          <h1 className="font-headline font-extrabold text-3xl lg:text-4xl tracking-tight text-on-surface">
            Resume Analysis
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        {/* Left: Job Description Input */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container rounded-2xl overflow-hidden p-6">
            <h3 className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-4">
              Target Job Description
            </h3>
            <textarea
              className="w-full h-64 bg-[#1a1f2e] border border-white/5 rounded-xl p-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/30 outline-none resize-none placeholder:text-on-surface-variant/50"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            {error && <p className="text-error text-xs mt-2">{error}</p>}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full mt-4 py-3 gradient-primary text-on-primary-container font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-70 disabled:hover:scale-100"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileSearch className="w-4 h-4" />
                  Analyze Match
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Analysis Results */}
        <div className="lg:col-span-3 space-y-6">
          {!atsData && !isAnalyzing && (
             <div className="bg-surface-container rounded-xl p-8 flex flex-col items-center justify-center text-center border border-dashed border-white/10 h-full">
               <FileSearch className="w-12 h-12 text-on-surface-variant mb-4 opacity-50" />
               <h3 className="font-headline font-bold text-xl text-white mb-2">Ready for Analysis</h3>
               <p className="text-sm text-on-surface-variant">Paste a job description and click analyze to see how your resume scores.</p>
             </div>
          )}

          {isAnalyzing && (
             <div className="bg-surface-container rounded-xl p-8 flex flex-col items-center justify-center text-center h-full">
               <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
               <p className="text-sm text-on-surface-variant">AI is reviewing your resume against the job description...</p>
             </div>
          )}

          {atsData && alignmentData && (
            <>
              {/* Match Score Gauge */}
              <div className="bg-surface-container rounded-xl p-6 flex flex-col items-center border border-primary/10">
                <AtsScoreGauge score={atsData.score} />
                <p className="text-on-surface-variant text-xs mt-3 text-center max-w-md">
                  We found <span className="text-white font-bold">{atsData.matchedKeywords.length} matching keywords</span> and <span className="text-error font-bold">{atsData.missingKeywords.length} missing keywords</span>.
                </p>
              </div>

              {/* Missing & Matched Skills */}
              <div className="bg-surface-container rounded-xl p-5">
                <h4 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">
                  Keyword Analysis
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                     <h5 className="text-xs text-error font-bold mb-2 flex items-center gap-1">
                       <XCircle className="w-3 h-3" /> Missing
                     </h5>
                     <div className="flex flex-wrap gap-2">
                       {atsData.missingKeywords.length ? atsData.missingKeywords.map((kw) => (
                         <span key={kw} className="px-2 py-1 bg-error/10 text-error text-[10px] rounded-md font-bold">{kw}</span>
                       )) : <span className="text-xs text-on-surface-variant">None!</span>}
                     </div>
                   </div>
                   <div>
                     <h5 className="text-xs text-secondary font-bold mb-2">Matched</h5>
                     <div className="flex flex-wrap gap-2">
                       {atsData.matchedKeywords.length ? atsData.matchedKeywords.map((kw) => (
                         <span key={kw} className="px-2 py-1 bg-secondary/10 text-secondary text-[10px] rounded-md font-bold">{kw}</span>
                       )) : <span className="text-xs text-on-surface-variant">None.</span>}
                     </div>
                   </div>
                </div>
              </div>

              {/* AI Suggestions / Alignment Details */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Suggested Edits
                </h4>
                {alignmentData.suggestedEdits.map((imp, i) => (
                  <div
                    key={i}
                    className="bg-surface-container rounded-xl p-5 border border-primary/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {imp.section}
                      </span>
                      <button className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant hover:text-primary transition-colors">
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                    {/* Current */}
                    <div className="mb-3">
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">
                        Current
                      </p>
                      <p className="text-sm italic text-on-surface-variant/60 leading-relaxed">
                        {imp.original}
                      </p>
                    </div>
                    {/* Improved */}
                    <div>
                      <p className="text-[10px] text-primary uppercase tracking-widest font-bold mb-1">
                        Improved
                      </p>
                      <p className="text-sm text-on-surface leading-relaxed">
                        {imp.improved}
                      </p>
                    </div>
                  </div>
                ))}
                {!alignmentData.suggestedEdits.length && (
                   <div className="bg-surface-container rounded-xl p-5 border border-primary/10 text-sm text-on-surface-variant">
                      No specific edits suggested. Great job!
                   </div>
                )}
                
                <div className="bg-surface-container-high rounded-xl p-5">
                   <h4 className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-2">Summary Advice</h4>
                   <p className="text-sm text-on-surface-variant italic">{alignmentData.summaryAdvice}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
