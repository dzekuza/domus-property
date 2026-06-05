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
      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
        <Icon size={24} strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.55)' }} />
      </div>
      <p style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{title}</p>
      {subtitle && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', maxWidth: 300 }}>{subtitle}</p>}
      {action && <Btn variant="primary" onClick={action.onClick} style={{ marginTop: 8 }}>{action.label}</Btn>}
    </div>
  );
}
