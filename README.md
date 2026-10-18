# Mente Unida — Frontend unificado

Next.js 15: sitio público, app paciente/psicólogo y panel administrativo en un solo proyecto.

## Stack

- Next.js 15 · React 19 · TypeScript · Tailwind CSS 4
- Zustand (sesión JWT)
- TanStack Query + React Hook Form + Zod (panel admin)

## Inicio rápido

```bash
# Terminal 1 — API
cd ../Mente_Unida_Backend
docker compose up -d
npm install && npm run db:generate && npm run db:push && npm run db:seed
npm run dev

# Terminal 2 — Frontend
cd ../Mente_Unida
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev
```

- App: http://localhost:3000  
- API: http://localhost:4000/api/v1  

## Rutas principales

| Área | Prefijo |
|------|---------|
| Marketing | `/`, `/directorio`, `/verificacion` |
| Auth | `/login`, `/registro` |
| App usuario | `/app/paciente`, `/app/psicologo`, `/app/book-session` |
| Admin | `/dashboard`, `/dashboard/usuarios`, `/dashboard/solicitudes`, … |

Login único en `/login`. El rol decide el destino.

## Credenciales demo

Contraseña: `MenteUnida2026!`

- Paciente: `paciente@demo.co`
- Psicólogo: `psicologo@demo.co`
- Admin: `admin@menteunida.co`

## Documentación

- [Diseño / tipografía / pantallas](docs/FRONTEND_DISENO.md)
- [API backend](../Mente_Unida_Backend/docs/API.md)

## Estructura

```
src/app/(marketing)   # Landing y directorio
src/app/(auth)        # Login / registro
src/app/(app)         # Espacio paciente y psicólogo (/app/*)
src/app/(admin)       # Panel admin (/dashboard/*)
src/components/       # UI por dominio
src/lib/api-client.ts # Cliente producto
src/lib/admin/        # Cliente y tipos del panel admin
```
