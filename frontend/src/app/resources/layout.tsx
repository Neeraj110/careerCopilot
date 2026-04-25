import AppShell from "@/components/shared/AppShell";
import AuthGuard from "@/components/shared/AuthGuard";

export default function ResourcesLayout({
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