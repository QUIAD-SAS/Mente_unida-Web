import { Card, CardDescription } from "@/components/ui/card";

const TESTIMONIALS = [
  {
    quote:
      "Encontré un espacio donde sentirme escuchada sin presión. La plataforma transmite calma y respeto.",
    author: "Laura M.",
    role: "Persona que busca apoyo · Bogotá",
  },
  {
    quote:
      "Conversaciones con colegas que fortalecen mi criterio. La verificación da confianza a toda la comunidad.",
    author: "Dr. Felipe R.",
    role: "Profesional de la salud mental · Lima",
  },
  {
    quote:
      "Superviso y mentoreo desde un solo lugar. Las herramientas me organizan sin quitarme el control profesional.",
    author: "Dra. Patricia V.",
    role: "Supervisora clínica · CDMX",
  },
];

export function TestimonialsSection() {
  return (
    <section className="mu-section bg-mu-surface" aria-labelledby="testimonials-title">
      <div className="mu-container">
        <h2
          id="testimonials-title"
          className="text-center font-heading text-2xl font-bold text-mu-text sm:text-3xl"
        >
          Voces de nuestra comunidad
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-mu-text-muted">
          Experiencias de personas y profesionales que ya forman parte del
          ecosistema.
        </p>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <li key={t.author}>
              <Card className="h-full border-mu-border/80">
                <blockquote>
                  <CardDescription className="text-base leading-relaxed text-mu-text">
                    &ldquo;{t.quote}&rdquo;
                  </CardDescription>
                  <footer className="mt-6">
                    <cite className="not-italic">
                      <p className="font-medium text-mu-text">{t.author}</p>
                      <p className="text-sm text-mu-text-muted">{t.role}</p>
                    </cite>
                  </footer>
                </blockquote>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
