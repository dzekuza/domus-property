export type Role = 'owner' | 'admin';

export interface User {
  id: string;
  role: Role;
  fullName: string;
  email: string;
  phone?: string;
  unitId?: string;
  avatarBg?: string;
}

export interface Estate {
  id: string;
  name: string;
  address: string;
  status: 'Pardavimas' | 'Statoma' | 'Baigta';
  coverPhotoUrl: string;
  unitCount: number;
  contactIds: string[];
  photoUrls: string[];
  createdAt: string;
}

export type PurchaseStepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type StepStatus = 'not_started' | 'pending' | 'progress' | 'done';

export interface PurchaseStep {
  id: PurchaseStepId;
  title: string;
  subtitle: string;
  status: StepStatus;
  allowOwnerUpload: boolean;
}

export interface DocumentFile {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
}

export type ServiceKind = 'elec' | 'water' | 'heat' | 'waste';

export interface ServiceContract {
  id: ServiceKind;
  status: 'pending' | 'progress' | 'done';
  date?: string;
}

export interface Unit {
  id: string;
  estateId: string;
  number: string;
  floor: number;
  block: string;
  totalAreaM2: number;
  usableAreaM2: number;
  rooms: number;
  notes?: string;
  ownerUserId?: string;
  status: 'available' | 'reserved' | 'sold';
  photoUrls: string[];
  services: ServiceContract[];
  visibleSteps: Record<PurchaseStepId, boolean>;
  documents: Record<PurchaseStepId, DocumentFile[]>;
  stepStatuses: Record<PurchaseStepId, StepStatus>;
  keyHandoverDate?: string;
}

export type DefectStatus = 'open' | 'progress' | 'resolved' | 'rejected';

export type DefectRoom = 'Vonia' | 'Virtuvė' | 'Svetainė' | 'Miegamasis' | 'Koridorius' | 'Balkonas' | 'Kita';

export interface DefectMessage {
  id: string;
  authorUserId: string;
  body: string;
  createdAt: string;
  attachments: { id: string; url: string; thumbUrl?: string }[];
}

export interface Defect {
  id: string;
  unitId: string;
  estateId: string;
  ownerUserId: string;
  title: string;
  room: DefectRoom;
  status: DefectStatus;
  createdAt: string;
  assignedContactId?: string;
  messages: DefectMessage[];
}

export type ContactCategory =
  | 'Langai ir durys'
  | 'Šildymas'
  | 'Vandentiekis'
  | 'Elektra'
  | 'Internetas'
  | 'Bendrosios patalpos'
  | 'Kita';

export interface Contact {
  id: string;
  category: ContactCategory;
  fullName: string;
  org: string;
  phone: string;
  email: string;
  documents: DocumentFile[];
}

export interface PhotoSection {
  id: string;
  unitId: string;
  title: string;
  date: string;
  photoUrls: string[];
}

export type ScheduleEventType = 'Žolės pjovimas' | 'Valymas' | 'Remontas' | 'Apžiūra' | 'Kita';

export interface ScheduleEvent {
  id: string;
  estateId: string;
  title: string;
  description?: string;
  type: ScheduleEventType;
  date: string;    // ISO date "YYYY-MM-DD"
  time?: string;   // "HH:MM"
  createdBy: string; // userId
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  estateId: string;
  authorUserId: string;
  body: string;
  createdAt: string;
}
