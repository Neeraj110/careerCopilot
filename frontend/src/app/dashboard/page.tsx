"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Files, 
  MessageSquare, 
  CheckCircle, 
  Map,
  ArrowRight,
  TrendingUp,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { documentsApi } from "@/lib/api/documents";
import { chatApi } from "@/lib/api/chat";
import type { Document, Chat } from "@/types";

export default function DashboardHomePage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, chatsRes] = await Promise.all([
          documentsApi.getAll(),
          chatApi.getAll()
        ]);
        setDocuments(docsRes.data || []);
        setChats(chatsRes.data || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { name: "Documents Analyzed", value: documents.length.toString(), icon: Files, trend: "Total uploaded" },
    { name: "AI Chats", value: chats.length.toString(), icon: MessageSquare, trend: "Total conversations" },
    { name: "Avg ATS Score", value: "N/A", icon: CheckCircle, trend: "Not tracked yet" },
    { name: "Roadmap Progress", value: "N/A", icon: Map, trend: "Not tracked yet" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold tracking-tight">
          Welcome back, {user?.email ? user.email.split('@')[0] : 'User'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your career journey today.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-64 w-full items-center justify-center border rounded-xl border-border/50 bg-card/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-border/40 bg-card/30 backdrop-blur-xl hover:border-primary/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.name}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-primary opacity-80" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-primary" />
                      {stat.trend}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Recent Documents */}
            <Card className="md:col-span-1 lg:col-span-4 border-border/40 bg-card/30 backdrop-blur-xl hover:border-primary/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Documents</CardTitle>
                  <CardDescription>You have uploaded {documents.length} documents.</CardDescription>
                </div>
                <Link href="/dashboard/documents" className="inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                  View All <ArrowRight className="h-4 w-4 text-primary" />
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                  ) : (
                    documents.slice(0, 5).map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between border-b border-border/40 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Files className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            doc.status === 'COMPLETED' ? 'bg-success/10 text-success' : 
                            (doc.status === 'PENDING' || doc.status === 'PROCESSING') ? 'bg-warning/10 text-warning' : 
                            'bg-danger/10 text-danger'
                          }`}>
                            {doc.status === 'FAILED' ? 'Could not upload' : doc.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ATS Score Chart Placeholder */}
            <Card className="md:col-span-1 lg:col-span-3 border-border/40 bg-card/30 backdrop-blur-xl hover:border-purple-500/30 hover:shadow-[0_0_15px_rgba(168,85,247,0.1)] transition-all duration-300">
              <CardHeader>
                <CardTitle>ATS Score History</CardTitle>
                <CardDescription>Your resume score trend over time.</CardDescription>
              </CardHeader>
              <CardContent className="flex h-[250px] items-center justify-center border-t border-border/40">
                <div className="flex flex-col items-center text-center text-muted-foreground">
                  <CheckCircle className="mb-2 h-10 w-10 opacity-20 text-purple-500" />
                  <p>Chart visualization will appear here.</p>
                  <p className="text-sm">Upload more resumes to see trends.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
