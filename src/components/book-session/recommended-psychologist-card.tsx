import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RecommendedPsychologist } from "@/lib/api/types";
import { formatAppointmentDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

interface RecommendedPsychologistCardProps {
  psychologist: RecommendedPsychologist;
  selected: boolean;
  scheduledAt?: string | null;
  isFavorite: boolean;
  favoriteLoading?: boolean;
  onSchedule: () => void;
  onToggleFavorite: () => void;
}

function formatAvailability(p: RecommendedPsychologist): string {
  if (p.nextAvailable) return p.nextAvailable;
  if (p.nextAvailableAt) return formatAppointmentDate(p.nextAvailableAt);
  return "Consultar disponibilidad";
}

export function RecommendedPsychologistCard({
  psychologist,
  selected,
  scheduledAt,
  isFavorite,
  favoriteLoading,
  onSchedule,
  onToggleFavorite,
}: RecommendedPsychologistCardProps) {
  const specialty =
    psychologist.specialties?.[0] ??
    psychologist.title ??
    "Salud mental";

  return (
    <article
      className={cn(
        "rounded-mu border p-4 transition-colors",
        selected
          ? "border-mu-primary bg-mu-accent/30"
          : "border-mu-border bg-mu-surface",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium text-mu-text">
              {psychologist.name ?? "Profesional"}
            </h3>
            {psychologist.verified ? (
              <Badge variant="verified">Verificado</Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-mu-text-muted">{specialty}</p>
          <dl className="mt-3 space-y-1 text-sm text-mu-text-muted">
            {psychologist.yearsExperience != null ? (
              <div className="flex justify-between gap-4">
                <dt>Experiencia</dt>
                <dd>{psychologist.yearsExperience} años</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt>Disponibilidad</dt>
              <dd className="text-right">{formatAvailability(psychologist)}</dd>
            </div>
            {selected && scheduledAt ? (
              <div className="flex justify-between gap-4">
                <dt>Tu cita</dt>
                <dd className="text-right font-medium text-mu-primary">
                  {formatAppointmentDate(scheduledAt)}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
        <button
          type="button"
          onClick={onToggleFavorite}
          disabled={favoriteLoading}
          className="shrink-0 rounded-mu p-2 text-mu-text-muted hover:bg-mu-accent hover:text-mu-text disabled:opacity-50"
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Quitar de favoritos" : "Guardar favorito"}
        >
          <Heart
            className={cn(
              "h-4 w-4",
              isFavorite && "fill-mu-error text-mu-error",
            )}
            aria-hidden
          />
        </button>
      </div>
      <Button
        type="button"
        variant={selected ? "primary" : "outline"}
        className="mt-4 w-full sm:w-auto"
        onClick={onSchedule}
      >
        {selected ? "Cambiar horario" : "Agendar"}
      </Button>
    </article>
  );
}
