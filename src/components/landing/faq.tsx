"use client";

import { FAQ_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="mu-section bg-mu-surface" aria-labelledby="faq-title">
      <div className="mu-container max-w-3xl">
        <h2
          id="faq-title"
          className="text-center font-heading text-2xl font-bold text-mu-text sm:text-3xl"
        >
          Preguntas frecuentes
        </h2>

        <div className="mt-10 divide-y divide-mu-border rounded-mu-lg border border-mu-border">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            const buttonId = `faq-button-${index}`;
            const panelId = `faq-panel-${index}`;

            return (
              <div key={item.q}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-medium text-mu-text transition-colors hover:text-mu-primary"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    {item.q}
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-mu-text-muted transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="px-6 pb-5 text-sm leading-relaxed text-mu-text-muted"
                >
                  {item.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
