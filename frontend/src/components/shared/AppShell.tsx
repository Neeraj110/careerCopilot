import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import ResumeGate from "./ResumeGate";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-h-screen bg-surface">
        <TopNav />
        <div className="pt-20 px-4 lg:px-8 pb-12">
          <div className="w-full max-w-[1180px] mx-auto">{children}</div>
        </div>
      </main>
      <ResumeGate />
    </div>
  );
}
