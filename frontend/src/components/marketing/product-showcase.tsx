"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  FileText,
  MessageSquare,
  BarChart3,
} from "lucide-react";

const tabs = [
  {
    id: "documents",
    label: "Document Intelligence",
    icon: FileText,
    content: {
      title: "Upload & Analyze Any Document",
      description:
        "Drag-and-drop your PDFs, Word docs, or text files. Our AI extracts, chunks, and indexes content for instant intelligent search and analysis.",
      features: [
        "Automatic text extraction & chunking",
        "Vector-based semantic search",
        "Real-time processing status",
      ],
    },
  },
  {
    id: "chat",
    label: "AI Chat",
    icon: MessageSquare,
    content: {
      title: "Chat With Your Documents",
      description:
        "Have natural conversations with your uploaded documents. Get cited answers with source references, powered by RAG architecture.",
      features: [
        "Streaming AI responses",
        "Source chunk references",
        "Web-grounded fallback",
      ],
    },
  },
  {
    id: "analytics",
    label: "Resume Analytics",
    icon: BarChart3,
    content: {
      title: "Deep Resume Intelligence",
      description:
        "Get comprehensive ATS analysis with real-time industry benchmarks. Match your resume against job descriptions with precision.",
      features: [
        "ATS score with keyword analysis",
        "JD match with gap identification",
        "AI-powered bullet improvements",
      ],
    },
  },
];

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState("documents");
  const active = tabs.find((t) => t.id === activeTab)!;

  return (
    <section className="relative border-y border-border bg-surface py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            How It Works
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            A platform built for{" "}
            <span className="gradient-text-primary">serious professionals</span>
          </h2>
        </div>

        {/* Tab Selector */}
        <div className="mb-12 flex justify-center">
          <div className="inline-flex rounded-xl border border-border bg-card p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid gap-12 lg:grid-cols-2 lg:items-center"
        >
          {/* Text */}
          <div>
            <h3 className="mb-4 font-heading text-2xl font-bold text-foreground">
              {active.content.title}
            </h3>
            <p className="mb-8 text-muted-foreground leading-relaxed">
              {active.content.description}
            </p>
            <ul className="space-y-4">
              {active.content.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-danger/50" />
              <div className="h-2.5 w-2.5 rounded-full bg-warning/50" />
              <div className="h-2.5 w-2.5 rounded-full bg-success/50" />
            </div>
            <div className="p-8">
              {activeTab === "documents" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border py-12 text-center">
                    <div>
                      <FileText className="mx-auto mb-3 h-10 w-10 text-muted" />
                      <p className="text-sm text-muted-foreground">
                        Drop files here or click to upload
                      </p>
                    </div>
                  </div>
                  {["Resume_2024.pdf", "Cover_Letter.docx"].map((file) => (
                    <div
                      key={file}
                      className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-xs text-primary">
                        PDF
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{file}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-success" />
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "chat" && (
                <div className="space-y-4">
                  <div className="ml-auto max-w-xs rounded-xl bg-primary/10 px-4 py-3 text-sm text-foreground">
                    What are the key skills mentioned in my resume?
                  </div>
                  <div className="mr-auto max-w-sm rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                    Based on your resume, the key skills include: React, TypeScript, Node.js, PostgreSQL, and AWS...
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-3">
                    <span className="flex-1 text-sm text-muted">Ask a question...</span>
                    <div className="h-6 w-6 rounded bg-primary/10" />
                  </div>
                </div>
              )}
              {activeTab === "analytics" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">ATS Score</span>
                    <span className="text-2xl font-bold text-success">87%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-border">
                    <div className="h-full w-[87%] rounded-full bg-success" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border bg-background p-3">
                      <p className="text-xs text-muted-foreground">Keywords Found</p>
                      <p className="text-lg font-semibold text-foreground">12/15</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-3">
                      <p className="text-xs text-muted-foreground">JD Match</p>
                      <p className="text-lg font-semibold text-foreground">78%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
