# Mapeo de Componentes: `src/` -> `src/app` (Next.js)

Este archivo lista los componentes útiles en la base actual (`src/`) y una propuesta de dónde ubicar o cómo migrarlos en la nueva arquitectura Next.js.

Current -> Target

- `src/components/Header.tsx` -> `src/components/layout/NavBar.tsx` (client)
- `src/components/Sidebar.tsx` -> `src/components/layout/Sidebar.tsx` (client, sheet for mobile)
- `src/components/Content.tsx` -> `src/components/features/WikiContent.tsx` (server+client hybrid)
- `src/components/DirectoryTree.tsx` -> `src/components/features/DirectoryTree.tsx` (client, virtualization)
- `src/components/CodeViewer.tsx` -> `src/components/features/CodeViewer.tsx` (client)
- `src/components/AutoScrollToggle.tsx` -> `src/components/ui/AutoScrollToggle.tsx` (client)

Servicios
- `src/services/appStateService.tsx` -> `src/services/client/appState.tsx` (or zustand)
- `src/services/repoFlattenerService.ts` -> `backend/workers/repoFlattener` (mover a worker / serverless)
- `src/services/searchService.ts` -> `src/services/searchService.ts` (mismo código, exportar util)
- `src/services/incrementalRenderingService.ts` -> `src/utils/incrementalRendering.ts`

Sugerencias de migración
- Extraer hooks (`useAppState`, `useSearch`) alrededor de `appStateService`.
- Mantener la lógica de parsing en `repoFlattenerService` y convertir en worker en el backend.
- Reutilizar CSS actual como punto de partida para Tailwind tokens.

Notas
- Objetivo: migración incremental, componente a componente.
- Priorizar primitives UI y MarkdownRenderer.
