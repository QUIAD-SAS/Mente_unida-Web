"use client";

import { CommunityAvatar } from "@/components/community/community-avatar";
import { CommunityComments } from "@/components/community/community-comments";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { CommunityComment, CommunityPost } from "@/lib/api/types";
import { formatCommunityDate, postTypeLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Bookmark,
  Link2,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";

interface CommunityPostCardProps {
  post: CommunityPost;
  comments: CommunityComment[];
  authorNames: Record<string, string>;
  interested: boolean;
  saved: boolean;
  currentUserId: string;
  currentUserName: string;
  onInterest: (postId: string) => void;
  onSave: (postId: string) => void;
  onShare: (postId: string) => void;
  onOpenComments: (postId: string) => void;
  onComment: (
    postId: string,
    content: string,
    parentId?: string,
  ) => Promise<void>;
}

export function CommunityPostCard({
  post,
  comments,
  authorNames,
  interested,
  saved,
  currentUserId,
  currentUserName,
  onInterest,
  onSave,
  onShare,
  onOpenComments,
  onComment,
}: CommunityPostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const authorLabel = post.isAnonymized
    ? "Profesional verificado"
    : (post.author.name ?? "Profesional");

  const reactionCount = post._count?.reactions ?? 0;
  const commentCount =
    Math.max(post._count?.comments ?? 0, comments.length);
  const saveCount = post._count?.bookmarks ?? 0;

  async function handleShare() {
    onShare(post.id);
    setShareFeedback("Enlace copiado");
    window.setTimeout(() => setShareFeedback(null), 2000);
  }

  return (
    <Card className="p-4">
      <header className="flex gap-3">
        <CommunityAvatar
          name={authorLabel}
          imageUrl={post.isAnonymized ? null : post.author.imageUrl}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-mu-text">{authorLabel}</p>
            <Badge variant="muted">{postTypeLabel(post.type)}</Badge>
            {post.isAnonymized ? (
              <Badge variant="verified">Anonimizado</Badge>
            ) : null}
          </div>
          <p className="text-xs text-mu-text-muted">Psicólogo/a clínico/a</p>
          <time
            className="text-[10px] text-mu-text-muted"
            dateTime={post.publishedAt ?? undefined}
          >
            {formatCommunityDate(post.publishedAt)}
          </time>
        </div>
      </header>

      {post.title ? (
        <h3 className="mt-3 font-heading text-base font-semibold text-mu-text">
          {post.title}
        </h3>
      ) : null}

      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-mu-text">
        {post.content}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-mu-border pt-3 text-xs text-mu-text-muted">
        <ActionButton
          active={interested}
          onClick={() => onInterest(post.id)}
          icon={ThumbsUp}
          label="Me interesa"
          count={reactionCount}
        />
        <ActionButton
          active={showComments}
          onClick={() => {
            setShowComments((v) => {
              const next = !v;
              if (next) onOpenComments(post.id);
              return next;
            });
          }}
          icon={MessageSquare}
          label="Comentar"
          count={commentCount}
        />
        <ActionButton
          active={saved}
          onClick={() => onSave(post.id)}
          icon={Bookmark}
          label="Guardar"
          count={saveCount}
        />
        <ActionButton
          onClick={handleShare}
          icon={Link2}
          label={shareFeedback ?? "Compartir enlace"}
        />
      </div>

      {showComments ? (
        <CommunityComments
          comments={comments}
          authorNames={authorNames}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          onSubmit={(content, parentId) => onComment(post.id, content, parentId)}
        />
      ) : null}
    </Card>
  );
}

function ActionButton({
  icon: Icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: typeof ThumbsUp;
  label: string;
  count?: number;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-mu px-2.5 py-1.5 font-medium transition-colors hover:bg-mu-accent",
        active ? "text-mu-primary" : "text-mu-text-muted hover:text-mu-text",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span>{label}</span>
      {count != null && count > 0 ? (
        <span className="text-mu-text-muted">({count})</span>
      ) : null}
    </button>
  );
}
