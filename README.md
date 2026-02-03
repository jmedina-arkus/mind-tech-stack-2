# Admin Web Application

Panel administrativo construido con Vite + React + TypeScript. Usa Tailwind CSS y componentes de Radix/shadcn-ui, React Router, React Query y Supabase para autenticación y datos.

## Stack
- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn-ui (Radix UI)
- React Router (HashRouter)
- React Query
- Supabase (auth y base de datos)

## Requisitos
- Node.js 18+ (recomendado)
- npm o pnpm
- Deno (solo para pruebas de edge functions)

## Configuración
1. Instala dependencias:
   `npm install`
2. Crea un archivo `.env` en la raíz con:
   `VITE_SUPABASE_URL=...`
   `VITE_SUPABASE_ANON_KEY=...`
3. Ejecuta en desarrollo:
   `npm run dev`

## Scripts útiles
- `npm run dev`: servidor de desarrollo (Vite)
- `npm run build`: build de producción
- `npm run build:dev`: build con sourcemaps en modo dev
- `npm run build:map`: build con sourcemaps
- `npm run preview`: previsualizar build
- `npm run lint`: lint de eslint
- `npm run test:edge-functions`: tests de edge functions (requiere Deno)

## Rutas principales
- `#/login`: login (Supabase auth)
- `#/`: dashboard (ruta protegida)
- `#/employees`: gestión de empleados (ruta protegida)
- `#/prompts`: gestión de prompts (ruta protegida)
- `#/settings`: configuración (placeholder)

## Despliegue
El proyecto incluye `vercel.json` para despliegues en Vercel.

## Estructura
- `src/pages`: pantallas principales
- `src/components`: componentes reutilizables
- `src/hooks`: hooks de datos (incluye Supabase)
- `src/config`: configuración (Supabase)
- `supabase/`: migraciones y edge functions
