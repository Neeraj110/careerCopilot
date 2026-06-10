"use client";

import { InfiniteMovingCards } from "@/components/ui/aceternity/infinite-moving-cards";

const testimonials = [
  {
    quote:
      "CareerPilot's ATS checker helped me identify critical missing keywords. My callback rate went from 5% to 35% in two weeks.",
    name: "Sarah Chen",
    title: "Software Engineer at Google",
  },
  {
    quote:
      "The resume vs JD match feature is incredible. I can now tailor my resume for each application with precision.",
    name: "Marcus Johnson",
    title: "Product Manager at Stripe",
  },
  {
    quote:
      "The learning roadmap generator saved me hours of planning. It curated the exact resources I needed to transition into ML engineering.",
    name: "Priya Patel",
    title: "ML Engineer at Meta",
  },
  {
    quote:
      "Being able to chat with my documents using AI is a game-changer for research. The source references make it trustworthy.",
    name: "David Kim",
    title: "Data Scientist at Netflix",
  },
  {
    quote:
      "The resume optimizer rewrote my bullet points to be ATS-friendly while keeping my authentic voice. My resume score jumped 30 points.",
    name: "Emily Rodriguez",
    title: "Senior Developer at Microsoft",
  },
];

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Testimonials
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Loved by{" "}
            <span className="gradient-text-primary">professionals worldwide</span>
          </h2>
        </div>
      </div>

      <InfiniteMovingCards
        items={testimonials}
        direction="left"
        speed="slow"
      />
    </section>
  );
}
