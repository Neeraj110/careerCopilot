"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What file formats does CareerPilot support?",
    a: "CareerPilot supports PDF, DOCX, and TXT files. You can upload resumes, cover letters, research papers, or any text-based document for AI analysis and chat.",
  },
  {
    q: "How accurate is the ATS score?",
    a: "Our ATS analysis uses real-time industry data via Google Search grounding to check against current hiring standards and trends. While no tool can guarantee a perfect ATS pass, our scores reflect modern applicant tracking system requirements.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. All documents are encrypted at rest and in transit. We use enterprise-grade cloud storage (Cloudinary) and never share your data with third parties. You can delete your documents at any time.",
  },
  {
    q: "How does the AI chat with documents work?",
    a: "We use RAG (Retrieval Augmented Generation) architecture. Your documents are split into chunks, embedded into vectors, and stored in a vector database. When you ask a question, we retrieve the most relevant chunks and use them as context for the AI response.",
  },
  {
    q: "Can I use CareerPilot for non-resume documents?",
    a: "Absolutely. The document chat feature works with any text-based document — research papers, legal documents, reports, study materials, and more.",
  },
  {
    q: "What AI models power CareerPilot?",
    a: "We use Google's Gemini models with Google Search grounding for real-time accuracy. Different features use different model configurations optimized for their specific tasks.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t border-border bg-surface py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            FAQ
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span className="pr-4 text-sm font-medium text-foreground">
                  {faq.q}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    openIndex === i && "rotate-180",
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="border-t border-border/50 px-6 py-5 text-sm leading-relaxed text-muted-foreground">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
