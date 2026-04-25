"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users2,
  BookOpen,
  MessageSquare,
  Settings,
  Zap,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/network", label: "Network", icon: Users2 },
  { href: "/resources", label: "Resources", icon: BookOpen },
  { href: "/chat", label: "Chat", icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="hidden lg:[display:flex] h-screen w-64 fixed left-0 top-0 glass-panel border-r border-white/5 flex-col p-4 gap-2 shadow-2xl shadow-black/40 z-50">
      {/* Brand */}
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <Zap className="w-4 h-4 text-on-primary-container" />
        </div>
        <span className="font-headline font-bold tracking-tight text-xl text-primary">
          AI Job Copilot
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm nav-link-hover",
                isActive
                  ? "text-primary bg-surface-container-high font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-surface-container"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-headline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto space-y-3">
        {/* Premium Upgrade */}
        <div className="bg-surface-container-high rounded-xl p-4">
          <p className="text-xs font-bold text-primary mb-1 uppercase tracking-widest">
            Premium Tier
          </p>
          <p className="text-sm text-on-surface-variant mb-3">
            Unlock unlimited AI tailoring and priority job alerts.
          </p>
          <button className="w-full py-2 gradient-primary text-on-primary font-bold rounded-xl text-sm shadow-lg shadow-primary/10 btn-press hover:scale-[1.02] transition-transform">
            Upgrade to Pro
          </button>
        </div>

        {/* Settings */}
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm nav-link-hover",
            pathname === "/settings"
              ? "text-primary bg-surface-container-high font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-surface-container"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="font-headline">Settings</span>
        </Link>

        {/* User info + Logout */}
        <div className="border-t border-white/5 pt-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-on-surface truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-on-surface-variant truncate">
                {user?.email || ""}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-error hover:bg-error/10 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
