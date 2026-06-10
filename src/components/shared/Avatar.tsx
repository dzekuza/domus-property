import { initials } from '@/lib/fmt';

interface Props {
  name: string;
  bg?: string;
  size?: number;
  avatarUrl?: string;
}

export default function Avatar({ name, bg = 'var(--color-violet-tint)', size = 34, avatarUrl }: Props) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{
          width: size, height: size, borderRadius: '50%', flexShrink: 0,
          objectFit: 'cover', display: 'block',
        }}
      />
    );
  }
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
