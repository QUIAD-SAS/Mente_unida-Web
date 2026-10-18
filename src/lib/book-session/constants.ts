export const ACCOMPANIMENT_REASON_OPTIONS = [
  { value: "ansiedad", label: "Ansiedad" },
  { value: "estres_laboral", label: "Estrés" },
  { value: "duelo", label: "Duelo" },
  { value: "relaciones", label: "Relaciones" },
  { value: "autoestima", label: "Autoestima" },
  { value: "depresion", label: "Depresión" },
  { value: "trauma", label: "Trauma" },
  { value: "otro", label: "Otro" },
] as const;

export type AccompanimentReasonValue =
  (typeof ACCOMPANIMENT_REASON_OPTIONS)[number]["value"];

export function accompanimentReasonLabel(value: string): string {
  return (
    ACCOMPANIMENT_REASON_OPTIONS.find((o) => o.value === value)?.label ?? value
  );
}
