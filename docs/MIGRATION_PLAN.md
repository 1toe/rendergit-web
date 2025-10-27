# Plan de Migración: Vite React -> Next.js (DirHub)

Objetivo: Migrar incrementalmente la aplicación actual (Vite + React) a una arquitectura SaaS basada en Next.js (App Router) preservando componentes útiles y minimizando riesgo de rotura.

Resumen de estrategia
1. No borrar código existente. Mantener `src/` actual como referencia.
2. Añadir un scaffold Next.js en `next-scaffold/` como base de trabajo.
3. Migración por capas: Layout & Routing -> UI primitives -> Features -> Services -> Integración backend.
4. Pruebas y validación por cada paso.

Fases

Fase 0 — Preparación (0.5d)
- Añadir documentación (este repo)
- Crear `next-scaffold/` con layout mínimo
- Definir mapping de componentes

Fase 1 — Layout y Rutas (1-2 d)
- Crear `app/layout.tsx`, `app/page.tsx`, páginas principales (/repositories, /add, /queue, /[owner]/[repo])
- Integrar `GlobalStyles` y `tailwind.config` (si se adopta Tailwind)

Fase 2 — UI Primitives (2-3 d)
- Migrar componentes de `src/components/ui/` (Button, Card, Input, Sheet, Dialog)
- Añadir variantes con CVA
- Tests unitarios básicos

Fase 3 — Feature Components (3-5 d)
- Migrar `SearchBar`, `RepoCard`, `MarkdownContent`, `DirectoryTree`, `CodeViewer`
- Reusar lógica de services (mover código a `services/` compartido)

Fase 4 — Servicios & State (2-4 d)
- Mover `appStateService`, `repoFlattenerService`, `searchService` al nuevo `src/services` o a endpoints serverless si conviene
- Reforzar typings

Fase 5 — Integración y Optimización (3-5 d)
- Implementar fetch con caching (revalidate)
- Tests de integración
- Performance tuning (ISR, streaming)

Fase 6 — QA & Release
- Tests E2E si aplica
- Documentación de despliegue (Vercel, Docker)

Checklist técnico (por módulo)
- [ ] `layout.tsx` con Metadata
- [ ] `NavBar` y `Sidebar` como Client Components
- [ ] `MarkdownRenderer` server-side con MDX
- [ ] `DirectoryTree` client con virtualization para repos grandes
- [ ] `repoFlattenerService` como job backend (worker) — salida a storage
- [ ] Endpoints API: POST /repos (enqueue), GET /repos/:owner/:repo/status

Notas de compatibilidad
- Mantener `src/` para referencia y para pruebas hasta que la migración esté completa.
- Evitar cambios destructivos en la configuración del repo (no tocar package.json principal hasta que el scaffold esté verificado).

Siguientes pasos inmediatos
1. Revisar `next-scaffold/` creado en repo y levantar localmente (manual).
2. Validar mapping de componentes (`docs/COMPONENT_MAPPING.md`).
3. Crear branch de migración `migration/nextjs-scaffold`.

---
*Fin del plan de migración*