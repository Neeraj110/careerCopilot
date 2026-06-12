"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Files,
  MessageSquare,
  FileSearch,
  CheckCircle,
  FileCheck2,
  Map,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const sidebarItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Documents", href: "/dashboard/documents", icon: Files },
  { name: "AI Chat", href: "/dashboard/chat", icon: MessageSquare },
  { name: "Resume Analyzer", href: "/dashboard/resume-analyzer", icon: FileSearch },
  { name: "Resume Match", href: "/dashboard/resume-match", icon: FileCheck2 },
  { name: "Roadmaps", href: "/dashboard/roadmaps", icon: Map },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ width: 260 }}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden md:flex relative z-20 h-screen flex-col border-r border-border/40 bg-card/40 backdrop-blur-xl shadow-xl shadow-black/20"
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-lg font-heading font-bold"
            >
              CareerPilot
            </motion.span>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            
            const content = (
              <span
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                    isCollapsed ? "mr-0" : "mr-3"
                  )}
                />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {item.name}
                  </motion.span>
                )}
              </span>
            );

            if (!isCollapsed) {
              return (
                <Link key={item.name} href={item.href}>
                  {content}
                </Link>
              );
            }

            return (
              <Tooltip key={item.name}>
                <TooltipTrigger render={<Link href={item.href} />}>
                  {content}
                </TooltipTrigger>
                <TooltipContent side="right" className="font-semibold">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border/50 p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </motion.aside>
  );
}
