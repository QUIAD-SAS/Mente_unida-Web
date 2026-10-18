"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface DeviceSelection {
  videoDeviceId: string;
  audioDeviceId: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
}

interface DevicePreviewProps {
  onReady: (selection: DeviceSelection) => void;
  onCancel?: () => void;
  joining?: boolean;
}

export function DevicePreview({
  onReady,
  onCancel,
  joining,
}: DevicePreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [videoDeviceId, setVideoDeviceId] = useState("");
  const [audioDeviceId, setAudioDeviceId] = useState("");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      setLoading(true);
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter((d) => d.kind === "videoinput");
        const auds = devices.filter((d) => d.kind === "audioinput");
        setCameras(cams);
        setMics(auds);

        const currentVideo = stream.getVideoTracks()[0]?.getSettings().deviceId;
        const currentAudio = stream.getAudioTracks()[0]?.getSettings().deviceId;
        setVideoDeviceId(currentVideo ?? cams[0]?.deviceId ?? "");
        setAudioDeviceId(currentAudio ?? auds[0]?.deviceId ?? "");
      } catch (err) {
        const name = err instanceof DOMException ? err.name : "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setError(
            "Permisos de cámara o micrófono denegados. Actívalos en el navegador para continuar.",
          );
        } else if (name === "NotFoundError") {
          setError("No encontramos cámara o micrófono en este dispositivo.");
        } else {
          setError("No se pudieron acceder a los dispositivos de audio/video.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void setup();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    const stream = streamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => {
      t.enabled = videoEnabled;
    });
    stream.getAudioTracks().forEach((t) => {
      t.enabled = audioEnabled;
    });
  }, [videoEnabled, audioEnabled]);

  async function switchDevices(nextVideoId: string, nextAudioId: string) {
    setError(null);
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: nextVideoId ? { deviceId: { exact: nextVideoId } } : true,
        audio: nextAudioId ? { deviceId: { exact: nextAudioId } } : true,
      });
      streamRef.current = stream;
      stream.getVideoTracks().forEach((t) => {
        t.enabled = videoEnabled;
      });
      stream.getAudioTracks().forEach((t) => {
        t.enabled = audioEnabled;
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setVideoDeviceId(nextVideoId);
      setAudioDeviceId(nextAudioId);
    } catch {
      setError("No se pudo cambiar el dispositivo seleccionado.");
    }
  }

  function handleJoin() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    onReady({
      videoDeviceId,
      audioDeviceId,
      videoEnabled,
      audioEnabled,
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-4">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-mu bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "h-full w-full object-cover",
            !videoEnabled && "opacity-0",
          )}
        />
        {!videoEnabled ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-white/80">
            Cámara desactivada
          </div>
        ) : null}
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm text-white">
            Preparando dispositivos…
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs text-mu-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block text-xs font-medium text-mu-text">
          Cámara
          <select
            className="mt-1 h-9 w-full rounded-mu border border-mu-border bg-white px-2 text-sm"
            value={videoDeviceId}
            onChange={(e) => void switchDevices(e.target.value, audioDeviceId)}
            disabled={loading || Boolean(error)}
          >
            {cameras.map((c) => (
              <option key={c.deviceId} value={c.deviceId}>
                {c.label || "Cámara"}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-mu-text">
          Micrófono
          <select
            className="mt-1 h-9 w-full rounded-mu border border-mu-border bg-white px-2 text-sm"
            value={audioDeviceId}
            onChange={(e) => void switchDevices(videoDeviceId, e.target.value)}
            disabled={loading || Boolean(error)}
          >
            {mics.map((m) => (
              <option key={m.deviceId} value={m.deviceId}>
                {m.label || "Micrófono"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => setVideoEnabled((v) => !v)}
        >
          {videoEnabled ? (
            <Video className="h-4 w-4" />
          ) : (
            <VideoOff className="h-4 w-4" />
          )}
          {videoEnabled ? "Cámara on" : "Cámara off"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => setAudioEnabled((v) => !v)}
        >
          {audioEnabled ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
          {audioEnabled ? "Mic on" : "Silenciado"}
        </Button>
        <div className="ml-auto flex gap-2">
          {onCancel ? (
            <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
              Volver
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            disabled={loading || Boolean(error) || joining}
            onClick={handleJoin}
          >
            {joining ? "Conectando…" : "Entrar a la videollamada"}
          </Button>
        </div>
      </div>
    </div>
  );
}
