"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CREATE_POST_OPTIONS,
  type CreatePostOption,
} from "@/lib/community/constants";
import type { CommunityPostType } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { FormEvent, useState } from "react";

interface CreatePostCardProps {
  onSubmit: (data: {
    type: CommunityPostType;
    content: string;
    title?: string;
    isAnonymized: boolean;
  }) => Promise<void>;
  disabled?: boolean;
}

export function CreatePostCard({ onSubmit, disabled }: CreatePostCardProps) {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<CreatePostOption>(
    CREATE_POST_OPTIONS[0],
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsTitle =
    selected.type === "ARTICLE" ||
    selected.type === "EVENT" ||
    selected.type === "RESOURCE";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text || submitting || disabled) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        type: selected.type,
        content: text,
        title: needsTitle ? title.trim() || undefined : undefined,
        isAnonymized: selected.anonymized ?? false,
      });
      setContent("");
      setTitle("");
      setSelected(CREATE_POST_OPTIONS[0]);
    } catch {
      setError("No se pudo publicar. Revisa el contenido e intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="mb-4 p-4">
      <form onSubmit={handleSubmit}>
        {error ? (
          <p
            className="mb-3 rounded-mu border border-mu-error/30 bg-mu-error/5 px-3 py-2 text-xs text-mu-error"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <label className="sr-only" htmlFor="create-post-content">
          Contenido de la publicación
        </label>
        <textarea
          id="create-post-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Comparte una experiencia, artículo o reflexión profesional."
          rows={3}
          disabled={disabled || submitting}
          className="w-full resize-none rounded-mu border border-mu-border bg-mu-background px-3 py-2.5 text-sm text-mu-text placeholder:text-mu-text-muted focus:border-mu-primary focus:outline-none focus:ring-1 focus:ring-mu-primary disabled:opacity-50"
        />

        {needsTitle ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
            disabled={disabled || submitting}
            className="mt-2 w-full rounded-mu border border-mu-border bg-mu-background px-3 py-2 text-sm focus:border-mu-primary focus:outline-none focus:ring-1 focus:ring-mu-primary"
          />
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          {CREATE_POST_OPTIONS.map((option, index) => {
            const active =
              selected.label === option.label &&
              selected.type === option.type &&
              selected.anonymized === option.anonymized;
            return (
              <button
                key={`${option.type}-${option.label}-${index}`}
                type="button"
                disabled={disabled || submitting}
                onClick={() => setSelected(option)}
                className={cn(
                  "rounded-mu border px-2.5 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-mu-primary bg-mu-accent text-mu-primary"
                    : "border-mu-border text-mu-text-muted hover:border-mu-primary/40 hover:text-mu-text",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="submit" size="sm" disabled={!content.trim() || submitting || disabled}>
            {submitting ? "Publicando…" : "Publicar"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
