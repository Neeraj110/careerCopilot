import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import type { ReactNode } from "react";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
