import type { ReactNode } from "react";
import { Icon } from "../../components/Icon";

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`min-w-0 rounded-2xl bg-white p-5 shadow-sm ${className}`}>{children}</section>;
}

export function Stat({
  label,
  value,
  hint,
  icon,
  hintClass = "text-ink-soft",
}: {
  label: string;
  value: string;
  hint: string;
  icon: string;
  hintClass?: string;
}) {
  return (
    <article className="flex items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm">
      <div className="min-w-0">
        <p className="text-sm text-ink-soft">{label}</p>
        <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">{value}</p>
        <p className={`mt-1 text-sm ${hintClass}`}>{hint}</p>
      </div>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-low text-primary">
        <Icon name={icon} className="text-[20px]" />
      </span>
    </article>
  );
}

export function Avatar({ initials, className = "" }: { initials: string; className?: string }) {
  return (
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-mid font-display text-sm font-semibold text-primary ${className}`}>
      {initials}
    </span>
  );
}
