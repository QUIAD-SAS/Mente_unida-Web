"use client";

import { EscuchaderoInboxChat } from "@/components/escuchadero/escuchadero-inbox-chat";
import { EscuchaderoInboxList } from "@/components/escuchadero/escuchadero-inbox-list";
import {
  escuchaderoKeys,
  useEscuchaderoMessage,
  useEscuchaderoMessages,
} from "@/lib/admin/escuchadero/queries";
import type { EscuchaderoFilters } from "@/lib/admin/escuchadero/types";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type MobilePane = "list" | "chat";

export function EscuchaderoView() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<EscuchaderoFilters>({
    status: "all",
    search: "",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobilePane, setMobilePane] = useState<MobilePane>("list");

  const listQuery = useEscuchaderoMessages(filters, {
    refetchInterval: 12_000,
  });
  const chatQuery = useEscuchaderoMessage(selectedId, {
    refetchInterval: selectedId ? 8_000 : false,
  });

  function handleSelect(id: string) {
    setSelectedId(id);
    setMobilePane("chat");
    // Una sola invalidación al abrir (no en cada poll)
    void queryClient.invalidateQueries({ queryKey: escuchaderoKeys.unread });
  }

  function handleBack() {
    setMobilePane("list");
  }

  return (
    <div className="-m-4 flex h-[calc(100dvh-5rem)] flex-col lg:-m-6">
      <div className="shrink-0 border-b border-mu-border bg-white px-4 py-3 lg:px-6">
        <h1 className="font-heading text-xl font-semibold text-mu-text sm:text-2xl">
          Escuchadero
        </h1>
        <p className="mt-0.5 text-sm text-mu-text-muted">
          Bandeja de mensajes de apoyo. Responde a varios pacientes desde aquí.
        </p>
      </div>

      {listQuery.isError ? (
        <div className="mx-4 mt-3 rounded-xl border border-mu-error/30 bg-mu-error/5 px-4 py-3 text-sm text-mu-error lg:mx-6">
          No se pudieron cargar las conversaciones. Intenta recargar.
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-hidden bg-mu-background p-3 lg:p-4">
        <div className="relative grid h-full overflow-hidden rounded-2xl border border-mu-border bg-white shadow-sm lg:grid-cols-[320px_1fr]">
          <EscuchaderoInboxList
            conversations={listQuery.data?.messages}
            isLoading={listQuery.isLoading}
            selectedId={selectedId}
            filters={filters}
            onFiltersChange={setFilters}
            onSelect={handleSelect}
            className={cn(
              "absolute inset-0 z-10 lg:relative lg:z-auto",
              mobilePane !== "list" && "hidden lg:flex",
            )}
          />

          <EscuchaderoInboxChat
            conversationId={selectedId}
            detail={chatQuery.data}
            isLoading={chatQuery.isLoading}
            isError={chatQuery.isError}
            onBack={handleBack}
            showBack={mobilePane === "chat"}
            className={cn(
              "absolute inset-0 lg:relative",
              mobilePane !== "chat" && "hidden lg:flex",
            )}
          />
        </div>
      </div>
    </div>
  );
}
