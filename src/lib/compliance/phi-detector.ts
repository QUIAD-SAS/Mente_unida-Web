/**
 * Detección básica de PHI (Protected Health Information) en publicaciones.
 * MVP: reglas + patrones. Fase 2: modelo NLP dedicado en packages/compliance.
 */

export interface PhiDetectionResult {
  passed: boolean;
  flags: string[];
  suggestions: string[];
}

const PATTERNS: { name: string; regex: RegExp; suggestion: string }[] = [
  {
    name: "email",
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    suggestion: "Elimina correos electrónicos.",
  },
  {
    name: "phone",
    regex: /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
    suggestion: "Elimina números de teléfono.",
  },
  {
    name: "address",
    regex:
      /\b(calle|avenida|av\.|carrera|cr\.|#|nº|n°)\s*[\w\d\s-]{3,40}/gi,
    suggestion: "No incluyas direcciones físicas.",
  },
  {
    name: "full_name",
    regex:
      /\b(paciente|señor|señora|sr\.|sra\.)\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+/gi,
    suggestion: "Usa pseudónimos o iniciales, nunca nombres completos.",
  },
  {
    name: "patient_photo",
    regex: /\b(foto|imagen|selfie)\s+(del\s+)?paciente/gi,
    suggestion: "No referencies fotografías de pacientes.",
  },
];

const BLOCKED_KEYWORDS = [
  "nombre completo",
  "dirección de casa",
  "documento de identidad del paciente",
  "número de cédula del paciente",
];

export function detectPhiInText(content: string): PhiDetectionResult {
  const flags: string[] = [];
  const suggestions: string[] = [];

  for (const { name, regex, suggestion } of PATTERNS) {
    if (regex.test(content)) {
      flags.push(name);
      if (!suggestions.includes(suggestion)) suggestions.push(suggestion);
    }
    regex.lastIndex = 0;
  }

  const lower = content.toLowerCase();
  for (const keyword of BLOCKED_KEYWORDS) {
    if (lower.includes(keyword)) {
      flags.push("blocked_keyword");
      suggestions.push(`Evita la expresión: "${keyword}".`);
    }
  }

  return {
    passed: flags.length === 0,
    flags,
    suggestions,
  };
}
