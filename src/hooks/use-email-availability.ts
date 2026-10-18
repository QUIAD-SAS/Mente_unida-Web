"use client";

import { api, ApiError } from "@/lib/api-client";
import { useEffect, useState } from "react";

export type EmailAvailabilityStatus =
  | "idle"
  | "invalid"
  | "checking"
  | "available"
  | "taken"
  | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useEmailAvailability(email: string) {
  const [status, setStatus] = useState<EmailAvailabilityStatus>("idle");

  useEffect(() => {
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      setStatus("idle");
      return;
    }

    if (!EMAIL_RE.test(trimmed)) {
      setStatus("invalid");
      return;
    }

    setStatus("checking");
    const timer = setTimeout(() => {
      api.auth
        .checkEmailAvailable(trimmed)
        .then((res) => setStatus(res.available ? "available" : "taken"))
        .catch((err) => {
          if (err instanceof ApiError && err.status === 404) {
            setStatus("idle");
            return;
          }
          setStatus("error");
        });
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  return status;
}

export function emailStatusMessage(status: EmailAvailabilityStatus): string | null {
  switch (status) {
    case "checking":
      return "Verificando disponibilidad…";
    case "available":
      return "Correo disponible";
    case "taken":
      return "Este correo ya está registrado";
    case "invalid":
      return "Ingresa un correo válido";
    case "error":
      return "No pudimos verificar el correo. Intenta de nuevo.";
    default:
      return null;
  }
}
