"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const UIContext = createContext<any>(null);

const VARIANTS: Record<string, any> = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-[var(--v2-success)] bg-[var(--v2-accent-soft)]",
  },
  error: {
    icon: AlertCircle,
    iconClass: "text-[var(--v2-danger)] bg-[#F8E3E0]",
  },
  info: {
    icon: Info,
    iconClass: "text-[var(--v2-accent-strong)] bg-[var(--v2-accent-soft)]",
  },
};

let _id = 0;
const nextId = () => ++_id;

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<any[]>([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  type ToastFn = ((opts?: any) => number) & {
    success: (title: string, description?: string, opts?: any) => number;
    error: (title: string, description?: string, opts?: any) => number;
    info: (title: string, description?: string, opts?: any) => number;
  };

  const toast = useCallback(
    ({ title, description, variant = "info", duration = 4200 }: any = {}) => {
      const id = nextId();
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss]
  ) as ToastFn;

  // Convenience helpers
  toast.success = (title: string, description?: string, opts?: any) =>
    toast({ title, description, variant: "success", ...opts });
  toast.error = (title: string, description?: string, opts?: any) =>
    toast({ title, description, variant: "error", ...opts });
  toast.info = (title: string, description?: string, opts?: any) =>
    toast({ title, description, variant: "info", ...opts });

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    };
  }, []);

  return (
    <UIContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </UIContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useToast must be used inside UIProvider");
  return ctx; // returns { toast, dismiss }
}

function ToastViewport({ toasts, dismiss }: { toasts: any[]; dismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed top-5 right-5 z-50 flex flex-col gap-2.5 w-[360px] max-w-[calc(100vw-32px)]">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const variant = VARIANTS[t.variant] || VARIANTS.info;
          const Icon = variant.icon;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.18 } }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.18 }}
              className="pointer-events-auto bg-[var(--surface)] border border-[var(--border)] shadow-hover rounded-2xl p-3.5 flex items-start gap-3"
            >
              <div
                className={cn(
                  "h-8 w-8 shrink-0 rounded-xl flex items-center justify-center",
                  variant.iconClass
                )}
              >
                <Icon size={15} />
              </div>
              <div className="flex-1 min-w-0">
                {t.title && (
                  <div className="text-sm font-semibold text-[var(--ink)] leading-tight">
                    {t.title}
                  </div>
                )}
                {t.description && (
                  <div className="text-xs text-[var(--ink-muted)] mt-0.5 leading-snug">
                    {t.description}
                  </div>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="h-7 w-7 rounded-full hover:bg-[var(--surface-2)] flex items-center justify-center text-[var(--ink-muted)] shrink-0"
                aria-label="Dismiss"
              >
                <X size={13} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
