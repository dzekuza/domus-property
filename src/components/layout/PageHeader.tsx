import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb { label: string; href?: string; }
interface MetaItem { label: string; value: string; }

interface Props {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  statusBadge?: { label: string; active: boolean };
  meta?: MetaItem[];
}

export default function PageHeader({ title, subtitle, breadcrumbs, actions, statusBadge, meta }: Props) {
  return (
    <div className="page-header" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '4px 0 20px',
      gap: 16,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            {breadcrumbs.map((bc, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {i > 0 && <ChevronRight size={12} style={{ color: '#959492' }} />}
                {bc.href
                  ? <Link href={bc.href} style={{ fontSize: 12, color: '#959492', textDecoration: 'none' }}>{bc.label}</Link>
                  : <span style={{ fontSize: 12, color: '#959492' }}>{bc.label}</span>
                }
              </span>
            ))}
          </div>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
        {(statusBadge || meta) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
            {statusBadge && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 100,
                background: statusBadge.active ? 'rgba(118,192,61,0.15)' : 'rgba(3,3,2,0.06)',
                color: statusBadge.active ? '#76c03d' : '#696967',
                letterSpacing: '0.03em',
              }}>
                {statusBadge.label}
              </span>
            )}
            {meta?.map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 11, color: '#959492', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#696967' }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  );
}
