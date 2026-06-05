import GlassCard from './GlassCard';

interface CardProps {
  children: React.ReactNode;
  flat?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function Card({ children, flat, style, className }: CardProps) {
  if (flat) {
    return (
      <div
        className={className}
        style={{
          background: 'rgba(22, 24, 30, 0.45)',
          borderRadius: 20,
          padding: 24,
          border: 'none',
          boxShadow: 'none',
          color: 'rgba(255, 255, 255, 0.92)',
          ...style,
        }}
      >
        {children}
      </div>
    );
  }

  const { padding, ...restStyle } = style ?? {};
  const paddingValue = padding != null ? String(padding) : '24px';

  return (
    <GlassCard
      className={className}
      padding={paddingValue}
      cornerRadius={20}
      style={restStyle}
    >
      {children}
    </GlassCard>
  );
}
