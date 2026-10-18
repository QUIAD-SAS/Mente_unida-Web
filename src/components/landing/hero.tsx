import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";
import { Search, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section
      className="mu-gradient-soft relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20"
      aria-labelledby="hero-title"
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-mu-secondary/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-mu-primary/15 blur-3xl"
        aria-hidden
      />

      <div className="mu-container relative">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-mu-surface px-4 py-1.5 text-sm text-mu-text-muted shadow-mu-card">
            <Sparkles className="h-4 w-4 text-mu-secondary" aria-hidden />
            Salud mental, acompañamiento profesional y crecimiento para
            psicólogos
          </div>

          <h1
            id="hero-title"
            className="font-heading text-3xl font-bold leading-tight tracking-tight text-mu-text sm:text-4xl lg:text-5xl"
          >
            {BRAND.tagline}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-mu-text-muted sm:text-lg">
            {BRAND.description}
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button size="lg" href="/directorio" className="min-w-[200px]">
              Encontrar apoyo profesional
            </Button>
            <Button
              size="lg"
              variant="outline"
              href="/registro?rol=psicologo"
              className="min-w-[200px]"
            >
              Soy profesional de la salud mental
            </Button>
          </div>

          <form
            className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row"
            role="search"
            aria-label="Buscar profesionales de apoyo"
            action="/directorio"
          >
            <label htmlFor="hero-search" className="sr-only">
              Buscar por ciudad o especialidad
            </label>
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-mu-text-muted"
                aria-hidden
              />
              <input
                id="hero-search"
                name="q"
                type="search"
                placeholder="Ciudad, especialidad o enfoque…"
                className="h-12 w-full rounded-mu-lg border border-mu-border bg-mu-surface pl-12 pr-4 text-mu-text placeholder:text-mu-text-muted focus:border-mu-primary"
              />
            </div>
            <Button type="submit" className="sm:w-auto">
              Buscar
            </Button>
          </form>
        </div>

        <div
          className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3"
          role="list"
          aria-label="Indicadores de confianza"
        >
          {[
            { value: "Verificados", label: "Profesionales con credenciales revisadas" },
            { value: "Protegido", label: "Privacidad y anonimato para pacientes" },
            { value: "Comunidad", label: "Espacio de crecimiento profesional" },
          ].map((stat) => (
            <div
              key={stat.label}
              role="listitem"
              className="rounded-mu-lg border border-mu-border/80 bg-mu-surface/80 px-6 py-5 text-center backdrop-blur-sm"
            >
              <p className="font-heading text-lg font-bold text-mu-primary">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-mu-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
