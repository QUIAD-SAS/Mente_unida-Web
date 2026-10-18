export const BRAND = {
  name: "Mente Unida",
  tagline:
    "Cuidamos la salud mental de las personas y fortalecemos el crecimiento de quienes las acompañan.",
  description:
    "Un espacio seguro donde las personas encuentran apoyo profesional y los psicólogos desarrollan su práctica, comparten experiencias y crecen junto a una comunidad comprometida con el bienestar emocional.",
} as const;

export const PLANS = [
  {
    id: "free",
    name: "Gratuito",
    price: "$0",
    period: "/mes",
    description: "Ideal para empezar tu presencia profesional.",
    features: [
      "Perfil profesional",
      "Comunidad profesional",
      "Presencia en la plataforma",
      "Publicaciones básicas",
    ],
    cta: "Comenzar gratis",
    highlighted: false,
  },
  {
    id: "professional",
    name: "Profesional",
    price: "$29",
    period: "/mes",
    description: "Gestiona tu práctica clínica en un solo lugar.",
    features: [
      "Agenda inteligente",
      "Consultorio virtual",
      "Gestión de pacientes",
      "Pagos integrados",
      "IA clínica básica",
    ],
    cta: "Probar 14 días",
    highlighted: true,
  },
  {
    id: "mentor",
    name: "Mentor",
    price: "$59",
    period: "/mes",
    description: "Para supervisores y líderes clínicos.",
    features: [
      "Todo en Profesional",
      "Supervisiones y mentorías",
      "Capacitaciones",
      "IA clínica avanzada",
      "Sesiones grupales",
    ],
    cta: "Contactar ventas",
    highlighted: false,
  },
] as const;

export const FEATURED_PSYCHOLOGISTS = [
  {
    name: "Dra. Camila Restrepo",
    specialty: "Ansiedad y estrés",
    city: "Bogotá",
    rating: 4.9,
    reviews: 128,
    price: "$85.000",
    verified: true,
  },
  {
    name: "Dr. Andrés Morales",
    specialty: "Terapia de pareja",
    city: "Medellín",
    rating: 4.8,
    reviews: 96,
    price: "$95.000",
    verified: true,
  },
  {
    name: "Lic. Valentina Soto",
    specialty: "Adolescentes",
    city: "Santiago",
    rating: 5.0,
    reviews: 74,
    price: "$70.000",
    verified: true,
  },
] as const;

export const FAQ_ITEMS = [
  {
    q: "¿Mente Unida reemplaza la atención de emergencia?",
    a: "No. En crisis o emergencia, contacta los servicios locales de salud mental o líneas de ayuda inmediata en tu país.",
  },
  {
    q: "¿Cómo verifican a los profesionales?",
    a: "Revisamos documento de identidad, tarjeta profesional y certificaciones antes de activar el badge Verificado.",
  },
  {
    q: "¿La IA diagnostica a mis pacientes?",
    a: "Nunca. La IA clínica solo apoya con resúmenes, organización de notas, bibliografía y escalas sugeridas bajo tu criterio profesional.",
  },
  {
    q: "¿Puedo atender consultas presenciales y virtuales?",
    a: "Sí. Configuras modalidad, tarifas y disponibilidad desde tu dashboard.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Stripe y Mercado Pago según tu país, con confirmación automática de citas.",
  },
] as const;
