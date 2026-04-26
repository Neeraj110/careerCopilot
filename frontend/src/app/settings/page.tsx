"use client";

import { useAuthStore } from "@/lib/store/auth";
import { User, Mail, Shield, LogOut, CreditCard, Bell, ChevronRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push("/login");
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="mb-8 lg:mb-10">
        <h1 className="font-headline font-extrabold text-3xl lg:text-4xl tracking-tight text-on-surface mb-2">
          Account Settings
        </h1>
        <p className="font-body text-on-surface-variant text-sm lg:text-base">
          Manage your profile, preferences, and subscription.
        </p>
      </div>

      <div className="space-y-6 lg:space-y-8">
        {/* Profile Section */}
        <section className="bg-surface-container rounded-xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile Information
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                <span className="text-2xl font-bold text-primary">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <h3 className="text-on-surface font-bold text-lg">{user?.name || "Job Seeker"}</h3>
                <div className="flex items-center gap-1.5 text-sm text-on-surface-variant mt-1">
                  <Mail className="w-4 h-4" />
                  {user?.email || "No email provided"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Subscription Section */}
        <section className="bg-surface-container rounded-xl border border-white/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="p-6 border-b border-white/5 relative z-10">
            <h2 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Subscription Plan
            </h2>
          </div>
          <div className="p-6 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-xs font-bold text-on-surface-variant mb-3">
                Current Plan
              </div>
              <h3 className="text-2xl font-headline font-extrabold text-on-surface flex items-center gap-2">
                Free Tier
              </h3>
              <p className="text-sm text-on-surface-variant mt-2 max-w-sm leading-relaxed">
                You currently have access to basic job matching and resume analysis features.
              </p>
            </div>
            <div className="w-full sm:w-auto p-5 rounded-xl bg-surface-container-high border border-primary/20">
              <h4 className="text-sm font-bold text-primary mb-3">Upgrade to Premium</h4>
              <ul className="space-y-2 mb-4">
                {["Unlimited AI tailored resumes", "Priority job matching", "Advanced cover letter generation"].map((feature, i) => (
                  <li key={i} className="text-xs text-on-surface flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full py-2.5 rounded-lg gradient-primary text-on-primary font-bold text-sm hover:scale-[1.02] transition-transform">
                Upgrade Now
              </button>
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="bg-surface-container rounded-xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security & Preferences
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            <button className="w-full p-6 flex items-center justify-between hover:bg-surface-container-high transition-colors text-left group">
              <div>
                <h3 className="text-sm font-bold text-on-surface mb-1">Change Password</h3>
                <p className="text-xs text-on-surface-variant">Update your account password</p>
              </div>
              <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
            </button>
            <button className="w-full p-6 flex items-center justify-between hover:bg-surface-container-high transition-colors text-left group">
              <div>
                <h3 className="text-sm font-bold text-on-surface mb-1 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Email Notifications
                </h3>
                <p className="text-xs text-on-surface-variant">Manage your job alerts and platform updates</p>
              </div>
              <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-surface-container rounded-xl border border-error/20 overflow-hidden">
          <div className="p-6 border-b border-error/10 bg-error/5">
            <h2 className="text-lg font-headline font-bold text-error flex items-center gap-2">
              Danger Zone
            </h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-on-surface mb-1">Log Out</h3>
                <p className="text-xs text-on-surface-variant">Securely log out of your account on this device</p>
              </div>
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-surface-container-high text-on-surface border border-white/10 hover:border-error/50 hover:text-error transition-colors flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
