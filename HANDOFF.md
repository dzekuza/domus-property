# Domus — Property Owner & Developer Dashboards

> Handoff spec for building the production app. **No database** — all state in-memory + `localStorage` persistence, seed data baked in. Hot-swappable for a real backend later.

---

## 1. Product overview

Two portals sharing one design system:

| Portal | Audience | Routes |
|---|---|---|
| **Owner Portal** | Buyers of new-build apartments | `/portal/*` |
| **Admin Dashboard** | Developer / property-management staff | `/admin/*` |

Auth is **role-based** (`owner` vs `admin`). For the no-DB build, the role is picked at login and stored in a cookie / `localStorage` key. Each owner is associated with **one unit**; admins see everything.

Lithuanian copy throughout. Light theme. Single accent color (Electric Violet `#5757f8`).

---

## 2. Tech stack (recommended)

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4** with the tokens in §6 wired through `@theme`
- **shadcn/ui** primitives for Dialog, Tabs, Select, Switch, DropdownMenu (restyled to match the spec)
- **Lucide React** icons (outline, 1.5px stroke, monochrome)
- **Zustand** for the in-memory store (§4)
- **react-hook-form** + **zod** for forms
- Fonts: **Montserrat** (display) + **Inter** (text) via `next/font`

No server actions, no DB driver, no API routes. All "writes" mutate the Zustand store; persistence layer = `zustand/middleware/persist` against `localStorage`.

---

## 3. Routes

### Owner Portal `/portal/*`
| Route | Title (LT) | Screen |
|---|---|---|
| `/portal/pagrindinis` | Pagrindinis | Purchase journey — 8-step accordion |
| `/portal/defektai` | Defektai | Defect threads + new-defect modal |
| `/portal/nuotraukos` | Nuotraukos | Sectioned photo gallery + lightbox |
| `/portal/sutartys` | Paslaugų sutartys | 4 utility service cards + warning banner |
| `/portal/kontaktai` | Kontaktai | Specialist contact cards |
| `/portal/nustatymai` | Nustatymai | Account settings |

### Admin Dashboard `/admin/*`
| Route | Screen |
|---|---|
| `/admin/estates` | Estates list (table) → row click opens detail |
| `/admin/estates/[id]` | Estate detail (Tabs: Butai · Nuotraukos · Kontaktai) |
| `/admin/estates/[id]/units/[unitId]` | Unit editor (Tabs: Techninė · Dokumentai · Nuotraukos · Paslaugos · Savininko eiga) |
| `/admin/defects` | All defects (filterable table) |
| `/admin/defects/[id]` | Defect thread (full conversation) |
| `/admin/contacts` | Global contacts library |

### Shared
- `/login` — single email/password form, role chosen via tab. On submit, write `{ role, userId }` to the store.
- `/logout` — clears the store.

---

## 4. Data layer (no DB)

Everything lives in a single Zustand store. Seed it on first load from `lib/seed.ts`. Persist to `localStorage` under `domus.store.v1`.

### 4.1 Types — `lib/types.ts`

```ts
export type Role = 'owner' | 'admin';

export interface User {
  id: string;
  role: Role;
  fullName: string;
  email: string;
  phone?: string;
  unitId?: string; // owners only
  avatarBg?: string;
}

export interface Estate {
  id: string;
  name: string;          // "Kalnų Terasos"
  address: string;       // "Vilniaus g. 24, Vilnius"
  status: 'Pardavimas' | 'Statoma' | 'Baigta';
  coverPhotoUrl: string;
  unitCount: number;
  contactIds: string[];
  photoUrls: string[];   // estate-level gallery
  createdAt: string;     // ISO
}

export interface Unit {
  id: string;
  estateId: string;
  number: string;        // "B-12"
  floor: number;
  block: string;         // "B"
  totalAreaM2: number;
  usableAreaM2: number;
  rooms: number;
  notes?: string;
  ownerUserId?: string;  // null = unassigned
  status: 'available' | 'reserved' | 'sold';
  photoUrls: string[];
  // service contracts
  services: { id: ServiceKind; status: 'pending' | 'progress' | 'done'; date?: string }[];
  // which purchase steps are visible to the owner
  visibleSteps: Record<PurchaseStepId, boolean>;
  // documents per step
  documents: Record<PurchaseStepId, DocumentFile[]>;
}

export type PurchaseStepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type StepStatus = 'not_started' | 'pending' | 'progress' | 'done';

export interface PurchaseStep {
  id: PurchaseStepId;
  title: string;        // "Notarinė sutartis"
  subtitle: string;     // "Pasirašyta 2025-01-20"
  status: StepStatus;
  allowOwnerUpload: boolean;
}

export interface DocumentFile {
  id: string;
  name: string;         // "Notarine_sutartis.pdf"
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;   // userId
  // For the no-DB build, store the blob as a data: URL in IndexedDB,
  // or skip and just hold metadata + a /mock/files/{name} path.
  url: string;
}

export type ServiceKind = 'elec' | 'water' | 'heat' | 'waste';

export interface ServiceContract {
  kind: ServiceKind;
  name: string;
  provider: string;
  status: 'pending' | 'progress' | 'done';
  activationDate?: string;
  documentId?: string;
}

export type DefectStatus = 'open' | 'progress' | 'resolved' | 'rejected';

export interface Defect {
  id: string;              // "D-204"
  unitId: string;
  estateId: string;
  ownerUserId: string;
  title: string;
  room: 'Vonia' | 'Virtuvė' | 'Svetainė' | 'Miegamasis' | 'Koridorius' | 'Balkonas' | 'Kita';
  status: DefectStatus;
  createdAt: string;
  assignedContactId?: string;
  messages: DefectMessage[];
}

export interface DefectMessage {
  id: string;
  authorUserId: string;
  body: string;
  createdAt: string;
  attachments: { id: string; url: string; thumbUrl?: string }[];
}

export interface Contact {
  id: string;
  category: 'Langai ir durys' | 'Šildymas' | 'Vandentiekis' | 'Elektra' | 'Internetas' | 'Bendrosios patalpos' | 'Kita';
  fullName: string;
  org: string;
  phone: string;
  email: string;
  documents: DocumentFile[];
}

export interface PhotoSection {
  id: string;
  unitId: string;        // or estateId
  title: string;         // "Bendras vaizdas"
  date: string;
  photoUrls: string[];
}
```

### 4.2 Store — `lib/store.ts`

```ts
// Single Zustand store with everything. Persisted to localStorage.
// One "active session" slice at the top, then collections.

interface DomusStore {
  session: { userId: string | null; role: Role | null };
  users: User[];
  estates: Estate[];
  units: Unit[];
  defects: Defect[];
  contacts: Contact[];
  photoSections: PhotoSection[];

  // selectors
  currentUser: () => User | null;
  unitOf: (userId: string) => Unit | null;
  defectsForUnit: (unitId: string) => Defect[];

  // mutations (all sync — no awaits, no errors)
  signIn: (email: string, password: string, role: Role) => boolean;
  signOut: () => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  createEstate: (input: Omit<Estate, 'id' | 'createdAt'>) => Estate;
  createUnit: (input: Omit<Unit, 'id'>) => Unit;
  uploadDocument: (unitId: string, stepId: PurchaseStepId, file: File) => DocumentFile;
  toggleStepVisibility: (unitId: string, stepId: PurchaseStepId, on: boolean) => void;
  inviteOwner: (unitId: string, email: string) => void;
  submitDefect: (input: { unitId: string; title: string; room: Defect['room']; body: string; files: File[] }) => Defect;
  replyToDefect: (defectId: string, body: string, files: File[]) => void;
  setDefectStatus: (defectId: string, status: DefectStatus) => void;
  deleteDefect: (id: string) => void;
  upsertContact: (input: Omit<Contact, 'id'> | Contact) => Contact;
  deleteContact: (id: string) => void;
  setServiceContractStatus: (unitId: string, kind: ServiceKind, status: ServiceContract['status']) => void;
}
```

**File handling without a DB:** convert uploads to `data:` URLs and store as strings on the document/attachment. Cap at ~3 MB per file with a friendly toast; warn that this is a demo store. Real implementation will swap to object storage.

### 4.3 Seed data — `lib/seed.ts`

Use the lists below to populate the store on first run. Names, IDs, photos, statuses are illustrative — feel free to multiply.

**Estates** (6): Kalnų Terasos, Pajūrio Namai, Švyturys, Auksakalniai Loftai, Baltijos Vartai, Pušyno Slėnis.

**Units** (~8 per estate, with one "demo owner" unit B-12 at Kalnų Terasos owned by `andrius@mail.lt`).

**Purchase steps** (constant — same 8 for every unit; per-unit visibility + per-step documents):
1. Preliminari sutartis
2. Notarinė sutartis
3. Registrų centro išrašas
4. Mokėjimo kvitas
5. Buto priėmimo-perdavimo aktas *(allowOwnerUpload: true — owner signs & uploads PDF)*
6. Raktų perdavimas
7. Komunalinių paslaugų aktyvavimas
8. Galutinė apžiūra

**Service contracts** (constant — same 4 per unit):
- `elec` — ESO
- `water` — Vilniaus vandenys
- `heat` — Vilniaus šilumos tinklai
- `waste` — Ecoservice

**Defects** (~7 across estates, mix of `open`, `progress`, `resolved`).

**Contacts** (~9 across all categories — Langai, Šildymas, Vandentiekis, Elektra, Internetas, Bendrosios patalpos).

**Demo accounts:**
- `andrius@mail.lt` / `demo` → role `owner`, owns `kalnu/units/B-12`
- `tomas@domus.lt` / `demo` → role `admin`

---

## 5. Screen specs

### 5.1 Layout

All authed routes share `<AppLayout>` with:
- **Left sidebar** (260px, white, hairline right border) — see §6 for nav lists per role
- **Main area** — Cloud Canvas background, max 1320px wide, 32px horizontal padding, 24px top
- **No top bar** — page title lives in the page header (`<PageHeader title subtitle breadcrumbs actions />`)

The sidebar contains: Domus logo + role chip, section eyebrow ("Mano butas" / "Valdymas"), nav items (44px min-height, 12/16 padding, 6px gap, icon + label), spacer, "Pagalba" link, and a user card (avatar + name + email).

### 5.2 Owner · Pagrindinis (`/portal/pagrindinis`)

Header: **"Pirkimo eiga"** + subtitle.

Top: **hero card** combining a 240px-wide photo of the estate + the unit name + a horizontal progress bar (X / 8 steps done) + planned key-handover date.

Below: **accordion** of all 8 purchase steps:
- Closed state: numbered step circle (or check on done) + title + subtitle + status pill + chevron
- Open state: list of documents (each row: file icon, name, size, "Atsisiųsti" pill button) **OR** empty-state caption "Dokumentai bus paskelbti…"
- If `allowOwnerUpload === true` (step 5): a dashed upload card with "Įkelti" primary button below the docs list
- Only one step open at a time; default open = first step with `status === 'progress'`

Status pill mapping:
- `done` → green pill "Atlikta" w/ check
- `progress` → violet pill "Vykdoma"
- `pending` / `not_started` → neutral pill "Laukiama" / "Nepradėta"

### 5.3 Owner · Defektai (`/portal/defektai`)

Header: **"Defektai"** + "Naujas pranešimas" primary button.

Filter pills row: Visi · Atviri · Vykdomi · Išspręsti (counts).

List of defect cards. Each row collapsed: ID · room · title · "Pateikta {date} · N žinutės" · status pill · chevron. Expanded: photo strip + threaded messages (avatar + name + date + body + attachment count) + reply composer (input + paperclip + "Siųsti" primary).

**New defect modal**: Patalpa select · Trumpas pavadinimas input · Aprašymas textarea · dashed file upload zone (JPG/PNG/MP4, ≤50 MB). Submit → `submitDefect` → modal closes → new card prepended.

### 5.4 Owner · Nuotraukos (`/portal/nuotraukos`)

Header: **"Nuotraukos"** + "Atsisiųsti visas" ghost button (zip on demand).

Sections of grouped photos (e.g. Bendras vaizdas, Virtuvė ir svetainė, Vonia, Miegamieji). Each section: title + meta + "Žiūrėti visas" pill + 4-col grid of 4:3 thumbnails. Click thumbnail → **lightbox** overlay (dim background, X close, arrow keys for next/prev).

### 5.5 Owner · Paslaugų sutartys (`/portal/sutartys`)

Header: **"Paslaugų sutartys"**.

If any `services[].status !== 'done'` after the unit is registered: render a **warning banner** at top — amber tint, alert icon, "N sutartys laukia jūsų veiksmų" + "Pradėti" primary.

2-column grid of 4 service cards. Each: service icon (40-44px tile) + status pill (top row), name + provider, divider, activation date + action ("Pasirašyti" primary if pending, "Sutartis" pill if done).

### 5.6 Owner · Kontaktai (`/portal/kontaktai`)

Header: **"Kontaktai"**.

2-column grid of contact cards. Each: 48px avatar + category eyebrow + name + org + phone + email + optional doc download pill.

Source: contacts assigned to the owner's estate (`estate.contactIds`).

### 5.7 Owner · Nustatymai (`/portal/nustatymai`)

Header: **"Nustatymai"**.

Single 640px column, two cards:

1. **Asmeninė informacija** — Vardas ir pavardė + Telefonas (filled inputs, side by side) + El. paštas (disabled input + "Nekeičiamas" lock pill, helper note "El. pašto pakeitimui susisiekite su Domus pagalba"). "Išsaugoti pakeitimus" primary; on save show inline "Išsaugota" success pill that auto-clears after 3s.
2. **Saugumas** — two list rows (Slaptažodis · Dviejų veiksnių autentifikacija) each with ghost-button action.

### 5.8 Admin · Estates (`/admin/estates`)

Header: **"Objektai"** + search input + "Naujas objektas" primary.

Single card containing a table:

| Objektas | Adresas | Butai | Parduota | Būsena |
|---|---|---|---|---|
| 48px thumb + name + slug | address | count | "{sold}/{total}" + mini progress bar | pill (Statoma · Pardavimas · Baigta) |

Row click → `/admin/estates/[id]`.

**New estate modal**: name + address + unit count + planned completion + cover photo dropzone. Submit → `createEstate` → close + scroll to new row.

### 5.9 Admin · Estate detail (`/admin/estates/[id]`)

Header: **breadcrumbs Objektai › Kalnų Terasos** + estate name + "{addr} · {N} butai · {status}" subtitle + "Redaguoti" ghost + "Naujas butas" primary.

Tabs: **Butai · Nuotraukos · Kontaktai** (counts shown).

- **Butai**: table — Butas · Aukštas · Plotas · Savininkas · Būsena. Row click → unit editor. Status pill: Parduotas / Rezervuotas / Laisvas.
- **Nuotraukos**: 4-col grid, "Įkelti nuotraukas" primary, hover-delete on each tile.
- **Kontaktai**: list of assigned contacts + "Priskirti kontaktą" primary (opens a picker drawn from the global contact library).

### 5.10 Admin · Unit editor (`/admin/estates/[id]/units/[unitId]`)

Header: **breadcrumbs Objektai › Kalnų Terasos › B-12** + unit name + "{floor} aukštas · {area} m² · Savininkas: {name}" + autosave pill + "Peržiūrėti kaip savininkas" primary (impersonate route — opens `/portal/pagrindinis` as that owner in a new tab).

Tabs:

1. **Techninė info** — single card, 3-col form: Buto Nr · Aukštas · Korpusas · Bendras plotas · Naudingas plotas · Kambariai · Pastabos (full row).
2. **Dokumentai** — one card per purchase step (collapsed list), each with "Įkelti dokumentą" ghost. Inside each card: file rows (icon, name, size, download, trash).
3. **Nuotraukos** — same 4-col grid as estate photos.
4. **Paslaugos** — 2-col grid of 4 service rows, each with icon, name, provider, and a switch.
5. **Savininko eiga** — 2-column split:
   - Left card: list of all 8 purchase steps, each with a Switch (visible to owner yes/no).
   - Right column: "Pakviesti savininką" card (email input + "Siųsti kvietimą" primary) + status card showing last login.

### 5.11 Admin · Defects list (`/admin/defects`)

Header: **"Defektai"** + count subtitle + "Eksportuoti" ghost.

Filter row: estate select + status select + status-count pills (visual summary).

Table: ID · Pranešimas · Objektas/Butas · Savininkas · Data · Būsena · chevron. Row click → `/admin/defects/[id]`.

### 5.12 Admin · Defect thread (`/admin/defects/[id]`)

Header: **breadcrumbs Defektai › D-204** + title + "{estate} · Butas {n} · {owner}" + "Ištrinti" ghost.

2-column layout:

**Left (thread):**
- Original message card: avatar + name + role + date + body + attachment thumbs
- Reply cards: violet-tinted background for admin replies
- Reply composer card: textarea + "Pridėti failą" ghost + "Siųsti atsakymą" primary

**Right (sidebar):**
- **Būsena** card: 4 radio rows (Atviras · Vykdomas · Išspręstas · Atmestas) with colored dots and a check on the active one
- **Detalės** card: ID, Objektas, Butas, Patalpa, Priskirta (with avatar)

### 5.13 Admin · Contacts library (`/admin/contacts`)

Header: **"Kontaktai"** + count + "Naujas kontaktas" primary.

Horizontal scroller of category pills (Visi · Langai · Šildymas · …). Selected pill: black bg.

Table: Specialistas (avatar + name + org) · Kategorija · Telefonas · El. paštas · Dokumentai · edit/delete actions.

---

## 6. Design system

### 6.1 Tokens — CSS custom properties

```css
:root {
  /* Colors */
  --color-midnight-ink: #202020;
  --color-cloud-canvas: #f5f5f5;
  --color-paper-white:  #ffffff;
  --color-muted-ash:    #333333;
  --color-muted-ash-2:  #666666;
  --color-ghost-border: #ececec;
  --color-electric-violet: #5757f8;
  --color-violet-tint:    #f0f0fe;
  --color-violet-tint-2:  #e6e6fd;
  --color-success: #1f8a5b; --color-success-tint: #e8f5ee;
  --color-warning: #c47a00; --color-warning-tint: #fdf3df;
  --color-danger:  #c43030; --color-danger-tint:  #fbe9e9;

  /* Type */
  --font-display: 'Montserrat', system-ui, sans-serif;
  --font-text:    'Inter', system-ui, sans-serif;
  --text-caption: 14px;   --leading-caption: 1.2;
  --text-body:    16px;   --leading-body:    1.4;
  --text-subheading: 18px;
  --text-heading-sm: 20px;
  --text-heading:    26px; --tracking-heading: -0.52px;
  --text-heading-lg: 36px; --tracking-heading-lg: -0.72px;
  --text-display:    48px; --tracking-display: -0.96px;

  /* Spacing — 4px base */
  --spacing-4: 4px; --spacing-8: 8px; --spacing-16: 16px; --spacing-20: 20px;
  --spacing-24: 24px; --spacing-32: 32px; --spacing-40: 40px; --spacing-48: 48px;

  /* Radius */
  --radius-default: 8px; --radius-input: 10px; --radius-image: 12px;
  --radius-pill: 1425.6px;
}
```

### 6.2 Component recipes

| Component | Spec |
|---|---|
| **Primary button** | `bg: --color-electric-violet`, `color: --color-paper-white`, `radius: --radius-pill`, padding `10px 20px`, font `Inter 500 14px`, gap 8px |
| **Secondary button** | same as primary but `bg: --color-midnight-ink` |
| **Ghost button** | transparent bg, `1px solid --color-ghost-border`, `radius: --radius-pill`, padding `8px 16px`, font `Inter 500 13px` |
| **Pill (small chip)** | `bg: --color-cloud-canvas`, `color: --color-midnight-ink`, `radius: --radius-default`, padding `5px 10px`, font 13px |
| **Default card** | `bg: --color-paper-white`, `1px solid --color-ghost-border`, `radius: --radius-default`, padding 20px, no shadow |
| **Flat card** | `bg: --color-cloud-canvas`, `radius: --radius-default`, padding 20px |
| **Input** | `bg: --color-paper-white`, `1px solid --color-ghost-border`, `radius: --radius-input`, padding `12px 16px`, font 14px. `:focus → border --color-electric-violet`. Filled variant: bg `--color-cloud-canvas` |
| **Status pill** | radius full, padding `4px 10px`, font 12px/500. Variants: success / warning / danger / violet / neutral — all using tinted bg + matching fg |
| **Nav item (sidebar)** | min-height 44px, padding `12px 16px`, radius 8px, gap 14px (icon→label), font 14px/500. Hover: bg `--color-cloud-canvas`. Active: bg `--color-violet-tint`, color + icon `--color-electric-violet` |
| **Tab** | padding `12px 16px`, font 14px/500, 2px bottom border. Active: border-color `--color-electric-violet`, color `--color-midnight-ink` |
| **Switch** | 40×22 pill. Off: `bg --color-cloud-canvas`, `1px --color-ghost-border`. On: `bg --color-electric-violet`. Thumb 16px white. |

### 6.3 Icons

Use **Lucide**. Outline only, 1.5px stroke. Color = `currentColor` so they inherit nav-item / button color.

Mapping used:
- Home → `home`
- Alert → `alert-triangle`
- Photos → `image`
- File / docs → `file-text`
- Contacts → `user-round-cog` / `contact`
- Settings → `settings`
- Estate → `building-2`
- Search → `search`
- Bell → `bell`
- Add → `plus`
- Chevron → `chevron-down` / `chevron-right`
- Check → `check`
- Close → `x`
- Upload / download → `upload-cloud` / `download`
- Attach → `paperclip`
- Send → `send`
- Phone → `phone`
- Mail → `mail`
- Service: electric → `zap`, water → `droplet`, heat → `flame`, waste → `trash-2`
- Edit → `pencil`
- Filter → `sliders-horizontal`
- Eye → `eye`
- Lock → `lock`

### 6.4 Imagery

- Property photos: place under `public/photos/estates/{slug}/cover.jpg` etc. (use Unsplash URLs in dev seed). Always `next/image` with `object-fit: cover` and 12px radius.
- Defect attachments: thumbs at 96×96, 8px radius, ghost-border.
- No illustrations, no emoji.

### 6.5 Motion

- Hover transitions: `background .12s, color .12s` only — never scale, never shadow pulse.
- Modal fade-in: opacity + 4px slide up over 200ms.
- Accordion: instant height open; small `.fade-in` on revealed children.

---

## 7. File structure

```
src/
  app/
    layout.tsx                 // root html, fonts, providers
    page.tsx                   // → redirects based on role
    login/page.tsx
    portal/
      layout.tsx               // owner AppLayout
      pagrindinis/page.tsx
      defektai/page.tsx
      nuotraukos/page.tsx
      sutartys/page.tsx
      kontaktai/page.tsx
      nustatymai/page.tsx
    admin/
      layout.tsx               // admin AppLayout
      estates/
        page.tsx
        [id]/
          page.tsx
          units/[unitId]/page.tsx
      defects/
        page.tsx
        [id]/page.tsx
      contacts/page.tsx
  components/
    layout/
      AppLayout.tsx
      Sidebar.tsx
      PageHeader.tsx
      UserCard.tsx
    ui/                        // shadcn-style primitives, restyled
      Button.tsx Pill.tsx Card.tsx Input.tsx Textarea.tsx Select.tsx
      Tabs.tsx Modal.tsx Switch.tsx Accordion.tsx Avatar.tsx Table.tsx
      StatusPill.tsx FileRow.tsx Dropzone.tsx Lightbox.tsx
    owner/
      PurchaseJourney.tsx StepCard.tsx
      DefectCard.tsx DefectThread.tsx NewDefectModal.tsx
      PhotoSection.tsx
      ServiceCard.tsx UtilityWarningBanner.tsx
      ContactCard.tsx
      AccountForm.tsx SecurityCard.tsx
    admin/
      EstatesTable.tsx NewEstateModal.tsx
      EstateUnitsTab.tsx EstatePhotosTab.tsx EstateContactsTab.tsx
      UnitTechnicalTab.tsx UnitDocumentsTab.tsx UnitPhotosTab.tsx
      UnitServicesTab.tsx UnitOwnerStepsTab.tsx InviteOwnerCard.tsx
      DefectsTable.tsx DefectThreadView.tsx DefectStatusPanel.tsx
      ContactsTable.tsx CategoryPills.tsx
  lib/
    types.ts
    store.ts            // Zustand
    seed.ts             // initial state
    constants.ts        // PURCHASE_STEPS, SERVICE_KINDS, CONTACT_CATEGORIES
    auth.ts             // signIn/signOut helpers
    files.ts            // file → dataURL helper
    fmt.ts              // formatBytes, formatDate (LT locale)
  styles/
    globals.css         // tokens + tailwind base
```

---

## 8. Behaviors / state contracts

### 8.1 Auth
- `/portal/*` requires `session.role === 'owner'`. `/admin/*` requires `'admin'`. Otherwise redirect to `/login`.
- Use a `<RoleGuard>` component in each layout.
- "Impersonate" from unit editor: set a transient `impersonate.userId` in the store and route to `/portal/pagrindinis`. Sidebar shows a yellow banner "Žiūrite kaip savininkas — Grįžti".

### 8.2 Optimistic mutations
Every mutation is sync against the Zustand store — no loading states. Show a brief inline "Išsaugota" pill where appropriate (settings, autosave).

### 8.3 File "uploads"
- `lib/files.ts → toDataURL(file: File): Promise<string>` — convert to base64 data URL.
- Cap at 3 MB. Show a friendly toast if exceeded.
- Persist the data URL on the entity (Defect attachment, DocumentFile).
- Note in README: **demo store; production should swap `files.ts` for S3/UploadThing.**

### 8.4 Defect ID generation
`D-{nextSeq}` where `nextSeq = max(existing ids) + 1`. Seed starts at 198.

### 8.5 Empty states
Each list view (Defektai, Nuotraukos sections, Kontaktai, Estates, Documents) shows a centered empty state when its collection is empty:
- icon, headline ("Pranešimų dar nėra"), one-line subline, primary action button.

### 8.6 Localization
Hardcode Lithuanian copy for v1. Wrap user-facing strings in a `t(key)` helper that just returns the LT string — leaves room for `next-intl` later. **Do not translate technical IDs, file names, or estate names.**

---

## 9. Acceptance checklist

- [ ] Both portals render with seeded data after a fresh `localStorage` clear.
- [ ] Owner can navigate all 6 routes; sidebar highlights correctly.
- [ ] Owner can submit a new defect; it appears at top of the list and in admin's defect list.
- [ ] Owner can upload a PDF on step 5; doc appears in step 5 list and in admin's unit-editor documents tab.
- [ ] Admin can flip a step's visibility off — owner stops seeing it on next load.
- [ ] Admin can reply to a defect; owner sees the reply on their thread.
- [ ] Admin can change defect status; status pill updates everywhere.
- [ ] Admin can toggle a unit's service contract; owner's Paslaugų sutartys reflects the change.
- [ ] "Peržiūrėti kaip savininkas" puts admin in owner view of the same unit.
- [ ] Logout returns to `/login`; seeded state survives reload.
- [ ] All buttons are pill-shaped (`--radius-pill`). No square corners on interactive elements.
- [ ] No color other than Electric Violet appears outside status pills.
- [ ] All text ≥ 500 weight.
- [ ] Sidebar nav items have 44px min-height and a visible hover state.

---

## 10. Out of scope (v1)

- Payments / billing
- Notifications (in-app or email — show the bell icon but it's decorative)
- Mobile dashboard (desktop-first, breakpoint at 1100px stops sidebar collapsing)
- Multi-language UI (LT only)
- Real file storage
- Audit log
- Role granularity beyond owner / admin (no "project manager" sub-role)

When swapping for a real backend later: replace `lib/store.ts` with a thin client over a tRPC / REST layer; keep `lib/types.ts` and `lib/seed.ts` (seed becomes a server-side fixture). Component layer should not need changes.
