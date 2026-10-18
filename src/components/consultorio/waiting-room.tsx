"use client";

import { formatAppointmentDate } from "@/lib/format";
import { useEffect, useState } from "react";

function formatCountdown(ms: number) {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

interface WaitingRoomProps {
  selfName: string;
  peerName: string;
  role: "PATIENT" | "PSYCHOLOGIST" | string;
  startAt: string;
  endAt: string;
  status: string;
  peerConnected: boolean;
}

export function WaitingRoomInfo({
  selfName,
  peerName,
  role,
  startAt,
  endAt,
  status,
  peerConnected,
}: WaitingRoomProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const startMs = new Date(startAt).getTime();
  const remaining = startMs - now;
  const waitingFor =
    role === "PSYCHOLOGIST" ? "el paciente" : "el profesional";

  return (
    <div className="space-y-2 text-sm">
      <p>
        <span className="font-medium text-mu-text">Tú:</span>{" "}
        <span className="text-mu-text-muted">{selfName}</span>
      </p>
      <p>
        <span className="font-medium text-mu-text">
          {role === "PSYCHOLOGIST" ? "Paciente" : "Profesional"}:
        </span>{" "}
        <span className="text-mu-text-muted">{peerName}</span>
      </p>
      <p>
        <span className="font-medium text-mu-text">Horario:</span>{" "}
        <span className="text-mu-text-muted">
          {formatAppointmentDate(startAt)}
          {endAt ? ` – ${formatAppointmentDate(endAt).split(",").pop()?.trim() ?? ""}` : ""}
        </span>
      </p>
      <p>
        <span className="font-medium text-mu-text">Estado:</span>{" "}
        <span className="text-mu-text-muted">
          {status === "IN_PROGRESS"
            ? "En curso"
            : status === "CONFIRMED"
              ? "Confirmada"
              : status}
        </span>
      </p>
      {remaining > 0 ? (
        <p className="text-mu-text-muted">
          Tiempo restante para el inicio:{" "}
          <span className="font-medium tabular-nums text-mu-text">
            {formatCountdown(remaining)}
          </span>
        </p>
      ) : (
        <p className="text-mu-text-muted">La hora de la cita ya comenzó.</p>
      )}
      <p
        className={
          peerConnected
            ? "font-medium text-mu-success"
            : "font-medium text-amber-700"
        }
      >
        {peerConnected
          ? `${peerName} está en la sala.`
          : `Esperando a ${waitingFor}…`}
      </p>
    </div>
  );
}
