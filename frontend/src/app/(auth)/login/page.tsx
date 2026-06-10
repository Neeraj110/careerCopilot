"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { loginSchema, type LoginFormValues } from "@/lib/validations";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch {
      // Error handled by store
    }
  };

  return (
    <div>
      <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">
        Welcome back
      </h1>
      <p className="mb-8 text-muted-foreground">
        Sign in to your CareerPilot account
      </p>

      {error && (
        <div className="mb-6 rounded-lg border border-danger/20 bg-danger-muted px-4 py-3 text-sm text-danger">
          {error}
          <button onClick={clearError} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-danger">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1.5 text-xs text-danger">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign In
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
