# Frontend — tipografía, colores y pantallas

Documento de identidad visual del frontend unificado (marketing + app + admin).

---

## Tipografía

| Uso | Fuente | Variable CSS |
|-----|--------|--------------|
| Títulos / headings | **Manrope** | `--font-manrope` / `--font-heading` |
| Cuerpo / UI | **Inter** | `--font-inter` / `--font-sans` |

Carga: `next/font/google` en `src/app/layout.tsx`.

Reglas:
- `h1–h6` usan `font-heading` (Manrope).
- Texto de interfaz y formularios usan `font-sans` (Inter).
- No usar Inter/Roboto/Arial como display hero fuera de este sistema.

---

## Paleta (`mu-*`)

Definida en `src/app/globals.css` (`@theme`):

| Token | Hex | Uso |
|-------|-----|-----|
| `mu-primary` | `#4F8FBF` | CTAs, links, marca |
| `mu-primary-dark` / `mu-primary-hover` | `#3D7299` | Hover primario |
| `mu-secondary` | `#8BA888` | Acentos bienestar |
| `mu-background` | `#F8FAFC` | Fondo de página |
| `mu-surface` | `#FFFFFF` | Superficies / paneles |
| `mu-accent` | `#EEF4F9` | Fondos suaves |
| `mu-sidebar` | `#3D7299` | Sidebar admin |
| `mu-text` | `#1F2937` | Texto principal |
| `mu-text-muted` | `#6B7280` | Texto secundario |
| `mu-border` | `#E5E7EB` | Bordes |
| `mu-success` | `#5CB85C` | Éxito |
| `mu-warning` | `#F4B942` | Advertencia |
| `mu-error` | `#E85D75` | Error / destructive |

Radios: `rounded-mu` (0.75rem), `rounded-mu-lg` (1rem).  
Sombras: `shadow-mu-soft`, `shadow-mu-card`.

---

## Mapa de pantallas

### Marketing (`(marketing)`)

| Ruta | Propósito | Notas visuales |
|------|-----------|----------------|
| `/` | Landing | Hero marca + CTA; fondo `mu-gradient-soft` / secciones |
| `/directorio` | Lista profesionales | Filtros + cards directorio |
| `/directorio/[slug]` | Perfil público | CTA agendar |
| `/verificacion` | Info verificación | Estático / onboarding psicólogo |

### Auth (`(auth)`)

| Ruta | Propósito |
|------|-----------|
| `/login` | **Login único** (paciente, psicólogo, admin) |
| `/registro` | Onboarding multi-paso |

Fondo login admin legacy: utilidad `.mu-login-bg` (disponible en globals).

### App usuario (`(app)`) — rutas `/app/*`

| Ruta | Rol | Color / layout |
|------|-----|----------------|
| `/app/paciente` | Paciente | Shell claro + sidebar |
| `/app/paciente/citas` | Paciente | Listado + detalle por estado (PENDING / chat CONFIRMED / cancelReason) |
| `/app/paciente/configuracion` | Paciente | Perfil |
| `/app/book-session` | Paciente | Reserva (slots desde ahora, bloques 1h) |
| `/app/psicologo` | Psicólogo | Home profesional |
| `/app/psicologo/agenda` | Psicólogo | Agenda por día + detalle + Consultorio |
| `/app/psicologo/pacientes` | Psicólogo | Pacientes |
| `/app/psicologo/mensajes` | Psicólogo | Chat citas + Escuchadero asignado |
| `/app/psicologo/comunidad` | Psicólogo | Feed |
| `/app/psicologo/configuracion` | Psicólogo | Perfil |
| `/app/psicologo/consultorio/[appointmentId]` | Psicólogo | Chat + HC + cierre (video LiveKit pendiente) |
| `/app/psicologo/ia` · `/supervisiones` | — | Placeholder “próximamente” |

UI de app: `src/components/dashboard/*` + `src/components/ui/*` (Button con `href`, Card, Badge).

### Admin (`(admin)`) — rutas `/dashboard/*`

| Ruta | Módulo | Notas |
|------|--------|-------|
| `/dashboard` | Home ops | Sidebar `mu-sidebar` |
| `/dashboard/escuchadero` | Escuchadero híbrido | Inbox real + acciones clínicas |
| `/dashboard/escuchadero/emergencias` | Emergencias | Cola de alertas |
| `/dashboard/escuchadero/seguimiento` | Seguimiento crisis | CrisisFollowUp |
| `/dashboard/soporte` | Soporte | Stub |
| `/dashboard/usuarios` · `/pacientes` · `/psicologos` | Usuarios | **Datos reales** |
| `/dashboard/solicitudes` | Verificación | **Datos reales** |
| `/dashboard/comunidad` | Posts | Stub |
| `/dashboard/moderacion` | Moderación | Stub |
| `/dashboard/finanzas` | Finanzas | Stub |
| `/dashboard/ia-administrativa` | IA | Stub |
| `/dashboard/auditoria` | Auditoría | **AuditLog real** |
| `/dashboard/configuracion` | Config | Stub |

### Registro (`/registro`)

Wizard paciente: dirección CO (país/depto/ciudad), modal emergencia (4 campos), selects clínicos, términos bloqueantes, alias real post-registro.
Wizard psicólogo: RETHUS/tarjeta/especializaciones (máx. 5), experiencias laborales, términos.

UI admin: `src/components/admin/*` + módulos (`pacientes`, `solicitudes`, …) + `src/components/admin/ui/*` (Radix + CVA).

---

## Componentes UI

- **Producto / marketing:** `src/components/ui` — Button, Card, Badge, FormField.
- **Admin:** `src/components/admin/ui` — Button (asChild), Table, Dialog-related, Input, Checkbox, etc.

No mezclar ambos en la misma vista sin necesidad: APIs de `Button` son distintas.

---

## Redirects legacy

Rutas antiguas de app bajo `/dashboard/paciente|psicologo|book-session` redirigen a `/app/...` (ver `next.config.ts`). El panel admin permanece en `/dashboard`.
