"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopNav } from "@/components/dashboard/top-nav";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

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
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
