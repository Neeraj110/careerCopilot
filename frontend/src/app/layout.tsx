import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider-v2";
import { UIProvider } from "@/providers/ui-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CareerPilot AI",
    template: "%s | CareerPilot AI",
  },
  description:
    "Learn skills, analyze resumes, generate roadmaps, and improve resumes using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');` }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-blue-500/30 selection:text-white">
        <ThemeProvider>
          <UIProvider>
            <QueryProvider>
              <TooltipProvider>
                {children}
              </TooltipProvider>
            </QueryProvider>
          </UIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

