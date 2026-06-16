"use client";

import { Search, Sun, Moon } from "lucide-react";
import { usePathname } from "next/navigation";
import { IconButton } from "@/components/ui/icon-button";
import { useTheme } from "@/providers/theme-provider-v2";
import { useAuth } from "@/hooks/use-auth";
import { NotificationsPopover } from "./notifications-popover";
import { useState, useEffect } from "react";

export function Topbar({ onOpenPalette }: { onOpenPalette?: () => void }) {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "there";
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/i.test(navigator.platform));
  }, []);

  return (
    <header className={`flex items-start justify-between gap-6 ${isDashboard ? 'mb-8' : 'mb-4'}`}>
      <div>
        {isDashboard && (
          <>
            <h1 className="font-display text-[clamp(28px,3vw,38px)] font-semibold leading-tight text-ink">
              Hello, {firstName}.
            </h1>
            <p className="text-sm text-ink-muted mt-1">
              Sharpen your resume with calm, focused AI insights.
            </p>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenPalette}
          className="hidden lg:flex items-center gap-3 h-11 w-[360px] rounded-full bg-surface border border-border pl-5 pr-1.5 shadow-card transition-shadow hover:shadow-hover text-left"
        >
          <Search size={16} className="text-ink-muted shrink-0" />
          <span className="flex-1 text-sm text-ink-muted truncate">
            Search resumes, keywords, rewrites...
          </span>
          <kbd className="inline-flex items-center gap-0.5 text-[10px] px-2 h-7 rounded-full bg-surface-2 text-ink-muted border border-border font-semibold">
            {isMac ? "⌘" : "Ctrl"} K
          </kbd>
        </button>

        <IconButton
          onClick={onOpenPalette}
          title="Search"
          className="lg:hidden"
        >
          <Search size={16} />
        </IconButton>

        <IconButton onClick={toggle} title="Toggle theme">
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </IconButton>
        <NotificationsPopover />
      </div>
    </header>
  );
}
