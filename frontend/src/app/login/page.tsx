"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, hydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await login(email, password);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left: Decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface-container-low to-surface" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-tertiary/5 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-md px-12">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-on-primary-container" />
            </div>
            <span className="font-headline font-bold text-2xl text-primary">
              CareerCopilot
            </span>
          </div>

          <h2 className="font-headline text-3xl font-extrabold text-white mb-4 leading-tight">
            Your Career,{" "}
            <span className="gradient-text">Supercharged</span> by AI
          </h2>
          <p className="text-on-surface-variant leading-relaxed mb-10">
            Join 10,000+ professionals who use AI-powered resume analysis,
            smart job matching, and career intelligence to land their dream
            roles faster.
          </p>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              "AI Resume Analysis & ATS Scoring",
              "Smart Job Matching Engine",
              "Personalized Career Insights",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 text-sm text-on-surface-variant"
              >
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3 h-3 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-on-primary-container" />
            </div>
            <span className="font-headline font-bold text-xl text-primary">
              CareerCopilot
            </span>
          </div>

          <h1 className="font-headline text-3xl font-extrabold text-white mb-2">
            Welcome back
          </h1>
          <p className="text-on-surface-variant text-sm mb-8">
            Sign in to your account to continue your career journey.
          </p>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-medium animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2"
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-surface-container-low rounded-xl py-3 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline-variant outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="login-password"
                  className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-low rounded-xl py-3 px-4 pr-12 text-sm text-on-surface focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline-variant outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full py-3.5 gradient-primary text-on-primary-container font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all",
                isSubmitting
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-outline font-medium uppercase tracking-widest">
              or
            </span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/google`}
              className="flex items-center justify-center gap-2 py-3 bg-surface-container-high rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-highest hover:text-white transition-colors btn-press"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </a>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/github`}
              className="flex items-center justify-center gap-2 py-3 bg-surface-container-high rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-highest hover:text-white transition-colors btn-press"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-on-surface-variant">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary font-bold hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
