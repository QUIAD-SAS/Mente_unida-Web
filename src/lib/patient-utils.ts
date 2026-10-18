export type DocumentType = "CC" | "CE" | "PASSPORT" | "TI" | "OTHER";
export type Gender = "MALE" | "FEMALE" | "NON_BINARY" | "PREFER_NOT_SAY" | "OTHER";

export const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "CE", label: "Cédula de extranjería" },
  { value: "TI", label: "Tarjeta de identidad" },
  { value: "PASSPORT", label: "Pasaporte" },
  { value: "OTHER", label: "Otro" },
];

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Masculino" },
  { value: "FEMALE", label: "Femenino" },
  { value: "NON_BINARY", label: "No binario" },
  { value: "PREFER_NOT_SAY", label: "Prefiero no decir" },
  { value: "OTHER", label: "Otro" },
];

export const RISK_LEVEL_OPTIONS = [
  { value: "ninguno", label: "Me siento bien en general" },
  { value: "bajo", label: "Algo de malestar" },
  { value: "moderado", label: "Malestar frecuente" },
  { value: "alto", label: "Necesito apoyo pronto" },
];

export function genderLabel(gender: Gender | null | undefined): string | null {
  if (!gender) return null;
  return GENDER_OPTIONS.find((g) => g.value === gender)?.label ?? null;
}

export function computeAge(birthDate?: string | Date | null): number | null {
  if (!birthDate) return null;
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age--;
  }
  return age >= 0 ? age : null;
}

export function formatAge(age: number | null | undefined): string {
  if (age == null) return "—";
  return `${age} años`;
}

export function previewPatientAlias(): string {
  const adjectives = ["Luna", "Horizonte", "Brisa", "Aurora", "Cielo"];
  const nouns = ["Azul", "Calmo", "Sereno", "Claro", "Suave"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const suffix = Math.floor(10 + Math.random() * 89);
  return `${adj}${noun}${suffix}`;
}
