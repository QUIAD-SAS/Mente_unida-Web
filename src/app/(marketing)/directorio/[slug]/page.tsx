import { BookSessionLink } from "@/components/scheduling/book-session-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { fetchDirectoryPsychologist } from "@/lib/api/server";
import { formatCOP } from "@/lib/format";
import { MapPin, Star, Video } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await fetchDirectoryPsychologist(slug);
  return {
    title: p?.name ?? "Profesional",
    description: p?.specialties?.join(", ") ?? "Perfil profesional en Mente Unida",
  };
}

export default async function PsychologistProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await fetchDirectoryPsychologist(slug);

  if (!p) notFound();

  return (
    <div className="mu-section">
      <div className="mu-container max-w-3xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full bg-mu-accent font-heading text-xl font-semibold text-mu-primary"
            aria-hidden
          >
            {(p.name ?? "MU").slice(0, 2).toUpperCase()}
          </div>
          {p.verified ? <Badge variant="verified">Verificado</Badge> : null}
        </div>

        <h1 className="mt-6 font-heading text-3xl font-bold text-mu-text">
          {p.name}
        </h1>
        <p className="mt-2 text-lg text-mu-text-muted">
          {p.specialties.join(" · ") || p.title || "Salud mental"}
        </p>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-mu-text-muted">
          {p.city ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" aria-hidden />
              {p.city}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Star
              className="h-4 w-4 fill-mu-warning text-mu-warning"
              aria-hidden
            />
            {p.ratingAvg.toFixed(1)} ({p.ratingCount} valoraciones)
          </span>
          {p.modalityOnline ? (
            <span className="inline-flex items-center gap-1">
              <Video className="h-4 w-4" aria-hidden />
              Online
            </span>
          ) : null}
          {p.modalityInPerson ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" aria-hidden />
              Presencial
            </span>
          ) : null}
        </div>

        {p.bio ? (
          <Card className="mt-8">
            <CardTitle>Sobre mí</CardTitle>
            <CardDescription className="mt-2 text-base leading-relaxed text-mu-text">
              {p.bio}
            </CardDescription>
          </Card>
        ) : null}

        <Card className="mt-6">
          <CardTitle>Tarifas</CardTitle>
          <p className="mt-2 font-semibold text-mu-primary">
            Desde {formatCOP(p.priceCents, p.currency)}
          </p>
          {p.yearsExperience ? (
            <p className="mt-2 text-sm text-mu-text-muted">
              {p.yearsExperience} años de experiencia
            </p>
          ) : null}
        </Card>

        <div className="mt-8 flex flex-wrap gap-3">
          <BookSessionLink psychologist={p} />
          <Button variant="outline" href="/directorio">
            Ver todos los profesionales
          </Button>
        </div>
      </div>
    </div>
  );
}
