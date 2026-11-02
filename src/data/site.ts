export const navItems = [
  { label: "Psicólogos", hash: "profesionales" },
  { label: "Cómo funciona", hash: "como-funciona" },
  { label: "Especialistas", hash: "para-psicologos" },
  { label: "Nosotros", hash: "sobre-nosotros" },
];

export const paradigm = [
  { n: "01", label: "Escuchar" },
  { n: "02", label: "Encontrar" },
  { n: "03", label: "Acompañar" },
  { n: "04", label: "Continuar" },
];

export const pillars = [
  {
    icon: "hearing",
    title: "Escuchar",
    tone: "teal" as const,
    text: "Un primer refugio para quienes aún exploran si están listos para la terapia formal. Accede a lecturas psicoeducativas, guías de autorreflexión y orientación sincera sin compromisos forzados.",
    note: "Tómate el tiempo que necesites",
  },
  {
    icon: "person_search",
    title: "Encontrar",
    tone: "clay" as const,
    text: "Conoce psicólogos con cédula profesional avalada, clasificados por enfoque (cognitivo, sistémico, humanista) y áreas de vida, para elegir con total tranquilidad al profesional afín a ti.",
    note: "Filtros transparentes y precisos",
  },
  {
    icon: "all_inclusive",
    title: "Continuar",
    tone: "mint" as const,
    text: "Tu proceso no se diluye en enlaces perdidos. Mantén la regularidad y el respaldo con tu terapeuta en un entorno confidencial concebido para sostener cambios duraderos en tu vida cotidiana.",
    note: "Vínculo terapéutico protegido",
  },
];

export const steps = [
  {
    n: "01",
    title: "Encuentra apoyo",
    text: "Explora perfiles detallados con enfoques clínicos reales, credenciales oficiales claras y disponibilidad de agenda abierta.",
    link: "Directorio verificado",
    tone: "teal" as const,
  },
  {
    n: "02",
    title: "Elige tu profesional",
    text: "Revisa su experiencia, su estilo de acompañamiento y cómo aborda motivos de consulta específicos antes de reservar.",
    link: "Conoce su filosofía",
    tone: "clay" as const,
  },
  {
    n: "03",
    title: "Agenda con calma",
    text: "Solicita y acuerda tu primera sesión de manera sencilla, en horarios que respeten tus descansos y tu rutina diaria.",
    link: "Reserva directa",
    tone: "mint" as const,
  },
  {
    n: "04",
    title: "Continúa tu proceso",
    text: "Da seguimiento ordenado dentro de un entorno estable, cercano y diseñado con absoluto rigor para tu tranquilidad.",
    link: "Acompañamiento firme",
    tone: "teal" as const,
  },
];

export const professionals = [
  {
    name: "Dra. Laura Gómez",
    role: "Psicóloga",
    rating: "4.9",
    opinions: "38 opiniones",
    tags: "Ansiedad · Estrés · Terapia de pareja",
    bio: "Psicóloga enfocada en acompañamiento emocional y procesos de crecimiento personal.",
    mode: "Virtual y presencial",
    modeIcon: "home_work",
    image: "/images/psych-laura.png",
    tagTone: "teal" as const,
  },
  {
    name: "Mtro. Carlos Morales",
    role: "Psicólogo",
    rating: "5.0",
    opinions: "41 opiniones",
    tags: "Terapia Sistémica · Adultos · Familia",
    bio: "Acompañamiento empático en dinámicas relacionales y resolución de conflictos.",
    mode: "Virtual",
    modeIcon: "videocam",
    image: "/images/psych-carlos.png",
    tagTone: "clay" as const,
  },
  {
    name: "Lic. Sofía Valenzuela",
    role: "Psicóloga",
    rating: "4.9",
    opinions: "28 opiniones",
    tags: "Mindfulness · Burnout · Regulación Emocional",
    bio: "Enfoque integrativo centrado en reducción de estrés y bienestar consciente.",
    mode: "Virtual",
    modeIcon: "videocam",
    image: "/images/psych-sofia.jpg",
    tagTone: "teal" as const,
  },
];

export const trust = [
  {
    icon: "fact_check",
    title: "Verificación estricta",
    text: "Validación exhaustiva de cédula profesional, título universitario acreditado y experiencia clínica real comprobable antes de habilitar el perfil.",
    tone: "teal" as const,
  },
  {
    icon: "security",
    title: "Privacidad absoluta",
    text: "Tus datos, notas personales y consultas protegidos bajo protocolos de confidencialidad médica y secreto profesional estricto.",
    tone: "clay" as const,
  },
  {
    icon: "spa",
    title: "Sin algoritmos fríos",
    text: "Aquí tú tienes el control de tu elección. Sin subastas de precios, sin presiones comerciales y con tarifas transparentes desde el inicio.",
    tone: "mint" as const,
  },
  {
    icon: "sync_saved_locally",
    title: "Continuidad del vínculo",
    text: "Plataforma diseñada para consolidar la relación terapéutica a largo plazo, evitando interrupciones y fricciones técnicas.",
    tone: "teal" as const,
  },
];

export const reviews = [
  {
    quote:
      "Llevaba meses postergando iniciar terapia por miedo a encontrar a alguien que no me entendiera. Con la Dra. Ana sentí empatía y claridad desde la primera conversación. Me devolvió la calma.",
    name: "Mariana G.",
    context: "Sesiones online",
    stars: 5,
  },
  {
    quote:
      "La transparencia sobre la cédula y el enfoque del Mtro. Morales me dio muchísima seguridad. En pareja pudimos poner sobre la mesa temas difíciles con un mediador profundamente humano.",
    name: "David R.",
    context: "Manejo de ansiedad y vínculo",
    stars: 5,
  },
  {
    quote:
      "Mente Unida no se siente como un software médico rígido. Es un lugar cálido. Agendar es fluido y saber que puedo continuar mis sesiones sin sorpresas me ha ayudado mucho con mi estrés laboral.",
    name: "Carla M.",
    context: "Atención al burnout",
    stars: 4,
  },
];

export const clinicPoints = [
  "Gestión ordenada: directorio centralizado de pacientes y fichas de seguimiento.",
  "Agenda inteligente: citas sincronizadas sin cruces de horarios ni cancelaciones caóticas.",
  "Sala virtual segura: videollamadas encriptadas de extremo a extremo sin instalar apps extra.",
  "Notas clínicas confidenciales: registro clínico estructurado que respeta la normativa de salud.",
  "Continuidad terapéutica: herramientas para acompañar entre sesiones y evaluar avances.",
];

export const values = [
  { icon: "verified", title: "Confianza", text: "Validación profesional sin excepciones.", tone: "neutral" as const },
  { icon: "lock", title: "Privacidad", text: "Confidencialidad absoluta y ética médica.", tone: "clay" as const },
  { icon: "favorite", title: "Humanidad", text: "Calidez y respeto por cada historia de vida.", tone: "mint" as const },
  { icon: "school", title: "Profesionalismo", text: "Prácticas sustentadas en evidencia científica.", tone: "neutral" as const },
  { icon: "handshake", title: "Respeto", text: "Sin juzgar ritmos ni decisiones personales.", tone: "neutral" as const },
  { icon: "autorenew", title: "Continuidad", text: "Sostén estable en tu evolución personal.", tone: "clay" as const },
];

export function toneClasses(tone: "teal" | "clay" | "mint" | "neutral") {
  if (tone === "clay") return "bg-secondary-fixed/50 text-secondary";
  if (tone === "mint") return "bg-primary-fixed/60 text-primary";
  if (tone === "neutral") return "bg-surface-mid text-primary";
  return "bg-surface-mid text-primary";
}
