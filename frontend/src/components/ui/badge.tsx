import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-tight tabular",
  {
    variants: {
      tone: {
        neutral: "bg-surface-2 text-ink-muted border border-border",
        accent: "bg-accent-soft text-accent-strong",
        success: "bg-accent-soft text-success",
        warning: "bg-[#FBF1E2] text-warning",
        danger: "bg-[#F8E3E0] text-danger",
        ink: "bg-ink text-bg",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { badgeVariants };
