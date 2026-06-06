'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
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
  children?: React.ReactNode;
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
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const sel = gsap.utils.selector(cardRef);
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        reduced: '(prefers-reduced-motion: reduce)',
      },
      (ctx) => {
        const { reduced } = (ctx as any).conditions;
        const d = reduced ? 0 : 1; // duration multiplier — 0 collapses all durations

        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

        // 1. Card fades in — no y/transform on the glass card itself because
        //    CSS transform creates an isolated composite layer that breaks
        //    backdrop-filter (blurs white instead of the shader background).
        tl.from(cardRef.current, { autoAlpha: 0, duration: 0.35 })

        // 2. Breadcrumbs (if present)
        .from(sel('[data-ps-breadcrumbs]'), { autoAlpha: 0, y: 8 * d, duration: 0.25 }, '-=0.18')

        // 3. Title
        .from(sel('[data-ps-title]'), { autoAlpha: 0, y: 10 * d, duration: 0.28, clearProps: 'opacity,visibility,transform' }, '-=0.15')

        // 4. Subtitle + meta row (stagger between them)
        .from(sel('[data-ps-subtitle], [data-ps-meta]'), {
          autoAlpha: 0, y: 7 * d, stagger: 0.07, duration: 0.24, clearProps: 'opacity,visibility,transform',
        }, '-=0.12')

        // 5. Actions slide in from the right
        .from(sel('[data-ps-actions]'), { autoAlpha: 0, x: 12 * d, duration: 0.26, clearProps: 'opacity,visibility,transform' }, '-=0.22')

        // 6. Divider expands from left
        .from(sel('[data-ps-divider]'), {
          scaleX: 0, duration: 0.35, transformOrigin: 'left center',
        }, '-=0.1')

        // 7. Body direct children stagger up
        // clearProps only removes GSAP-animated properties — NOT 'all', which
        // would wipe React inline styles (padding, gap, display, etc.).
        .from(sel('[data-ps-body] > *'), {
          autoAlpha: 0, y: 14 * d, stagger: 0.07, duration: 0.32,
          clearProps: 'opacity,visibility,transform',
        }, '-=0.18');
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <div ref={cardRef} className="glass" style={{ padding: 0, borderRadius: 'var(--radius-card)' }}>
      {/* Header region */}
      <div className="page-header" style={{ padding: '24px 28px', position: 'relative' }}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div data-ps-breadcrumbs style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
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

        <div className="page-header-row">
          <h1 data-ps-title style={{
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
            <p data-ps-subtitle style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 5, fontWeight: 400 }}>
              {subtitle}
            </p>
          )}
          {(statusBadge || meta) && (
            <div data-ps-meta style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
              {statusBadge && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 100,
                  background: statusBadge.active ? 'rgba(118,192,61,0.2)' : 'rgba(0,0,0,0.08)',
                  color: statusBadge.active ? '#8dd452' : 'var(--color-muted-ash)',
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
          {actions && <div data-ps-actions className="page-header-actions">{actions}</div>}
        </div>
      </div>

      {/* Divider */}
      <div data-ps-divider style={{ height: 1, background: 'var(--color-ghost-border)' }} />

      {/* Body region */}
      <div data-ps-body style={bodyStyle}>{children}</div>
    </div>
  );
}
