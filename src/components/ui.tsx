import type { ReactNode } from "react";
import { Icon } from "./Icon";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-[1240px] px-4 sm:px-5 md:px-12 ${className}`}>{children}</div>;
}

export const fieldClass =
  "w-full rounded-lg border border-line-soft/70 bg-white px-4 py-3 text-base text-ink shadow-sm outline-none transition placeholder:text-line focus:border-primary-container focus:ring-2 focus:ring-primary-container/20";

export function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5" htmlFor={htmlFor}>
      <span className="font-display text-sm font-semibold text-ink">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
      {hint ? <span className="text-xs leading-5 text-ink-soft">{hint}</span> : null}
    </label>
  );
}

export function Eyebrow({ children, tone = "secondary" }: { children: ReactNode; tone?: "secondary" | "primary" }) {
  return (
    <span
      className={`font-display text-xs font-semibold uppercase tracking-[0.08em] ${tone === "primary" ? "text-primary" : "text-secondary"}`}
    >
      {children}
    </span>
  );
}

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button className="absolute inset-0 bg-ink/45 backdrop-blur-sm" aria-label="Cerrar" onClick={onClose} />
      <div className="relative flex max-h-[min(90vh,100dvh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-surface-high bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-surface-high bg-surface-low px-4 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <h3 id="modal-title" className="font-display text-xl font-semibold leading-7 text-ink sm:text-[22px]">
              {title}
            </h3>
            {subtitle ? <p className="mt-0.5 text-xs leading-5 text-ink-soft">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-mid text-ink-soft transition hover:bg-surface-highest"
            aria-label="Cerrar ventana"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-5 sm:px-6">{children}</div>
        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-surface-high bg-surface-low px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6 [&_a]:w-full [&_button]:w-full sm:[&_a]:w-auto sm:[&_button]:w-auto">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
