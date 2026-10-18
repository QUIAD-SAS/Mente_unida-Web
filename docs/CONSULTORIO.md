# Consultorio virtual

Documento técnico del Consultorio Virtual de Mente Unida, incluyendo la integración LiveKit.

## Rutas (sin cambios)

| Rol | Ruta | Entrada |
|-----|------|---------|
| Psicólogo | `/app/psicologo/consultorio/[appointmentId]` | Agenda → cita confirmada/en curso → **Ir al consultorio** |
| Psicólogo | `/app/psicologo/consultorio` | Placeholder: elegir cita desde la agenda |
| Paciente | `/app/paciente/consultorio/[appointmentId]` | Mis citas → **Ir al consultorio** (`CONFIRMED` / `IN_PROGRESS`) |

## Qué incluye el consultorio

### Psicólogo

1. **Videollamada LiveKit** (sala de espera → preview de dispositivos → sala).
2. **Panel clínico**
   - Datos del paciente (solo lectura).
   - Registro de la sesión: observaciones, impresión, plan, riesgo.
   - Guardar notas + **Cerrar sesión** (disconnect video → notas → `COMPLETED`).
3. **Chat de la sesión** — `AppointmentSessionChatWidget` (sin cambios).

### Paciente

- Misma videollamada LiveKit.
- Chat de sesión.
- Escuchadero oculto mientras está en el consultorio.
- Sin acceso a notas clínicas.

---

## Arquitectura LiveKit

```
Agenda → Appointment CONFIRMED/IN_PROGRESS
  → FE sala de espera + preview
  → POST /api/v1/appointments/:id/video/token  (JWT)
  → Backend valida ownership + status + ONLINE
  → Upsert VideoSession (room: appointment-{id})
  → Opcional: status → IN_PROGRESS
  → Access Token temporal (TTL ~2h)
  → FE Room.connect(url, token)
  → Chat sigue por messaging HTTP
  → Cerrar sesión: disconnect + clinical notes + COMPLETED + VideoSession.endedAt
```

### Sala

- Nombre estable: `appointment-{appointmentId}`
- Una sala por cita; no se reutiliza entre citas.

### Participantes (v1)

- Solo paciente y psicólogo asignados a la cita.
- Metadata del token incluye `role` (`PATIENT` | `PSYCHOLOGIST`) preparado para `SUPERVISOR` / `OBSERVER` a futuro.
- Compartir pantalla: solo psicólogo (`canPublishSources` con screen share).

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/appointments/:id/video/status` | Estado sin emitir token (útil si LiveKit no está configurado) |
| `POST` | `/appointments/:id/video/token` | Token + URL + metadatos de cita |
| `PATCH` | `/appointments/:id/complete` | Completa cita y cierra `VideoSession` (+ deleteRoom si aplica) |

Tokens **nunca** se generan en el frontend. Secrets solo en backend.

### Modelo

`VideoSession` (Prisma): `appointmentId`, `roomName`, `startedAt`, `endedAt`.

Grabación: no implementada; la arquitectura (room + session) queda lista para Egress después.

---

## Variables de entorno

### Backend (`Mente_Unida_Backend/.env`)

```
LIVEKIT_URL=wss://tu-proyecto.livekit.cloud
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
```

### Frontend

No requiere secrets. La URL de LiveKit llega en la respuesta de `video/token`.

Opcional (documentación / futuros usos):

```
NEXT_PUBLIC_LIVEKIT_URL=wss://tu-proyecto.livekit.cloud
```

Sin las tres variables del backend, el panel muestra “videollamada pendiente de configuración”; chat y notas siguen funcionando.

---

## Configuración local

1. Crear proyecto en [LiveKit Cloud](https://cloud.livekit.io/) (o self-host).
2. Copiar URL, API Key y API Secret al `.env` del backend.
3. Reiniciar `npm run dev` del API.
4. Abrir una cita `CONFIRMED` ONLINE desde paciente y psicólogo.
5. En cada lado: **Preparar cámara y micrófono** → **Entrar a la videollamada**.

### Self-host (opcional)

Se puede apuntar `LIVEKIT_URL` a un servidor LiveKit propio (Docker). El código no cambia: solo env vars.

---

## Configuración producción

1. LiveKit Cloud o servidor propio con TLS.
2. Actualizar `LIVEKIT_*` en el entorno del API.
3. Dominio + HTTPS en la app.
4. Sin cambios de código.

---

## Componentes FE relevantes

| Archivo | Rol |
|---------|-----|
| `consultorio/consultorio-video-panel.tsx` | Orquesta lobby / preview / call |
| `consultorio/device-preview.tsx` | Cámara/mic preview y toggles |
| `consultorio/waiting-room.tsx` | Info de espera y countdown |
| `consultorio/livekit-session.tsx` | Room LiveKit, controles, reconnect |
| `chat/appointment-session-chat-widget.tsx` | Chat (no modificar) |

## Backend

| Archivo | Rol |
|---------|-----|
| `appointments/livekit-video.service.ts` | Tokens, VideoSession, endSession |
| `appointments.controller.ts` | Rutas video/status y video/token |
| `appointments.service.ts` | `complete()` llama `endSession` |

---

## Checklist de pruebas

- [ ] Paciente y psicólogo entran a la misma sala.
- [ ] Usuario no autorizado recibe 403.
- [ ] Cita `PENDING` / `COMPLETED` / `IN_PERSON` no emite token válido.
- [ ] Reconexión automática al cortar red (mensaje “Reconectando…”).
- [ ] Cambio de cámara/mic en preview.
- [ ] Psicólogo comparte pantalla; paciente no tiene el control.
- [ ] Chat de sesión sigue funcionando.
- [ ] Notas clínicas se guardan.
- [ ] Cerrar sesión desconecta video, completa cita y cierra VideoSession.
- [ ] Sin env LiveKit, UI informativa sin romper el resto del consultorio.
