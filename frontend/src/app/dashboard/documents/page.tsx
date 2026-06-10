"use client";

import { useState, useEffect, useRef } from "react";
import { UploadCloud, FileText, MoreVertical, Search, Filter, Loader2 } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
import { documentsApi } from "@/lib/api/documents";
import type { Document } from "@/types";

export default function DocumentsPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await documentsApi.getAll();
        setDocuments(res.data || []);
      } catch (err) {
        console.error("Failed to fetch documents", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocs();
  }, []);

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
    setIsUploading(true);
    try {
      await documentsApi.upload(file, file.name);
      const res = await documentsApi.getAll();
      setDocuments(res.data || []);
    } catch (err) {
      console.error("Failed to upload document", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          Manage your uploaded resumes, cover letters, and portfolios.
        </p>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm border-dashed">
        <CardContent className="p-0">
          <div 
            className={`flex flex-col items-center justify-center p-12 transition-colors cursor-pointer ${
              isDragging ? "bg-primary/5" : "hover:bg-muted/50"
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
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <h3 className="text-lg font-medium">Uploading document...</h3>
                <p className="text-sm text-muted-foreground mt-1">Please wait while we process your file.</p>
              </div>
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
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

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle>Your Files</CardTitle>
            <CardDescription>Manage your {documents.length} uploaded files</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search files..."
                className="w-[200px] pl-9 lg:w-[300px]"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
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
                    <tr key={doc.id} className="border-t border-border/50 transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-primary" />
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
                          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
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
                            <DropdownMenuItem className="text-danger">Delete file</DropdownMenuItem>
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
