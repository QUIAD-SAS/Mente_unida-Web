"use client";

import { CommunityAvatar } from "@/components/community/community-avatar";
import type { CommunityComment } from "@/lib/api/types";
import { formatCommunityDate } from "@/lib/format";
import { FormEvent, useState } from "react";

interface CommunityCommentsProps {
  comments: CommunityComment[];
  authorNames: Record<string, string>;
  currentUserId: string;
  currentUserName: string;
  onSubmit: (content: string, parentId?: string) => Promise<void>;
}

export function CommunityComments({
  comments,
  authorNames,
  currentUserId,
  currentUserName,
  onSubmit,
}: CommunityCommentsProps) {
  const [value, setValue] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const roots = comments.filter((c) => !c.parentId);
  const repliesByParent = comments.reduce<Record<string, CommunityComment[]>>(
    (acc, c) => {
      if (!c.parentId) return acc;
      acc[c.parentId] = [...(acc[c.parentId] ?? []), c];
      return acc;
    },
    {},
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(text, replyTo ?? undefined);
      setValue("");
      setReplyTo(null);
    } finally {
      setSubmitting(false);
    }
  }

  function authorName(comment: CommunityComment) {
    if (comment.authorId === currentUserId) return currentUserName;
    return authorNames[comment.authorId] ?? "Profesional";
  }

  return (
    <div className="mt-4 border-t border-mu-border pt-4">
      {roots.length === 0 ? (
        <p className="mb-3 text-xs text-mu-text-muted">
          Aún no hay comentarios visibles en esta sesión.
        </p>
      ) : (
        <ul className="mb-4 space-y-3">
          {roots.map((comment) => (
            <li key={comment.id}>
              <CommentItem
                comment={comment}
                name={authorName(comment)}
                onReply={() => setReplyTo(comment.id)}
              />
              {(repliesByParent[comment.id] ?? []).map((reply) => (
                <div key={reply.id} className="ml-8 mt-2 border-l-2 border-mu-border pl-3">
                  <CommentItem
                    comment={reply}
                    name={authorName(reply)}
                    onReply={() => setReplyTo(comment.id)}
                  />
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <CommunityAvatar name={currentUserName} size="sm" />
        <div className="min-w-0 flex-1">
          {replyTo ? (
            <p className="mb-1 text-[10px] text-mu-text-muted">
              Respondiendo…{" "}
              <button
                type="button"
                className="text-mu-primary hover:underline"
                onClick={() => setReplyTo(null)}
              >
                Cancelar
              </button>
            </p>
          ) : null}
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Escribe un comentario profesional…"
            disabled={submitting}
            className="w-full rounded-mu border border-mu-border px-3 py-2 text-sm focus:border-mu-primary focus:outline-none focus:ring-1 focus:ring-mu-primary"
          />
        </div>
      </form>
    </div>
  );
}

function CommentItem({
  comment,
  name,
  onReply,
}: {
  comment: CommunityComment;
  name: string;
  onReply: () => void;
}) {
  return (
    <div className="flex gap-2">
      <CommunityAvatar name={name} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-xs font-medium text-mu-text">{name}</span>
          <time
            className="text-[10px] text-mu-text-muted"
            dateTime={comment.createdAt}
          >
            {formatCommunityDate(comment.createdAt)}
          </time>
        </div>
        <p className="mt-0.5 text-sm text-mu-text-muted">{comment.content}</p>
        <button
          type="button"
          onClick={onReply}
          className="mt-1 text-[10px] font-medium text-mu-primary hover:underline"
        >
          Responder
        </button>
      </div>
    </div>
  );
}
