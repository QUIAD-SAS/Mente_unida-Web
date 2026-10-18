"use client";

import { FEED_FILTERS, type CommunityFeedFilter } from "@/lib/community/constants";
import { cn } from "@/lib/utils";

interface CommunityFeedFiltersProps {
  value: CommunityFeedFilter;
  onChange: (filter: CommunityFeedFilter) => void;
}

export function CommunityFeedFilters({
  value,
  onChange,
}: CommunityFeedFiltersProps) {
  return (
    <div
      className="mb-4 flex gap-1 overflow-x-auto border-b border-mu-border pb-px"
      role="tablist"
      aria-label="Filtrar publicaciones"
    >
      {FEED_FILTERS.map((filter) => {
        const active = value === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(filter.id)}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-mu-primary text-mu-primary"
                : "border-transparent text-mu-text-muted hover:text-mu-text",
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
