import { Link } from "react-router-dom";
import { Container, Eyebrow } from "../components/ui";

type Kind = "privacy" | "terms" | "resources";

const pages: Record<Kind, { eyebrow: string; title: string; lead: string; blocks: { title: string; text: string }[] }> = {
  privacy: {
    eyebrow: "Secreto profesional",
    title: "Privacidad y secreto profesional",
    lead: "Tus datos de ubicación, contacto y proceso terapéutico se tratan como información clínica confidencial.",
    blocks: [
      {
        title: "Qué cuidamos",
        text: "Identidad, domicilio, canales de contacto, acompañante de emergencia y soportes profesionales se usan solo para prestar el servicio y verificar credenciales.",
      },
      {
        title: "Marco que cita la plataforma",
        text: "El diseño de Mente Unida se apoya en la Ley 1090 de 2006, sobre el ejercicio de la psicología y el secreto profesional, y en la Ley 1581 de 2012, sobre protección de datos personales en Colombia.",
      },
      {
        title: "Contacto de emergencia",
        text: "La persona que indicas como acompañante solo se contempla para situaciones excepcionales de emergencia, conforme a los lineamientos éticos descritos en el registro.",
      },
    ],
  },
  terms: {
    eyebrow: "Condiciones de uso",
    title: "Términos de servicio",
    lead: "Mente Unida es un espacio para encontrar acompañamiento psicológico y para que profesionales colegiados gestionen su práctica.",
    blocks: [
      {
        title: "Cuentas",
        text: "Hay dos perfiles: persona que busca cuidado y profesional de la psicología. El perfil profesional queda en revisión hasta validar tarjeta profesional, RETHUS y soportes.",
      },
      {
        title: "Veracidad",
        text: "Quien se registra como psicólogo declara la veracidad de los títulos y certificados aportados, bajo el código deontológico citado en la Ley 1090 de 2006.",
      },
      {
        title: "Contenido de demostración",
        text: "Los perfiles, reseñas y el panel de Clínica Ya que ves en la página principal son una vista previa. Clínica Ya está señalado como próximo lanzamiento.",
      },
    ],
  },
  resources: {
    eyebrow: "Antes de empezar",
    title: "Un primer lugar para escuchar",
    lead: "Estas entradas recogen la promesa de la sección Escuchar: orientación sin prisa y sin un compromiso forzado.",
    blocks: [
      {
        title: "Guías de autocuidado",
        text: "Lecturas breves para reconocer cómo te sientes antes de decidir si quieres una primera sesión.",
      },
      {
        title: "Test de orientación",
        text: "Una guía de autorreflexión para aclarar el motivo de consulta. No reemplaza una valoración clínica.",
      },
      {
        title: "Línea de contención y preguntas",
        text: "Si estás en una crisis inmediata, acude a los servicios de emergencia de tu ciudad. Mente Unida acompaña procesos continuos, no sustituye una urgencia.",
      },
    ],
  },
};

export function InfoPage({ kind }: { kind: Kind }) {
  const page = pages[kind];

  return (
    <Container className="max-w-3xl py-16 md:py-24">
      <Eyebrow>{page.eyebrow}</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl">{page.title}</h1>
      <p className="mt-4 text-lg leading-7 text-ink-soft">{page.lead}</p>
      <div className="mt-10 space-y-4">
        {page.blocks.map((block) => (
          <article key={block.title} className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-display text-lg font-semibold">{block.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{block.text}</p>
          </article>
        ))}
      </div>
      <Link to="/" className="mt-8 inline-flex font-display text-sm font-semibold text-primary hover:underline">
        Volver al inicio
      </Link>
    </Container>
  );
}
