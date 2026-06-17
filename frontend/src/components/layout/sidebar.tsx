"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutGrid,
  FileText,
  BarChart3,
  Layers,
  History,
  Settings,
  LogOut,
  MessageSquare,
  FolderOpen,
  Map,
  Target,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { AILogo } from "./ai-logo";

const NAV = [
  { to: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
  { to: "/dashboard/resumes", icon: FileText, label: "Resumes" },
  { to: "/dashboard/resume-match", icon: Target, label: "Resume Match" },
  { to: "/dashboard/chat", icon: MessageSquare, label: "Chat" },
  { to: "/dashboard/documents", icon: FolderOpen, label: "Documents" },
  { to: "/dashboard/roadmaps", icon: Map, label: "Roadmaps" },
  { to: "/dashboard/insights", icon: BarChart3, label: "Insights" },
  { to: "/dashboard/versions", icon: Layers, label: "Versions" },
  { to: "/dashboard/history", icon: History, label: "History" },
];

const ROW_BASE =
  "relative flex items-center h-11 w-11 rounded-2xl overflow-hidden " +
  "group-hover/sidebar:w-[200px] " +
  "transition-[width,background-color,color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]";

const LABEL_BASE =
  "text-sm font-medium whitespace-nowrap pr-4 " +
  "opacity-0 -translate-x-1 " +
  "transition-[opacity,transform] duration-200 ease-out " +
  "group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:delay-100";

function NavItem({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === to || pathname.startsWith(`${to}/`);

  return (
    <Link href={to} title={label} className="block">
      <div
        className={cn(
          ROW_BASE,
          isActive
            ? "bg-[var(--v2-ink)] text-[var(--v2-bg)] shadow-card"
            : "text-[var(--v2-ink-muted)] hover:bg-surface-2 hover:text-[var(--v2-ink)]"
        )}
      >
        <span className="h-11 w-11 flex items-center justify-center shrink-0">
          <Icon size={18} strokeWidth={2} />
        </span>
        <span className={LABEL_BASE}>{label}</span>
      </div>
    </Link>
  );
}

function ActionRow({ icon: Icon, label, onClick, to }: any) {
  const pathname = usePathname();
  const isActive = to ? pathname === to || pathname.startsWith(`${to}/`) : false;

  const inner = (
    <div
      className={cn(
        ROW_BASE,
        isActive
          ? "bg-[var(--v2-ink)] text-[var(--v2-bg)] shadow-card"
          : "text-[var(--v2-ink-muted)] hover:bg-surface-2 hover:text-[var(--v2-ink)]"
      )}
    >
      <span className="h-11 w-11 flex items-center justify-center shrink-0">
        <Icon size={18} />
      </span>
      <span className={LABEL_BASE}>{label}</span>
    </div>
  );

  if (to) {
    return (
      <Link href={to} title={label} className="block">
        {inner}
      </Link>
    );
  }

  return (
    <button onClick={onClick} title={label} className="block">
      {inner}
    </button>
  );
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const displayName = user?.name || "Account";
  const displayEmail = user?.email || "";

  return (
    <aside
      className={cn(
        "group/sidebar hidden md:flex shrink-0 h-[calc(100vh-32px)] sticky top-4 ml-4",
        "flex-col items-center justify-between py-5 rounded-3xl",
        "bg-surface border border-border shadow-card overflow-y-auto overflow-x-hidden no-scrollbar",
        "w-[88px] hover:w-[248px]",
        "transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      )}
    >
      <div className="flex flex-col items-center gap-6 w-full">
        <div
          className={cn(
            "flex items-center h-14 w-14 group-hover/sidebar:w-[200px]",
            "transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          )}
        >
          <div className="h-12 w-12 flex items-center justify-center shrink-0">
            <AILogo />
          </div>
          <span
            className={cn(
              "ml-2 font-display text-base font-semibold text-[var(--v2-ink)] whitespace-nowrap",
              "opacity-0 -translate-x-1",
              "transition-[opacity,transform] duration-200 ease-out",
              "group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:delay-100"
            )}
          >
            CareerPilot AI
          </span>
        </div>

        <nav className="flex flex-col items-center gap-1.5 overflow-y-auto max-h-[calc(100vh-250px)] no-scrollbar w-full px-2">
          {NAV.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-2 w-full px-2">
        <ActionRow icon={Settings} label="Settings" to="/dashboard/settings" />
        <ActionRow icon={LogOut} label="Log out" onClick={logout} />

        <div
          className={cn(
            "flex items-center h-12 mt-1 w-10 group-hover/sidebar:w-[200px] overflow-hidden",
            "transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          )}
        >
          <div className="h-10 w-10 rounded-full bg-accent-soft text-accent-strong font-semibold flex items-center justify-center text-sm ring-2 ring-surface shrink-0">
            {user?.name?.[0]?.toUpperCase() || "R"}
          </div>
          <div
            className={cn(
              "ml-3 min-w-0 flex-1",
              "opacity-0 -translate-x-1",
              "transition-[opacity,transform] duration-200 ease-out",
              "group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:delay-100"
            )}
          >
            <div className="text-sm font-semibold text-[var(--v2-ink)] truncate">
              {displayName}
            </div>
            {displayEmail && (
              <div className="text-[11px] text-[var(--v2-ink-muted)] truncate">
                {displayEmail}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileNavItem({ to, icon: Icon, label, onClick }: any) {
  const pathname = usePathname();
  const isActive = to ? pathname === to || pathname.startsWith(`${to}/`) : false;

  const inner = (
    <div
      className={cn(
        "flex items-center h-12 w-full rounded-2xl px-4 transition-colors",
        isActive
          ? "bg-[var(--v2-ink)] text-[var(--v2-bg)] shadow-card"
          : "text-[var(--v2-ink-muted)] hover:bg-surface-2 hover:text-[var(--v2-ink)]"
      )}
    >
      <Icon size={18} />
      <span className="ml-3 text-sm font-medium">{label}</span>
    </div>
  );

  if (to) {
    return (
      <Link href={to} onClick={onClick} className="block w-full">
        {inner}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className="block w-full text-left">
      {inner}
    </button>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();
  
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[var(--v2-ink)]/40 z-[100] md:hidden backdrop-blur-sm"
        />
      )}
      {open && (
        <motion.div
          key="sidebar"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          className="fixed inset-y-0 left-0 w-[280px] bg-surface border-r border-border shadow-2xl z-[101] md:hidden flex flex-col py-6 px-4"
        >
          <div className="w-full flex justify-between items-center mb-8 px-2">
            <div className="flex items-center">
              <div className="h-8 w-8 flex items-center justify-center shrink-0">
                <AILogo />
              </div>
              <span className="ml-2 font-display text-base font-semibold text-[var(--v2-ink)]">
                CareerPilot AI
              </span>
            </div>
            <button onClick={onClose} className="p-2 text-[var(--v2-ink-muted)] hover:bg-surface-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <nav className="flex flex-col gap-1 overflow-y-auto no-scrollbar w-full flex-1">
            {NAV.map((item) => (
              <MobileNavItem key={item.to} to={item.to} icon={item.icon} label={item.label} onClick={onClose} />
            ))}
          </nav>

          <div className="flex flex-col gap-1 w-full mt-4 border-t border-border pt-4">
            <MobileNavItem icon={Settings} label="Settings" to="/dashboard/settings" onClick={onClose} />
            <MobileNavItem icon={LogOut} label="Log out" onClick={() => { logout(); onClose(); }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
