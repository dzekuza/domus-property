import type { PurchaseStepId, ContactCategory, DefectRoom, ServiceKind } from './types';

export const PURCHASE_STEPS: {
  id: PurchaseStepId;
  title: string;
  subtitle: string;
  allowOwnerUpload: boolean;
}[] = [
  { id: 1, title: 'Preliminari sutartis', subtitle: 'Pasirašyta preliminari pirkimo-pardavimo sutartis', allowOwnerUpload: false },
  { id: 2, title: 'Notarinė sutartis', subtitle: 'Notariškai patvirtinta pirkimo-pardavimo sutartis', allowOwnerUpload: false },
  { id: 3, title: 'Registrų centro išrašas', subtitle: 'Nuosavybės teisės įregistruotos Registrų centre', allowOwnerUpload: false },
  { id: 4, title: 'Mokėjimo kvitas', subtitle: 'Galutinis mokėjimas atliktas ir patvirtintas', allowOwnerUpload: false },
  { id: 5, title: 'Buto priėmimo-perdavimo aktas', subtitle: 'Butas perduotas savininkui, aktas pasirašytas', allowOwnerUpload: true },
  { id: 6, title: 'Raktų perdavimas', subtitle: 'Raktai ir prieigos dokumentai perduoti', allowOwnerUpload: false },
  { id: 7, title: 'Komunalinių paslaugų aktyvavimas', subtitle: 'Visos komunalinės paslaugos aktyvuotos', allowOwnerUpload: false },
  { id: 8, title: 'Galutinė apžiūra', subtitle: 'Galutinė buto apžiūra atlikta kartu su rangovu', allowOwnerUpload: false },
];

export const SERVICE_KINDS: Record<ServiceKind, { name: string; provider: string }> = {
  elec:  { name: 'Elektra',   provider: 'ESO' },
  water: { name: 'Vandentiekis', provider: 'Vilniaus vandenys' },
  heat:  { name: 'Šildymas',  provider: 'Vilniaus šilumos tinklai' },
  waste: { name: 'Atliekos',  provider: 'Ecoservice' },
};

export const CONTACT_CATEGORIES: ContactCategory[] = [
  'Langai ir durys',
  'Šildymas',
  'Vandentiekis',
  'Elektra',
  'Internetas',
  'Bendrosios patalpos',
  'Kita',
];

export const DEFECT_ROOMS: DefectRoom[] = [
  'Vonia',
  'Virtuvė',
  'Svetainė',
  'Miegamasis',
  'Koridorius',
  'Balkonas',
  'Kita',
];
