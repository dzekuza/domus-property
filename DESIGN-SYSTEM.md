# Domus Design System

> Reference guide for building UI consistent with the Domus owner portal and admin dashboard. All tokens are defined in `tokens.css`. All measurements in `px` unless stated otherwise.

---

## 1. Brand Identity

**Product name:** Domus  
**Tagline:** Viena platforma. Visas nekilnojamojo turto valdymas.  
**Tone:** Professional, clean, Lithuanian-first. No illustrations, no emoji, no decorative color outside the defined palette.

---

## 2. Color Palette

### Base

| Token | Hex | Usage |
|---|---|---|
| `--color-midnight-ink` | `#202020` | Primary text, secondary buttons, sidebar logo |
| `--color-cloud-canvas` | `#f5f5f5` | Page background, flat cards, hover states, filled inputs |
| `--color-paper-white` | `#ffffff` | Card backgrounds, input backgrounds |
| `--color-muted-ash` | `#333333` | Secondary text, nav items (default) |
| `--color-muted-ash-2` | `#666666` | Meta text, table headers, captions |
| `--color-ghost-border` | `#ececec` | All borders — cards, inputs, dividers, table rows |

### Brand

| Token | Hex | Usage |
|---|---|---|
| `--color-electric-violet` | `#5757f8` | Primary buttons, active nav, active tab underline, progress bars, focus rings |
| `--color-violet-tint` | `#f0f0fe` | Active nav item background |
| `--color-violet-tint-2` | `#e6e6fd` | Admin reply message background |

### Semantic

| Token | Hex | Usage |
|---|---|---|
| `--color-success` | `#1f8a5b` | "Atlikta" status pill text |
| `--color-success-tint` | `#e8f5ee` | "Atlikta" status pill background |
| `--color-warning` | `#c47a00` | "Laukiama" pill text, warning banners |
| `--color-warning-tint` | `#fdf3df` | Warning pill / banner background |
| `--color-danger` | `#c43030` | "Atmesta" pill text, destructive actions |
| `--color-danger-tint` | `#fbe9e9` | Danger pill background |

### Sidebar (updated UI)

The sidebar uses a **dark teal** background — not a token from `tokens.css`. Apply it directly:

| Element | Value |
|---|---|
| Sidebar background | `#1a3a3a` (dark teal) |
| Sidebar text (default) | `rgba(255,255,255,0.65)` |
| Sidebar text (active/hover) | `#ffffff` |
| Sidebar active nav bg | `rgba(255,255,255,0.12)` |
| Sidebar role chip bg | `rgba(255,255,255,0.15)` |
| Sidebar role chip text | `#ffffff` |
| Sidebar divider / border | `rgba(255,255,255,0.08)` |
| Sidebar bottom user card bg | transparent |

> The dark sidebar is an **owner portal** treatment. The admin dashboard may use a lighter sidebar — confirm per portal.

---

## 3. Typography

### Fonts

| Role | Family | Weight | Import |
|---|---|---|---|
| Display / headings | Montserrat | 500 | `next/font` or Google Fonts |
| Body / UI | Inter | 500 | `next/font` or Google Fonts |

**All text defaults to `font-weight: 500`.** Never use 400 in UI — lighter weights feel off-brand.

### Scale

| Class | Size | Line-height | Letter-spacing | Font | Usage |
|---|---|---|---|---|---|
| `.h-display` | 36px | 1.0 | −0.72px | Montserrat | Hero headings |
| `.h-page` | 26px | 1.2 | −0.52px | Montserrat | Page titles (`<PageHeader>`) |
| `.h-section` | 20px | 1.43 | — | Montserrat | Card titles, section headers |
| `.t-body` | 14px | 1.4 | — | Inter | Paragraph text, descriptions |
| `.t-meta` | 13px | — | — | Inter | Secondary labels, subtitles |
| `.t-caption` | 12px | 1.2 | +0.04em | Inter | Table headers, eyebrows (uppercase) |

---

## 4. Spacing

Base unit: **4px**. All spacing is a multiple of 4.

| Token | Value | Common usage |
|---|---|---|
| `--spacing-4` | 4px | Icon gaps, tight internal padding |
| `--spacing-8` | 8px | Button icon gap, small gaps |
| `--spacing-16` | 16px | Card inner padding (tight), table cell padding |
| `--spacing-20` | 20px | Default card padding |
| `--spacing-24` | 24px | Page top padding, section gaps |
| `--spacing-32` | 32px | Page horizontal padding |
| `--spacing-40` | 40px | Between sections |
| `--spacing-48` | 48px | Large section gaps |

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-default` | 8px | Cards, nav items, small chips |
| `--radius-input` | 10px | Inputs, textareas, selects |
| `--radius-image` | 12px | Property photos, thumbnails |
| `--radius-pill` | 1425.6px | All buttons, status pills — fully rounded |

> **Rule:** Every interactive element (button, pill) uses `--radius-pill`. No square corners on anything clickable.

---

## 6. Components

### 6.1 Buttons

#### Primary
```css
background: var(--color-electric-violet);
color: var(--color-paper-white);
border-radius: var(--radius-pill);
padding: 10px 20px;
font-size: 14px;
font-weight: 500;
gap: 8px;
```
Hover: `filter: brightness(1.08)`

#### Secondary
Same as primary but `background: var(--color-midnight-ink)`.

#### Ghost
```css
background: transparent;
border: 1px solid var(--color-ghost-border);
border-radius: var(--radius-pill);
padding: 8px 16px;
font-size: 13px;
```
Hover: `background: var(--color-cloud-canvas)`

> Never use colored ghost buttons. Ghost = neutral only.

---

### 6.2 Cards

#### Default card
```css
background: var(--color-paper-white);
border: 1px solid var(--color-ghost-border);
border-radius: var(--radius-default);
padding: 20px;
/* No box-shadow */
```

#### Flat card
```css
background: var(--color-cloud-canvas);
border-radius: var(--radius-default);
padding: 20px;
```

#### Hero card (owner portal — Pirkimo eiga)
```css
background: #1a3a3a; /* dark teal, matches sidebar */
border-radius: 16px;
padding: 32px;
color: #ffffff;
```
Contains: property thumbnail (left, `border-radius: 12px`) + unit name (Montserrat 26px white) + progress bar (Electric Violet fill on white/10% track).

---

### 6.3 Status Pills

```css
display: inline-flex;
align-items: center;
gap: 6px;
padding: 4px 10px;
border-radius: var(--radius-pill);
font-size: 12px;
font-weight: 500;
```

| Variant | Class | Background | Text color |
|---|---|---|---|
| Completed | `.pill-success` | `#e8f5ee` | `#1f8a5b` |
| In progress | `.pill-violet` | `#f0f0fe` | `#5757f8` |
| Pending | `.pill-warning` | `#fdf3df` | `#c47a00` |
| Rejected | `.pill-danger` | `#fbe9e9` | `#c43030` |
| Neutral | `.pill-neutral` | `#f5f5f5` | `#333333` |

Pills optionally include a leading icon (16px Lucide, `currentColor`).

---

### 6.4 Inputs

```css
background: var(--color-paper-white);
border: 1px solid var(--color-ghost-border);
border-radius: var(--radius-input);
padding: 12px 16px;
font-size: 14px;
font-weight: 500;
```
Focus: `border-color: var(--color-electric-violet)`  
Filled variant (pre-populated/read-only): `background: var(--color-cloud-canvas)`  
Disabled: `color: var(--color-muted-ash-2)` + lock icon pill inline

---

### 6.5 Sidebar Navigation

**Sidebar width:** 260px  
**Sidebar background:** `#1a3a3a`

#### Structure (top to bottom)
1. Logo + role chip (`SAVININKAS` / `ADMIN`) — 24px padding
2. Section eyebrow label — 12px uppercase, `rgba(255,255,255,0.4)`
3. Nav items
4. Spacer (flex-grow)
5. "Pagalba" link
6. User card (avatar + name + email)

#### Nav item
```css
min-height: 44px;
padding: 12px 16px;
border-radius: 8px;
gap: 14px;           /* icon → label */
font-size: 14px;
font-weight: 500;
color: rgba(255,255,255,0.65);
transition: background .12s, color .12s;
```
Hover: `background: rgba(255,255,255,0.08); color: #ffffff`  
Active: `background: rgba(255,255,255,0.12); color: #ffffff`  
Active icon: inherits white via `currentColor`

#### Role chip
```css
background: rgba(255,255,255,0.15);
color: #ffffff;
border-radius: var(--radius-pill);
padding: 3px 10px;
font-size: 11px;
letter-spacing: 0.06em;
text-transform: uppercase;
```

---

### 6.6 Accordion (Purchase Steps)

Each step row:
- **Closed:** step number circle (or green check if done) + title + subtitle + status pill + chevron-down
- **Open:** expands to show document list or upload zone; only one step open at a time
- Step circle: 32px, `border: 2px solid var(--color-ghost-border)`, `border-radius: 50%`
- Done step circle: `background: var(--color-success)`, white check icon inside
- Active step number: `color: var(--color-electric-violet)`, violet border

---

### 6.7 Tables

```css
/* Header cell */
font-size: 12px;
text-transform: uppercase;
letter-spacing: 0.04em;
color: var(--color-muted-ash-2);
padding: 12px 16px;
border-bottom: 1px solid var(--color-ghost-border);

/* Data cell */
padding: 16px;
font-size: 14px;
border-bottom: 1px solid var(--color-ghost-border);
```
Last row: no bottom border.  
Hoverable rows: `background: var(--color-cloud-canvas)` on hover, `cursor: pointer`.

---

### 6.8 Tabs

```css
/* Tab bar */
border-bottom: 1px solid var(--color-ghost-border);

/* Tab item */
padding: 12px 16px;
font-size: 14px;
font-weight: 500;
color: var(--color-muted-ash-2);
border-bottom: 2px solid transparent;
margin-bottom: -1px;
```
Active tab: `color: var(--color-midnight-ink)`, `border-bottom-color: var(--color-electric-violet)`

---

### 6.9 Progress Bar

Used in hero card and purchase journey:
```css
height: 6px;
border-radius: var(--radius-pill);
background: rgba(255,255,255,0.15); /* track — on dark bg */
/* fill */
background: var(--color-electric-violet);
border-radius: var(--radius-pill);
```
On light background: track = `var(--color-ghost-border)`, fill = `var(--color-electric-violet)`.

---

### 6.10 Switch

```css
width: 40px; height: 22px;
border-radius: var(--radius-pill);
/* Off */
background: var(--color-cloud-canvas);
border: 1px solid var(--color-ghost-border);
/* On */
background: var(--color-electric-violet);
/* Thumb */
width: 16px; height: 16px;
border-radius: 50%;
background: #ffffff;
```

---

## 7. Icons

Library: **Lucide React** — outline only, `1.5px` stroke, `currentColor`.  
Default size: **20px** in nav, **16px** inline in text/pills, **24px** in standalone icon slots.

| Context | Icon |
|---|---|
| Home / Pagrindinis | `home` |
| Defektai | `alert-triangle` |
| Nuotraukos | `image` |
| Paslaugų sutartys | `file-text` |
| Kontaktai | `contact` |
| Tvarkaraštis | `calendar` |
| Bendruomenė | `message-square` |
| Nustatymai | `settings` |
| Atsijungti | `log-out` |
| Estates | `building-2` |
| Search | `search` |
| Add | `plus` |
| Chevron | `chevron-down` / `chevron-right` |
| Done check | `check` |
| Close | `x` |
| Upload | `upload-cloud` |
| Download | `download` |
| Attach | `paperclip` |
| Send | `send` |
| Electric | `zap` |
| Water | `droplet` |
| Heat | `flame` |
| Waste | `trash-2` |
| Lock | `lock` |
| Edit | `pencil` |
| Help | `help-circle` |

---

## 8. Layout

### Page layout
```
┌──────────────────────────────────────────┐
│  Sidebar 260px  │  Main area             │
│  bg: #1a3a3a    │  bg: #f5f5f5           │
│                 │  max-width: 1320px      │
│                 │  padding: 24px 32px     │
└──────────────────────────────────────────┘
```

No top navigation bar. Page title lives in `<PageHeader>` at the top of the main area.

### PageHeader
```
[Breadcrumbs]
[Page title — h-page]  [Actions — buttons, right aligned]
[Subtitle — t-meta]
```

### Content max-width
- Full-page table/content: `max-width: 1320px`  
- Narrow forms (settings): `max-width: 640px`

### Column grids
- 2-column: `gap: 24px`  
- 4-column photo grid: `gap: 12px`, aspect ratio `4/3` per tile  

---

## 9. Motion

Keep motion minimal and fast.

| Element | Animation |
|---|---|
| Hover state | `background .12s, color .12s` — no scale, no shadow pulse |
| Modal open | `opacity 0→1` + `translateY(4px→0)` over `200ms ease-out` |
| Accordion open | Instant height; children fade in with `.fade-in` class |
| Toast / success pill | Auto-dismiss after `3000ms` |

```css
@keyframes domus-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: none; }
}
.fade-in { animation: domus-fade-in .2s ease-out; }
```

---

## 10. Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Use Electric Violet for primary actions only | Use violet for decorative color or borders |
| Keep all buttons pill-shaped | Use `border-radius: 8px` on buttons |
| Use 500 weight for all UI text | Use 400 (regular) weight anywhere |
| Use Lucide outline icons at 1.5px stroke | Mix icon libraries or use filled icons |
| Use `--color-ghost-border` for all borders | Use custom border colors |
| Show empty states for every empty list | Show blank space with no context |
| One open accordion item at a time | Allow multiple steps expanded simultaneously |
| Dark teal sidebar for owner portal | Use white/light sidebar in owner portal |
| Semantic status pills only (success/warning/danger/violet) | Create custom one-off pill colors |

---

## 11. Files

| File | Purpose |
|---|---|
| `tokens.css` | All CSS custom properties — source of truth for colors, type, spacing, radius |
| `DESIGN-SYSTEM.md` | This document — component rules and usage guidance |
| `components/ui/` | shadcn-restyled primitives: Button, Card, Input, Pill, Tabs, Modal, etc. |
| `styles/globals.css` | Tailwind base + token imports |
