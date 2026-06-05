'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  User, Estate, Unit, Defect, Contact, PhotoSection,
  Role, DefectStatus, ServiceKind, PurchaseStepId, DocumentFile, DefectRoom,
  ScheduleEvent, ScheduleEventType, ChatMessage,
  WorkEngagement, WorkerProfile, WorkerSpecialty, WorkUpdate, WorkAttachment, AISummary,
  Expense, BulletinPost, BulletinCategory, CommunityPost, CommunityMention, ProgressUpdate,
} from './types';
import { SEED_USERS, SEED_ESTATES, SEED_UNITS, SEED_DEFECTS, SEED_CONTACTS, SEED_PHOTO_SECTIONS, SEED_SCHEDULE_EVENTS, SEED_CHAT_MESSAGES, SEED_WORK_ENGAGEMENTS, SEED_WORKER_PROFILES, SEED_WORK_UPDATES, SEED_BULLETIN_POSTS, SEED_COMMUNITY_POSTS } from './seed';
import { toDataURL, generateId } from './files';

interface Session {
  userId: string | null;
  role: Role | null;
  impersonateUserId: string | null;
}


interface DomusStore {
  session: Session;
  users: User[];
  estates: Estate[];
  units: Unit[];
  defects: Defect[];
  contacts: Contact[];
  photoSections: PhotoSection[];
  scheduleEvents: ScheduleEvent[];
  chatMessages: ChatMessage[];
  workEngagements: WorkEngagement[];
  workerProfiles: WorkerProfile[];
  workUpdates: WorkUpdate[];
  aiSummaries: AISummary[];
  expenses: Expense[];

  // work engagement selectors
  engagementForUnit: (unitId: string) => WorkEngagement | undefined;
  engagementsForUnit: (unitId: string) => WorkEngagement[];
  workersForEngagement: (engagementId: string) => WorkerProfile[];
  updatesForEngagement: (engagementId: string) => WorkUpdate[];
  summariesForEngagement: (engagementId: string) => AISummary[];

  // work engagement mutations
  inviteWorkManager: (unitId: string, name: string, email: string) => WorkEngagement;
  completeEngagement: (engagementId: string) => void;
  reactivateEngagement: (engagementId: string) => void;
  inviteWorker: (engagementId: string, name: string, email: string, specialty: WorkerSpecialty) => WorkerProfile;
  removeWorker: (workerId: string) => void;
  submitWorkUpdate: (update: Omit<WorkUpdate, 'id' | 'createdAt'>) => WorkUpdate;
  setWorkUpdateTranscription: (updateId: string, transcription: string) => void;
  setWorkUpdateTranslation: (updateId: string, lang: string, text: string) => void;
  addAISummary: (summary: Omit<AISummary, 'id'>) => AISummary;
  addExpense: (input: Omit<Expense, 'id' | 'submittedAt'>) => Expense;
  expensesForEngagement: (engagementId: string) => Expense[];
  expensesForUnit: (unitId: string) => Expense[];

  // auth
  signIn: (email: string, _password: string, role: Role) => boolean;
  signOut: () => void;
  impersonate: (userId: string) => void;
  stopImpersonating: () => void;

  // selectors
  currentUser: () => User | null;
  effectiveUser: () => User | null;
  unitOf: (userId: string) => Unit | null;
  defectsForUnit: (unitId: string) => Defect[];
  estateForUnit: (unitId: string) => Estate | null;

  // mutations
  updateUser: (id: string, patch: Partial<User>) => void;
  createEstate: (input: Omit<Estate, 'id' | 'createdAt'>) => Estate;
  updateEstate: (id: string, patch: Partial<Estate>) => void;
  createUnit: (input: Omit<Unit, 'id'>) => Unit;
  updateUnit: (id: string, patch: Partial<Unit>) => void;
  uploadDocument: (unitId: string, stepId: PurchaseStepId, file: File) => Promise<DocumentFile>;
  toggleStepVisibility: (unitId: string, stepId: PurchaseStepId, on: boolean) => void;
  submitDefect: (input: { unitId: string; estateId: string; title: string; room: DefectRoom; body: string; files: File[] }) => Promise<Defect>;
  replyToDefect: (defectId: string, body: string, files: File[]) => Promise<void>;
  setDefectStatus: (defectId: string, status: DefectStatus) => void;
  deleteDefect: (id: string) => void;
  upsertContact: (input: Omit<Contact, 'id'> | Contact) => Contact;
  deleteContact: (id: string) => void;
  setServiceContractStatus: (unitId: string, kind: ServiceKind, status: 'pending' | 'progress' | 'done') => void;
  addEstatePhoto: (estateId: string, file: File) => Promise<void>;
  addUnitPhoto: (unitId: string, file: File) => Promise<void>;
  removeEstatePhoto: (estateId: string, url: string) => void;
  removeUnitPhoto: (unitId: string, url: string) => void;
  deleteDocument: (unitId: string, stepId: PurchaseStepId, docId: string) => void;
  // schedule
  createScheduleEvent: (input: Omit<ScheduleEvent, 'id' | 'createdAt' | 'createdBy'>) => ScheduleEvent;
  deleteScheduleEvent: (id: string) => void;
  // chat
  sendChatMessage: (estateId: string, body: string) => void;
  // bulletin
  bulletinPosts: BulletinPost[];
  addBulletinPost: (input: { category: BulletinCategory; title: string; body: string; contact?: string }) => void;
  deleteBulletinPost: (id: string) => void;
  // community
  communityPosts: CommunityPost[];
  addCommunityPost: (estateId: string, body: string, imageFiles: File[], mentions: CommunityMention[], anonymous?: boolean) => Promise<void>;
  deleteCommunityPost: (id: string) => void;
  toggleCommunityPostLike: (id: string) => void;
  // progress updates
  progressUpdates: ProgressUpdate[];
  addProgressUpdate: (input: { estateId?: string; title: string; body: string; notifiedUserIds: string[]; imageFiles?: File[] }) => Promise<void>;
  deleteProgressUpdate: (id: string) => void;
}

let defectSeq = 204;

export const useStore = create<DomusStore>()(
  persist(
    (set, get) => ({
      session: { userId: null, role: null, impersonateUserId: null },
      users: SEED_USERS,
      estates: SEED_ESTATES,
      units: SEED_UNITS,
      defects: SEED_DEFECTS,
      contacts: SEED_CONTACTS,
      photoSections: SEED_PHOTO_SECTIONS,
      scheduleEvents: SEED_SCHEDULE_EVENTS,
      chatMessages: SEED_CHAT_MESSAGES,
      bulletinPosts: SEED_BULLETIN_POSTS,
      communityPosts: SEED_COMMUNITY_POSTS,
      progressUpdates: [],
      workEngagements: SEED_WORK_ENGAGEMENTS,
      workerProfiles: SEED_WORKER_PROFILES,
      workUpdates: SEED_WORK_UPDATES,
      aiSummaries: [],
      expenses: [],

      // ── Work Engagement Selectors ─────────────────────────────────────────
      engagementForUnit(unitId) {
        return get().workEngagements.find(e => e.unitId === unitId);
      },
      engagementsForUnit(unitId) {
        return get().workEngagements.filter(e => e.unitId === unitId);
      },
      workersForEngagement(engagementId) {
        return get().workerProfiles.filter(w => w.engagementId === engagementId);
      },
      updatesForEngagement(engagementId) {
        return get().workUpdates.filter(u => u.engagementId === engagementId);
      },
      summariesForEngagement(engagementId) {
        return get().aiSummaries.filter(s => s.engagementId === engagementId);
      },

      // ── Work Engagement Mutations ─────────────────────────────────────────
      inviteWorkManager(unitId, name, email) {
        const managerId = `mgr-${generateId()}`;
        const engagementId = `we-${generateId()}`;
        const managerUser: User = {
          id: managerId,
          role: 'work_manager',
          fullName: name,
          email,
          engagementId,
          avatarBg: '#e8f5ee',
        };
        const engagement: WorkEngagement = {
          id: engagementId,
          unitId,
          managerId,
          managerName: name,
          managerEmail: email,
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        set(s => ({
          users: [...s.users, managerUser],
          workEngagements: [...s.workEngagements, engagement],
        }));
        return engagement;
      },
      completeEngagement(engagementId) {
        set(s => ({
          workEngagements: s.workEngagements.map(e =>
            e.id === engagementId ? { ...e, status: 'completed', completedAt: new Date().toISOString() } : e
          ),
        }));
      },
      reactivateEngagement(engagementId) {
        set(s => ({
          workEngagements: s.workEngagements.map(e =>
            e.id === engagementId ? { ...e, status: 'active', completedAt: undefined } : e
          ),
        }));
      },
      inviteWorker(engagementId, name, email, specialty) {
        const userId = `wrk-${generateId()}`;
        const profileId = `wp-${generateId()}`;
        const workerUser: User = {
          id: userId,
          role: 'worker',
          fullName: name,
          email,
          engagementId,
          avatarBg: '#fdf3df',
        };
        const engagement = get().workEngagements.find(e => e.id === engagementId);
        const workerProfile: WorkerProfile = {
          id: profileId,
          engagementId,
          userId,
          name,
          email,
          specialty,
          createdAt: new Date().toISOString(),
        };
        set(s => ({
          users: [...s.users, workerUser],
          workerProfiles: [...s.workerProfiles, workerProfile],
          units: engagement
            ? s.units.map(u => u.id === engagement.unitId ? { ...u } : u)
            : s.units,
        }));
        return workerProfile;
      },
      removeWorker(workerId) {
        const profile = get().workerProfiles.find(w => w.id === workerId);
        set(s => ({
          workerProfiles: s.workerProfiles.filter(w => w.id !== workerId),
          users: profile ? s.users.filter(u => u.id !== profile.userId) : s.users,
        }));
      },
      submitWorkUpdate(update) {
        const newUpdate: WorkUpdate = {
          ...update,
          id: `wu-${generateId()}`,
          createdAt: new Date().toISOString(),
        };
        set(s => ({ workUpdates: [...s.workUpdates, newUpdate] }));
        return newUpdate;
      },
      setWorkUpdateTranscription(updateId, transcription) {
        set(s => ({
          workUpdates: s.workUpdates.map(u =>
            u.id === updateId ? { ...u, transcription, text: u.text || transcription } : u
          ),
        }));
      },
      setWorkUpdateTranslation(updateId, lang, text) {
        set(s => ({
          workUpdates: s.workUpdates.map(u =>
            u.id === updateId ? { ...u, translations: { ...u.translations, [lang]: text } } : u
          ),
        }));
      },
      addAISummary(summary) {
        const newSummary: AISummary = { ...summary, id: `sum-${generateId()}` };
        set(s => ({ aiSummaries: [...s.aiSummaries, newSummary] }));
        return newSummary;
      },
      addExpense(input) {
        const expense: Expense = { ...input, id: `exp-${generateId()}`, submittedAt: new Date().toISOString() };
        set(s => ({ expenses: [...s.expenses, expense] }));
        return expense;
      },
      expensesForEngagement(engagementId) {
        return get().expenses.filter(e => e.engagementId === engagementId);
      },
      expensesForUnit(unitId) {
        return get().expenses.filter(e => e.unitId === unitId);
      },

      // ── Auth ──────────────────────────────────────────────────────────────
      signIn(email, _password, role) {
        const user = get().users.find(u => u.email === email && u.role === role);
        if (!user) return false;
        set({ session: { userId: user.id, role: user.role, impersonateUserId: null } });
        return true;
      },
      signOut() {
        set({ session: { userId: null, role: null, impersonateUserId: null } });
      },
      impersonate(userId) {
        set(s => ({ session: { ...s.session, impersonateUserId: userId } }));
      },
      stopImpersonating() {
        set(s => ({ session: { ...s.session, impersonateUserId: null } }));
      },

      // ── Selectors ─────────────────────────────────────────────────────────
      currentUser() {
        const { userId } = get().session;
        return get().users.find(u => u.id === userId) ?? null;
      },
      effectiveUser() {
        const { impersonateUserId } = get().session;
        if (impersonateUserId) return get().users.find(u => u.id === impersonateUserId) ?? null;
        return get().currentUser();
      },
      unitOf(userId) {
        const user = get().users.find(u => u.id === userId);
        if (!user?.unitId) return null;
        return get().units.find(u => u.id === user.unitId) ?? null;
      },
      defectsForUnit(unitId) {
        return get().defects.filter(d => d.unitId === unitId);
      },
      estateForUnit(unitId) {
        const unit = get().units.find(u => u.id === unitId);
        if (!unit) return null;
        return get().estates.find(e => e.id === unit.estateId) ?? null;
      },

      // ── User mutations ────────────────────────────────────────────────────
      updateUser(id, patch) {
        set(s => ({ users: s.users.map(u => u.id === id ? { ...u, ...patch } : u) }));
      },

      // ── Estate mutations ──────────────────────────────────────────────────
      createEstate(input) {
        const estate: Estate = { ...input, id: `e-${generateId()}`, createdAt: new Date().toISOString() };
        set(s => ({ estates: [...s.estates, estate] }));
        return estate;
      },
      updateEstate(id, patch) {
        set(s => ({ estates: s.estates.map(e => e.id === id ? { ...e, ...patch } : e) }));
      },

      // ── Unit mutations ────────────────────────────────────────────────────
      createUnit(input) {
        const unit: Unit = { ...input, id: `unit-${generateId()}` };
        set(s => ({ units: [...s.units, unit] }));
        return unit;
      },
      updateUnit(id, patch) {
        set(s => ({ units: s.units.map(u => u.id === id ? { ...u, ...patch } : u) }));
      },
      async uploadDocument(unitId, stepId, file) {
        const url = await toDataURL(file);
        const doc: DocumentFile = {
          id: generateId(),
          name: file.name,
          sizeBytes: file.size,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
          uploadedBy: get().session.userId ?? 'unknown',
          url,
        };
        set(s => ({
          units: s.units.map(u => u.id === unitId ? {
            ...u,
            documents: { ...u.documents, [stepId]: [...(u.documents[stepId] ?? []), doc] },
          } : u),
        }));
        return doc;
      },
      deleteDocument(unitId, stepId, docId) {
        set(s => ({
          units: s.units.map(u => u.id === unitId ? {
            ...u,
            documents: { ...u.documents, [stepId]: u.documents[stepId].filter(d => d.id !== docId) },
          } : u),
        }));
      },
      toggleStepVisibility(unitId, stepId, on) {
        set(s => ({
          units: s.units.map(u => u.id === unitId ? {
            ...u,
            visibleSteps: { ...u.visibleSteps, [stepId]: on },
          } : u),
        }));
      },

      // ── Defect mutations ──────────────────────────────────────────────────
      async submitDefect({ unitId, estateId, title, room, body, files }) {
        const attachments = await Promise.all(files.map(async f => ({
          id: generateId(),
          url: await toDataURL(f),
          thumbUrl: undefined,
        })));
        defectSeq += 1;
        const defect: Defect = {
          id: `D-${defectSeq}`,
          unitId,
          estateId,
          ownerUserId: get().session.userId ?? '',
          title,
          room,
          status: 'open',
          createdAt: new Date().toISOString(),
          messages: [{
            id: generateId(),
            authorUserId: get().session.userId ?? '',
            body,
            createdAt: new Date().toISOString(),
            attachments,
          }],
        };
        set(s => ({ defects: [defect, ...s.defects] }));
        return defect;
      },
      async replyToDefect(defectId, body, files) {
        const attachments = await Promise.all(files.map(async f => ({
          id: generateId(),
          url: await toDataURL(f),
          thumbUrl: undefined,
        })));
        set(s => ({
          defects: s.defects.map(d => d.id === defectId ? {
            ...d,
            messages: [...d.messages, {
              id: generateId(),
              authorUserId: s.session.userId ?? '',
              body,
              createdAt: new Date().toISOString(),
              attachments,
            }],
          } : d),
        }));
      },
      setDefectStatus(defectId, status) {
        set(s => ({ defects: s.defects.map(d => d.id === defectId ? { ...d, status } : d) }));
      },
      deleteDefect(id) {
        set(s => ({ defects: s.defects.filter(d => d.id !== id) }));
      },

      // ── Contact mutations ─────────────────────────────────────────────────
      upsertContact(input) {
        const existing = 'id' in input ? get().contacts.find(c => c.id === input.id) : null;
        if (existing) {
          const updated = { ...existing, ...input } as Contact;
          set(s => ({ contacts: s.contacts.map(c => c.id === updated.id ? updated : c) }));
          return updated;
        }
        const contact: Contact = { ...input, id: `c-${generateId()}` } as Contact;
        set(s => ({ contacts: [...s.contacts, contact] }));
        return contact;
      },
      deleteContact(id) {
        set(s => ({ contacts: s.contacts.filter(c => c.id !== id) }));
      },

      // ── Service mutations ─────────────────────────────────────────────────
      setServiceContractStatus(unitId, kind, status) {
        set(s => ({
          units: s.units.map(u => u.id === unitId ? {
            ...u,
            services: u.services.map(svc => svc.id === kind ? { ...svc, status } : svc),
          } : u),
        }));
      },

      // ── Photo mutations ───────────────────────────────────────────────────
      async addEstatePhoto(estateId, file) {
        const url = await toDataURL(file);
        set(s => ({ estates: s.estates.map(e => e.id === estateId ? { ...e, photoUrls: [...e.photoUrls, url] } : e) }));
      },
      async addUnitPhoto(unitId, file) {
        const url = await toDataURL(file);
        set(s => ({ units: s.units.map(u => u.id === unitId ? { ...u, photoUrls: [...u.photoUrls, url] } : u) }));
      },
      removeEstatePhoto(estateId, url) {
        set(s => ({ estates: s.estates.map(e => e.id === estateId ? { ...e, photoUrls: e.photoUrls.filter(p => p !== url) } : e) }));
      },
      removeUnitPhoto(unitId, url) {
        set(s => ({ units: s.units.map(u => u.id === unitId ? { ...u, photoUrls: u.photoUrls.filter(p => p !== url) } : u) }));
      },

      // ── Schedule mutations ────────────────────────────────────────────────
      createScheduleEvent(input) {
        const event: ScheduleEvent = { ...input, id: `se-${generateId()}`, createdBy: get().session.userId ?? 'u2', createdAt: new Date().toISOString() };
        set(s => ({ scheduleEvents: [...s.scheduleEvents, event].sort((a, b) => a.date.localeCompare(b.date)) }));
        return event;
      },
      deleteScheduleEvent(id) {
        set(s => ({ scheduleEvents: s.scheduleEvents.filter(e => e.id !== id) }));
      },

      // ── Chat mutations ────────────────────────────────────────────────────
      sendChatMessage(estateId, body) {
        const msg: ChatMessage = { id: `cm-${generateId()}`, estateId, authorUserId: get().session.userId ?? '', body, createdAt: new Date().toISOString() };
        set(s => ({ chatMessages: [...s.chatMessages, msg] }));
      },
      // ── Bulletin mutations ────────────────────────────────────────────────
      addBulletinPost({ category, title, body, contact }) {
        const { session, users, units } = get();
        const user = users.find(u => u.id === session.userId);
        const unit = units.find(u => u.ownerUserId === session.userId);
        const post: BulletinPost = {
          id: `bp-${generateId()}`,
          authorId: session.userId ?? '',
          authorName: user?.fullName ?? 'Savininkas',
          unitNumber: unit?.number ?? '—',
          category, title, body, contact,
          createdAt: new Date().toISOString(),
        };
        set(s => ({ bulletinPosts: [post, ...s.bulletinPosts] }));
      },
      deleteBulletinPost(id) {
        set(s => ({ bulletinPosts: s.bulletinPosts.filter(p => p.id !== id) }));
      },
      // ── Community mutations ───────────────────────────────────────────────
      async addCommunityPost(estateId, body, imageFiles, mentions, anonymous = false) {
        const { session, users, units } = get();
        const user = users.find(u => u.id === session.userId);
        const unit = units.find(u => u.ownerUserId === session.userId);
        const imageUrls = await Promise.all(imageFiles.map(toDataURL));
        const post: CommunityPost = {
          id: `cp-${generateId()}`,
          estateId,
          authorId: session.userId ?? '',
          authorName: anonymous ? 'Anonimas' : (user?.fullName ?? 'Savininkas'),
          unitNumber: anonymous ? '—' : (unit?.number ?? (user?.role === 'admin' ? 'Admin' : '—')),
          body,
          createdAt: new Date().toISOString(),
          likedBy: [],
          imageUrls,
          mentions,
          isAnonymous: anonymous || undefined,
        };
        set(s => ({ communityPosts: [post, ...s.communityPosts] }));
      },
      deleteCommunityPost(id) {
        set(s => ({ communityPosts: s.communityPosts.filter(p => p.id !== id) }));
      },
      toggleCommunityPostLike(id) {
        const userId = get().session.userId ?? '';
        set(s => ({
          communityPosts: s.communityPosts.map(p =>
            p.id === id
              ? { ...p, likedBy: p.likedBy.includes(userId) ? p.likedBy.filter(uid => uid !== userId) : [...p.likedBy, userId] }
              : p
          ),
        }));
      },
      async addProgressUpdate({ estateId, title, body, notifiedUserIds, imageFiles = [] }) {
        const { session, users } = get();
        const author = users.find(u => u.id === session.userId);
        const imageUrls: string[] = await Promise.all(imageFiles.map(f => toDataURL(f)));
        const update: ProgressUpdate = {
          id: generateId(),
          authorId: session.userId ?? '',
          authorName: author?.fullName ?? 'Administratorius',
          estateId,
          title,
          body,
          notifiedUserIds,
          imageUrls: imageUrls.length ? imageUrls : undefined,
          createdAt: new Date().toISOString(),
        };
        set(s => ({ progressUpdates: [update, ...s.progressUpdates] }));
      },
      deleteProgressUpdate(id) {
        set(s => ({ progressUpdates: s.progressUpdates.filter(p => p.id !== id) }));
      },
    }),
    {
      name: 'domus.store.v1',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      partialize: (s) => ({
        session: s.session,
        users: s.users,
        estates: s.estates,
        units: s.units,
        defects: s.defects,
        contacts: s.contacts,
        photoSections: s.photoSections,
        scheduleEvents: s.scheduleEvents,
        chatMessages: s.chatMessages,
        bulletinPosts: s.bulletinPosts,
        communityPosts: s.communityPosts,
        progressUpdates: s.progressUpdates,
        workEngagements: s.workEngagements,
        workerProfiles: s.workerProfiles,
        workUpdates: s.workUpdates.map(({ audioDataUrl: _a, attachments, ...rest }) => ({
          ...rest,
          attachments: attachments.map(({ dataUrl: _d, ...att }) => att),
        })),
        aiSummaries: s.aiSummaries,
        expenses: s.expenses.map(({ billImageDataUrl: _img, ...rest }) => rest),
      }),
    }
  )
);
