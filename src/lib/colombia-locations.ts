/** Catálogo simplificado Colombia: país → departamento → ciudades. */
export const COUNTRY_OPTIONS = [
  { value: "CO", label: "Colombia" },
] as const;

export const CO_DEPARTMENTS: Record<
  string,
  { value: string; label: string; cities: { value: string; label: string }[] }[]
> = {
  CO: [
    {
      value: "Cundinamarca",
      label: "Cundinamarca",
      cities: [
        { value: "Bogotá", label: "Bogotá" },
        { value: "Soacha", label: "Soacha" },
        { value: "Chía", label: "Chía" },
        { value: "Zipaquirá", label: "Zipaquirá" },
      ],
    },
    {
      value: "Antioquia",
      label: "Antioquia",
      cities: [
        { value: "Medellín", label: "Medellín" },
        { value: "Envigado", label: "Envigado" },
        { value: "Bello", label: "Bello" },
        { value: "Rionegro", label: "Rionegro" },
      ],
    },
    {
      value: "Valle del Cauca",
      label: "Valle del Cauca",
      cities: [
        { value: "Cali", label: "Cali" },
        { value: "Palmira", label: "Palmira" },
        { value: "Buenaventura", label: "Buenaventura" },
      ],
    },
    {
      value: "Atlántico",
      label: "Atlántico",
      cities: [
        { value: "Barranquilla", label: "Barranquilla" },
        { value: "Soledad", label: "Soledad" },
      ],
    },
    {
      value: "Santander",
      label: "Santander",
      cities: [
        { value: "Bucaramanga", label: "Bucaramanga" },
        { value: "Floridablanca", label: "Floridablanca" },
      ],
    },
    {
      value: "Bolívar",
      label: "Bolívar",
      cities: [
        { value: "Cartagena", label: "Cartagena" },
        { value: "Magangué", label: "Magangué" },
      ],
    },
  ],
};

export const WELLBEING_OPTIONS = [
  { value: "bien", label: "Bien / estable" },
  { value: "algo_bajo", label: "Un poco bajo de ánimo" },
  { value: "ansioso", label: "Ansioso o agobiado" },
  { value: "triste", label: "Triste o desmotivado" },
  { value: "agotado", label: "Agotado / sobrecargado" },
  { value: "crisis", label: "En un momento difícil" },
];

export const WORK_ON_OPTIONS = [
  { value: "ansiedad", label: "Ansiedad" },
  { value: "depresion", label: "Ánimo / depresión" },
  { value: "relaciones", label: "Relaciones" },
  { value: "duelo", label: "Duelo o pérdidas" },
  { value: "autoestima", label: "Autoestima" },
  { value: "estres", label: "Estrés laboral o académico" },
  { value: "trauma", label: "Trauma o experiencias difíciles" },
  { value: "otro", label: "Otro" },
];

export const RELATIONSHIP_OPTIONS = [
  { value: "madre", label: "Madre" },
  { value: "padre", label: "Padre" },
  { value: "pareja", label: "Pareja" },
  { value: "hermano", label: "Hermano/a" },
  { value: "amigo", label: "Amigo/a" },
  { value: "otro", label: "Otro" },
];

export const STREET_TYPE_OPTIONS = [
  { value: "Calle", label: "Calle" },
  { value: "Carrera", label: "Carrera" },
  { value: "Avenida", label: "Avenida" },
  { value: "Diagonal", label: "Diagonal" },
  { value: "Transversal", label: "Transversal" },
  { value: "Circular", label: "Circular" },
];
