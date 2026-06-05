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
  children: React.ReactNode;
  /** Extra styles for the body region (e.g. padding for non-table content). */
  bodyStyle?: React.CSSProperties;
}

/**
 * Unified page card: header (title / actions) and content live inside ONE
 * dark glass card, separated by a hairline divider — instead of two stacked
 * cards with a gap. The header region keeps the `page-header` class so the
 * existing dark-context input/button/icon styling still applies.
 */
export default function PageShell({
  title, subtitle, breadcrumbs, actions, statusBadge, meta, children, bodyStyle,
}: Props) {
  return (
    <div className="glass" style={{ padding: 0, overflow: 'hidden', borderRadius: 24 }}>
      {/* Header region */}
      <div className="page-header" style={{ padding: '24px 28px', position: 'relative' }}>
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
            {(statusBadge || meta) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                {statusBadge && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 100,
                    background: statusBadge.active ? 'rgba(118,192,61,0.2)' : 'rgba(255,255,255,0.1)',
                    color: statusBadge.active ? '#8dd452' : 'rgba(255,255,255,0.45)',
                    letterSpacing: '0.03em',
                  }}>
                    {statusBadge.label}
                  </span>
                )}
                {meta?.map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {actions && <div className="page-header-actions">{actions}</div>}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.10)' }} />

      {/* Body region */}
      <div style={bodyStyle}>{children}</div>
    </div>
  );
}
