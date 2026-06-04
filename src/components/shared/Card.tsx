interface CardProps {
  children: React.ReactNode;
  flat?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function Card({ children, flat, style, className }: CardProps) {
  return (
    <div
      className={flat ? className : `glass ${className ?? ''}`}
      style={{
        background: flat ? 'rgba(240, 237, 232, 0.55)' : undefined,
        borderRadius: 'var(--radius-card)',
        padding: 24,
        ...(flat ? { border: 'none', boxShadow: 'none' } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
