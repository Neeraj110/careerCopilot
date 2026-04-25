"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users2,
  BookOpen,
  MessageSquare,
  Settings,
  Zap,
  X,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/network", label: "Network", icon: Users2 },
  { href: "/resources", label: "Resources", icon: BookOpen },
  { href: "/chat", label: "Chat", icon: MessageSquare },
];

export function MobileMenuButton() {
  return null; // Trigger is handled by SidebarMobile
}

export default function SidebarMobile() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Hamburger trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 rounded-xl hover:bg-surface-container transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-on-surface-variant" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] lg:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-72 glass-panel-strong border-r border-white/5 flex flex-col p-4 gap-2 shadow-2xl z-[70] transition-transform duration-300 ease-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-on-primary-container" />
            </div>
            <span className="font-headline font-bold tracking-tight text-xl text-primary">
              AI Job Copilot
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:bg-surface-container-high transition-colors"
          >
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
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
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors",
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

        {/* Settings */}
        <div className="mt-auto">
          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-surface-container transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="font-headline">Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
