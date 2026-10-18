import { BRAND } from "@/lib/constants";
import Link from "next/link";

const FOOTER_LINKS = {
  Plataforma: [
    { href: "/directorio", label: "Profesionales" },
    { href: "#planes", label: "Planes" },
    { href: "/registro", label: "Registro" },
  ],
  Profesionales: [
    { href: "#comunidad", label: "Comunidad" },
    { href: "/registro?rol=psicologo", label: "Soy profesional de la salud mental" },
    { href: "#planes", label: "Plan Mentor" },
  ],
  Legal: [
    { href: "/legal/privacidad", label: "Privacidad" },
    { href: "/legal/terminos", label: "Términos" },
    { href: "/legal/consentimientos", label: "Consentimientos" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-mu-border bg-mu-surface">
      <div className="mu-container py-12 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <p className="font-heading text-xl font-bold text-mu-primary">
              {BRAND.name}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-mu-text-muted">
              Ecosistema de salud mental para Latinoamérica. Bienestar, comunidad
              e innovación profesional.
            </p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading text-sm font-semibold text-mu-text">
                {title}
              </h4>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-mu-text-muted transition-colors hover:text-mu-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-mu-border pt-8 sm:flex-row">
          <p className="text-sm text-mu-text-muted">
            © {new Date().getFullYear()} {BRAND.name}. Todos los derechos
            reservados.
          </p>
          <p className="text-xs text-mu-text-muted">
            No sustituye atención de emergencia. Protección de datos y
            privacidad garantizada.
          </p>
        </div>
      </div>
    </footer>
  );
}
