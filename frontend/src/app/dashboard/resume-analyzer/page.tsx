"use client";

import { useState, useEffect } from "react";
import { UploadCloud, FileSearch, ArrowUpRight, AlertCircle, CheckCircle2, FileText, ChevronDown, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { documentsApi } from "@/lib/api/documents";
import { resumeApi } from "@/lib/api/resume";
import type { Document, ATSResult } from "@/types";

export default function ResumeAnalyzerPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);

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
    if (!selectedDocId) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      const res = await resumeApi.checkATS(selectedDocId);
      setResult(res.data);
    } catch (err) {
      console.error("Failed to analyze resume", err);
    } finally {
      setIsAnalyzing(false);
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-heading font-bold tracking-tight">Resume Analyzer</h1>
          <p className="text-muted-foreground">
            Get deep AI insights on your resume impact, formatting, and content.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border/40 bg-card/30 backdrop-blur-xl px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent/50 hover:text-accent-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 max-w-[250px]">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{selectedDoc ? selectedDoc.title : "Select Document"}</span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[250px] bg-card/80 backdrop-blur-xl border-border/40">
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
          <Button onClick={handleAnalyze} disabled={!selectedDocId || isAnalyzing} className="shadow-lg shadow-primary/20">
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze"}
          </Button>
        </div>
      </div>

      {!result && !isAnalyzing && (
        <Card className="border-dashed border-border/40 bg-card/10 backdrop-blur-xl flex flex-col items-center justify-center py-24 text-center shadow-xl shadow-black/20 hover:border-primary/30 transition-all duration-300">
          <FileSearch className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No Analysis Yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Select a document above and click Analyze to begin.</p>
        </Card>
      )}

      {isAnalyzing && (
        <Card className="border-border/40 bg-card/30 backdrop-blur-xl flex flex-col items-center justify-center py-24 text-center shadow-xl shadow-black/20">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h3 className="text-lg font-medium">Analyzing your resume...</h3>
          <p className="text-sm text-muted-foreground mt-1">Our AI is reading and extracting your document data.</p>
        </Card>
      )}

      {result && !isAnalyzing && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Score Card */}
          <Card className="md:col-span-1 border-border/40 bg-card/30 backdrop-blur-xl flex flex-col justify-center items-center py-8 h-fit md:sticky md:top-6 md:max-h-[calc(100vh-80px)] md:overflow-y-auto shadow-xl shadow-black/20 hover:border-primary/30 transition-all duration-300">

            <div className=" flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{result.atsScore}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Score</span>
            </div>

            <div className="text-center mt-6 px-6">
              <h3 className="text-xl font-semibold">
                {result.atsScore >= 80 ? 'Excellent' : result.atsScore >= 60 ? 'Needs Work' : 'Requires Rewrite'}
              </h3>
              <p className="text-md text-muted-foreground mt-3 mx-auto leading-relaxed text-balance">
                {result.overallFeedback}
              </p>
            </div>
          </Card>

          {/* Detailed Breakdown */}
          <div className="md:col-span-2 space-y-6 md:max-h-[calc(100vh-200px)] md:overflow-y-auto md:pr-2 pb-4">
            <Card className="border-border/40 bg-card/30 backdrop-blur-xl shadow-xl shadow-black/20 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Analysis Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-border/40 bg-muted/10 backdrop-blur-md p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <h4 className="text-sm font-medium">Keywords Found</h4>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {result.presentKeywords.length === 0 ? <span className="text-xs text-muted-foreground">None</span> :
                        result.presentKeywords.map(kw => <span key={kw} className="text-md bg-success/10 text-success px-2 py-0.5 rounded-full">{kw}</span>)
                      }
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-muted/10 backdrop-blur-md p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-danger" />
                      <h4 className="text-md font-medium">Missing Keywords</h4>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {result.missingKeywords.length === 0 ? <span className="text-xs text-muted-foreground">None</span> :
                        result.missingKeywords.map(kw => <span key={kw} className="text-md bg-danger/10 text-danger px-2 py-0.5 rounded-full">{kw}</span>)
                      }
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-muted/10 backdrop-blur-md p-4 col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-warning" />
                      <h4 className="text-md font-medium">Formatting Issues</h4>
                    </div>
                    <ul className="list-disc pl-5 text-md text-muted-foreground space-y-1">
                      {result.formattingIssues.length === 0 ? <li>No major issues found.</li> :
                        result.formattingIssues.map((issue, i) => <li key={i}>{issue}</li>)
                      }
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/30 backdrop-blur-xl shadow-xl shadow-black/20 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Key Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {result.improvements.length === 0 ? (
                    <p className="text-md text-muted-foreground">Your resume is looking great! No major improvements needed.</p>
                  ) : (
                    result.improvements.map((imp, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex flex-col gap-2 text-sm p-4 rounded-md bg-muted/20 border border-border/50"
                      >
                        <div className="flex items-center gap-2 font-medium">
                          <ArrowUpRight className="h-4 w-4 text-primary shrink-0" />
                          <span className="capitalize">{imp.section}</span>
                        </div>
                        <div className="pl-6 grid gap-2">
                          <div className="text-muted-foreground bg-danger/5 border border-danger/10 p-2 rounded line-through text-md">
                            {imp.current}
                          </div>
                          <div className="text-foreground bg-success/5 border border-success/10 p-2 rounded text-md">
                            {imp.suggested}
                          </div>
                          <p className="text-md text-muted-foreground mt-1 italic">
                            Reason: {imp.reason}
                          </p>
                        </div>
                      </motion.li>
                    ))
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </motion.div>
    
  );
}
