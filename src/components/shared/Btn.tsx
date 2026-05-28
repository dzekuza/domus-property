import React from 'react';

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export default function Btn({ variant = 'primary', size = 'md', icon, children, style, ...rest }: BtnProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 'var(--radius-pill)',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'inherit',
    transition: 'filter 0.15s ease, background 0.12s ease, transform 0.1s ease',
    letterSpacing: '-0.01em',
  };

  const sizes = {
    sm: { padding: '7px 14px', fontSize: 13 },
    md: { padding: '10px 20px', fontSize: 14 },
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--color-accent)',
      color: '#ffffff',
      ...sizes[size],
    },
    secondary: {
      background: 'var(--color-sidebar-bg)',
      color: '#ffffff',
      ...sizes[size],
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-midnight-ink)',
      border: '1px solid var(--color-ghost-border)',
      padding: size === 'sm' ? '6px 12px' : '9px 16px',
      fontSize: 13,
    },
  };

  return (
    <button
      data-variant={variant}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.08)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'none'; }}
      onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; }}
      onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
