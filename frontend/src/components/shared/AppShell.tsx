import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-h-screen bg-surface">
        <TopNav />
        <div className="pt-20 px-4 lg:px-8 pb-12">{children}</div>
      </main>
    </div>
  );
}
