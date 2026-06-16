"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isCheckingAuth, loadUser } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (isMounted && !isCheckingAuth && !isAuthenticated) {
      router.push("/login");
    }
  }, [isMounted, isAuthenticated, isCheckingAuth, router]);

  if (!isMounted || isCheckingAuth || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bg">
        <Loader2 className="h-8 w-8 animate-spin text-accent-v2" />
      </div>
    );
  }

  return (
    <AppShell>
      {children}
    </AppShell>
  );
}

