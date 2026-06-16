import { cn } from "@/lib/utils";

interface VersionSwitcherProps {
  versions: any[];
  activeId: string | null;
  onChange: (id: string) => void;
}

export function VersionSwitcher({ versions, activeId, onChange }: VersionSwitcherProps) {
  if (!versions?.length) return null;
  return (
    <div className="inline-flex items-center gap-1 bg-surface-2 border border-border p-1 rounded-full">
      {versions.map((v) => (
        <button
          key={v.id}
          onClick={() => onChange(v.id)}
          className={cn(
            "h-8 px-3 text-xs font-medium rounded-full transition-colors tabular",
            activeId === v.id
              ? "bg-surface text-ink shadow-card"
              : "text-ink-muted hover:text-ink"
          )}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
