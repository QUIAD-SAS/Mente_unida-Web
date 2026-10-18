"use client";

import { ComunidadActionDialog } from "@/components/comunidad/comunidad-action-dialog";
import { ComunidadDetailPanel } from "@/components/comunidad/comunidad-detail-panel";
import { ComunidadFiltersBar } from "@/components/comunidad/comunidad-filters";
import { ComunidadTable } from "@/components/comunidad/comunidad-table";
import {
  useCommunityAction,
  useCommunityPost,
  useCommunityPosts,
} from "@/lib/admin/comunidad/queries";
import type {
  CommunityFilters,
  CommunityPostListItem,
} from "@/lib/admin/comunidad/types";
import { useMemo, useState } from "react";

type DialogMode = "hide" | "delete" | "warn" | "suspend" | null;

export function ComunidadView() {
  const [filters, setFilters] = useState<CommunityFilters>({
    type: "all",
    status: "all",
    search: "",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [dialogPost, setDialogPost] = useState<CommunityPostListItem | null>(
    null,
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data, isLoading, isError } = useCommunityPosts(filters);
  const detailQuery = useCommunityPost(selectedId);
  const actionMutation = useCommunityAction(dialogPost?.id ?? selectedId);

  const selectedListItem = useMemo(
    () => data?.posts.find((p) => p.id === selectedId) ?? null,
    [data?.posts, selectedId],
  );

  function openDialog(mode: DialogMode, post?: CommunityPostListItem) {
    setDialogMode(mode);
    setDialogPost(post ?? selectedListItem);
  }

  function closeDialog() {
    setDialogMode(null);
    setDialogPost(null);
  }

  function findPost(id: string) {
    return data?.posts.find((p) => p.id === id);
  }

  async function runAction(
    fn: () => Promise<unknown>,
    successMessage: string,
  ) {
    try {
      await fn();
      setFeedback(successMessage);
      closeDialog();
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "No se pudo completar la acción",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-mu-text">
          Comunidad
        </h1>
        <p className="mt-1 text-sm text-mu-text-muted">
          Administración de publicaciones de la comunidad profesional.
        </p>
      </div>

      <ComunidadFiltersBar filters={filters} onChange={setFilters} />

      {feedback ? (
        <p
          className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700"
          role="status"
        >
          {feedback}
        </p>
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-mu-error/30 bg-mu-error/5 px-4 py-3 text-sm text-mu-error">
          No se pudieron cargar las publicaciones. Intenta recargar la página.
        </div>
      ) : null}

      <ComunidadTable
        posts={data?.posts}
        isLoading={isLoading}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onHide={(id) => {
          const post = findPost(id);
          if (post) openDialog("hide", post);
        }}
        onDelete={(id) => {
          const post = findPost(id);
          if (post) openDialog("delete", post);
        }}
        onWarn={(id) => {
          const post = findPost(id);
          if (post) openDialog("warn", post);
        }}
        onSuspend={(id) => {
          const post = findPost(id);
          if (post) openDialog("suspend", post);
        }}
      />

      <ComunidadDetailPanel
        open={Boolean(selectedId)}
        post={detailQuery.data}
        isLoading={detailQuery.isLoading}
        isError={detailQuery.isError}
        onClose={() => setSelectedId(null)}
        onHide={() => openDialog("hide")}
        onDelete={() => openDialog("delete")}
        onWarn={() => openDialog("warn")}
        onSuspend={() => openDialog("suspend")}
      />

      <ComunidadActionDialog
        mode={dialogMode}
        post={dialogPost}
        isPending={actionMutation.isPending}
        onClose={closeDialog}
        onHide={() =>
          runAction(
            () => actionMutation.mutateAsync({ type: "hide" }),
            "Publicación ocultada.",
          )
        }
        onDelete={() =>
          runAction(
            () => actionMutation.mutateAsync({ type: "delete" }),
            "Publicación eliminada.",
          )
        }
        onWarn={(reason) =>
          runAction(
            () => actionMutation.mutateAsync({ type: "warn", reason }),
            "Advertencia enviada al autor.",
          )
        }
        onSuspend={() =>
          runAction(
            () => actionMutation.mutateAsync({ type: "suspend" }),
            "Autor suspendido de la comunidad.",
          )
        }
      />
    </div>
  );
}
