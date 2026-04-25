import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/lib/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["100", "300", "400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareerCopilot — Your Career, Supercharged by AI",
  description:
    "Analyze your resume instantly, discover high-match roles with proprietary intelligence, and manage your entire career journey on a single intelligent canvas.",
  keywords: [
    "AI resume analyzer",
    "job matching",
    "career intelligence",
    "ATS score",
    "job search",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${roboto.variable} font-body bg-surface text-on-surface antialiased selection:bg-primary/30`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
