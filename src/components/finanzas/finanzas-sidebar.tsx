"use client";

import { FINANZAS_SECTIONS } from "@/lib/admin/finanzas/labels";
import type { FinanzasSection } from "@/lib/admin/finanzas/types";
import { cn } from "@/lib/utils";

interface FinanzasSidebarProps {
  active: FinanzasSection;
  onChange: (section: FinanzasSection) => void;
}

export function FinanzasSidebar({ active, onChange }: FinanzasSidebarProps) {
  return (
    <nav
      className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
      aria-label="Secciones de finanzas"
    >
      {FINANZAS_SECTIONS.map((section) => {
        const Icon = section.icon;
        const isActive = active === section.id;

        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onChange(section.id)}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors lg:w-full",
              isActive
                ? "bg-mu-primary text-white"
                : "text-mu-text-muted hover:bg-mu-accent hover:text-mu-text",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="whitespace-nowrap">{section.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
