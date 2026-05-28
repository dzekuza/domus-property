import React from 'react';

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export default function Btn({ variant = 'primary', size = 'md', icon, children, style, ...rest }: BtnProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    borderRadius: 'var(--radius-pill)', fontWeight: 500, cursor: 'pointer',
    border: 'none', fontFamily: 'inherit', transition: 'filter .15s, background .12s',
  };

  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: 'var(--color-electric-violet)', color: 'var(--color-paper-white)', padding: size === 'sm' ? '7px 14px' : '10px 20px', fontSize: size === 'sm' ? 13 : 14 },
    secondary: { background: 'var(--color-midnight-ink)', color: 'var(--color-paper-white)', padding: size === 'sm' ? '7px 14px' : '10px 20px', fontSize: size === 'sm' ? 13 : 14 },
    ghost:     { background: 'transparent', color: 'var(--color-midnight-ink)', border: '1px solid var(--color-ghost-border)', padding: size === 'sm' ? '5px 12px' : '8px 16px', fontSize: 13 },
  };

  return (
    <button style={{ ...base, ...variants[variant], ...style }} {...rest}>
      {icon}
      {children}
    </button>
  );
}
