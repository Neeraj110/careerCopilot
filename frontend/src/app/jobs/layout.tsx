import AppShell from "@/components/shared/AppShell";
import AuthGuard from "@/components/shared/AuthGuard";

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
