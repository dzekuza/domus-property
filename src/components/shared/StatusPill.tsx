import { Check } from 'lucide-react';
import type { DefectStatus, StepStatus } from '@/lib/types';

const defectMap: Record<DefectStatus, { label: string; bg: string; color: string }> = {
  open:     { label: 'Atviras',    bg: 'var(--color-cloud-canvas)',  color: 'var(--color-muted-ash)' },
  progress: { label: 'Vykdomas',  bg: 'var(--color-teal-tint)',     color: 'var(--color-teal)' },
  resolved: { label: 'Išspręstas', bg: 'var(--color-success-tint)', color: 'var(--color-success)' },
  rejected: { label: 'Atmestas',  bg: 'var(--color-danger-tint)',   color: 'var(--color-danger)' },
};

const stepMap: Record<StepStatus, { label: string; bg: string; color: string }> = {
  done:        { label: 'Atlikta',    bg: 'var(--color-success-tint)', color: 'var(--color-success)' },
  progress:    { label: 'Vykdoma',   bg: 'var(--color-teal-tint)',    color: 'var(--color-teal)' },
  pending:     { label: 'Laukiama',  bg: 'var(--color-cloud-canvas)', color: 'var(--color-muted-ash)' },
  not_started: { label: 'Nepradėta', bg: 'var(--color-cloud-canvas)', color: 'var(--color-muted-ash-2)' },
};

const estateStatusMap: Record<string, { bg: string; color: string }> = {
  Pardavimas: { bg: 'var(--color-teal-tint)',    color: 'var(--color-teal)' },
  Statoma:    { bg: 'var(--color-warning-tint)', color: 'var(--color-warning)' },
  Baigta:     { bg: 'var(--color-success-tint)', color: 'var(--color-success)' },
};

const unitStatusMap: Record<string, { label: string; bg: string; color: string }> = {
  sold:      { label: 'Parduotas',   bg: 'var(--color-success-tint)', color: 'var(--color-success)' },
  reserved:  { label: 'Rezervuotas', bg: 'var(--color-warning-tint)', color: 'var(--color-warning)' },
  available: { label: 'Laisvas',     bg: 'var(--color-cloud-canvas)', color: 'var(--color-muted-ash)' },
};

const serviceStatusMap: Record<string, { label: string; bg: string; color: string }> = {
  done:     { label: 'Aktyvuota', bg: 'var(--color-success-tint)', color: 'var(--color-success)' },
  progress: { label: 'Vykdoma',  bg: 'var(--color-teal-tint)',    color: 'var(--color-teal)' },
  pending:  { label: 'Laukiama', bg: 'var(--color-cloud-canvas)', color: 'var(--color-muted-ash)' },
};

interface Props {
  type: 'defect' | 'step' | 'estate' | 'unit' | 'service';
  value: string;
}

export default function StatusPill({ type, value }: Props) {
  let label = value;
  let bg = 'var(--color-cloud-canvas)';
  let color = 'var(--color-muted-ash)';

  if (type === 'defect') {
    const m = defectMap[value as DefectStatus];
    if (m) { label = m.label; bg = m.bg; color = m.color; }
  } else if (type === 'step') {
    const m = stepMap[value as StepStatus];
    if (m) { label = m.label; bg = m.bg; color = m.color; }
  } else if (type === 'estate') {
    const m = estateStatusMap[value];
    if (m) { bg = m.bg; color = m.color; }
  } else if (type === 'unit') {
    const m = unitStatusMap[value];
    if (m) { label = m.label; bg = m.bg; color = m.color; }
  } else if (type === 'service') {
    const m = serviceStatusMap[value];
    if (m) { label = m.label; bg = m.bg; color = m.color; }
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 10px',
      borderRadius: 'var(--radius-pill)',
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.01em',
      background: bg,
      color,
    }}>
      {type === 'step' && value === 'done' && <Check size={11} strokeWidth={2.5} />}
      {label}
    </span>
  );
}
