import { Check, Star, Zap } from "lucide-react";
import Link from "next/link";
import AppShell from "@/components/shared/AppShell";
import AuthGuard from "@/components/shared/AuthGuard";

export default function PricingPage() {
  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-6xl mx-auto py-12 px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="font-headline font-extrabold text-4xl md:text-5xl tracking-tight text-white mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
              Upgrade to Pro for advanced features and unlimited AI capabilities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-surface-container rounded-3xl p-8 border border-white/5 flex flex-col hover:border-white/10 transition-colors duration-300">
              <div className="mb-8">
                <h3 className="font-headline font-bold text-2xl text-on-surface mb-2">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-on-surface-variant font-medium">/month</span>
                </div>
                <p className="text-on-surface-variant mt-4 text-sm">Perfect for getting started with your job search.</p>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "Basic Resume Analysis",
                  "Limited Job Matching",
                  "Standard Support",
                  "Community Access"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-on-surface">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link href="/dashboard" className="w-full py-4 bg-surface-container-high hover:bg-surface-container-highest text-white font-bold rounded-xl text-center transition-colors">
                Current Plan
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-surface-container rounded-3xl p-8 border border-primary/30 relative flex flex-col transform hover:-translate-y-1 transition-all duration-300 shadow-2xl shadow-primary/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 gradient-primary px-4 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                <Star className="w-3.5 h-3.5 text-on-primary-container fill-on-primary-container" />
                <span className="text-xs font-bold text-on-primary-container uppercase tracking-wider">Most Popular</span>
              </div>
              
              <div className="mb-8">
                <h3 className="font-headline font-bold text-2xl text-primary mb-2 flex items-center gap-2">
                  Pro <Zap className="w-5 h-5 fill-primary" />
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$15</span>
                  <span className="text-on-surface-variant font-medium">/month</span>
                </div>
                <p className="text-on-surface-variant mt-4 text-sm">Unlock the full power of CareerCopilot AI.</p>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "Advanced AI Resume Optimization",
                  "Unlimited Priority Job Matching",
                  "Cover Letter Generation",
                  "Interview Prep Copilot",
                  "Priority Email Support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-on-surface">
                    <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-on-primary-container" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button className="w-full py-4 gradient-primary text-on-primary-container font-bold rounded-xl transition-transform hover:scale-[1.02] shadow-lg shadow-primary/20">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
