"use client";

import { useState, useEffect } from "react";
import { UploadCloud, CheckCircle, Search, FileX2, Eye, FileCheck2, Loader2, ChevronDown, FileText } from "lucide-react";
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
import { documentsApi } from "@/lib/api/documents";
import { resumeApi } from "@/lib/api/resume";
import type { Document, ATSResult } from "@/types";

export default function ATSCheckerPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
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

  const handleScan = async () => {
    if (!selectedDocId) return;
    setIsScanning(true);
    setResult(null);
    try {
      const res = await resumeApi.checkATS(selectedDocId);
      setResult(res?.data)
    } catch (err) {
      console.error("Failed to scan resume", err);
    } finally {
      setIsScanning(false);
    }
  };

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  // Derive checklist items from the result
  const checklist = result ? [
    { title: "Keywords Present", desc: `${result.presentKeywords.length} key industry terms identified.`, icon: result.presentKeywords.length > 5 ? CheckCircle : FileX2, ok: result.presentKeywords.length > 5 },
    { title: "Missing Terms", desc: `${result.missingKeywords.length} important terms are missing.`, icon: result.missingKeywords.length === 0 ? CheckCircle : FileX2, ok: result.missingKeywords.length === 0 },
    { title: "Formatting Issues", desc: `${result.formattingIssues.length} parsing problems detected.`, icon: result.formattingIssues.length === 0 ? CheckCircle : FileX2, ok: result.formattingIssues.length === 0 },
    { title: "Role Identified", desc: `Parser thinks you are a: ${result.role}`, icon: result.role !== "Unknown" ? CheckCircle : FileX2, ok: result.role !== "Unknown" },
    { title: "Industry Trends", desc: `${result.industryTrends.length} modern trends spotted.`, icon: result.industryTrends.length > 0 ? CheckCircle : FileX2, ok: result.industryTrends.length > 0 },
    { title: "Overall ATS Score", desc: `Score: ${result.atsScore}/100`, icon: result.atsScore > 75 ? CheckCircle : FileX2, ok: result.atsScore > 75 },
  ] : [
    { title: "Standard Fonts", desc: "Use Arial, Calibri, or Times New Roman.", icon: CheckCircle, ok: true },
    { title: "No Tables/Columns", desc: "Tables can confuse the parser.", icon: CheckCircle, ok: true },
    { title: "Standard Headings", desc: "'Experience', 'Education', etc.", icon: CheckCircle, ok: true },
    { title: "No Headers/Footers", desc: "Keep critical info in main body.", icon: FileX2, ok: false },
    { title: "Keyword Density", desc: "Match job description terminology.", icon: CheckCircle, ok: true },
    { title: "Chronological Format", desc: "Reverse-chronological is best.", icon: CheckCircle, ok: true },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold tracking-tight">ATS Checker</h1>
        <p className="text-muted-foreground">
          See exactly how Applicant Tracking Systems parse your resume. Ensure your formatting doesn't hide important keywords.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* File Selection / Parsing */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Select Document</CardTitle>
            <CardDescription>Choose a document to run through the ATS parser.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border p-8 text-center bg-muted/20">
               <UploadCloud className="mb-4 h-8 w-8 text-muted-foreground" />
               <p className="mb-4 text-sm font-medium">Select an existing file to scan</p>
               
               <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-card px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 max-w-[250px]">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">{selectedDoc ? selectedDoc.title : "Select Document"}</span>
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-[250px]">
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

               <Button className="mt-4" onClick={handleScan} disabled={!selectedDocId || isScanning}>
                 {isScanning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                 {isScanning ? "Scanning..." : "Scan Document"}
               </Button>
             </div>
          </CardContent>
        </Card>

        {/* ATS Parse Results Placeholder */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Parsed Output Analysis</CardTitle>
            <CardDescription>What the ATS system extracted from your document.</CardDescription>
          </CardHeader>
          <CardContent>
            {!result && !isScanning ? (
              <div className="flex h-[230px] flex-col items-center justify-center rounded-md border border-border bg-muted/20 text-center p-6 text-muted-foreground">
                 <FileCheck2 className="mb-2 h-10 w-10 opacity-20" />
                 <p className="text-sm">Run an ATS scan to see how robots read your resume.</p>
                 <p className="text-xs mt-2">If the output looks messy or is missing sections, you need to adjust your resume formatting.</p>
              </div>
            ) : isScanning ? (
              <div className="flex h-[230px] flex-col items-center justify-center rounded-md border border-border bg-muted/20 text-center p-6">
                 <Loader2 className="mb-2 h-10 w-10 animate-spin text-primary" />
                 <p className="text-sm font-medium">Parsing document structure...</p>
              </div>
            ) : (
              <div className="flex h-[230px] flex-col rounded-md border border-border bg-muted/20 p-6 overflow-y-auto">
                 <h4 className="font-semibold mb-2">Overall Feedback</h4>
                 <p className="text-sm text-muted-foreground mb-4">{result!.overallFeedback}</p>
                 
                 {result!.formattingIssues.length > 0 && (
                   <>
                    <h4 className="font-semibold mb-2 text-warning">Formatting Alerts</h4>
                    <ul className="list-disc pl-4 text-sm text-muted-foreground">
                      {result!.formattingIssues.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                   </>
                 )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* ATS Checklist */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>ATS Compatibility Checklist</CardTitle>
          <CardDescription>
            {result ? "Results based on the latest scan" : "General rules to ensure your resume passes common ATS filters"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {checklist.map((item, i) => (
              <div key={i} className={`flex items-start gap-3 rounded-lg border border-border/50 p-4 ${item.ok ? 'bg-success/5 border-success/20' : 'bg-danger/5 border-danger/20'}`}>
                <item.icon className={`h-5 w-5 mt-0.5 shrink-0 ${item.ok ? 'text-success' : 'text-danger'}`} />
                <div>
                  <h4 className="text-sm font-medium">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
