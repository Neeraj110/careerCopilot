"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, MoreVertical, Search, Filter, Loader2 } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useDocumentsList, useUploadDocument, useDeleteDocument } from "@/hooks/use-documents";
import type { Document } from "@/types";
import { motion } from "framer-motion";

export default function DocumentsPage() {
  const [isDragging, setIsDragging] = useState(false);
  const { data: documents = [], isLoading } = useDocumentsList();
  const uploadDoc = useUploadDocument();
  const deleteDoc = useDeleteDocument();
  const isUploading = uploadDoc.isPending;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFile = async (file: File) => {
    try {
      let fileToUpload = file;

      // ─── Frontend Optimization & Compression ───
      if (file.type === "text/plain") {
        const text = await file.text();
        const optimizedText = text
          .replace(/\r\n/g, "\n")
          .replace(/\n{3,}/g, "\n\n") // Max 2 consecutive linebreaks
          .replace(/[ \t]+/g, " ")     // Max 1 consecutive space/tab
          .trim();
        
        fileToUpload = new File([optimizedText], file.name, { type: "text/plain" });
        console.log(`[Compression] Optimized plain-text file from ${file.size} to ${fileToUpload.size} bytes`);
      } else if (file.size > 5 * 1024 * 1024) {
        console.warn(`[Optimization] Warning: Large file (${(file.size / 1024 / 1024).toFixed(2)}MB) uploaded. Processing might take a few moments.`);
      }

      await uploadDoc.mutateAsync({ file: fileToUpload, title: file.name });
    } catch (err) {
      console.error("Failed to upload document", err);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Manage your uploaded resumes, cover letters, and portfolios."
      />

      <Card className="border-border bg-surface border-dashed shadow-card hover:border-accent-v2 transition-all duration-300">
        <CardContent className="p-0">
          <div 
            className={`flex flex-col items-center justify-center p-12 transition-colors cursor-pointer rounded-xl ${
              isDragging ? "bg-accent-soft/20" : "hover:bg-surface-2"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
            />
            {isUploading ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 text-accent-v2 animate-spin mb-4" />
                <h3 className="text-lg font-medium">Uploading document...</h3>
                <p className="text-sm text-muted-foreground mt-1">Please wait while we process your file.</p>
              </div>
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft/20 text-accent-v2 mb-4">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium">Click to upload or drag and drop</h3>
                <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
                  PDF, DOCX, or TXT (max. 10MB). We'll automatically parse and extract text for AI analysis.
                </p>
                <Button className="mt-6" variant="outline" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Browse Files</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-surface shadow-card transition-all duration-300">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
          <div className="space-y-1">
            <CardTitle>Your Files</CardTitle>
            <CardDescription>Manage your {documents.length} uploaded files</CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search files..."
                className="w-full sm:w-[200px] lg:w-[300px] pl-9 bg-surface-2 border-border focus:border-accent-v2"
              />
            </div>
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border bg-surface-2/30 backdrop-blur-md overflow-x-auto w-full">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-surface-2 text-ink-muted">
                <tr>
                  <th className="h-10 px-4 text-left font-medium">Name</th>
                  <th className="h-10 px-4 text-left font-medium">Date</th>
                  <th className="h-10 px-4 text-left font-medium">Type</th>
                  <th className="h-10 px-4 text-left font-medium">Status</th>
                  <th className="h-10 w-[50px] px-4"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="h-32 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="h-32 text-center text-muted-foreground">
                      No documents found. Upload one to get started!
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="border-t border-border transition-colors hover:bg-surface">
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-accent-v2" />
                          <span className="font-medium">{doc.title}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">{doc.type}</td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          doc.status === 'COMPLETED' ? 'bg-success/10 text-success' :
                          (doc.status === 'PENDING' || doc.status === 'PROCESSING') ? 'bg-warning/10 text-warning' :
                          'bg-danger/10 text-danger'
                        }`}>
                          {doc.status === 'FAILED' ? 'Could not upload' : doc.status}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-bg transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-v2 disabled:pointer-events-none disabled:opacity-50">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View details</DropdownMenuItem>
                              <DropdownMenuItem>Download</DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${doc.title}?`)) {
                                  deleteDoc.mutate(doc.id);
                                }
                              }}
                              className="text-danger cursor-pointer font-medium"
                              disabled={deleteDoc.isPending}
                            >
                              Delete file
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
