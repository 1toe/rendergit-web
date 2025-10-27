# DirHub — Especificación Frontend (Plataforma SaaS)

Este documento reúne la especificación completa del frontend de DirHub: una plataforma SaaS para generar documentación wiki automática de repositorios de GitHub usando análisis con IA.

ÍNDICE GENERAL
1. Visión y Propósito del Sistema
2. Arquitectura Frontend Completa
3. Stack Tecnológico Frontend
4. Estructura de Componentes y Páginas
5. Sistema de Navegación
6. Componentes de Visualización
7. Sistema de Estilos y Diseño
8. Gestión de Estado
9. Renderizado de Contenido
10. Interacciones y Flujos de Usuario
11. Diseño Responsivo
12. Optimizaciones de Performance
13. Accesibilidad
14. Internacionalización
15. Diagramas Mermaid Completos

---

## 1. VISIÓN Y PROPÓSITO DEL SISTEMA

1.1 Descripción General

DirHub es una aplicación web que permite a desarrolladores y equipos generar automáticamente documentación wiki para cualquier repositorio de GitHub. La plataforma analiza el código fuente usando modelos de IA y presenta la información de forma estructurada, navegable e interactiva.

1.2 Objetivos del Frontend

- Interfaz intuitiva para buscar y agregar repositorios
- Visualizar documentación generada claramente
- Navegación fluida entre secciones
- Experiencia responsiva
- Rendimiento y tiempos de carga rápidos
- Accesibilidad (A11y)

1.3 Usuarios Objetivo

- Desarrolladores
- Equipos técnicos
- Estudiantes
- Arquitectos de software

1.4 Casos de Uso Principales

- Búsqueda de repositorio
- Visualización de wiki
- Gestión de repositorios y cola de procesamiento

---

## 2. ARQUITECTURA FRONTEND COMPLETA

Ver `docs/diagrams.md` para diagramas Mermaid completos. Resumen:

- Framework: Next.js con App Router (Server & Client Components)
- Renderizado híbrido: RSC + Client components cuando es necesario
- Capa de servicios del frontend: data fetching, state management, routing, error handling
- Componentización por dominio: layout, pages, feature components, ui primitives

---

## 3. STACK TECNOLÓGICO FRONTEND

- Next.js 15.x (App Router)
- TypeScript 5.x
- Tailwind CSS (JIT)
- Radix UI (primitivas accesibles)
- Lucide React (iconos)
- next-mdx-remote o @next/mdx para renderizado MDX
- clsx, tailwind-merge, CVA
- React Query o SWR (opcional) para caching/fetching
- Jest + React Testing Library para tests

---

## 4. ESTRUCTURA DE COMPONENTES Y PÁGINAS

Estructura propuesta (src/app Next.js):

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── repositories/
│   │   └── page.tsx
│   ├── add/
│   │   └── page.tsx
│   ├── queue/
│   │   └── page.tsx
│   └── [owner]/[repo]/
│       └── page.tsx
│
├── components/
│   ├── layout/
│   ├── features/
│   └── ui/
│
├── services/
└── styles/
```

Cada componente debe tener su contrato de props, tests y variantes (CVA) cuando aplique.

---

## 5. SISTEMA DE NAVEGACIÓN

- App Router de Next.js para páginas principales
- Menú lateral (Sheet para mobile)
- Breadcrumbs contextuales por repo/carpeta/archivo
- URL-state (search params) para filtros, vista y línea seleccionada

---

## 6. COMPONENTES DE VISUALIZACIÓN

- MarkdownRenderer: MDX + componentes embebidos
- CollapsibleHeader: secciones expandibles
- CodeBlock: resaltado + copy to clipboard + open on GitHub
- DirectoryTree: lazy rendering de nodos
- RepoCard, QueueMonitor, ProcessingItem

---

## 7. SISTEMA DE ESTILOS Y DISEÑO

- Tailwind configurado con tokens de diseño en `tailwind.config.ts`
- Tema claro/oscuro controlado por CSS variables y `class="dark"`
- Componentes Radix para accesibilidad
- Tokens: spacing, radii, colors, semantic tokens (success, warning)

---

## 8. GESTIÓN DE ESTADO

- Server-state: Next.js Server Components + caching (fetch with cache)
- Client-state: React Context ligero para UI (tema, nav) y zustand para estado complejo opcional
- URL state para seleccionados y filtros

---

## 9. RENDERIZADO DE CONTENIDO

- Server: Serialización inicial de MDX para SEO y performance
- Incremental rendering en cliente: batch de archivos (8 por carga)
- Suspense + streaming para experiencias progresivas

---

## 10. INTERACCIONES Y FLUJOS DE USUARIO

- Añadir repo → validación → encolar → procesamiento (API backend)
- Visualizar wiki → cargar TOC → lazy-load de archivos
- Buscar → debounced input → mostrar resultados con contexto y jump-to-line

---

## 11. DISEÑO RESPONSIVO

- Mobile-first breakpoints: sm, md, lg, xl
- Sidebar como sheet en mobile
- Layout adaptable: grid en escritorio, stacked en mobile

---

## 12. OPTIMIZACIONES DE PERFORMANCE

- Caching (ISR / revalidation) en endpoints
- Image optimization si aplica
- Code-splitting por página
- Deboundes y throttling para búsqueda
- Web Workers para parsing pesado (opcional)

---

## 13. ACCESIBILIDAD

- Uso de Radix y ARIA attributes
- Keyboard navigation en árbol de directorios
- Contrast ratios verificadas
- Tests de accesibilidad automatizados (axe)

---

## 14. INTERNACIONALIZACIÓN

- i18n con `next-intl` o `react-intl`
- Mensajes en JSON por locale
- Detectar preferencia del navegador y override por usuario

---

## 15. DIAGRAMAS MERMAID COMPLETOS

Ver `docs/diagrams.md` para representaciones Mermaid.

---

## Entregables inmediatos

- Documentación técnica en `docs/` (este repo)
- Scaffolding de Next.js en `next-scaffold/` como punto de partida
- Plan de migración y mapeo de componentes

---

## Notas de diseño y decisiones

- Mantener código actual en `src/` para preservar historial y componentes reutilizables.
- Migración incremental por paquetes de componentes y servicios: 1) rutas y layout, 2) servicios, 3) components UI, 4) pages features.

---

*Fin de la especificación inicial.*
