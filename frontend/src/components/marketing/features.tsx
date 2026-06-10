"use client";

import {
  MessageSquare,
  FileSearch,
  GitCompare,
  Wand2,
  Map,
  Bot,
} from "lucide-react";
import { BentoGrid, BentoGridItem } from "@/components/ui/aceternity/bento-grid";

const features = [
  {
    title: "AI Document Chat",
    description:
      "Upload PDFs, DOCX, or TXT files and have intelligent conversations with your documents. Get instant answers with source references.",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    title: "Resume ATS Checker",
    description:
      "Get your resume scored against modern ATS standards with real-time industry data. Identify missing keywords and formatting issues.",
    icon: <FileSearch className="h-5 w-5" />,
  },
  {
    title: "Resume vs JD Match",
    description:
      "Compare your resume against any job description. See match scores, missing skills, partial matches, and actionable recommendations.",
    icon: <GitCompare className="h-5 w-5" />,
  },
  {
    title: "Resume Optimizer",
    description:
      "AI-powered bullet point improvement with multi-step validation. Rewrite experience sections to maximize ATS compatibility.",
    icon: <Wand2 className="h-5 w-5" />,
  },
  {
    title: "Learning Roadmaps",
    description:
      "Generate personalized week-by-week learning plans with curated resources, projects, and interview preparation questions.",
    icon: <Map className="h-5 w-5" />,
  },
  {
    title: "AI Career Assistant",
    description:
      "Real-time web-grounded AI assistant for career guidance, skill recommendations, and industry insights.",
    icon: <Bot className="h-5 w-5" />,
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Features
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to{" "}
            <span className="gradient-text-primary">accelerate your career</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            From document analysis to resume optimization — a complete
            AI-powered toolkit designed for career-focused professionals.
          </p>
        </div>

        {/* Feature Grid */}
        <BentoGrid>
          {features.map((feature) => (
            <BentoGridItem
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
