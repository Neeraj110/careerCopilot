"use client";

import { useState, useEffect } from "react";
import { FileText, Target, Zap, AlertTriangle, ArrowRight, UploadCloud, ChevronDown, Loader2, Wand2, CheckCircle2 } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { documentsApi } from "@/lib/api/documents";
import { resumeApi } from "@/lib/api/resume";
import type { Document, JDMatchResult, ImproveResult } from "@/types";

export default function ResumeMatchPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [jd, setJd] = useState("");
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<JDMatchResult | null>(null);
  
  const [isImproving, setIsImproving] = useState(false);
  const [improveResult, setImproveResult] = useState<ImproveResult | null>(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await documentsApi.getAll();
        setDocuments(res.data || []);
      } catch (err) {
        console.error("Failed to fetch documents", err);
      }
    };
    fetchDocs();
  }, []);

  const handleAnalyze = async () => {
    if (!jd || !selectedDocId) return;
    setIsAnalyzing(true);
    setResult(null);
    setImproveResult(null);
    try {
      const res = await resumeApi.jdMatch(selectedDocId, jd);
      setResult(res.data);
    } catch (err) {
      console.error("Failed to analyze jd match", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImprove = async () => {
    if (!jd || !selectedDocId) return;
    setIsImproving(true);
    setResult(null);
    setImproveResult(null);
    try {
      const res = await resumeApi.improve(selectedDocId, jd);
      setImproveResult(res.data);
    } catch (err) {
      console.error("Failed to improve resume", err);
    } finally {
      setIsImproving(false);
    }
  };

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Resume vs Job Description Match</h1>
        <p className="text-muted-foreground">
          Paste a job description to see how well your resume matches and what skills you are missing.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 ">
        <Card className="border-border/40 bg-card/30 backdrop-blur-xl h-fit shadow-xl shadow-black/20 hover:border-primary/30 transition-all duration-300">
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Select a resume and paste the target job description.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">1. Select Resume</label>
              <div className="flex items-center gap-3 rounded-md border border-border/40 bg-muted/10 backdrop-blur-md p-1">
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-full flex h-10 items-center justify-between whitespace-nowrap rounded-md bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring hover:bg-accent/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate">{selectedDoc ? selectedDoc.title : "Select a document..."}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[300px] bg-card/80 backdrop-blur-xl border-border/40">
                    {documents.map(doc => (
                      <DropdownMenuItem key={doc.id} onClick={() => setSelectedDocId(doc.id)}>
                        <span className="truncate">{doc.title}</span>
                      </DropdownMenuItem>
                    ))}
                    {documents.length === 0 && (
                      <DropdownMenuItem disabled>No documents found</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">2. Paste Job Description</label>
              <Textarea 
                placeholder="Paste the job requirements and responsibilities here..."
                className="h-[250px] min-h-[250px] max-h-[400px] resize-y overflow-y-auto [field-sizing:fixed]"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                className="flex-1 py-5" 
                onClick={handleAnalyze} 
                disabled={!jd || !selectedDocId || isAnalyzing || isImproving}
              >
                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isAnalyzing ? "Analyzing..." : "Calculate Match Score"}
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-transparent py-5"
                onClick={handleImprove} 
                disabled={!jd || !selectedDocId || isAnalyzing || isImproving}
              >
                {isImproving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                {isImproving ? "AI Improving..." : "Auto-Improve Resume"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && !isAnalyzing && !isImproving ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <Card className="border-border/40 bg-card/30 backdrop-blur-xl overflow-hidden relative shadow-xl shadow-black/20 hover:border-primary/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" /> Match Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-primary bg-primary/10">
                    <span className="text-3xl font-bold">{result.matchScore}%</span>
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-lg">
                      {result.matchScore >= 80 ? "Strong Match" : result.matchScore >= 60 ? "Moderate Match" : "Weak Match"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {result.matchScore >= 80 
                        ? "Your resume aligns well with the core requirements." 
                        : "There are significant gaps between your resume and the job description."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {result.missingSkills.length > 0 && (
              <Card className="border-border/40 bg-card/30 backdrop-blur-xl shadow-xl shadow-black/20 hover:border-warning/30 transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" /> Missing Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map(skill => (
                      <span key={skill} className="inline-flex items-center rounded-md bg-warning/10 px-2.5 py-1 text-sm font-medium text-warning border border-warning/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    The job description mentions these frequently. Consider adding them to your skills section or mentioning related experience if applicable.
                  </p>
                </CardContent>
              </Card>
            )}

            {result.strengths.length > 0 && (
              <Card className="border-border/40 bg-card/30 backdrop-blur-xl shadow-xl shadow-black/20 hover:border-success/30 transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-success" /> Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.strengths.map(skill => (
                      <span key={skill} className="inline-flex items-center rounded-md bg-success/10 px-2.5 py-1 text-sm font-medium text-success border border-success/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {result.recommendations.length > 0 && (
              <Card className="border-border/40 bg-card/30 backdrop-blur-xl shadow-xl shadow-black/20 hover:border-primary/30 transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-primary" /> Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
                    {result.recommendations.map((rec, i) => (
                      <li key={i}>
                        <span className="font-medium text-foreground">{rec.skill}: </span>
                        {rec.reason}
                        {rec.resource && (
                          <a href={rec.resource} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline">
                            (Resource)
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : improveResult && !isImproving && !isAnalyzing ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <Card className="border-border/40 bg-card/30 backdrop-blur-xl overflow-hidden relative border-blue-500/30 shadow-xl shadow-black/20 hover:border-blue-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-blue-500" /> Auto-Improved Bullets
                </CardTitle>
                <CardDescription>
                  AI has rewritten your resume points to better match this JD. Validation Score: <span className="font-bold text-foreground">{improveResult.validationScore}/100</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {improveResult.improvedBullets.map((bullet, i) => (
                  <div key={i} className="flex flex-col gap-3 rounded-lg border border-border/40 bg-muted/10 backdrop-blur-sm p-4 relative shadow-sm">
                    <div className="flex gap-3 items-start opacity-70">
                      <div className="mt-0.5 rounded-full bg-danger/10 p-1 shrink-0">
                        <AlertTriangle className="h-3 w-3 text-danger" />
                      </div>
                      <p className="text-sm text-muted-foreground line-through">{bullet.original}</p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="mt-0.5 rounded-full bg-success/10 p-1 shrink-0">
                        <CheckCircle2 className="h-3 w-3 text-success" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-foreground">{bullet.improved}</p>
                        <p className="text-xs text-muted-foreground italic">Reason: {bullet.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {improveResult.gaps?.missing && improveResult.gaps.missing.length > 0 && (
                  <div className="mt-6 rounded-lg border border-border/50 bg-muted/20 p-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" /> Remaining Missing Skills
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                      {improveResult.gaps.missing.map((gap: string, i: number) => <li key={i}>{gap}</li>)}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/40 bg-card/10 backdrop-blur-xl p-12 text-center h-full min-h-[400px] shadow-xl shadow-black/20"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mb-4 h-12 w-12 text-primary animate-spin" />
                <h3 className="text-lg font-medium">Analyzing match...</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                  Comparing your resume against the job description requirements.
                </p>
              </>
            ) : isImproving ? (
              <>
                <Wand2 className="mb-4 h-12 w-12 text-blue-500 animate-pulse" />
                <h3 className="text-lg font-medium">AI is improving your resume...</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                  This takes a moment as our agents iterate and validate the rewrites against the JD.
                </p>
              </>
            ) : (
              <>
                <Target className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-medium text-muted-foreground">Awaiting Input</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                  Select a document, paste a job description, and choose an action to analyze or automatically improve your resume.
                </p>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
