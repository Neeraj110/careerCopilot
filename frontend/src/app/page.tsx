"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Zap,
  FileText,
  Network,
  Kanban,
  PlayCircle,
} from "lucide-react";

const HeroAnimation = dynamic(
  () => import("@/components/animations/HeroAnimation"),
  { ssr: false }
);

const ScrollReveal = dynamic(
  () => import("@/components/animations/ScrollReveal"),
  { ssr: false }
);

export default function LandingPage() {
  const { isAuthenticated, isLoading, hydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-xl gradient-primary opacity-60 flex items-center justify-center">
             <Zap className="w-6 h-6 text-on-primary-container" />
          </div>
          <div className="h-3 w-32 bg-surface-container-high rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-2xl shadow-black/20">
        <div className="flex justify-between items-center px-6 lg:px-10 py-4 max-w-[1440px] mx-auto">
          <div className="text-2xl font-bold tracking-tighter font-headline text-white">
            CareerCopilot
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-primary font-semibold text-sm tracking-tight hover:text-white transition-colors" href="#">
              Product
            </a>
            <a className="text-slate-400 font-medium text-sm tracking-tight hover:text-white transition-colors" href="#">
              Intelligence
            </a>
            <a className="text-slate-400 font-medium text-sm tracking-tight hover:text-white transition-colors" href="#">
              Pricing
            </a>
            <a className="text-slate-400 font-medium text-sm tracking-tight hover:text-white transition-colors" href="#">
              Resources
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-400 font-medium text-sm hover:text-white transition-colors hidden sm:block">
              Log In
            </Link>
            <Link
              href="/dashboard"
              className="gradient-primary text-on-primary-container px-5 py-2 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-transform"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* ── Hero Section ── */}
        <HeroAnimation>
          <section className="relative px-6 lg:px-10 pt-16 lg:pt-20 pb-24 lg:pb-32 max-w-[1440px] mx-auto flex flex-col items-center text-center">
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
              <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] lg:w-[800px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
            </div>

            <div
              data-hero-badge
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-primary text-xs font-bold tracking-wider uppercase mb-6 opacity-0"
            >
              <Zap className="w-3.5 h-3.5" />
              The Future of Recruitment is Here
            </div>

            <h1
              data-hero-heading
              className="font-headline text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-8 max-w-4xl leading-[1.1] opacity-0"
            >
              Your Career,{" "}
              <span className="gradient-text">Supercharged</span> by AI
            </h1>

            <p
              data-hero-subtext
              className="text-on-surface-variant text-base sm:text-lg md:text-xl max-w-2xl mb-12 leading-relaxed opacity-0"
            >
              Analyze your resume instantly, discover high-match roles with
              proprietary intelligence, and manage your entire journey on a
              single intelligent canvas.
            </p>

            <div
              data-hero-buttons
              className="flex flex-col sm:flex-row gap-4 mb-16 lg:mb-20 opacity-0"
            >
              <Link
                href="/dashboard"
                className="gradient-primary text-on-primary-container px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-primary/20"
              >
                Start Your Journey
              </Link>
              <button className="bg-surface-container-highest text-on-surface px-8 py-4 rounded-xl font-bold text-lg hover:bg-surface-bright transition-colors flex items-center justify-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Watch Demo
              </button>
            </div>

            {/* Dashboard Preview */}
            <div
              data-hero-preview
              className="relative w-full max-w-6xl rounded-2xl p-[2px] bg-gradient-to-b from-white/10 to-transparent shadow-2xl opacity-0"
            >
              <div className="rounded-2xl overflow-hidden bg-surface-container-lowest border-t border-white/10 p-4 lg:p-8">
                {/* Mini dashboard mockup */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-surface-container rounded-xl p-4">
                    <p className="text-xs text-on-surface-variant mb-1">Applications</p>
                    <p className="text-2xl font-headline font-extrabold text-white">42</p>
                  </div>
                  <div className="bg-surface-container rounded-xl p-4">
                    <p className="text-xs text-on-surface-variant mb-1">Match Score</p>
                    <p className="text-2xl font-headline font-extrabold text-primary">88%</p>
                  </div>
                  <div className="bg-surface-container rounded-xl p-4">
                    <p className="text-xs text-on-surface-variant mb-1">Interviews</p>
                    <p className="text-2xl font-headline font-extrabold text-white">06</p>
                  </div>
                </div>
                {/* Chart bars */}
                <div className="flex items-end gap-3 h-24 px-4">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/20 rounded-t-lg relative overflow-hidden"
                      style={{ height: `${h}%` }}
                    >
                      <div
                        className="absolute bottom-0 w-full bg-primary rounded-t-lg"
                        style={{ height: `${h * 0.7}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </HeroAnimation>

        {/* ── Bento Features ── */}
        <ScrollReveal>
          <section className="px-6 lg:px-10 py-20 lg:py-24 max-w-[1440px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Resume Intelligence */}
              <div className="md:col-span-8 bg-surface-container rounded-2xl p-8 lg:p-10 flex flex-col justify-between group overflow-hidden relative card-hover">
                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-6">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline text-2xl lg:text-3xl font-bold text-white mb-4">
                    Resume Intelligence
                  </h3>
                  <p className="text-on-surface-variant text-base lg:text-lg max-w-md leading-relaxed">
                    Our proprietary LLM analyzes your resume against industry
                    benchmarks, providing actionable scores and semantic
                    improvements to bypass ATS filters.
                  </p>
                </div>
                {/* Match Score Card */}
                <div className="mt-8 self-end bg-surface-container-highest p-6 rounded-2xl shadow-2xl ghost-border w-full sm:w-72 transition-transform duration-500 group-hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-6">
                    <div className="font-bold text-white">Match Score</div>
                    <div className="text-primary font-headline text-2xl font-extrabold">
                      94%
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-primary w-[94%] rounded-full" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant uppercase tracking-widest font-bold">
                    <span className="text-primary">Optimized</span>
                    <span className="opacity-30">•</span>
                    <span>High Relevance</span>
                  </div>
                </div>
              </div>

              {/* Smart Matching */}
              <div className="md:col-span-4 bg-surface-container-low ghost-border rounded-2xl p-8 lg:p-10 flex flex-col card-hover">
                <div className="h-12 w-12 rounded-xl bg-tertiary/20 text-tertiary flex items-center justify-center mb-6">
                  <Network className="w-6 h-6" />
                </div>
                <h3 className="font-headline text-xl lg:text-2xl font-bold text-white mb-4">
                  Smart Matching
                </h3>
                <p className="text-on-surface-variant leading-relaxed mb-8">
                  The Match Engine discovers roles that aren&apos;t just a fit on
                  paper, but align with your career trajectory and skill-depth
                  metrics.
                </p>
                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-3 bg-surface-container p-3 rounded-xl">
                    <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">S</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Senior Architect</div>
                      <div className="text-[10px] text-on-surface-variant">CloudScale AI</div>
                    </div>
                    <div className="ml-auto text-primary text-xs font-bold">
                      98% Fit
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-surface-container p-3 rounded-xl opacity-60">
                    <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-secondary">N</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Lead Engineer</div>
                      <div className="text-[10px] text-on-surface-variant">Nexus Flow</div>
                    </div>
                    <div className="ml-auto text-primary text-xs font-bold">
                      91% Fit
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Tracker */}
              <div className="md:col-span-12 bg-surface-bright/20 ghost-border rounded-2xl p-8 lg:p-10 flex flex-col md:flex-row gap-8 lg:gap-12 items-center overflow-hidden card-hover">
                <div className="md:w-1/2">
                  <div className="h-12 w-12 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center mb-6">
                    <Kanban className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline text-2xl lg:text-3xl font-bold text-white mb-4">
                    Application Tracker
                  </h3>
                  <p className="text-on-surface-variant text-base lg:text-lg leading-relaxed">
                    Stop using spreadsheets. Our intelligent Kanban board tracks
                    your applications, reminds you of follow-ups, and archives
                    interview insights automatically.
                  </p>
                </div>
                <div className="md:w-1/2 flex gap-4 w-full">
                  <div className="flex-1 space-y-4">
                    <div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest px-2">
                      Interviewing
                    </div>
                    <div className="bg-surface-container p-4 rounded-xl shadow-lg border-l-2 border-primary">
                      <div className="text-sm font-bold text-white mb-1">Google UX Design</div>
                      <div className="text-xs text-on-surface-variant">Tomorrow, 10:00 AM</div>
                    </div>
                    <div className="bg-surface-container p-4 rounded-xl shadow-lg opacity-80">
                      <div className="text-sm font-bold text-white mb-1">Apple Lead Dev</div>
                      <div className="text-xs text-on-surface-variant">Monday, 02:30 PM</div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4 hidden sm:block">
                    <div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest px-2">
                      Offered
                    </div>
                    <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                      <div className="text-sm font-bold text-primary mb-1">Stripe Staff Eng</div>
                      <div className="text-xs text-primary/80">$240k Base • Remote</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ── Testimonials ── */}
        <ScrollReveal>
          <section className="px-6 lg:px-10 py-20 lg:py-24 max-w-[1440px] mx-auto text-center">
            <h2 className="font-headline text-2xl lg:text-3xl font-bold text-white mb-12 lg:mb-16">
              Trusted by High-Performance Professionals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  quote:
                    "CareerCopilot completely changed how I approach my job search. The match scores are incredibly accurate, and I landed an offer at Google within 3 weeks.",
                  name: "David Chen",
                  role: "Senior Engineer @ Google",
                  initial: "D",
                  color: "bg-primary/20 text-primary",
                },
                {
                  quote:
                    "The resume analyzer pointed out gaps I never noticed. Once I optimized based on the AI feedback, my response rate from recruiters tripled.",
                  name: "Sarah Jenkins",
                  role: "Product Lead @ Airbnb",
                  initial: "S",
                  color: "bg-secondary/20 text-secondary",
                },
                {
                  quote:
                    "Managing dozens of applications was a nightmare until I found this. The Kanban board and automated tracking keep me sane and organized.",
                  name: "Marcus Thorne",
                  role: "Design Director @ Vercel",
                  initial: "M",
                  color: "bg-tertiary/20 text-tertiary",
                },
              ].map((t, i) => (
                <div
                  key={i}
                  className="bg-surface-container-low p-6 lg:p-8 rounded-2xl text-left ghost-border hover:border-primary/20 transition-colors card-hover"
                >
                  <p className="text-on-surface-variant leading-relaxed mb-6 italic text-sm lg:text-base">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-full ${t.color} flex items-center justify-center`}
                    >
                      <span className="text-sm font-bold">{t.initial}</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{t.name}</div>
                      <div className="text-xs text-on-surface-variant">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* ── Final CTA ── */}
        <ScrollReveal>
          <section className="px-6 lg:px-10 py-24 lg:py-32 max-w-[1440px] mx-auto text-center">
            <div className="relative bg-gradient-to-br from-surface-container-high to-surface-container-low rounded-3xl p-10 md:p-16 lg:p-20 overflow-hidden ghost-border">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -z-10" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-tertiary/10 blur-[100px] -z-10" />
              <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6">
                Join 10,000+ professionals engineering their future.
              </h2>
              <p className="text-on-surface-variant text-base lg:text-lg mb-10 lg:mb-12 max-w-2xl mx-auto">
                Stop guessing. Start knowing. CareerCopilot gives you the data
                and intelligence you need to land your dream role in any market.
              </p>
              <Link
                href="/dashboard"
                className="inline-block gradient-primary text-on-primary-container px-10 py-5 rounded-xl font-bold text-lg lg:text-xl hover:scale-105 active:scale-95 transition-transform shadow-2xl shadow-primary/30"
              >
                Get Started for Free
              </Link>
              <div className="mt-8 text-on-surface-variant text-sm font-medium">
                No credit card required. Cancel anytime.
              </div>
            </div>
          </section>
        </ScrollReveal>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-surface w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 px-6 lg:px-10 py-16 lg:py-20 max-w-[1440px] mx-auto">
          <div className="col-span-2 md:col-span-1">
            <div className="text-lg font-bold font-headline text-white mb-6">
              CareerCopilot
            </div>
            <p className="text-xs uppercase tracking-widest text-slate-500 max-w-[200px]">
              © 2024 CareerCopilot AI. Engineering the future of work.
            </p>
          </div>
          {[
            {
              title: "Platform",
              links: ["Match Engine", "Analytics", "Resume Builder"],
            },
            { title: "Company", links: ["Careers", "Privacy", "Terms"] },
            { title: "Social", links: ["Twitter", "LinkedIn"] },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="text-xs uppercase tracking-widest text-white mb-6 font-bold">
                {section.title}
              </h4>
              <div className="flex flex-col gap-4">
                {section.links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-xs uppercase tracking-widest text-slate-500 hover:text-primary transition-all opacity-80 hover:opacity-100"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
