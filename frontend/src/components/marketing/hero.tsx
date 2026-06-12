"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MessageSquare,
  Cloud,
  Hexagon,
  Box,
  Database,
  Cpu,
  Layers,
  Globe,
  Star,
  CheckCircle2,
  Mail,
  FileText
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const orbitIcons = [
  { icon: MessageSquare, color: "text-blue-500", top: "15%", left: "20%", delay: 0 },
  { icon: Cloud, color: "text-orange-500", top: "25%", left: "75%", delay: 0.2 },
  { icon: Hexagon, color: "text-green-500", top: "60%", left: "15%", delay: 0.4 },
  { icon: Database, color: "text-purple-500", top: "70%", left: "80%", delay: 0.6 },
  { icon: Cpu, color: "text-pink-500", top: "40%", left: "88%", delay: 0.8 },
  { icon: Layers, color: "text-yellow-500", top: "80%", left: "30%", delay: 1.0 },
  { icon: Globe, color: "text-indigo-500", top: "10%", left: "60%", delay: 1.2 },
];

export function Hero() {
  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-background text-foreground pt-20">

      {/* Orbital Background Rings */}
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1200px] aspect-square pointer-events-none">
        <div className="absolute inset-0 m-auto w-[35%] h-[35%] rounded-full border border-border/60" />
        <div className="absolute inset-0 m-auto w-[55%] h-[55%] rounded-full border border-border/40" />
        <div className="absolute inset-0 m-auto w-[75%] h-[75%] rounded-full border border-border/20" />
        <div className="absolute inset-0 m-auto w-[95%] h-[95%] rounded-full border border-border/10" />

        {/* Orbiting Icons */}
        {orbitIcons.map((item, i) => (
          <motion.div
            key={i}
            className="absolute flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border shadow-md"
            style={{ top: item.top, left: item.left }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: item.delay }}
          >
            <item.icon className={`w-5 h-5 ${item.color}`} />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 mt-16">

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center gap-4 text-sm font-medium text-muted-foreground bg-card/50 backdrop-blur-sm border border-border/50 px-4 py-2 rounded-full"
        >
          <div className="flex items-center gap-1.5">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">G</span>
            <span className="text-foreground">4.6</span> Google
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-green-500 fill-green-500" />
            <span className="text-foreground">4.9</span> Trustpilot
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl font-heading text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl mb-6"
        >
          AI-Powered Resume Analyzer & Improver
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-xl text-lg text-muted-foreground mb-10"
        >
          Upload your resume and get instant, AI-driven feedback to optimize your profile, beat the ATS, and land your dream job.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            href="/dashboard/resume-analyzer"
            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors shadow-lg shadow-foreground/10"
          >
            Analyze Resume Now
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-border bg-card hover:bg-muted font-medium transition-colors shadow-sm"
          >
            Create an Account
          </Link>
        </motion.div>

        {/* Floating Mockups */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative mt-20 w-full max-w-lg h-48 flex flex-col items-center pointer-events-none"
        >
          {/* Card 1 */}
          <div className="absolute top-0 z-10 w-full max-w-sm rounded-xl border border-border bg-card/80 backdrop-blur-md p-3 shadow-xl flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-bold">95</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium leading-none"><span className="text-foreground">Resume Score</span> improved to <span className="font-semibold text-foreground">95/100</span></p>
              <p className="text-xs text-muted-foreground mt-1">2 mins ago • ATS Optimization</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="absolute top-12 z-20 w-full max-w-[340px] rounded-xl border border-border bg-card/90 backdrop-blur-md p-3 shadow-2xl flex items-center gap-3 translate-x-4">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarFallback className="bg-green-100 text-green-600 text-xs font-bold">SJ</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium leading-none text-foreground">Sarah Jenkins</p>
              <p className="text-xs text-muted-foreground mt-1">Software Engineer • Resume Analyzed</p>
            </div>
            <div className="h-6 w-6 rounded bg-muted flex items-center justify-center flex-col gap-[2px]">
              <span className="block w-1 h-1 rounded-full bg-muted-foreground"></span>
              <span className="block w-1 h-1 rounded-full bg-muted-foreground"></span>
              <span className="block w-1 h-1 rounded-full bg-muted-foreground"></span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="absolute top-24 z-30 w-full max-w-[300px] rounded-xl border border-border bg-card backdrop-blur-md p-3 shadow-2xl flex items-center gap-3 translate-x-12">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 border border-indigo-200">
              <FileText className="h-4 w-4" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium leading-none text-foreground">Actionable Feedback</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">Added 3 strong action verbs to experience...</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Trusted By Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="mt-auto pt-24 w-full z-10 px-4"
      >
        <p className="text-center text-sm font-medium text-muted-foreground mb-8">Trusted by 200,000+ users worldwide</p>
        {/* <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2 font-bold text-lg"><Globe className="w-5 h-5" /> Google</div>
          <div className="flex items-center gap-2 font-bold text-lg"><Hexagon className="w-5 h-5" /> airbnb</div>
          <div className="flex items-center gap-2 font-bold text-lg"><Database className="w-5 h-5" /> coinbase</div>
          <div className="flex items-center gap-2 font-bold text-lg"><Box className="w-5 h-5" /> Notion</div>
          <div className="flex items-center gap-2 font-bold text-lg uppercase tracking-wider text-base"><Layers className="w-5 h-5" /> Gumroad</div>
          <div className="flex items-center gap-2 font-bold text-lg italic"><MessageSquare className="w-5 h-5" /> PayPal</div>
        </div> */}
      </motion.div>

    </div>
  );
}
