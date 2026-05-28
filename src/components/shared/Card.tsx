interface CardProps {
  children: React.ReactNode;
  flat?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function Card({ children, flat, style, className }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: flat ? 'var(--color-cloud-canvas)' : 'var(--color-paper-white)',
        border: flat ? 'none' : '1px solid var(--color-ghost-border)',
        borderRadius: 'var(--radius-card)',
        boxShadow: flat ? 'none' : 'var(--shadow-card)',
        padding: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
