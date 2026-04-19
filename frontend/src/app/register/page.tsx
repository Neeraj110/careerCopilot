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
