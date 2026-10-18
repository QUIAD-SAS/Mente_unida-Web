"use client";

import { CommunityFeedFilters } from "@/components/community/community-feed-filters";
import {
  CommunityLeftSidebar,
  type CommunityProfile,
} from "@/components/community/community-left-sidebar";
import { CommunityPostCard } from "@/components/community/community-post-card";
import { CommunityRightSidebar } from "@/components/community/community-right-sidebar";
import { CreatePostCard } from "@/components/community/create-post-card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardDescription } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api-client";
import type {
  CommunityComment,
  CommunityPost,
  CommunityPostType,
  DirectoryPsychologist,
} from "@/lib/api/types";
import type { CommunityFeedFilter } from "@/lib/community/constants";
import { getDisplayName } from "@/lib/auth/display";
import { useSession } from "@/lib/auth/session-context";
import { useAuthStore } from "@/lib/auth/store";
import { useCallback, useEffect, useMemo, useState } from "react";

function filterPosts(
  posts: CommunityPost[],
  filter: CommunityFeedFilter,
): CommunityPost[] {
  if (filter === "all") return posts;
  if (filter === "mentorship" || filter === "supervision") return [];
  return posts.filter((p) => p.type === filter);
}

export function PsychologistCommunityView() {
  const token = useAuthStore((s) => s.token)!;
  const { session } = useSession();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [mentors, setMentors] = useState<DirectoryPsychologist[]>([]);
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [filter, setFilter] = useState<CommunityFeedFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [commentsByPost, setCommentsByPost] = useState<
    Record<string, CommunityComment[]>
  >({});
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const [interestedIds, setInterestedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loadedCommentPosts, setLoadedCommentPosts] = useState<Set<string>>(
    new Set(),
  );

  const currentUserName = getDisplayName(session);
  const currentUserId = session?.id ?? "";

  const loadFeed = useCallback(async () => {
    setError(null);
    try {
      const res = await api.community.posts({ limit: "30" }, token);
      setPosts(res.items);
      const interested = new Set<string>();
      for (const p of res.items) {
        if (p.viewerInterested) interested.add(p.id);
      }
      setInterestedIds(interested);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Error al cargar el feed",
      );
    }
  }, [token]);

  const loadCommentsForPost = useCallback(async (postId: string) => {
    if (loadedCommentPosts.has(postId)) return;

    try {
      const raw = await api.community.listComments(postId);
      const names: Record<string, string> = {};
      const comments: CommunityComment[] = raw.map((c) => {
        const author = (c as CommunityComment & { author?: { id: string; name: string | null } }).author;
        if (author?.id && author.name) {
          names[author.id] = author.name;
        }
        return {
          id: c.id,
          postId: c.postId,
          content: c.content,
          authorId: c.authorId ?? author?.id ?? "",
          createdAt:
            typeof c.createdAt === "string"
              ? c.createdAt
              : new Date().toISOString(),
          parentId: c.parentId ?? null,
        };
      });

      setCommentsByPost((prev) => ({ ...prev, [postId]: comments }));
      setLoadedCommentPosts((prev) => new Set(prev).add(postId));
      if (Object.keys(names).length > 0) {
        setAuthorNames((prev) => ({ ...prev, ...names }));
      }
    } catch {
      /* comentarios opcionales */
    }
  }, [loadedCommentPosts]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      await loadFeed();

      try {
        const directory = await api.psychologists.list({ limit: "3" });
        if (!cancelled) setMentors(directory.items);
      } catch {
        /* opcional */
      }

      const slug = session?.profile.psychologist?.slug;
      const baseName = getDisplayName(session);
      const baseImage = session?.profile.imageUrl ?? null;

      if (slug) {
        try {
          const detail = await api.psychologists.bySlug(slug);
          if (!cancelled) {
            setProfile({
              name: detail.name ?? baseName,
              imageUrl: detail.image ?? baseImage,
              title: detail.title ?? "Psicólogo/a clínico/a",
              specialty: detail.specialties[0] ?? "Salud mental",
              experience:
                detail.yearsExperience != null
                  ? `${detail.yearsExperience} años de experiencia`
                  : "Experiencia profesional",
            });
          }
        } catch {
          if (!cancelled) {
            setProfile({
              name: baseName,
              imageUrl: baseImage,
              title: "Psicólogo/a clínico/a",
              specialty: "Salud mental",
              experience: "Miembro de la comunidad",
            });
          }
        }
      } else if (!cancelled) {
        setProfile({
          name: baseName,
          imageUrl: baseImage,
          title: "Psicólogo/a clínico/a",
          specialty: "Salud mental",
          experience: "Miembro de la comunidad",
        });
      }

      if (!cancelled) setLoading(false);
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [loadFeed, session]);

  const filteredPosts = useMemo(
    () => filterPosts(posts, filter),
    [posts, filter],
  );

  async function handleCreate(data: {
    type: CommunityPostType;
    content: string;
    title?: string;
    isAnonymized: boolean;
  }) {
    const created = await api.community.create(token, data);
    setPosts((prev) => [created, ...prev]);
  }

  async function handleInterest(postId: string) {
    const result = await api.community.react(token, postId);
    setInterestedIds((prev) => {
      const next = new Set(prev);
      if (result.reacted) next.add(postId);
      else next.delete(postId);
      return next;
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              viewerInterested: result.reacted,
              _count: {
                reactions: result.count,
                comments: p._count?.comments ?? 0,
                bookmarks: p._count?.bookmarks,
              },
            }
          : p,
      ),
    );
  }

  async function handleSave(postId: string) {
    await api.community.save(token, postId);
    setSavedIds((prev) => new Set(prev).add(postId));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              _count: {
                reactions: p._count?.reactions ?? 0,
                comments: p._count?.comments ?? 0,
                bookmarks: (p._count?.bookmarks ?? 0) + 1,
              },
            }
          : p,
      ),
    );
  }

  async function handleShare(postId: string) {
    const { shareUrl } = await api.community.share(postId);
    const url =
      shareUrl.startsWith("http")
        ? shareUrl
        : `${window.location.origin}${shareUrl}`;
    await navigator.clipboard.writeText(url);
  }

  async function handleComment(
    postId: string,
    content: string,
    parentId?: string,
  ) {
    const created = await api.community.comment(token, postId, content);
    const author = (created as CommunityComment & { author?: { id: string; name: string | null } }).author;
    const comment: CommunityComment = {
      id: created.id,
      postId,
      content: created.content,
      authorId: created.authorId ?? author?.id ?? currentUserId,
      parentId: parentId ?? null,
      createdAt:
        typeof created.createdAt === "string"
          ? created.createdAt
          : new Date().toISOString(),
    };

    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] ?? []), comment],
    }));
    setAuthorNames((prev) => ({
      ...prev,
      [currentUserId]: currentUserName,
    }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              _count: {
                reactions: p._count?.reactions ?? 0,
                comments: (p._count?.comments ?? 0) + 1,
                bookmarks: p._count?.bookmarks,
              },
            }
          : p,
      ),
    );
  }

  const upcomingFilter =
    filter === "mentorship" || filter === "supervision";

  return (
    <DashboardShell role="psychologist" contained mainClassName="!p-0">
      <div className="grid h-full min-h-0 grid-cols-1 overflow-hidden lg:grid-cols-12">
          {profile ? (
            <CommunityLeftSidebar
              profile={profile}
              className="hidden overflow-y-auto overscroll-contain border-r border-mu-border p-4 lg:col-span-3 lg:flex"
            />
          ) : null}

          <main className="min-h-0 overflow-y-auto overscroll-contain p-4 lg:col-span-6 lg:border-r lg:border-mu-border">
            {profile ? (
              <div className="mb-4 lg:hidden">
                <CommunityLeftSidebar profile={profile} />
              </div>
            ) : null}

            <CreatePostCard onSubmit={handleCreate} disabled={loading} />

            <CommunityFeedFilters value={filter} onChange={setFilter} />

            {error ? (
              <p
                className="mb-4 rounded-mu border border-mu-error/30 bg-mu-error/5 px-3 py-2 text-sm text-mu-error"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            {loading ? (
              <p className="text-sm text-mu-text-muted">Cargando feed…</p>
            ) : upcomingFilter ? (
              <Card className="p-6 text-center">
                <CardDescription>
                  {filter === "mentorship"
                    ? "Las mentorías estarán disponibles próximamente."
                    : "Las supervisiones grupales estarán disponibles próximamente."}
                </CardDescription>
              </Card>
            ) : filteredPosts.length === 0 ? (
              <Card className="p-6 text-center">
                <CardDescription>
                  No hay publicaciones en esta categoría todavía.
                </CardDescription>
              </Card>
            ) : (
              <ul className="space-y-4">
                {filteredPosts.map((post) => (
                  <li key={post.id}>
                    <CommunityPostCard
                      post={post}
                      comments={commentsByPost[post.id] ?? []}
                      authorNames={authorNames}
                      interested={interestedIds.has(post.id)}
                      saved={savedIds.has(post.id)}
                      currentUserId={currentUserId}
                      currentUserName={currentUserName}
                      onInterest={handleInterest}
                      onSave={handleSave}
                      onShare={handleShare}
                      onOpenComments={loadCommentsForPost}
                      onComment={handleComment}
                    />
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 lg:hidden">
              <CommunityRightSidebar posts={posts} mentors={mentors} />
            </div>
          </main>

          <CommunityRightSidebar
            posts={posts}
            mentors={mentors}
            className="hidden overflow-y-auto overscroll-contain p-4 lg:col-span-3 lg:block"
          />
      </div>
    </DashboardShell>
  );
}
