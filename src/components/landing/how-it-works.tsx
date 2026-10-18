const STEPS = [
  {
    step: "01",
    title: "Crea tu cuenta",
    description:
      "Regístrate en minutos como persona que busca apoyo o como profesional de la salud mental.",
  },
  {
    step: "02",
    title: "Conecta con confianza",
    description:
      "Encuentra profesionales que se ajusten a lo que necesitas. Los profesionales verifican credenciales y activan su perfil.",
  },
  {
    step: "03",
    title: "Agenda y acompaña",
    description:
      "Reserva sesiones, comunícate con seguridad y, si eres profesional, participa en la comunidad cuando lo necesites.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="mu-section" aria-labelledby="how-title">
      <div className="mu-container">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="how-title"
            className="font-heading text-2xl font-bold text-mu-text sm:text-3xl"
          >
            Cómo funciona
          </h2>
          <p className="mt-4 text-mu-text-muted">
            Un proceso sencillo para encontrar apoyo, conectar con
            profesionales y construir relaciones de confianza.
          </p>
        </div>

        <ol className="mt-14 grid gap-8 md:grid-cols-3">
          {STEPS.map((item, index) => (
            <li
              key={item.step}
              className="relative rounded-mu-lg border border-mu-border bg-mu-surface p-8"
            >
              <span
                className="font-heading text-4xl font-bold text-mu-primary/25"
                aria-hidden
              >
                {item.step}
              </span>
              <h3 className="mt-2 font-heading text-lg font-semibold text-mu-text">
                <span className="sr-only">Paso {index + 1}: </span>
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-mu-text-muted">
                {item.description}
              </p>
              {index < STEPS.length - 1 ? (
                <div
                  className="absolute -right-4 top-1/2 hidden h-0.5 w-8 bg-mu-secondary/40 md:block"
                  aria-hidden
                />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
