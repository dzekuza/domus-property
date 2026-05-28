import type { User, Estate, Unit, Defect, Contact, PhotoSection, PurchaseStepId, ScheduleEvent, ChatMessage } from './types';
import { PURCHASE_STEPS, SERVICE_KINDS } from './constants';

const ALL_STEP_IDS = PURCHASE_STEPS.map(s => s.id) as PurchaseStepId[];

function makeVisibleSteps(visible = true): Record<PurchaseStepId, boolean> {
  return Object.fromEntries(ALL_STEP_IDS.map(id => [id, visible])) as Record<PurchaseStepId, boolean>;
}

function makeDocuments(): Record<PurchaseStepId, []> {
  return Object.fromEntries(ALL_STEP_IDS.map(id => [id, []])) as Record<PurchaseStepId, []>;
}

function makeServices() {
  return (Object.keys(SERVICE_KINDS) as (keyof typeof SERVICE_KINDS)[]).map(kind => ({
    id: kind,
    status: 'pending' as const,
  }));
}

// ─── Users ───────────────────────────────────────────────────────────────────

export const SEED_USERS: User[] = [
  {
    id: 'u1',
    role: 'owner',
    fullName: 'Andrius Kazlauskas',
    email: 'andrius@mail.lt',
    phone: '+370 612 34567',
    unitId: 'unit-b12',
    avatarBg: '#e6e6fd',
  },
  {
    id: 'u2',
    role: 'admin',
    fullName: 'Tomas Domus',
    email: 'tomas@domus.lt',
    phone: '+370 699 11223',
    avatarBg: '#e8f5ee',
  },
  {
    id: 'u3',
    role: 'owner',
    fullName: 'Laura Petraitienė',
    email: 'laura@mail.lt',
    phone: '+370 620 98765',
    unitId: 'unit-a04',
    avatarBg: '#fdf3df',
  },
];

// ─── Estates ─────────────────────────────────────────────────────────────────

export const SEED_ESTATES: Estate[] = [
  {
    id: 'e1',
    name: 'Kalnų Terasos',
    address: 'Vilniaus g. 24, Vilnius',
    status: 'Pardavimas',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    unitCount: 48,
    contactIds: ['c1', 'c2', 'c3'],
    photoUrls: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
    ],
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'e2',
    name: 'Pajūrio Namai',
    address: 'Klaipėdos g. 5, Klaipėda',
    status: 'Statoma',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    unitCount: 32,
    contactIds: ['c4', 'c5'],
    photoUrls: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80',
    ],
    createdAt: '2024-03-10T10:00:00Z',
  },
  {
    id: 'e3',
    name: 'Švyturys',
    address: 'Palangos g. 12, Kaunas',
    status: 'Baigta',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    unitCount: 24,
    contactIds: ['c6'],
    photoUrls: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
    ],
    createdAt: '2023-06-01T10:00:00Z',
  },
  {
    id: 'e4',
    name: 'Auksakalniai Loftai',
    address: 'Gedimino pr. 45, Vilnius',
    status: 'Pardavimas',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    unitCount: 18,
    contactIds: ['c1', 'c7'],
    photoUrls: [],
    createdAt: '2024-05-20T10:00:00Z',
  },
  {
    id: 'e5',
    name: 'Baltijos Vartai',
    address: 'Laisvės al. 88, Kaunas',
    status: 'Statoma',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    unitCount: 60,
    contactIds: [],
    photoUrls: [],
    createdAt: '2024-07-01T10:00:00Z',
  },
  {
    id: 'e6',
    name: 'Pušyno Slėnis',
    address: 'Žvejų g. 3, Neringa',
    status: 'Baigta',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    unitCount: 12,
    contactIds: ['c8', 'c9'],
    photoUrls: [],
    createdAt: '2023-01-10T10:00:00Z',
  },
];

// ─── Units ────────────────────────────────────────────────────────────────────

export const SEED_UNITS: Unit[] = [
  {
    id: 'unit-b12',
    estateId: 'e1',
    number: 'B-12',
    floor: 3,
    block: 'B',
    totalAreaM2: 72.4,
    usableAreaM2: 65.1,
    rooms: 3,
    ownerUserId: 'u1',
    status: 'sold',
    photoUrls: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
    ],
    services: [
      { id: 'elec', status: 'done', date: '2025-02-15' },
      { id: 'water', status: 'done', date: '2025-02-15' },
      { id: 'heat', status: 'progress' },
      { id: 'waste', status: 'pending' },
    ],
    visibleSteps: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: false, 8: false },
    documents: {
      1: [{ id: 'd1', name: 'Preliminari_sutartis.pdf', sizeBytes: 245760, mimeType: 'application/pdf', uploadedAt: '2024-06-01T10:00:00Z', uploadedBy: 'u2', url: '#' }],
      2: [{ id: 'd2', name: 'Notarine_sutartis.pdf', sizeBytes: 512000, mimeType: 'application/pdf', uploadedAt: '2024-09-15T10:00:00Z', uploadedBy: 'u2', url: '#' }],
      3: [], 4: [], 5: [], 6: [], 7: [], 8: [],
    },
    stepStatuses: { 1: 'done', 2: 'done', 3: 'done', 4: 'done', 5: 'progress', 6: 'pending', 7: 'not_started', 8: 'not_started' },
    keyHandoverDate: '2025-06-30',
  },
  {
    id: 'unit-a04',
    estateId: 'e1',
    number: 'A-04',
    floor: 1,
    block: 'A',
    totalAreaM2: 55.2,
    usableAreaM2: 49.8,
    rooms: 2,
    ownerUserId: 'u3',
    status: 'sold',
    photoUrls: [],
    services: makeServices(),
    visibleSteps: makeVisibleSteps(true),
    documents: makeDocuments(),
    stepStatuses: { 1: 'done', 2: 'progress', 3: 'not_started', 4: 'not_started', 5: 'not_started', 6: 'not_started', 7: 'not_started', 8: 'not_started' },
  },
  {
    id: 'unit-c07',
    estateId: 'e1',
    number: 'C-07',
    floor: 2,
    block: 'C',
    totalAreaM2: 88.0,
    usableAreaM2: 79.5,
    rooms: 4,
    status: 'reserved',
    photoUrls: [],
    services: makeServices(),
    visibleSteps: makeVisibleSteps(false),
    documents: makeDocuments(),
    stepStatuses: { 1: 'pending', 2: 'not_started', 3: 'not_started', 4: 'not_started', 5: 'not_started', 6: 'not_started', 7: 'not_started', 8: 'not_started' },
  },
  {
    id: 'unit-a01',
    estateId: 'e1',
    number: 'A-01',
    floor: 1,
    block: 'A',
    totalAreaM2: 48.0,
    usableAreaM2: 43.2,
    rooms: 2,
    status: 'available',
    photoUrls: [],
    services: makeServices(),
    visibleSteps: makeVisibleSteps(false),
    documents: makeDocuments(),
    stepStatuses: { 1: 'not_started', 2: 'not_started', 3: 'not_started', 4: 'not_started', 5: 'not_started', 6: 'not_started', 7: 'not_started', 8: 'not_started' },
  },
  {
    id: 'unit-e2-01',
    estateId: 'e2',
    number: 'A-01',
    floor: 1,
    block: 'A',
    totalAreaM2: 62.0,
    usableAreaM2: 55.8,
    rooms: 3,
    status: 'reserved',
    photoUrls: [],
    services: makeServices(),
    visibleSteps: makeVisibleSteps(false),
    documents: makeDocuments(),
    stepStatuses: { 1: 'pending', 2: 'not_started', 3: 'not_started', 4: 'not_started', 5: 'not_started', 6: 'not_started', 7: 'not_started', 8: 'not_started' },
  },
];

// ─── Defects ──────────────────────────────────────────────────────────────────

export const SEED_DEFECTS: Defect[] = [
  {
    id: 'D-198',
    unitId: 'unit-b12',
    estateId: 'e1',
    ownerUserId: 'u1',
    title: 'Vonios kambaryje nutekėjimas',
    room: 'Vonia',
    status: 'progress',
    createdAt: '2025-03-10T09:00:00Z',
    assignedContactId: 'c2',
    messages: [
      { id: 'm1', authorUserId: 'u1', body: 'Pastebėjau nutekėjimą po kriaukle. Vanduo lašo ant grindų.', createdAt: '2025-03-10T09:00:00Z', attachments: [] },
      { id: 'm2', authorUserId: 'u2', body: 'Ačiū už pranešimą. Meistrą siųsime ketvirtadienį 10:00–12:00.', createdAt: '2025-03-11T14:00:00Z', attachments: [] },
    ],
  },
  {
    id: 'D-199',
    unitId: 'unit-b12',
    estateId: 'e1',
    ownerUserId: 'u1',
    title: 'Langų jungtys nesandarios',
    room: 'Svetainė',
    status: 'open',
    createdAt: '2025-04-02T11:30:00Z',
    messages: [
      { id: 'm3', authorUserId: 'u1', body: 'Šaltis pučia iš lango jungčių. Reikia įvertinti sandarinimą.', createdAt: '2025-04-02T11:30:00Z', attachments: [] },
    ],
  },
  {
    id: 'D-200',
    unitId: 'unit-a04',
    estateId: 'e1',
    ownerUserId: 'u3',
    title: 'Dažų burbulai virtuvėje',
    room: 'Virtuvė',
    status: 'resolved',
    createdAt: '2025-02-14T08:00:00Z',
    messages: [
      { id: 'm4', authorUserId: 'u3', body: 'Ant sienos atsirado dažų burbulai prie lango.', createdAt: '2025-02-14T08:00:00Z', attachments: [] },
      { id: 'm5', authorUserId: 'u2', body: 'Apdorojome. Siena perdažyta, problema išspręsta.', createdAt: '2025-02-20T16:00:00Z', attachments: [] },
    ],
  },
  {
    id: 'D-201',
    unitId: 'unit-b12',
    estateId: 'e1',
    ownerUserId: 'u1',
    title: 'Grindų lenta girgžda',
    room: 'Miegamasis',
    status: 'open',
    createdAt: '2025-05-01T10:00:00Z',
    messages: [
      { id: 'm6', authorUserId: 'u1', body: 'Viena parketo lenta girgžda einant. Reikia patikrinti.', createdAt: '2025-05-01T10:00:00Z', attachments: [] },
    ],
  },
  {
    id: 'D-202',
    unitId: 'unit-c07',
    estateId: 'e1',
    ownerUserId: 'u1',
    title: 'Elektros jungiklis neveikia',
    room: 'Koridorius',
    status: 'rejected',
    createdAt: '2025-01-20T14:00:00Z',
    messages: [
      { id: 'm7', authorUserId: 'u1', body: 'Koridoriaus jungiklis neįjungia šviesos.', createdAt: '2025-01-20T14:00:00Z', attachments: [] },
      { id: 'm8', authorUserId: 'u2', body: 'Patikrinome — pažeidimas įvyko po perdavimo, garantija netaikoma.', createdAt: '2025-01-22T11:00:00Z', attachments: [] },
    ],
  },
  {
    id: 'D-203',
    unitId: 'unit-e2-01',
    estateId: 'e2',
    ownerUserId: 'u3',
    title: 'Balkono durys neužsidaro',
    room: 'Balkonas',
    status: 'progress',
    createdAt: '2025-05-10T09:00:00Z',
    messages: [
      { id: 'm9', authorUserId: 'u3', body: 'Balkono durys neužsidaro tinkamai, pro plyšius pučia vėjas.', createdAt: '2025-05-10T09:00:00Z', attachments: [] },
    ],
  },
  {
    id: 'D-204',
    unitId: 'unit-b12',
    estateId: 'e1',
    ownerUserId: 'u1',
    title: 'Vonios plytelė įtrūkusi',
    room: 'Vonia',
    status: 'open',
    createdAt: '2025-05-20T15:00:00Z',
    messages: [
      { id: 'm10', authorUserId: 'u1', body: 'Ant vonios sienos pastebėjau įtrūkusią plytelę. Reikia keisti.', createdAt: '2025-05-20T15:00:00Z', attachments: [] },
    ],
  },
];

// ─── Contacts ─────────────────────────────────────────────────────────────────

export const SEED_CONTACTS: Contact[] = [
  { id: 'c1', category: 'Langai ir durys', fullName: 'Vytautas Šilas', org: 'WinDoor UAB', phone: '+370 600 11111', email: 'vytautas@windoor.lt', documents: [] },
  { id: 'c2', category: 'Vandentiekis', fullName: 'Jonas Puodžius', org: 'AquaFix', phone: '+370 600 22222', email: 'jonas@aquafix.lt', documents: [] },
  { id: 'c3', category: 'Elektra', fullName: 'Rimas Elektra', org: 'ElecPro', phone: '+370 600 33333', email: 'rimas@elecpro.lt', documents: [] },
  { id: 'c4', category: 'Šildymas', fullName: 'Algis Šiluma', org: 'ThermoLT', phone: '+370 600 44444', email: 'algis@thermolt.lt', documents: [] },
  { id: 'c5', category: 'Internetas', fullName: 'Deividas Ryšys', org: 'NetCo', phone: '+370 600 55555', email: 'deividas@netco.lt', documents: [] },
  { id: 'c6', category: 'Bendrosios patalpos', fullName: 'Sonata Priežiūra', org: 'CleanPro', phone: '+370 600 66666', email: 'sonata@cleanpro.lt', documents: [] },
  { id: 'c7', category: 'Langai ir durys', fullName: 'Kęstutis Balzamas', org: 'GlassTech', phone: '+370 600 77777', email: 'kestutis@glasstech.lt', documents: [] },
  { id: 'c8', category: 'Kita', fullName: 'Marius Statyba', org: 'BuildLT', phone: '+370 600 88888', email: 'marius@buildlt.lt', documents: [] },
  { id: 'c9', category: 'Vandentiekis', fullName: 'Eglė Vamzdis', org: 'PipeService', phone: '+370 600 99999', email: 'egle@pipeservice.lt', documents: [] },
];

// ─── Photo sections ───────────────────────────────────────────────────────────

export const SEED_PHOTO_SECTIONS: PhotoSection[] = [
  {
    id: 'ps1',
    unitId: 'unit-b12',
    title: 'Bendras vaizdas',
    date: '2025-01-10',
    photoUrls: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80',
    ],
  },
  {
    id: 'ps2',
    unitId: 'unit-b12',
    title: 'Virtuvė ir svetainė',
    date: '2025-01-10',
    photoUrls: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
      'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80',
      'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=600&q=80',
    ],
  },
  {
    id: 'ps3',
    unitId: 'unit-b12',
    title: 'Vonia',
    date: '2025-01-10',
    photoUrls: [
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&q=80',
    ],
  },
  {
    id: 'ps4',
    unitId: 'unit-b12',
    title: 'Miegamieji',
    date: '2025-01-11',
    photoUrls: [
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
    ],
  },
];

// ─── Schedule events ──────────────────────────────────────────────────────────

export const SEED_SCHEDULE_EVENTS: ScheduleEvent[] = [
  { id: 'se1', estateId: 'e1', title: 'Žolės pjovimas', description: 'Reguliarus žolės pjovimas visoje teritorijoje. Prašome nestatyti automobilių ant vejos.', type: 'Žolės pjovimas', date: '2026-06-03', time: '09:00', createdBy: 'u2', createdAt: '2026-05-20T10:00:00Z' },
  { id: 'se2', estateId: 'e1', title: 'Laiptinių valymas', description: 'Mėnesinis laiptinių ir bendrų patalpų valymas.', type: 'Valymas', date: '2026-06-10', time: '08:00', createdBy: 'u2', createdAt: '2026-05-20T10:00:00Z' },
  { id: 'se3', estateId: 'e1', title: 'Lifto techninė apžiūra', description: 'Metinė lifto techninė apžiūra. Liftas bus išjungtas nuo 10:00 iki 14:00.', type: 'Apžiūra', date: '2026-06-15', time: '10:00', createdBy: 'u2', createdAt: '2026-05-21T09:00:00Z' },
  { id: 'se4', estateId: 'e1', title: 'Stogo remonto darbai', description: 'Planuojami stogo remonto darbai. Tikimasi triukšmo.', type: 'Remontas', date: '2026-06-22', time: '07:30', createdBy: 'u2', createdAt: '2026-05-22T11:00:00Z' },
  { id: 'se5', estateId: 'e1', title: 'Žolės pjovimas', description: 'Eilinis žolės pjovimas.', type: 'Žolės pjovimas', date: '2026-07-01', time: '09:00', createdBy: 'u2', createdAt: '2026-05-22T11:00:00Z' },
  { id: 'se6', estateId: 'e1', title: 'Vandentiekio patikrinimas', description: 'Profilaktinis vandentiekio sistemos patikrinimas. Vanduo gali būti išjungtas 1–2 val.', type: 'Apžiūra', date: '2026-05-15', time: '11:00', createdBy: 'u2', createdAt: '2026-05-01T10:00:00Z' },
  { id: 'se7', estateId: 'e2', title: 'Žolės pjovimas', type: 'Žolės pjovimas', date: '2026-06-05', time: '09:00', createdBy: 'u2', createdAt: '2026-05-20T10:00:00Z' },
];

// ─── Chat messages ────────────────────────────────────────────────────────────

export const SEED_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'cm1', estateId: 'e1', authorUserId: 'u2', body: 'Sveiki, gyventojai! Primename, kad birželio 3 d. bus pjaunama žolė. Prašome nestatyti automobilių ant vejos.', createdAt: '2026-05-20T10:05:00Z' },
  { id: 'cm2', estateId: 'e1', authorUserId: 'u1', body: 'Ačiū už informaciją! Ar žinote, kada planuojama tvarkyti vaikų žaidimų aikštelę?', createdAt: '2026-05-20T11:30:00Z' },
  { id: 'cm3', estateId: 'e1', authorUserId: 'u2', body: 'Žaidimų aikštelės atnaujinimas planuojamas rugpjūčio mėnesį. Detalesnė informacija bus paskelbta vėliau.', createdAt: '2026-05-20T12:00:00Z' },
  { id: 'cm4', estateId: 'e1', authorUserId: 'u3', body: 'Labas! Ar kas nors žino, ar yra galimybė gauti papildomą rūsio dėžę?', createdAt: '2026-05-21T09:15:00Z' },
  { id: 'cm5', estateId: 'e1', authorUserId: 'u2', body: 'Laura, prašome kreiptis į administraciją el. paštu — peržiūrėsime galimybes.', createdAt: '2026-05-21T10:00:00Z' },
];
