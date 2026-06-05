# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (Next.js 16, port 3000)
npm run build    # production build — must pass before committing
npm run start    # serve production build
```

There are no lint or test scripts configured. TypeScript type-checking is implicit in the build.

## Architecture

**Domus / Miteda** — a Next.js 16 App Router property management SaaS. All state lives in a single Zustand store with `persist` middleware (localStorage). No backend database — data is seeded from `src/lib/seed.ts` and mutated in-memory.

### Routing & roles

Four roles exist: `owner`, `admin`, `work_manager`, `worker`. Each maps to a route segment:

| Role | Segment |
|------|---------|
| `owner` | `/portal/*` |
| `admin` | `/admin/*` |
| `work_manager` | `/manager` |
| `worker` | `/worker` |

The `Sidebar` component derives its nav links from `session.role` in the store. `AppLayout` hides the sidebar entirely for `work_manager` / `worker`. Role-gating in pages uses `RoleGuard`.

### Data layer

- `src/lib/types.ts` — all TypeScript interfaces
- `src/lib/store.ts` — Zustand store; all mutations live here; includes `effectiveUser()` for impersonation
- `src/lib/seed.ts` — initial dataset injected into the store
- `src/app/api/` — Next.js Route Handlers (OpenAI-based: AI summary, voice transcription, bill analysis)

### Layout stack

```
RootLayout (layout.tsx)
  <BackgroundShader />          ← @paper-design/shaders-react animated mesh gradient
  <AppLayout>                   ← sticky collapsible glass sidebar + .app-wrapper/.app-main
    <PageShell> OR              ← unified glass card: header row + body in one card
    <Card> + <PageHeader>       ← separate header / card (older pattern; still used)
      {page content}
```

`AppLayout` uses CSS classes `.app-wrapper`, `.app-sidebar`, `.app-main` defined in `globals.css` for responsive behaviour (mobile: fixed overlay sidebar + `.mobile-topbar`).

### Glass design system

The entire UI uses a **dark iOS 26-style liquid glass** theme over an animated shader background.

**Core class: `.glass`** (`globals.css:179`)
- `backdrop-filter: blur(28px) saturate(180%)` applied **directly** (no `::before` pseudo-element)
- `background: rgba(22, 24, 30, 0.55)`
- **CRITICAL**: do NOT write `-webkit-backdrop-filter` alongside `backdrop-filter` — Lightning CSS (Tailwind v4 bundler) silently drops both when it sees the manual webkit pair. It auto-prefixes correctly on its own.
- Redefines `--color-midnight-ink`, `--color-muted-ash*`, `--color-ghost-border`, `--foreground`, `--muted-foreground` to light values inside its scope. Every descendant using these tokens automatically renders as light text on dark glass without per-component overrides.

**Variant: `.glass-strong`** (`globals.css:200`) — darker `rgba(18,20,26,0.68)`, used for modals/overlays.

**Sidebar glass** — uses `--glass-sidebar-bg` (`rgba(22,24,30,0.60)`) and `--glass-sidebar-blur` tokens, applied as inline styles on `<aside>` because sidebar width is dynamic.

**Component hierarchy**:
- `GlassCard` (`src/components/shared/GlassCard.tsx`) — RSC-safe, renders `.glass` div with configurable padding/radius
- `Card` (`src/components/shared/Card.tsx`) — wraps `GlassCard`; `flat` prop renders a simpler non-blur variant
- `PageShell` (`src/components/layout/PageShell.tsx`) — single glass card containing a `PageHeader` + body; used on migrated admin pages
- `PageHeader` (`src/components/layout/PageHeader.tsx`) — standalone header row (older pattern; still used by un-migrated pages)

**shadcn overrides** — all shadcn components (`[data-slot="input"]`, `[data-slot="select-trigger"]`, `[data-slot="dialog-content"]`, etc.) are globally styled in `globals.css` to match the dark glass palette. Do not add per-component light backgrounds.

**Opaque surfaces break the glass effect.** When adding content inside `.glass` cards:
- Replace any `background: var(--color-*)` that resolves to an opaque value with `rgba(255,255,255,0.07)` or similar translucent values
- Replace opaque borders with `rgba(255,255,255,0.12)`
- Keep table headers/cells transparent or translucent

### Design tokens (key ones)

```css
--color-accent: #76c03d          /* lime green — CTA, active nav, focus rings */
--color-cta: #ff601b             /* orange — destructive / primary actions */
--glass-sidebar-bg: rgba(22,24,30,0.60)
--glass-sidebar-blur: blur(32px) saturate(180%)
--radius-card: 20px
--radius-pill: 1000px
--font-display: Tomato Grotesk   /* headings */
--font-text: Inter               /* body */
```

### CSS utilities

- `.domus-table` — transparent table for glass contexts; `.glass .domus-table` overrides enforce light text
- `.hide-scrollbar` — removes scrollbar on filter-pill rows
- `.home-grid` / `.darbai-grid` — two-column grids that collapse to 1-col at 1100px
- `.nav-item` — sidebar nav link; `.active` applies green highlight via `--color-sidebar-fg-active`
- `.t-icon-swap` / `.t-panel-slide` — transitions-dev animation primitives
- `.fade-in` — `domus-fade-in` keyframe (fade + translateY)

### Fonts

Two font families loaded in `RootLayout` via `next/font`:
- `--font-display`: Tomato Grotesk (local `.otf` files in `src/app/fonts/`)
- `--font-text`: Inter (Google Fonts)

### Background

`BackgroundShader` (`src/components/ui/background-shader.tsx`) renders a full-screen fixed `@paper-design/shaders-react` `MeshGradient` behind all content. Body has `background: #0c1830` as fallback.

## Conventions

- **Client components**: mark `'use client'` only when hooks or browser APIs are needed; `GlassCard` and most layout primitives are RSC-safe
- **Inline styles vs CSS classes**: sidebar uses inline styles (dynamic width); page content uses `globals.css` classes + Tailwind utilities
- **No light-mode surfaces inside glass cards** — everything inside `.glass` must use translucent rgba values, never opaque CSS variable references that resolve to light colours
- **shadcn components** are configured via `components.json`; add new ones with `npx shadcn add <component>`
