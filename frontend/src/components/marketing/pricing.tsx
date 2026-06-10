"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with basic career tools.",
    features: [
      "5 document uploads",
      "10 AI chat messages / day",
      "3 ATS analyses / month",
      "1 learning roadmap",
      "Basic resume matching",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/ month",
    description: "For professionals serious about career growth.",
    features: [
      "Unlimited document uploads",
      "Unlimited AI chat",
      "Unlimited ATS analyses",
      "Unlimited roadmaps",
      "Resume optimizer (AI rewrite)",
      "Priority processing",
      "Chat history export",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For teams and organizations.",
    features: [
      "Everything in Pro",
      "Team management",
      "SSO & SAML",
      "Custom AI models",
      "API access",
      "Dedicated support",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Start free and upgrade as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative overflow-hidden rounded-2xl border p-8",
                plan.popular
                  ? "border-primary bg-card shadow-lg shadow-primary/5"
                  : "border-border bg-card",
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 rounded-bl-xl bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="mb-1 font-heading text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="font-heading text-4xl font-bold text-foreground">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="ml-1 text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                )}
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={cn(
                  "inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors",
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                    : "border border-border bg-background text-foreground hover:bg-card-hover",
                )}
              >
                {plan.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
