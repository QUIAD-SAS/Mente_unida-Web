import type { RecommendedPsychologist } from "@/lib/api/types";
import { formatAppointmentDate } from "@/lib/format";

/** Shape devuelto por GET /recommendations en el backend actual */
export interface ApiRecommendedPsychologist {
  id: string;
  name: string | null;
  specialty?: string;
  specialties?: string[];
  experience?: number;
  yearsExperience?: number | null;
  languages?: string[];
  price?: number;
  priceCents?: number;
  currency?: string;
  nextAvailability?: {
    slotId: string;
    startAt: string;
    endAt: string;
  } | null;
  nextAvailable?: string | null;
  nextAvailableAt?: string | null;
  photo?: string | null;
  image?: string | null;
  verified?: boolean;
  slug?: string;
  title?: string | null;
  city?: string | null;
  modalityOnline?: boolean;
  modalityInPerson?: boolean;
  ratingAvg?: number;
  ratingCount?: number;
}

export function normalizeRecommendedPsychologist(
  raw: ApiRecommendedPsychologist,
): RecommendedPsychologist {
  const nextSlot = raw.nextAvailability;
  const nextAvailable =
    raw.nextAvailable ??
    raw.nextAvailableAt ??
    (nextSlot?.startAt
      ? formatAppointmentDate(nextSlot.startAt)
      : null);

  const specialty = raw.specialty ?? raw.specialties?.[0] ?? raw.title ?? null;

  return {
    id: raw.id,
    slug: raw.slug ?? raw.id,
    name: raw.name,
    image: raw.image ?? raw.photo ?? null,
    title: raw.title ?? specialty,
    specialties: raw.specialties ?? (specialty ? [specialty] : []),
    city: raw.city ?? null,
    ratingAvg: raw.ratingAvg ?? 0,
    ratingCount: raw.ratingCount ?? 0,
    priceCents: raw.priceCents ?? raw.price ?? 0,
    currency: raw.currency ?? "COP",
    modalityOnline: raw.modalityOnline ?? true,
    modalityInPerson: raw.modalityInPerson ?? false,
    yearsExperience: raw.yearsExperience ?? raw.experience ?? null,
    languages: raw.languages ?? ["es"],
    verified: raw.verified ?? true,
    nextAvailable,
    nextAvailableAt: nextSlot?.startAt ?? raw.nextAvailableAt ?? null,
  };
}

export interface ApiAvailabilitySlot {
  id: string;
  startAt: string;
  endAt: string;
  isBooked?: boolean;
  label?: string;
}

export function normalizeAvailabilityDates(
  dates: Array<{ date: string; slots: ApiAvailabilitySlot[] }>,
) {
  const now = Date.now();

  return dates
    .map((day) => {
      const seenStarts = new Set<string>();
      const slots = day.slots
        .filter((slot) => !slot.isBooked && new Date(slot.startAt).getTime() > now)
        .filter((slot) => {
          // Una sola opción por horario (evita "7:00 p. m." duplicado)
          const start = new Date(slot.startAt);
          const key = `${start.getFullYear()}-${start.getMonth()}-${start.getDate()}-${start.getHours()}-${start.getMinutes()}`;
          if (seenStarts.has(key)) return false;
          seenStarts.add(key);
          return true;
        })
        .map((slot) => ({
          id: slot.id,
          startAt: slot.startAt,
          endAt: slot.endAt,
          isBooked: false,
        }))
        .sort(
          (a, b) =>
            new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
        );

      return { date: day.date, slots };
    })
    .filter((day) => day.slots.length > 0);
}

export function buildAppointmentNotes(input: {
  accompanimentReason: string;
  accompanimentLabel: string;
  description?: string;
  emotionalState?: string;
  privacyChoice?: string;
}): string | undefined {
  const lines: string[] = [
    `Motivo: ${input.accompanimentLabel || input.accompanimentReason}`,
  ];
  if (input.description?.trim()) {
    lines.push(`Descripción: ${input.description.trim()}`);
  }
  if (input.emotionalState) {
    lines.push(`Estado emocional: ${input.emotionalState}`);
  }
  if (input.privacyChoice) {
    const privacyLabels: Record<string, string> = {
      YES: "Identidad protegida (alias)",
      NO: "Nombre visible",
      DISCUSS: "A definir con el profesional",
    };
    lines.push(
      `Privacidad: ${privacyLabels[input.privacyChoice] ?? input.privacyChoice}`,
    );
  }
  return lines.join("\n");
}
