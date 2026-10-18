"use client";

import { SoporteChatPanel } from "@/components/soporte/soporte-chat-panel";
import { SoporteConversationsSidebar } from "@/components/soporte/soporte-conversations-sidebar";
import { SoporteUserInfoPanel } from "@/components/soporte/soporte-user-info-panel";
import {
  useSoporteConversation,
  useSoporteConversations,
} from "@/lib/admin/soporte/queries";
import type { SoporteFilters } from "@/lib/admin/soporte/types";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { useState } from "react";

type MobileView = "list" | "chat" | "info";

export function SoporteView() {
  const [filters, setFilters] = useState<SoporteFilters>({
    status: "all",
    search: "",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const [showInfoMobile, setShowInfoMobile] = useState(false);

  const { data, isLoading, isError } = useSoporteConversations(filters);
  const detailQuery = useSoporteConversation(selectedId);

  function handleSelect(id: string) {
    setSelectedId(id);
    setMobileView("chat");
  }

  function handleBackToList() {
    setMobileView("list");
    setShowInfoMobile(false);
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4 shrink-0">
        <h1 className="font-heading text-2xl font-semibold text-mu-text">
          Soporte
        </h1>
        <p className="mt-1 text-sm text-mu-text-muted">
          Sistema híbrido de chat en tiempo real y tickets de soporte.
        </p>
      </div>

      {isError ? (
        <div className="mb-4 shrink-0 rounded-xl border border-mu-error/30 bg-mu-error/5 px-4 py-3 text-sm text-mu-error">
          No se pudieron cargar las conversaciones. Intenta recargar la página.
        </div>
      ) : null}

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-mu-border bg-white shadow-sm">
        <div className="grid h-full grid-cols-1 lg:grid-cols-[280px_1fr_300px]">
          <SoporteConversationsSidebar
            conversations={data?.conversations}
            isLoading={isLoading}
            selectedId={selectedId}
            filters={filters}
            onFiltersChange={setFilters}
            onSelect={handleSelect}
            className={cn(
              "absolute inset-0 z-10 lg:relative lg:z-auto",
              mobileView !== "list" && "hidden lg:flex",
            )}
          />

          <div className="relative flex h-full min-w-0 flex-col">
            <SoporteChatPanel
              conversationId={selectedId}
              detail={detailQuery.data}
              isLoading={detailQuery.isLoading}
              isError={detailQuery.isError}
              onBack={handleBackToList}
              showBack={mobileView === "chat"}
              className={cn(
                "absolute inset-0 lg:relative",
                mobileView !== "chat" && selectedId && "hidden lg:flex",
                mobileView !== "chat" && !selectedId && "flex",
              )}
            />

            {selectedId ? (
              <button
                type="button"
                onClick={() => setShowInfoMobile(true)}
                className="absolute bottom-20 right-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-mu-primary text-white shadow-lg xl:hidden"
                aria-label="Ver información del usuario"
              >
                <Info className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <SoporteUserInfoPanel
            detail={detailQuery.data}
            isLoading={detailQuery.isLoading}
            onClose={() => setShowInfoMobile(false)}
            className={cn(
              "absolute inset-0 z-20 lg:relative lg:z-auto",
              showInfoMobile ? "flex" : "hidden xl:flex",
            )}
          />
        </div>
      </div>
    </div>
  );
}
