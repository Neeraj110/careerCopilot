"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Lock, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const { accessToken } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_BASE}/api/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to change password");
      } else {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => router.push("/settings"), 2000);
      }
    } catch {
      setError("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in pb-12">
      <div className="mb-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>
        <h1 className="font-headline font-extrabold text-3xl tracking-tight text-on-surface mb-2">
          Change Password
        </h1>
        <p className="font-body text-on-surface-variant text-sm">
          Update your account password to stay secure.
        </p>
      </div>

      <section className="bg-surface-container rounded-xl border border-white/5 p-6 md:p-8">
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-medium animate-fade-in flex items-center gap-3">
            <Lock className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm font-medium animate-fade-in">
            Password successfully changed! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full bg-surface-container-low rounded-xl py-3 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline-variant outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 chars)"
              className="w-full bg-surface-container-low rounded-xl py-3 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline-variant outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full bg-surface-container-low rounded-xl py-3 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline-variant outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || success}
            className={cn(
              "w-full mt-4 py-3.5 gradient-primary text-on-primary-container font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all",
              (isSubmitting || success) ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                Update Password
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
