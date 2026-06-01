export type Role = 'owner' | 'admin' | 'work_manager' | 'worker';

export interface User {
  id: string;
  role: Role;
  fullName: string;
  email: string;
  phone?: string;
  unitId?: string;
  avatarBg?: string;
  engagementId?: string;
}

// ─── Work Engagement Types ────────────────────────────────────────────────────

export interface WorkEngagement {
  id: string;
  unitId: string;
  managerId: string;
  managerName: string;
  managerEmail: string;
  status: 'active' | 'completed';
  createdAt: string;
  completedAt?: string;
}

export type WorkerSpecialty = 'Dažytojas' | 'Elektrikas' | 'Santechnikas' | 'Stogdengys' | 'Kita';

export interface WorkerProfile {
  id: string;
  engagementId: string;
  userId: string;
  name: string;
  email: string;
  specialty: WorkerSpecialty;
  createdAt: string;
}

export interface WorkAttachment {
  id: string;
  name: string;
  mimeType: string;
  dataUrl?: string;
}

export interface WorkUpdate {
  id: string;
  engagementId: string;
  authorId: string;
  authorName: string;
  authorRole: 'work_manager' | 'worker';
  inputType: 'text' | 'voice';
  text: string;
  audioDataUrl?: string;
  transcription?: string;
  translations: Record<string, string>;
  attachments: WorkAttachment[];
  createdAt: string;
  toOwner?: boolean;
  groupedIds?: string[];
  billSummary?: { vendorName?: string; totalAmount?: number; currency?: string };
}

export interface AISummary {
  id: string;
  engagementId: string;
  period: 'daily' | 'weekly';
  generatedAt: string;
  text: string;
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

export interface ExpenseItem {
  description: string;
  quantity?: number;
  unit_price?: number;
  line_total?: number;
}

export type BulletinCategory = 'Parduodu' | 'Ieškau' | 'Informacija' | 'Prarasta';

export interface BulletinPost {
  id: string;
  authorId: string;
  authorName: string;
  unitNumber: string;
  category: BulletinCategory;
  title: string;
  body: string;
  contact?: string;
  createdAt: string;
  pinned?: boolean;
}

export interface Expense {
  id: string;
  engagementId: string;
  unitId: string;
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
  billImageDataUrl?: string;
  vendorName: string;
  billDate: string;
  totalAmount: number;
  items: ExpenseItem[];
  currency?: string;
}
