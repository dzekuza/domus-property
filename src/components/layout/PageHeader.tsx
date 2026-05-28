import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb { label: string; href?: string; }

interface Props {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, breadcrumbs, actions }: Props) {
  return (
    <div className="page-header" style={{
      background: 'var(--color-sidebar-bg)',
      borderRadius: 20,
      padding: '28px 32px',
      marginBottom: 28,
      position: 'relative',
      overflow: 'hidden',
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
              {i > 0 && <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.25)' }} />}
              {bc.href
                ? <Link href={bc.href} style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>{bc.label}</Link>
                : <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{bc.label}</span>
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
            color: '#ffffff',
            margin: 0,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 5, fontWeight: 400 }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </div>
  );
}
