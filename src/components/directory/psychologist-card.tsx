import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { DirectoryPsychologist } from "@/lib/api/types";
import { formatCOP } from "@/lib/format";
import { MapPin, Star, Video } from "lucide-react";

export function PsychologistCard({ p }: { p: DirectoryPsychologist }) {
  return (
    <Card className="h-full">
      <div className="flex justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full bg-mu-accent font-heading font-semibold text-mu-primary"
          aria-hidden
        >
          {(p.name ?? "MU").slice(0, 2).toUpperCase()}
        </div>
        {p.verified ? <Badge variant="verified">Verificado</Badge> : null}
      </div>
      <CardTitle className="mt-3">{p.name}</CardTitle>
      <CardDescription>
        {p.specialties[0] ?? p.title ?? "Salud mental"}
      </CardDescription>
      <div className="mt-3 flex flex-wrap gap-2 text-sm text-mu-text-muted">
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
          {p.ratingAvg.toFixed(1)} ({p.ratingCount})
        </span>
        {p.modalityOnline ? (
          <span className="inline-flex items-center gap-1">
            <Video className="h-4 w-4" aria-hidden />
            Online
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-semibold text-mu-primary">
        Desde {formatCOP(p.priceCents, p.currency)}
      </p>
      <Button className="mt-4 w-full" href={`/directorio/${p.slug}`}>
        Conocer al profesional
      </Button>
    </Card>
  );
}
