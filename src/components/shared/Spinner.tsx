'use client';

interface Props {
  size?: number;
  color?: string;
}

export default function Spinner({ size = 14, color = 'currentColor' }: Props) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: color,
        borderTopColor: 'transparent',
        animation: 'spinner-rotate 0.7s linear infinite',
        flexShrink: 0,
      }}
    />
  );
}
