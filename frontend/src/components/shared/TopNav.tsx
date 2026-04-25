"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, HelpCircle, Bot, LogOut, Moon, Sun, PanelTop } from "lucide-react";
import SidebarMobile from "./SidebarMobile";
import { useAuthStore } from "@/lib/store/auth";
import { useUiStore } from "@/lib/store/ui";
import { cn } from "@/lib/utils";

export default function TopNav() {
  const { user, logout } = useAuthStore();
  const { theme, density, toggleTheme, toggleDensity } = useUiStore();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 z-40 bg-surface/80 backdrop-blur-xl flex justify-between items-center px-4 lg:px-8 shadow-sm shadow-black/20">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile menu trigger */}
        <SidebarMobile />

        {/* Search */}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
          <input
            type="text"
            placeholder="Search applications or skills..."
            className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline-variant outline-none"
          />
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6 font-body text-sm font-medium">
          {[
            { href: "/network", label: "Network" },
            { href: "/resources", label: "Resources" },
          ].map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-slate-400 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="hover:bg-white/5 rounded-full p-2 transition-colors"
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? (
            <Moon className="w-4 h-4 text-on-surface-variant" />
          ) : (
            <Sun className="w-4 h-4 text-on-surface-variant" />
          )}
        </button>

        <button
          onClick={toggleDensity}
          className="hover:bg-white/5 rounded-full p-2 transition-colors"
          title={density === "compact" ? "Switch to comfortable density" : "Switch to compact density"}
        >
          <PanelTop className="w-4 h-4 text-on-surface-variant" />
        </button>

        {/* AI Assistant button */}
        <button className="hidden sm:flex items-center gap-2 bg-primary-container/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-bold hover:bg-primary/20 transition-colors btn-press">
          <Bot className="w-3.5 h-3.5" />
          AI Assistant
        </button>

        {/* Notifications */}
        <button className="hover:bg-white/5 rounded-full p-2 transition-colors relative">
          <Bell className="w-5 h-5 text-on-surface-variant" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border-2 border-surface" />
        </button>

        {/* Help */}
        <button className="hover:bg-white/5 rounded-full p-2 transition-colors hidden sm:block">
          <HelpCircle className="w-5 h-5 text-on-surface-variant" />
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="hover:bg-error/10 rounded-full p-2 transition-colors hidden sm:block"
          title="Sign out"
        >
          <LogOut className="w-4 h-4 text-on-surface-variant hover:text-error" />
        </button>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/30 ml-2 flex items-center justify-center overflow-hidden">
          <span className="text-xs font-bold text-primary">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </span>
        </div>
      </div>
    </header>
  );
}
