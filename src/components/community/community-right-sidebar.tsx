"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { TRENDING_TOPICS } from "@/lib/community/constants";
import type { CommunityPost, DirectoryPsychologist } from "@/lib/api/types";
import { formatCommunityDate, postTypeLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CommunityRightSidebarProps {
  posts: CommunityPost[];
  mentors: DirectoryPsychologist[];
  className?: string;
}

export function CommunityRightSidebar({
  posts,
  mentors,
  className,
}: CommunityRightSidebarProps) {
  const events = posts.filter((p) => p.type === "EVENT").slice(0, 3);
  const articles = posts.filter((p) => p.type === "ARTICLE").slice(0, 3);

  return (
    <aside
      className={cn("flex flex-col gap-4", className)}
      aria-label="Sugerencias"
    >
      <Card className="p-4">
        <CardTitle className="text-sm">Temas tendencia</CardTitle>
        <ul className="mt-3 flex flex-wrap gap-2">
          {TRENDING_TOPICS.map((topic) => (
            <li key={topic}>
              <Badge variant="muted" className="cursor-default">
                {topic}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>

      {events.length > 0 ? (
        <Card className="p-4">
          <CardTitle className="text-sm">Próximos eventos</CardTitle>
          <ul className="mt-3 space-y-3">
            {events.map((post) => (
              <li key={post.id} className="text-xs">
                <p className="font-medium text-mu-text">
                  {post.title ?? postTypeLabel(post.type)}
                </p>
                <p className="mt-0.5 text-mu-text-muted line-clamp-2">
                  {post.content}
                </p>
                <time className="mt-1 block text-[10px] text-mu-text-muted">
                  {formatCommunityDate(post.publishedAt)}
                </time>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {articles.length > 0 ? (
        <Card className="p-4">
          <CardTitle className="text-sm">Artículos recientes</CardTitle>
          <ul className="mt-3 space-y-3">
            {articles.map((post) => (
              <li key={post.id} className="text-xs">
                <p className="font-medium text-mu-text line-clamp-2">
                  {post.title ?? post.content.slice(0, 60)}
                </p>
                <p className="mt-0.5 text-mu-text-muted">
                  {post.isAnonymized
                    ? "Profesional verificado"
                    : (post.author.name ?? "Profesional")}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {mentors.length > 0 ? (
        <Card className="p-4">
          <CardTitle className="text-sm">Mentores destacados</CardTitle>
          <ul className="mt-3 space-y-3">
            {mentors.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/directorio/${m.slug}`}
                  className="block text-xs hover:text-mu-primary"
                >
                  <p className="font-medium text-mu-text">{m.name}</p>
                  <p className="mt-0.5 text-mu-text-muted">
                    {m.specialties[0] ?? m.title ?? "Salud mental"}
                    {m.yearsExperience != null
                      ? ` · ${m.yearsExperience} años`
                      : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </aside>
  );
}
