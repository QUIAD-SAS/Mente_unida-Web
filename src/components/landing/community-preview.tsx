import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CommunityPost } from "@/lib/api/types";
import { postTypeLabel } from "@/lib/format";
import { Bookmark, MessageCircle, Share2, ThumbsUp } from "lucide-react";

export function CommunityPreviewSection({
  posts,
}: {
  posts?: CommunityPost[];
}) {
  const items = posts ?? [];

  return (
    <section
      id="comunidad"
      className="mu-section"
      aria-labelledby="community-title"
    >
      <div className="mu-container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2
              id="community-title"
              className="font-heading text-2xl font-bold text-mu-text sm:text-3xl"
            >
              Comunidad para aprender, compartir y crecer
            </h2>
            <p className="mt-4 leading-relaxed text-mu-text-muted">
              Un espacio donde los profesionales de la salud mental pueden
              intercambiar experiencias, discutir casos anonimizados, recibir
              orientación y fortalecer su práctica junto a colegas de toda
              Latinoamérica.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-mu-text">
              <li>· Experiencias compartidas con privacidad</li>
              <li>· Conversaciones y recursos de aprendizaje</li>
              <li>· Eventos y materiales para tu desarrollo</li>
            </ul>
            <Button className="mt-8" href="/registro?rol=psicologo">
              Unirme como profesional
            </Button>
          </div>

          {items.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-mu-text-muted">
                La comunidad estará disponible pronto. Únete como profesional
                para participar.
              </p>
            </Card>
          ) : (
            <ul className="space-y-4">
              {items.map((post) => (
                <li key={post.id}>
                  <Card className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="muted">{postTypeLabel(post.type)}</Badge>
                      <Badge variant="verified">Verificado</Badge>
                      {post.isAnonymized ? (
                        <Badge variant="muted">Anonimizado</Badge>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm font-medium text-mu-text">
                      {post.isAnonymized
                        ? "Profesional verificado"
                        : (post.author.name ?? "Profesional")}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-mu-text-muted">
                      {post.content.slice(0, 140)}
                      {post.content.length > 140 ? "…" : ""}
                    </p>
                    <div className="mt-4 flex gap-4 text-sm text-mu-text-muted">
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" aria-hidden />
                        {post._count?.reactions ?? 0}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" aria-hidden />
                        {post._count?.comments ?? 0}
                      </span>
                      <Share2 className="h-4 w-4" aria-hidden />
                      <Bookmark className="h-4 w-4" aria-hidden />
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
