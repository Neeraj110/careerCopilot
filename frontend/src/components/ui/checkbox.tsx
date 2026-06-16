import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  label?: string;
}

export function Checkbox({ checked, onChange, className, label }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex items-center gap-2 select-none focus-visible:outline-none",
        className
      )}
    >
      <span
        className={cn(
          "h-4 w-4 rounded-md border flex items-center justify-center transition-colors",
          checked
            ? "bg-accent-v2 border-transparent text-white"
            : "bg-surface border-border text-transparent"
        )}
      >
        <Check size={11} strokeWidth={3} />
      </span>
      {label && (
        <span className="text-xs text-ink-muted">{label}</span>
      )}
    </button>
  );
}
