"use client";

import { DevicePreview, type DeviceSelection } from "@/components/consultorio/device-preview";
import { LiveKitSession } from "@/components/consultorio/livekit-session";
import { WaitingRoomInfo } from "@/components/consultorio/waiting-room";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api-client";
import type { AppointmentVideoStatus, AppointmentVideoToken } from "@/lib/api/types";
import { useAuthStore } from "@/lib/auth/store";
import type { Room } from "livekit-client";
import { Video } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export interface ConsultorioVideoHandle {
  disconnect: () => Promise<void>;
}

type Phase = "lobby" | "preview" | "in_call";

interface ConsultorioVideoPanelProps {
  appointmentId: string;
  className?: string;
}

export const ConsultorioVideoPanel = forwardRef<
  ConsultorioVideoHandle,
  ConsultorioVideoPanelProps
>(function ConsultorioVideoPanel({ appointmentId, className }, ref) {
  const token = useAuthStore((s) => s.token)!;
  const [phase, setPhase] = useState<Phase>("lobby");
  const [status, setStatus] = useState<AppointmentVideoStatus | null>(null);
  const [creds, setCreds] = useState<AppointmentVideoToken | null>(null);
  const [devices, setDevices] = useState<DeviceSelection | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const roomRef = useRef<Room | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await api.appointments.videoStatus(token, appointmentId);
      setStatus(s);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo cargar el estado de la videollamada.",
      );
    } finally {
      setLoading(false);
    }
  }, [appointmentId, token]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useImperativeHandle(
    ref,
    () => ({
      disconnect: async () => {
        const room = roomRef.current;
        if (room) {
          await room.disconnect();
          roomRef.current = null;
        }
      },
    }),
    [],
  );

  async function startPreview() {
    setError(null);
    if (status && !status.configured) {
      setError(
        "La videollamada no está configurada en el servidor. El chat y el registro clínico siguen disponibles.",
      );
      return;
    }
    if (status?.sessionEnded) {
      setError("La sala de esta consulta ya fue cerrada.");
      return;
    }
    if (status?.appointment.modality === "IN_PERSON") {
      setError("Esta cita es presencial; no hay videollamada.");
      return;
    }
    setPhase("preview");
  }

  async function joinWithDevices(selection: DeviceSelection) {
    setJoining(true);
    setError(null);
    try {
      const videoToken = await api.appointments.videoToken(
        token,
        appointmentId,
      );
      setCreds(videoToken);
      setDevices(selection);
      setPhase("in_call");
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              appointment: {
                ...prev.appointment,
                status: videoToken.appointment.status,
              },
            }
          : prev,
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo obtener acceso a la sala.",
      );
      setPhase("lobby");
    } finally {
      setJoining(false);
    }
  }

  function leaveCall() {
    setPhase("lobby");
    setCreds(null);
    setDevices(null);
    void loadStatus();
  }

  if (loading) {
    return (
      <div
        className={`flex min-h-64 items-center justify-center text-sm text-mu-text-muted ${className ?? ""}`}
      >
        Preparando consultorio…
      </div>
    );
  }

  if (phase === "in_call" && creds && devices) {
    return (
      <div className={`h-full min-h-64 ${className ?? ""}`}>
        <LiveKitSession
          creds={creds}
          devices={devices}
          roomRef={roomRef}
          onLeave={leaveCall}
        />
      </div>
    );
  }

  if (phase === "preview") {
    return (
      <div className={`h-full min-h-64 ${className ?? ""}`}>
        <DevicePreview
          joining={joining}
          onCancel={() => setPhase("lobby")}
          onReady={(selection) => void joinWithDevices(selection)}
        />
        {error ? (
          <p className="px-4 pb-3 text-xs text-mu-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`flex h-full min-h-64 flex-col items-center justify-center gap-4 p-6 text-center ${className ?? ""}`}
    >
      <Video className="h-10 w-10 text-mu-primary" aria-hidden />
      <div>
        <p className="font-heading text-xl font-semibold text-mu-text">
          Sala de espera
        </p>
        <p className="mt-1 text-sm text-mu-text-muted">
          Revisa tus dispositivos antes de entrar a la videollamada.
        </p>
      </div>

      {status ? (
        <div className="w-full max-w-sm rounded-mu border border-mu-border bg-white p-4 text-left">
          <WaitingRoomInfo
            selfName={status.appointment.selfName}
            peerName={status.appointment.peerName}
            role={status.role}
            startAt={status.appointment.startAt}
            endAt={status.appointment.endAt}
            status={status.appointment.status}
            peerConnected={false}
          />
        </div>
      ) : null}

      {!status?.configured ? (
        <p className="max-w-md text-xs text-amber-800">
          Videollamada pendiente de configuración en el servidor (LiveKit).
          Puedes usar el chat de la sesión con normalidad.
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-mu-error" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        onClick={() => void startPreview()}
        disabled={
          status?.sessionEnded ||
          status?.appointment.modality === "IN_PERSON" ||
          status?.appointment.status === "COMPLETED" ||
          status?.appointment.status === "CANCELLED"
        }
      >
        Preparar cámara y micrófono
      </Button>
    </div>
  );
});
