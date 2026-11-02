import { useState } from "react";
import { Link } from "react-router-dom";
import { Float, Reveal } from "../components/Reveal";
import { Icon } from "../components/Icon";
import { Container, Eyebrow, Modal } from "../components/ui";
import {
  clinicPoints,
  paradigm,
  pillars,
  professionals,
  reviews,
  steps,
  toneClasses,
  trust,
  values,
} from "../data/site";

const section = "scroll-mt-24 py-16 md:py-24";

export function LandingPage() {
  const [profile, setProfile] = useState<(typeof professionals)[number] | null>(null);

  return (
    <div className="overflow-hidden text-ink">
      <section className="relative scroll-mt-24">
        <Container className="grid items-center gap-10 py-8 md:py-16 lg:grid-cols-12 lg:gap-12">
          <Reveal className="z-10 flex flex-col items-start gap-6 lg:col-span-6">
            <span className="inline-flex items-center gap-2.5 rounded-full bg-surface-mid px-4 py-1.5 font-display text-xs font-semibold tracking-wide text-primary shadow-sm">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary-container" />
              Cuidado psicológico con confianza y continuidad
            </span>
            <h1 className="max-w-xl font-display text-[2rem] leading-[1.15] font-bold tracking-tight text-primary sm:text-4xl md:text-5xl lg:text-[56px] lg:leading-[64px]">
              Tu salud mental merece un espacio seguro.
            </h1>
            <p className="max-w-xl text-lg leading-7 text-ink-soft">
              Encuentra profesionales verificados, recibe acompañamiento y continúa tu proceso de cuidado en un solo lugar.
            </p>
            <div className="flex w-full flex-col gap-4 pt-1 sm:w-auto sm:flex-row sm:items-center">
              <a
                href="#profesionales"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-primary px-8 py-4 font-display text-sm font-semibold text-white shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:bg-primary-container hover:shadow-xl"
              >
                <Icon name="search" className="text-[20px]" />
                Encontrar un psicólogo
              </a>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-surface-low px-6 py-4 font-display text-sm font-semibold text-primary transition hover:translate-x-0.5 hover:bg-surface-mid"
              >
                Quiero comenzar
                <Icon name="arrow_forward" className="text-[18px]" />
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs leading-5 text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="verified_user" className="text-[18px] text-primary" />
                Cédulas validadas
              </span>
              <span className="h-1 w-1 rounded-full bg-line-soft" />
              <span className="inline-flex items-center gap-1.5">
                <Icon name="lock" className="text-[18px] text-primary" />
                Secreto profesional ético
              </span>
            </div>
          </Reveal>
          <div className="relative lg:col-span-6">
            <div className="pointer-events-none absolute -top-10 -right-8 h-72 w-72 rounded-full bg-secondary-fixed/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-80 w-80 rounded-full bg-primary-fixed/50 blur-3xl" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-surface-low shadow-xl sm:aspect-[16/11]">
              <img
                src="/images/hero-session.png"
                alt="Conversación calmada entre una terapeuta y una persona en una sala luminosa, con plantas y luz natural."
                className="h-full w-full object-cover"
              />
            </div>
            <Float className="mt-4 lg:absolute lg:top-4 lg:left-4 lg:mt-0">
              <div className="flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-fixed text-primary">
                  <Icon name="verified" filled className="text-[20px]" />
                </span>
                <span>
                  <span className="block font-display text-xs font-bold text-primary">Profesionales 100%</span>
                  <span className="block text-xs text-ink-soft">Credenciales verificadas</span>
                </span>
              </div>
            </Float>
            <Float delay={0.8} className="mt-3 lg:absolute lg:right-4 lg:bottom-6 lg:mt-0">
              <div className="flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-fixed text-secondary">
                  <Icon name="chat_bubble" filled className="text-[20px]" />
                </span>
                <span>
                  <span className="block font-display text-xs font-bold text-ink">Espacio confidencial</span>
                  <span className="block text-xs text-ink-soft">Sin juicios ni prisa</span>
                </span>
              </div>
            </Float>
          </div>
        </Container>
      </section>

      <section id="que-es" className={`${section} bg-surface-low`}>
        <Container className="flex flex-col gap-12">
          <Reveal className="max-w-2xl">
            <Eyebrow>Un nuevo paradigma de apoyo</Eyebrow>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-primary md:text-[40px] md:leading-[48px]">
              Cuidado humano, continuo y sin frialdad clínica
            </h2>
            <p className="mt-4 text-lg leading-7 text-ink-soft">
              Mente Unida nace para conectar a personas que buscan bienestar emocional con terapeutas colegiados, asegurando que tu proceso no termine en una simple videollamada, sino en un vínculo sólido y transformador.
            </p>
          </Reveal>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface-mid px-6 py-4 font-display text-sm font-semibold text-primary">
            {paradigm.map((item, index) => (
              <div key={item.n} className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{item.n}</span>
                  {item.label}
                </span>
                {index < paradigm.length - 1 ? <Icon name="trending_flat" className="hidden text-line-soft sm:inline" /> : null}
              </div>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
            {pillars.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.06} className="flex flex-col justify-between rounded-3xl bg-white p-8 shadow-sm transition hover:shadow-md">
                <div>
                  <span className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${toneClasses(item.tone)}`}>
                    <Icon name={item.icon} className="text-[26px]" />
                  </span>
                  <h3 className="mb-3 font-display text-[22px] font-semibold">{item.title}</h3>
                  <p className="leading-7 text-ink-soft">{item.text}</p>
                </div>
                <p className="mt-6 border-t border-surface-mid pt-6 text-xs font-semibold text-secondary">{item.note}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section id="como-funciona" className={section}>
        <Container>
          <Reveal className="mx-auto mb-16 max-w-2xl text-center">
            <Eyebrow>Paso a paso sencillo</Eyebrow>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-primary md:text-[40px] md:leading-[48px]">
              ¿Cómo comenzar en Mente Unida?
            </h2>
            <p className="mt-3 text-lg leading-7 text-ink-soft">
              Sin formularios interminables ni tecnicismos confusos. Iniciar tu cuidado es un proceso natural y claro.
            </p>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <Reveal key={step.n} delay={index * 0.05} className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1">
                <div>
                  <span className={`mb-6 flex h-10 w-10 items-center justify-center rounded-xl font-display text-lg font-bold ${toneClasses(step.tone)}`}>
                    {step.n}
                  </span>
                  <h3 className="mb-2 font-display text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm leading-6 text-ink-soft">{step.text}</p>
                </div>
                <a href="#profesionales" className={`mt-6 inline-flex items-center gap-1 font-display text-xs font-semibold ${step.tone === "clay" ? "text-secondary" : "text-primary"}`}>
                  {step.link}
                  <Icon name="chevron_right" className="text-[16px]" />
                </a>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section id="profesionales" className={`${section} bg-surface-low`}>
        <Container>
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <Reveal>
              <span className="mb-3.5 inline-flex items-center gap-2 rounded-full bg-surface-mid px-3.5 py-1.5 font-display text-xs font-semibold text-primary">
                <Icon name="verified" filled className="text-[16px]" />
                Comunidad Clínica Regulada
                <span className="text-line-soft">·</span>
                <span className="font-body text-xs font-normal text-ink-soft">Contenido de demostración</span>
              </span>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-primary md:text-[40px] md:leading-[48px]">
                Encuentra un profesional que te acompañe
              </h2>
              <p className="mt-2 max-w-2xl text-lg leading-7 text-ink-soft">
                Explora algunos de los profesionales que hacen parte de Mente Unida y encuentra un espacio de acompañamiento pensado para ti.
              </p>
            </Reveal>
            <a href="#para-psicologos" className="inline-flex shrink-0 items-center gap-2 font-display text-sm font-semibold text-primary hover:underline">
              ¿Eres terapeuta colegiado? Súmate
              <Icon name="arrow_forward" className="text-[18px]" />
            </a>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {professionals.map((person) => (
              <article key={person.name} className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-mid">
                  <img src={person.image} alt={person.name} className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]" />
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 font-display text-xs font-semibold text-primary shadow-sm backdrop-blur-md">
                    <Icon name="check_circle" className="text-[15px]" />
                    Profesional verificado
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold">{person.name}</h3>
                    <span className="shrink-0 text-xs font-semibold text-primary">{person.rating} ★</span>
                  </div>
                  <p className="mb-3 font-display text-sm font-medium text-primary">{person.role}</p>
                  <span className={`mb-2 inline-block rounded-lg px-3 py-1 font-display text-xs font-semibold ${person.tagTone === "clay" ? "bg-secondary-fixed/40 text-secondary" : "bg-surface-low text-primary"}`}>
                    {person.tags}
                  </span>
                  <p className="text-sm leading-6 text-ink-soft">{person.bio}</p>
                  <div className="mt-4 border-t border-surface-mid pt-4">
                    <div className="mb-4 flex items-center justify-between text-xs text-ink-soft">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name={person.modeIcon} className="text-[16px] text-primary" />
                        {person.mode}
                      </span>
                      <span>{person.opinions}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProfile(person)}
                      className="w-full rounded-full bg-surface-mid py-3 font-display text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
                    >
                      Ver perfil
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-3xl border border-surface-mid bg-white p-6 shadow-sm md:flex-row md:p-8">
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center gap-2.5">
                <Icon name="verified_user" filled className="text-[22px] text-primary" />
                <h3 className="font-display text-lg font-semibold text-primary">Profesionales verificados</h3>
              </div>
              <p className="text-sm leading-6 text-ink-soft">
                Trabajamos para que puedas conocer quién está detrás de cada perfil y tomar una decisión con mayor confianza.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-surface-mid px-4 py-2.5 font-display text-xs font-semibold text-primary">
                <Icon name="check" className="text-[18px]" />
                Identidad verificada
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-surface-mid px-4 py-2.5 font-display text-xs font-semibold text-primary">
                <Icon name="check" className="text-[18px]" />
                Información profesional revisada
              </span>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <p className="text-ink-soft">¿Quieres conocer más profesionales?</p>
            <a
              href="#profesionales"
              className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 font-display text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-primary-container"
            >
              Ver todos los psicólogos
              <Icon name="arrow_forward" className="text-[20px]" />
            </a>
          </div>
        </Container>
      </section>

      <section className={section}>
        <Container>
          <Reveal className="mx-auto mb-16 max-w-2xl text-center">
            <Eyebrow tone="primary">Certeza clínica y ética</Eyebrow>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-primary md:text-[40px] md:leading-[48px]">
              ¿Por qué confiar en Mente Unida?
            </h2>
            <p className="mt-3 text-lg leading-7 text-ink-soft">
              Cuidar tu bienestar requiere certezas. Nos comprometemos con estándares éticos y humanos claros en cada etapa de tu proceso.
            </p>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {trust.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.05} className="rounded-3xl bg-white p-8 shadow-sm">
                <span className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${toneClasses(item.tone)}`}>
                  <Icon name={item.icon} className="text-[26px]" />
                </span>
                <h3 className="mb-2 font-display text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-6 text-ink-soft">{item.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className={`${section} bg-surface-low`}>
        <Container>
          <Reveal className="mx-auto mb-16 max-w-2xl text-center">
            <Eyebrow>Voces Reales</Eyebrow>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-primary md:text-[40px] md:leading-[48px]">
              Experiencias de quienes ya dieron el primer paso
            </h2>
            <p className="mt-3 text-ink-soft">
              Testimonios compartidos de manera anónima y voluntaria por personas que encontraron acompañamiento a través de la red.
            </p>
          </Reveal>
          <div className="grid gap-8 md:grid-cols-3">
            {reviews.map((review) => (
              <article key={review.name} className="flex flex-col justify-between rounded-3xl bg-white p-8 shadow-sm">
                <div>
                  <div className="mb-4 flex gap-0.5 text-secondary">
                    {Array.from({ length: review.stars }).map((_, index) => (
                      <Icon key={index} name="star" filled className="text-[20px]" />
                    ))}
                  </div>
                  <p className="mb-6 leading-7 text-ink italic">«{review.quote}»</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-mid pt-4">
                  <div>
                    <p className="font-display text-sm font-semibold">{review.name}</p>
                    <p className="text-xs text-ink-soft">{review.context}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-mid px-2.5 py-1 text-xs font-medium text-primary">
                    <Icon name="check" className="text-[14px]" />
                    Verificada
                  </span>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section id="para-psicologos" className="relative scroll-mt-24 overflow-hidden bg-forest py-20 text-white md:py-28">
        <div className="pointer-events-none absolute top-0 right-1/4 h-96 w-96 rounded-full bg-primary-container/20 blur-3xl" />
        <Container className="relative">
          <Reveal className="mb-16 max-w-3xl">
            <span className="mb-4 inline-block rounded-full bg-white/10 px-3.5 py-1.5 font-display text-xs font-semibold text-primary-fixed">
              Espacio para Profesionales Colegiados
            </span>
            <h2 className="font-display text-3xl font-semibold leading-tight md:text-[44px]">
              Tu práctica profesional también merece un lugar propio.
            </h2>
            <p className="mt-4 text-lg leading-7 text-white/80">
              Mente Unida busca ayudar a los profesionales a gestionar su práctica, atender a sus pacientes y continuar creciendo profesionalmente desde un mismo ecosistema digno y ético.
            </p>
          </Reveal>
          <div className="rounded-3xl bg-white/5 p-5 shadow-2xl sm:p-8 lg:p-12">
            <div className="grid items-center gap-10 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-6">
                <span className="inline-flex items-center gap-2 self-start rounded-full bg-secondary-container/20 px-3 py-1 font-display text-xs font-semibold text-secondary-fixed">
                  <Icon name="bolt" className="text-[16px]" />
                  Próximo Lanzamiento
                </span>
                <h3 className="font-display text-2xl font-semibold leading-snug sm:text-[32px] sm:leading-10">Clínica Ya: Tu propia clínica virtual integral</h3>
                <p className="leading-7 text-white/80">
                  Crea tu espacio digital de atención y gestiona tu consulta privada sin dispersarte entre múltiples aplicaciones de mensajería, hojas de cálculo y enlaces de videollamada desarticulados.
                </p>
                <ul className="space-y-3.5 pt-2 text-sm leading-6 text-white/90">
                  {clinicPoints.map((point, index) => (
                    <li key={point} className="flex items-start gap-3">
                      <Icon name="check_circle" className="mt-0.5 text-[20px] text-primary-fixed" />
                      <span>
                        <strong>{index + 1}. </strong>
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#sobre-nosotros"
                  className="inline-flex rounded-full bg-primary-fixed px-6 py-3.5 font-display text-sm font-semibold text-[#00201d] shadow-md transition hover:bg-white"
                >
                  Quiero conocer Clínica Ya
                </a>
              </div>
              <div className="lg:col-span-6">
                <div className="rounded-2xl bg-white p-4 text-ink shadow-2xl sm:p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-surface-mid pb-4">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="h-3 w-3 shrink-0 rounded-full bg-error" />
                      <span className="h-3 w-3 shrink-0 rounded-full bg-secondary-container" />
                      <span className="h-3 w-3 shrink-0 rounded-full bg-primary-container" />
                      <span className="ml-1 font-display text-xs font-semibold text-ink-soft">Panel Profesional — Clínica Ya</span>
                    </div>
                    <span className="rounded bg-surface-mid px-2 py-0.5 text-xs font-semibold text-primary">En Vivo</span>
                  </div>
                  <div className="mb-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-3">
                    {[
                      ["12", "Sesiones esta semana", "text-primary"],
                      ["98%", "Continuidad", "text-primary"],
                      ["4", "Próximas hoy", "text-secondary"],
                    ].map(([value, label, color]) => (
                      <div key={label} className="rounded-xl bg-surface-low p-3 text-center">
                        <span className={`block font-display text-lg font-semibold ${color}`}>{value}</span>
                        <span className="text-xs text-ink-soft">{label}</span>
                      </div>
                    ))}
                  </div>
                  <ClinicRow initials="MG" tone="mint" name="Mariana G. — Sesión 04" detail="16:00 hrs • Sala clínica encriptada" status="Iniciar sala" active />
                  <ClinicRow initials="DR" tone="clay" name="David R. — Sesión 02" detail="17:30 hrs • Notas clínicas listas" status="Programada" />
                  <p className="mt-4 text-center text-xs text-ink-soft">Vista previa conceptual • Cumplimiento ético y cifrado médico</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="sobre-nosotros" className={section}>
        <Container className="grid items-center gap-12 lg:grid-cols-12">
          <Reveal className="space-y-6 lg:col-span-6">
            <Eyebrow>Nuestra Vocación</Eyebrow>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-primary md:text-[40px] md:leading-[48px]">
              Un proyecto nacido para acercar el cuidado
            </h2>
            <p className="text-lg leading-7 text-ink-soft">
              Creemos que pedir ayuda es un acto de valentía que no debe verse obstaculizado por barreras burocráticas, desconfianza en las credenciales o interfaces despersonalizadas.
            </p>
            <div className="space-y-4 pt-2">
              <div className="rounded-2xl bg-surface-low p-5">
                <h3 className="mb-1 font-display text-lg font-semibold text-primary">Nuestra Misión</h3>
                <p className="text-sm leading-6 text-ink-soft">
                  Facilitar el acceso a un acompañamiento psicológico digno, ético y confiable, fortaleciendo al mismo tiempo a los profesionales que dedican su vida a cuidar la salud emocional de otros.
                </p>
              </div>
              <div className="rounded-2xl bg-surface-low p-5">
                <h3 className="mb-1 font-display text-lg font-semibold text-primary">Nuestra Visión</h3>
                <p className="text-sm leading-6 text-ink-soft">
                  Consolidar un entorno donde el cuidado de la salud mental sea visto como un hábito natural de salud, accesible, humano, desestigmatizado y en comunidad.
                </p>
              </div>
            </div>
          </Reveal>
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <h3 className="mb-6 font-display text-[22px] font-semibold">Valores que guían cada decisión</h3>
              <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
                {values.map((value) => (
                  <div key={value.title} className={`flex flex-col gap-2 rounded-2xl p-4 ${toneClasses(value.tone)}`}>
                    <Icon name={value.icon} className="text-[24px]" />
                    <span className="font-display text-lg font-semibold text-ink">{value.title}</span>
                    <span className="text-xs leading-5 text-ink-soft">{value.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-surface-low py-16 md:py-24">
        <Container className="max-w-[1000px]">
          <Reveal className="flex flex-col items-center rounded-3xl bg-white p-8 text-center shadow-sm md:p-16">
            <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed/60 text-primary">
              <Icon name="self_improvement" className="text-[32px]" />
            </span>
            <h2 className="max-w-xl font-display text-3xl font-semibold tracking-tight text-primary md:text-[40px] md:leading-[48px]">
              Dar el primer paso también es cuidarte.
            </h2>
            <p className="mt-4 max-w-lg text-lg leading-7 text-ink-soft">
              No tienes que tener todas las respuestas hoy. Estamos aquí para acompañarte a encontrar a la persona adecuada a tu ritmo.
            </p>
            <div className="mt-8 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
              <a href="#profesionales" className="w-full rounded-full bg-primary px-8 py-4 text-center font-display text-sm font-semibold text-white shadow-md transition hover:bg-primary-container sm:w-auto">
                Encontrar un psicólogo
              </a>
              <Link to="/registro" className="w-full rounded-full bg-surface-mid px-8 py-4 text-center font-display text-sm font-semibold text-primary transition hover:bg-surface-high sm:w-auto">
                Registrarme
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      {profile ? (
        <Modal
          title={profile.name}
          subtitle={`${profile.role} · ${profile.mode}`}
          onClose={() => setProfile(null)}
          footer={
            <>
              <button type="button" onClick={() => setProfile(null)} className="rounded-lg bg-surface-mid px-4 py-2.5 font-display text-sm font-semibold text-ink">
                Cerrar
              </button>
              <Link to="/registro" className="rounded-lg bg-primary-container px-5 py-2.5 font-display text-sm font-semibold text-white hover:bg-primary">
                Crear cuenta para agendar
              </Link>
            </>
          }
        >
          <img src={profile.image} alt="" className="mb-4 h-52 w-full rounded-xl object-cover" />
          <p className="font-display text-sm font-semibold text-primary">{profile.tags}</p>
          <p className="mt-3 leading-7 text-ink-soft">{profile.bio}</p>
          <p className="mt-4 text-sm text-ink-soft">
            Perfil de demostración. La agenda y la ficha completa se abren con una cuenta de Mente Unida.
          </p>
        </Modal>
      ) : null}
    </div>
  );
}

function ClinicRow({
  initials,
  tone,
  name,
  detail,
  status,
  active = false,
}: {
  initials: string;
  tone: "mint" | "clay";
  name: string;
  detail: string;
  status: string;
  active?: boolean;
}) {
  return (
    <div className="mb-3 flex flex-col gap-3 rounded-xl bg-surface-low p-4 last:mb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display font-bold ${tone === "clay" ? "bg-secondary-fixed text-secondary" : "bg-primary-fixed text-primary"}`}>
          {initials}
        </span>
        <div className="min-w-0">
          <h4 className="font-display text-sm font-semibold">{name}</h4>
          <p className="text-xs leading-5 text-ink-soft">{detail}</p>
        </div>
      </div>
      <span className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs ${active ? "bg-primary text-white" : "bg-surface-mid text-ink-soft"}`}>{status}</span>
    </div>
  );
}
