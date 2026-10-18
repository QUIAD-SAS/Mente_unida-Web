/** Catálogo de especialidades profesionales (registro + matching de citas). */

export const PSYCHOLOGIST_SPECIALTIES = [
  { code: "CLINICAL", label: "Psicología Clínica" },
  { code: "CHILD", label: "Psicología Infantil" },
  { code: "ADOLESCENT", label: "Psicología Adolescente" },
  { code: "COUPLES", label: "Psicología de Pareja" },
  { code: "FAMILY", label: "Psicología Familiar" },
  { code: "ORGANIZATIONAL", label: "Psicología Organizacional" },
  { code: "EDUCATIONAL", label: "Psicología Educativa" },
  { code: "SOCIAL", label: "Psicología Social" },
  { code: "COMMUNITY", label: "Psicología Comunitaria" },
  { code: "NEURO", label: "Neuropsicología" },
  { code: "HEALTH", label: "Psicología de la Salud" },
  { code: "FORENSIC", label: "Psicología Forense" },
  { code: "SPORTS", label: "Psicología Deportiva" },
  { code: "ADDICTION", label: "Psicología de Adicciones" },
  { code: "ELDERLY", label: "Psicología del Adulto Mayor" },
  { code: "SEXUAL", label: "Psicología Sexual" },
  { code: "EMERGENCY_CRISIS", label: "Psicología de Emergencias y Crisis" },
  { code: "OTHER", label: "Otro" },
] as const;

export type PsychologistSpecialtyCode =
  (typeof PSYCHOLOGIST_SPECIALTIES)[number]["code"];

export const PSYCHOLOGIST_SPECIALTY_OPTIONS = PSYCHOLOGIST_SPECIALTIES.map(
  (s) => ({ value: s.code, label: s.label }),
);

export function specialtyLabelFromCode(code: string): string {
  return (
    PSYCHOLOGIST_SPECIALTIES.find((s) => s.code === code)?.label ?? code
  );
}

export function specialtyCodeFromLabel(label: string): string | null {
  const needle = label.trim().toLowerCase();
  const hit = PSYCHOLOGIST_SPECIALTIES.find(
    (s) => s.label.toLowerCase() === needle,
  );
  return hit?.code ?? null;
}

/**
 * Motivo de acompañamiento (paciente) → códigos de especialidad recomendados.
 */
export const ACCOMPANIMENT_TO_SPECIALTY_CODES: Record<string, string[]> = {
  ansiedad: ["CLINICAL"],
  estres_laboral: ["CLINICAL", "ORGANIZATIONAL"],
  estres: ["CLINICAL", "ORGANIZATIONAL"],
  duelo: ["CLINICAL"],
  relaciones: ["COUPLES", "FAMILY"],
  autoestima: ["CLINICAL"],
  depresion: ["CLINICAL"],
  trauma: ["CLINICAL", "EMERGENCY_CRISIS"],
  otro: ["CLINICAL"],
};
