import { Link } from "react-router-dom";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

const platform = [
  { label: "Encontrar psicólogo", to: { pathname: "/", hash: "profesionales" } },
  { label: "Cómo funciona", to: { pathname: "/", hash: "como-funciona" } },
  { label: "Portal de especialistas", to: { pathname: "/", hash: "para-psicologos" } },
  { label: "Nuestra vocación", to: { pathname: "/", hash: "sobre-nosotros" } },
];

const resources = [
  { label: "Guías de autocuidado", to: "/recursos" },
  { label: "Test de orientación", to: "/recursos" },
  { label: "Línea de contención", to: "/recursos" },
  { label: "Preguntas frecuentes", to: "/recursos" },
];

export function Footer() {
  return (
    <footer className="bg-surface-low text-ink-soft">
      <div className="mx-auto max-w-[1240px] px-5 py-10 md:px-12">
        <div className="mb-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo size="md" className="mb-3" />
            <p className="max-w-xs text-sm leading-6">
              Espacio humano, cálido y confidencial para cuidar tu salud mental junto a profesionales verificados.
            </p>
          </div>
          <div>
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Plataforma</h2>
            <ul className="space-y-2 text-sm">
              {platform.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="transition hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Bienestar y Recursos</h2>
            <ul className="space-y-2 text-sm">
              {resources.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="transition hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Compromiso Ético</h2>
            <p className="mb-3 text-sm leading-6">
              Atención regulada y confidencialidad clínica garantizada según estándares de salud vigentes.
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-mid px-3 py-1 font-display text-xs font-semibold text-primary">
              <Icon name="verified" className="text-[16px]" />
              Profesionales Verificados
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-surface-high pt-6 text-center text-xs leading-5 sm:text-left md:flex-row">
          <p>© {new Date().getFullYear()} Mente Unida. Todos los derechos reservados. Tu bienestar en manos de confianza.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link to="/privacidad" className="transition hover:text-primary">
              Privacidad y secreto profesional
            </Link>
            <Link to="/terminos" className="transition hover:text-primary">
              Términos de servicio
            </Link>
            <a href="mailto:hola@menteunida.com" className="transition hover:text-primary">
              Contacto
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
