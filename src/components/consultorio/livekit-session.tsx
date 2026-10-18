"use client";

import { WaitingRoomInfo } from "@/components/consultorio/waiting-room";
import type { DeviceSelection } from "@/components/consultorio/device-preview";
import { Button } from "@/components/ui/button";
import type { AppointmentVideoToken } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import {
  ConnectionState,
  createLocalTracks,
  LocalVideoTrack,
  RemoteParticipant,
  RemoteTrack,
  Room,
  RoomEvent,
  Track,
  type LocalTrack,
} from "livekit-client";
import {
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Signal,
  Video,
  VideoOff,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";

interface LiveKitSessionProps {
  creds: AppointmentVideoToken;
  devices: DeviceSelection;
  onLeave?: () => void;
  /** Ref externo para disconnect al cerrar consulta */
  roomRef?: MutableRefObject<Room | null>;
}

function formatElapsed(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function LiveKitSession({
  creds,
  devices,
  onLeave,
  roomRef,
}: LiveKitSessionProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const roomInstanceRef = useRef<Room | null>(null);
  const localTracksRef = useRef<LocalTrack[]>([]);
  const screenTrackRef = useRef<LocalVideoTrack | null>(null);

  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.Disconnected,
  );
  const [peerConnected, setPeerConnected] = useState(false);
  const [peerLeftMessage, setPeerLeftMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(devices.audioEnabled);
  const [camOn, setCamOn] = useState(devices.videoEnabled);
  const [sharing, setSharing] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [quality, setQuality] = useState<string>("—");

  const attachRemote = useCallback((track: RemoteTrack) => {
    if (track.kind !== Track.Kind.Video) return;
    const el = remoteVideoRef.current;
    if (!el) return;
    track.attach(el);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setElapsed(Date.now() - startedAt), 1000);
    return () => window.clearInterval(id);
  }, [startedAt]);

  useEffect(() => {
    let cancelled = false;
    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });
    roomInstanceRef.current = room;
    if (roomRef) roomRef.current = room;

    async function connect() {
      setError(null);
      try {
        const tracks = await createLocalTracks({
          audio: devices.audioDeviceId
            ? { deviceId: devices.audioDeviceId }
            : true,
          video: devices.videoDeviceId
            ? { deviceId: devices.videoDeviceId }
            : true,
        });
        if (cancelled) {
          tracks.forEach((t) => t.stop());
          return;
        }
        localTracksRef.current = tracks;

        for (const track of tracks) {
          if (track.kind === Track.Kind.Video && localVideoRef.current) {
            track.attach(localVideoRef.current);
          }
          if (track.kind === Track.Kind.Audio) {
            track.mediaStreamTrack.enabled = devices.audioEnabled;
          }
          if (track.kind === Track.Kind.Video) {
            track.mediaStreamTrack.enabled = devices.videoEnabled;
          }
        }

        room
          .on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
            setConnectionState(state);
          })
          .on(RoomEvent.ParticipantConnected, () => {
            setPeerConnected(true);
            setPeerLeftMessage(null);
          })
          .on(RoomEvent.ParticipantDisconnected, (participant) => {
            setPeerConnected(room.remoteParticipants.size > 0);
            const meta = safeParseMeta(participant.metadata);
            const role = meta?.role;
            setPeerLeftMessage(
              role === "PSYCHOLOGIST"
                ? "El profesional abandonó la sesión."
                : "El paciente abandonó la sesión.",
            );
          })
          .on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
            if (track.kind === Track.Kind.Video) {
              attachRemote(track);
              setPeerConnected(true);
              setPeerLeftMessage(null);
            }
            if (track.kind === Track.Kind.Audio) {
              const audioEl = track.attach();
              audioEl.dataset.peer = participant.identity;
              document.body.appendChild(audioEl);
            }
          })
          .on(RoomEvent.TrackUnsubscribed, (track) => {
            track.detach().forEach((el) => {
              el.remove();
            });
          })
          .on(RoomEvent.ConnectionQualityChanged, (_q, participant) => {
            if (participant.isLocal) {
              setQuality(String(_q));
            }
          });

        await room.connect(creds.url, creds.token);
        if (cancelled) {
          await room.disconnect();
          return;
        }

        for (const track of tracks) {
          await room.localParticipant.publishTrack(track);
        }

        // Participante remoto ya presente
        room.remoteParticipants.forEach((p: RemoteParticipant) => {
          setPeerConnected(true);
          p.trackPublications.forEach((pub) => {
            if (pub.track && pub.track.kind === Track.Kind.Video) {
              attachRemote(pub.track as RemoteTrack);
            }
          });
        });
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof Error
            ? err.message
            : "No se pudo conectar a la videollamada.";
        if (/permission|NotAllowed/i.test(msg)) {
          setError("Permisos de cámara o micrófono denegados.");
        } else if (/NotFound|device/i.test(msg)) {
          setError("Cámara o micrófono no disponible.");
        } else {
          setError("Error de conexión con la sala. Intenta de nuevo.");
        }
      }
    }

    void connect();

    return () => {
      cancelled = true;
      localTracksRef.current.forEach((t) => {
        t.stop();
        t.detach();
      });
      localTracksRef.current = [];
      screenTrackRef.current?.stop();
      screenTrackRef.current = null;
      void room.disconnect();
      roomInstanceRef.current = null;
      if (roomRef) roomRef.current = null;
      document
        .querySelectorAll("audio[data-peer]")
        .forEach((el) => el.remove());
    };
  }, [attachRemote, creds.token, creds.url, devices, roomRef]);

  async function toggleMic() {
    const room = roomInstanceRef.current;
    if (!room) return;
    const next = !micOn;
    await room.localParticipant.setMicrophoneEnabled(next);
    setMicOn(next);
  }

  async function toggleCam() {
    const room = roomInstanceRef.current;
    if (!room) return;
    const next = !camOn;
    await room.localParticipant.setCameraEnabled(next);
    setCamOn(next);
  }

  async function toggleScreen() {
    if (!creds.canShareScreen) return;
    const room = roomInstanceRef.current;
    if (!room) return;

    if (sharing) {
      await room.localParticipant.setScreenShareEnabled(false);
      screenTrackRef.current = null;
      setSharing(false);
      return;
    }

    try {
      await room.localParticipant.setScreenShareEnabled(true);
      setSharing(true);
    } catch {
      setError("No se pudo compartir la pantalla.");
    }
  }

  async function handleLeave() {
    const room = roomInstanceRef.current;
    localTracksRef.current.forEach((t) => {
      t.stop();
      t.detach();
    });
    if (room) await room.disconnect();
    onLeave?.();
  }

  const reconnecting =
    connectionState === ConnectionState.Reconnecting ||
    connectionState === ConnectionState.SignalReconnecting ||
    connectionState === ConnectionState.Connecting;

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-mu bg-mu-background">
      <div className="relative min-h-0 flex-1 bg-black">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />
        {!peerConnected ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4">
            <div className="max-w-sm rounded-mu bg-white/95 p-4 shadow-lg">
              <WaitingRoomInfo
                selfName={creds.appointment.selfName}
                peerName={creds.appointment.peerName}
                role={creds.role}
                startAt={creds.appointment.startAt}
                endAt={creds.appointment.endAt}
                status={creds.appointment.status}
                peerConnected={false}
              />
            </div>
          </div>
        ) : null}

        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-3 right-3 h-28 w-40 rounded-mu border border-white/30 object-cover shadow-lg sm:h-32 sm:w-48"
        />

        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2 rounded-mu bg-black/55 px-2.5 py-1.5 text-[11px] text-white">
          <span className="inline-flex items-center gap-1">
            <Signal className="h-3.5 w-3.5" />
            {reconnecting
              ? "Reconectando…"
              : connectionState === ConnectionState.Connected
                ? `Conectado · ${quality}`
                : String(connectionState)}
          </span>
          <span className="tabular-nums">{formatElapsed(elapsed)}</span>
        </div>

        {peerLeftMessage && peerConnected === false ? (
          <div className="absolute inset-x-3 top-12 rounded-mu bg-amber-50 px-3 py-2 text-center text-xs text-amber-900">
            {peerLeftMessage} Puedes permanecer en la sala; podrá volver a
            ingresar mientras la cita esté activa.
          </div>
        ) : null}

        {reconnecting ? (
          <div className="absolute inset-x-0 bottom-20 text-center text-sm font-medium text-white">
            Reconectando…
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="shrink-0 bg-mu-error/10 px-3 py-2 text-xs text-mu-error">
          {error}
        </p>
      ) : null}

      <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-t border-mu-border bg-white px-3 py-2.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => void toggleMic()}
        >
          {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          {micOn ? "Silenciar" : "Activar mic"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => void toggleCam()}
        >
          {camOn ? (
            <Video className="h-4 w-4" />
          ) : (
            <VideoOff className="h-4 w-4" />
          )}
          {camOn ? "Apagar cámara" : "Encender cámara"}
        </Button>
        {creds.canShareScreen ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={cn("gap-1.5", sharing && "border-mu-primary text-mu-primary")}
            onClick={() => void toggleScreen()}
          >
            <MonitorUp className="h-4 w-4" />
            {sharing ? "Dejar de compartir" : "Compartir pantalla"}
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="destructive"
          className="gap-1.5"
          onClick={() => void handleLeave()}
        >
          <PhoneOff className="h-4 w-4" />
          Salir del video
        </Button>
      </div>
    </div>
  );
}

function safeParseMeta(raw?: string | null): { role?: string } | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { role?: string };
  } catch {
    return null;
  }
}
