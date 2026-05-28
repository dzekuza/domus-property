import type { LucideIcon } from 'lucide-react';
import Btn from './Btn';

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon: Icon, title, subtitle, action }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', gap: 12, textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--color-cloud-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
        <Icon size={24} strokeWidth={1.5} style={{ color: 'var(--color-muted-ash-2)' }} />
      </div>
      <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>{title}</p>
      {subtitle && <p style={{ fontSize: 14, color: 'var(--color-muted-ash-2)', maxWidth: 300 }}>{subtitle}</p>}
      {action && <Btn variant="primary" onClick={action.onClick} style={{ marginTop: 8 }}>{action.label}</Btn>}
    </div>
  );
}
