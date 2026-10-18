import { PsychologistCard } from "@/components/directory/psychologist-card";
import { Button } from "@/components/ui/button";
import type { DirectoryPsychologist } from "@/lib/api/types";

export function FeaturedPsychologistsSection({
  psychologists,
}: {
  psychologists?: DirectoryPsychologist[];
}) {
  const items = psychologists ?? [];

  return (
    <section
      id="profesionales"
      className="mu-section bg-mu-accent/50"
      aria-labelledby="featured-title"
    >
      <div className="mu-container">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h2
              id="featured-title"
              className="font-heading text-2xl font-bold text-mu-text sm:text-3xl"
            >
              Profesionales que te acompañan
            </h2>
            <p className="mt-3 max-w-lg text-mu-text-muted">
              Personas con formación verificada, listas para acompañarte en tu
              proceso. Presencial u online.
            </p>
          </div>
          <Button variant="outline" href="/directorio">
            Ver todos los profesionales
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="mt-10 text-sm text-mu-text-muted">
            Próximamente verás profesionales destacados aquí.
          </p>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <li key={p.id}>
                <PsychologistCard p={p} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
