import { initials } from '@/lib/fmt';

interface Props {
  name: string;
  bg?: string;
  size?: number;
}

export default function Avatar({ name, bg = 'var(--color-violet-tint)', size = 34 }: Props) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 600, color: 'var(--color-electric-violet)',
    }}>
      {initials(name)}
    </div>
  );
}
