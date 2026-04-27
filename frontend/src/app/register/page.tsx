"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Check,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, isAuthenticated, hydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Password strength
  const passwordChecks = [
    { label: "At least 6 characters", pass: password.length >= 6 },
    { label: "Contains a number", pass: /\d/.test(password) },
    {
      label: "Contains uppercase letter",
      pass: /[A-Z]/.test(password),
    },
  ];

  const passwordStrength = passwordChecks.filter((c) => c.pass).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, email, password);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Registration failed");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left: Decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface-container-low to-surface" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[100px]" />

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
            Start your <span className="gradient-text">AI-powered</span>{" "}
            career journey
          </h2>
          <p className="text-on-surface-variant leading-relaxed mb-10">
            Create your free account and get instant access to resume
            analysis, job matching, and career intelligence tools.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "10K+", label: "Professionals" },
              { value: "94%", label: "Avg Match" },
              { value: "3x", label: "Faster Hiring" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-surface-container/60 rounded-xl p-4 text-center ghost-border"
              >
                <div className="text-xl font-headline font-extrabold text-primary">
                  {stat.value}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Register form */}
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
            Create your account
          </h1>
          <p className="text-on-surface-variant text-sm mb-8">
            Free forever. No credit card required.
          </p>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-medium animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="register-name"
                className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2"
              >
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Sterling"
                className="w-full bg-surface-container-low rounded-xl py-3 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline-variant outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="register-email"
                className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2"
              >
                Email Address
              </label>
              <input
                id="register-email"
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
              <label
                htmlFor="register-password"
                className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
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

              {/* Password strength */}
              {password.length > 0 && (
                <div className="mt-3 space-y-2 animate-fade-in">
                  {/* Strength bar */}
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex-1 h-1 rounded-full transition-colors",
                          i <= passwordStrength
                            ? passwordStrength === 1
                              ? "bg-error"
                              : passwordStrength === 2
                                ? "bg-secondary"
                                : "bg-primary"
                            : "bg-surface-container-high"
                        )}
                      />
                    ))}
                  </div>
                  {/* Checks */}
                  <div className="space-y-1">
                    {passwordChecks.map((check) => (
                      <div
                        key={check.label}
                        className="flex items-center gap-2 text-xs"
                      >
                        {check.pass ? (
                          <Check className="w-3 h-3 text-primary" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-outline-variant/40" />
                        )}
                        <span
                          className={cn(
                            check.pass
                              ? "text-primary"
                              : "text-on-surface-variant"
                          )}
                        >
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="register-confirm"
                className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2"
              >
                Confirm Password
              </label>
              <input
                id="register-confirm"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  "w-full bg-surface-container-low rounded-xl py-3 px-4 text-sm text-on-surface focus:ring-2 transition-all placeholder:text-outline-variant outline-none",
                  confirmPassword.length > 0 && confirmPassword !== password
                    ? "focus:ring-error/30 ring-1 ring-error/20"
                    : "focus:ring-primary/30"
                )}
              />
              {confirmPassword.length > 0 && confirmPassword !== password && (
                <p className="text-error text-xs mt-1 font-medium">
                  Passwords do not match
                </p>
              )}
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
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
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

          {/* Social login */}
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

          {/* Terms */}
          <p className="text-xs text-outline text-center mt-6 leading-relaxed">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-on-surface-variant hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-on-surface-variant hover:text-primary">
              Privacy Policy
            </a>
            .
          </p>

          {/* Login link */}
          <p className="text-center text-sm text-on-surface-variant mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-bold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
