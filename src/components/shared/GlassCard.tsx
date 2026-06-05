import { CSSProperties } from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  style?: CSSProperties;
  className?: string;
  padding?: string;
  cornerRadius?: number;
}

/**
 * Frosted-glass card built on the proven `.glass` CSS pattern:
 * a transparent parent with a `::before` pseudo-element carrying the
 * `backdrop-filter`. This stays in normal document flow (no absolute
 * positioning, no canvas, no double render), so it fills its container
 * and never offsets from its content — unlike a WebGL displacement shader.
 *
 * Renders as a plain element, so it is RSC-safe (no `'use client'` needed).
 */
export default function GlassCard({
  children,
  style,
  className,
  padding = '24px',
  cornerRadius = 20,
}: GlassCardProps) {
  return (
    <div
      className={['glass', className].filter(Boolean).join(' ')}
      style={{ padding, borderRadius: cornerRadius, ...style }}
    >
      {children}
    </div>
  );
}
