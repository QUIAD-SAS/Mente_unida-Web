import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Brain,
  Calendar,
  GraduationCap,
  Heart,
  Shield,
  Users,
} from "lucide-react";

const PATIENT_BENEFITS = [
  {
    icon: Heart,
    title: "Bienestar sin barreras",
    description:
      "Accede a acompañamiento profesional en un entorno respetuoso, seguro y libre de juicios. Tú decides cómo dar el primer paso.",
  },
  {
    icon: Shield,
    title: "Profesionales verificados",
    description:
      "Cada profesional pasa revisión de identidad y tarjeta profesional antes de acompañar en la plataforma.",
  },
  {
    icon: Calendar,
    title: "Citas simples",
    description:
      "Agenda, recibe recordatorios y conecta con tu profesional. Consultas virtuales o presenciales en un solo flujo.",
  },
];

const PSYCHOLOGIST_BENEFITS = [
  {
    icon: Users,
    title: "Comunidad de crecimiento",
    description:
      "Comparte experiencias clínicas, aprende de otros profesionales y participa en conversaciones que fortalecen tu práctica y tu criterio profesional.",
  },
  {
    icon: Brain,
    title: "Apoyo para tu práctica",
    description:
      "Resúmenes, notas organizadas y bibliografía sugerida. Herramientas que respetan tu criterio: tú decides.",
  },
  {
    icon: GraduationCap,
    title: "Crecimiento continuo",
    description:
      "Accede a supervisión clínica, mentorías y espacios de aprendizaje que te permitan crecer con confianza en cada etapa de tu carrera.",
  },
];

function BenefitGrid({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: typeof PATIENT_BENEFITS;
}) {
  return (
    <div>
      <h3 className="font-heading text-xl font-semibold text-mu-text">
        {title}
      </h3>
      <p className="mt-1 text-sm text-mu-text-muted">{subtitle}</p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <li key={item.title}>
            <Card className="h-full border-mu-border/80 transition-shadow duration-200 hover:shadow-mu-soft">
              <item.icon
                className="h-8 w-8 text-mu-primary"
                aria-hidden
              />
              <CardTitle className="mt-4">{item.title}</CardTitle>
              <CardDescription className="mt-2 leading-relaxed">
                {item.description}
              </CardDescription>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BenefitsSection() {
  return (
    <section className="mu-section bg-mu-surface" aria-labelledby="benefits-title">
      <div className="mu-container">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="benefits-title"
            className="font-heading text-2xl font-bold text-mu-text sm:text-3xl"
          >
            Un espacio para quienes buscan apoyo y para quienes lo brindan
          </h2>
          <p className="mt-4 text-mu-text-muted">
            Un ecosistema de salud mental donde las personas encuentran
            acompañamiento y los profesionales fortalecen su práctica con
            comunidad y herramientas.
          </p>
        </div>

        <div className="mt-14 space-y-16">
          <BenefitGrid
            title="Para quienes buscan apoyo"
            subtitle="Tu bienestar, a tu ritmo y con respeto"
            items={PATIENT_BENEFITS}
          />
          <BenefitGrid
            title="Para profesionales"
            subtitle="Tu práctica, acompañada y en comunidad"
            items={PSYCHOLOGIST_BENEFITS}
          />
        </div>
      </div>
    </section>
  );
}
