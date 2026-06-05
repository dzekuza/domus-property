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
      background: 'var(--glass-sidebar-bg)',
      backdropFilter: 'var(--glass-sidebar-blur)',
      WebkitBackdropFilter: 'var(--glass-sidebar-blur)',
      borderRadius: 20,
      border: '1px solid var(--color-ghost-border)',
      padding: '28px 32px',
      marginBottom: 28,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
    }}>
      {/* Subtle texture dot */}
      <div style={{
        position: 'absolute',
        top: -40, right: -40,
        width: 200, height: 200,
        borderRadius: '50%',
        background: 'rgba(103,205,205,0.07)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: -60, right: 80,
        width: 160, height: 160,
        borderRadius: '50%',
        background: 'rgba(232,119,60,0.06)',
        pointerEvents: 'none',
      }} />

      {breadcrumbs && breadcrumbs.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          {breadcrumbs.map((bc, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {i > 0 && <ChevronRight size={12} style={{ color: 'var(--color-muted-ash-2)' }} />}
              {bc.href
                ? <Link href={bc.href} style={{ fontSize: 12, color: 'var(--color-muted-ash)', textDecoration: 'none' }}>{bc.label}</Link>
                : <span style={{ fontSize: 12, color: 'var(--color-muted-ash)' }}>{bc.label}</span>
              }
            </span>
          ))}
        </div>
      )}

      <div className="page-header-row" style={{ alignItems: 'center' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: 'var(--foreground)',
            margin: 0,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 5, fontWeight: 400 }}>
              {subtitle}
            </p>
          )}
          {(statusBadge || meta) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              {statusBadge && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 100,
                  background: statusBadge.active ? 'rgba(103,205,205,0.18)' : 'rgba(0,0,0,0.08)',
                  color: statusBadge.active ? 'rgba(103,205,205,1)' : 'var(--color-muted-ash)',
                  letterSpacing: '0.03em',
                }}>
                  {statusBadge.label}
                </span>
              )}
              {meta?.map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted-ash)' }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </div>
  );
}
