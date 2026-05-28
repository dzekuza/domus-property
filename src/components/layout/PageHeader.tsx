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
    <div style={{ marginBottom: 24 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          {breadcrumbs.map((bc, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {i > 0 && <ChevronRight size={14} style={{ color: 'var(--color-muted-ash-2)' }} />}
              {bc.href
                ? <Link href={bc.href} style={{ fontSize: 13, color: 'var(--color-muted-ash-2)', textDecoration: 'none' }}>{bc.label}</Link>
                : <span style={{ fontSize: 13, color: 'var(--color-muted-ash-2)' }}>{bc.label}</span>
              }
            </span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.2, letterSpacing: '-0.52px', color: 'var(--color-midnight-ink)', margin: 0 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 14, color: 'var(--color-muted-ash-2)', marginTop: 4 }}>{subtitle}</p>
          )}
        </div>
        {actions && <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>{actions}</div>}
      </div>
    </div>
  );
}
