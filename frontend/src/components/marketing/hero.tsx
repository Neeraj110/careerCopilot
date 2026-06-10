"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Users, Shield } from "lucide-react";
import { SpotlightBackground } from "@/components/ui/aceternity/spotlight";
import { BackgroundBeams } from "@/components/ui/aceternity/background-beams";

const trustItems = [
  { icon: Users, label: "10,000+ professionals" },
  { icon: Shield, label: "Enterprise-grade security" },
  { icon: Sparkles, label: "Powered by AI" },
];

export function Hero() {
  return (
    <SpotlightBackground className="relative flex min-h-[90vh] items-center justify-center overflow-hidden pt-16">
      <BackgroundBeams />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI-Powered Career Growth Platform
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-5xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl md:text-7xl"
        >
          Navigate Your Career
          <br />
          <span className="gradient-text-primary">With AI Precision</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          Analyze resumes, check ATS scores, match against job descriptions,
          chat with documents, and generate personalized learning roadmaps —
          all in one platform.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 px-8 py-3.5 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-card-hover"
          >
            See How It Works
          </a>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8"
        >
          {trustItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <item.icon className="h-4 w-4 text-muted" />
              {item.label}
            </div>
          ))}
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative mx-auto mt-16 max-w-4xl"
        >
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/50">
            {/* Mock browser chrome */}
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-danger/60" />
              <div className="h-3 w-3 rounded-full bg-warning/60" />
              <div className="h-3 w-3 rounded-full bg-success/60" />
              <div className="ml-4 flex-1 rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
                app.careerpilot.ai/dashboard
              </div>
            </div>
            {/* Mock dashboard content */}
            <div className="grid grid-cols-12 gap-0">
              {/* Sidebar */}
              <div className="col-span-3 border-r border-border bg-surface p-4">
                <div className="space-y-3">
                  {[
                    "Dashboard",
                    "Documents",
                    "AI Chat",
                    "ATS Checker",
                    "Roadmaps",
                  ].map((item, i) => (
                    <div
                      key={item}
                      className={`rounded-lg px-3 py-2 text-xs ${i === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              {/* Main */}
              <div className="col-span-9 p-6">
                <div className="mb-4 h-3 w-32 rounded bg-foreground/10" />
                <div className="mb-6 h-2 w-48 rounded bg-foreground/5" />
                <div className="grid grid-cols-3 gap-3">
                  {[85, 92, 73].map((score, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border bg-background p-4"
                    >
                      <div className="mb-2 h-2 w-16 rounded bg-foreground/10" />
                      <div className="text-2xl font-bold text-foreground">
                        {score}
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  {[1, 2, 3].map((row) => (
                    <div
                      key={row}
                      className="flex items-center gap-3 rounded-lg border border-border/50 bg-background p-3"
                    >
                      <div className="h-8 w-8 rounded bg-primary/10" />
                      <div className="flex-1 space-y-1">
                        <div className="h-2 w-24 rounded bg-foreground/10" />
                        <div className="h-1.5 w-40 rounded bg-foreground/5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Glow underneath */}
          <div className="absolute -bottom-20 left-1/2 h-40 w-3/4 -translate-x-1/2 bg-primary/5 blur-[80px]" />
        </motion.div>
      </div>
    </SpotlightBackground>
  );
}
