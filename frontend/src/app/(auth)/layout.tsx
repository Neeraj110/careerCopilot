import Link from "next/link";
import { Compass } from "lucide-react";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left: Branding */}
      <div className="relative hidden flex-1 items-center justify-center bg-surface lg:flex">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-md px-12">
          <Link href="/" className="mb-12 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <span className="font-heading text-2xl font-bold text-foreground">
              CareerPilot
            </span>
          </Link>
          <h2 className="mb-4 font-heading text-3xl font-bold leading-tight text-foreground">
            Navigate your career with AI precision
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Analyze resumes, chat with documents, generate learning roadmaps,
            and optimize your career trajectory — all powered by AI.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              { value: "10K+", label: "Users" },
              { value: "50K+", label: "Documents Analyzed" },
              { value: "92%", label: "Avg. ATS Score Improvement" },
              { value: "4.9★", label: "User Rating" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
