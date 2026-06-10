'use client';

import { useCallback, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, Hash, Heart, ImagePlus, MessageSquare, Search, Sparkles, Trash2, TrendingUp, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageShell from '@/components/layout/PageShell';
import Avatar from '@/components/shared/Avatar';
import { Textarea } from '@/components/ui/textarea';
import type { CommunityPost, User } from '@/lib/types';

// ─── static sidebar data ───────────────────────────────────────────────────

const TRENDING = [
  {
    id: 't1',
    title: 'Vasaros šventė kieme',
    body: 'Gyventojai dalinasi idėjomis birželio susitikimo organizavimui.',
  },
  {
    id: 't2',
    title: 'Karšto vandens tiekimo darbai',
    body: 'Informacija apie planuojamus profilaktinius darbus ir laikinuosius grafikus.',
  },
  {
    id: 't3',
    title: 'Naujas dviračių saugojimas',
    body: 'Administracija renka pasiūlymus dėl naujų dviračių saugojimo vietų įrengimo.',
  },
];

const TOPICS = ['Pranešimai', 'Remontai', 'Renginiai', 'Klausimai', 'Komunaliniai', 'Skelbimai'];

const TIPS = [
  { id: 'tip1', author: '@andrius_b12', text: 'Ryte 7–9 val. liftai laisvi — rekomenduoju kraustytis tada.' },
  { id: 'tip2', author: '@laura_a05', text: 'Šalia namo yra puikus parko takas — idealus pasivaikščiojimams su vaikais.' },
];

// ─── helper: derive category from post body ────────────────────────────────

function deriveCategory(body: string): string {
  const lower = body.toLowerCase();
  if (lower.includes('vanduo') || lower.includes('elektra') || lower.includes('šildymas')) return 'Komunaliniai';
  if (lower.includes('susitik') || lower.includes('švent') || lower.includes('organizuo')) return 'Renginiai';
  if (lower.includes('dėmesio') || lower.includes('planuojam') || lower.includes('pranešam')) return 'Pranešimai';
  if (lower.includes('klausim') || lower.includes('ar kas') || lower.includes('žino')) return 'Klausimai';
  if (lower.includes('remontas') || lower.includes('tvarky') || lower.includes('darbai')) return 'Remontai';
  return 'Bendruomenė';
}

// pseudo-random views from post id
function mockViews(id: string) {
  let hash = 0;
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return 120 + (hash % 880);
}

// ─── compose dialog ─────────────────────────────────────────────────────────

function ComposeDialog({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (body: string, files: File[], anonymous: boolean) => Promise<void>;
}) {
  const [body, setBody] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImageFiles(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files);
    const previews = await Promise.all(arr.map(f => new Promise<string>(res => {
      const reader = new FileReader();
      reader.onload = e => res(e.target?.result as string);
      reader.readAsDataURL(f);
    })));
    setImageFiles(prev => [...prev, ...arr]);
    setImagePreviews(prev => [...prev, ...previews]);
  }

  async function handleSubmit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    setSubmitting(true);
    await onSubmit(trimmed, imageFiles, anonymous);
    onClose();
    setSubmitting(false);
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div style={{ width: '100%', maxWidth: 540, background: '#fff', backdropFilter: 'blur(32px) saturate(160%)', border: '1px solid var(--color-ghost-border)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-midnight-ink)' }}>Naujas įrašas</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', padding: 4 }}><X size={18} /></button>
        </div>
        <div style={{ position: 'relative' }}>
          <Textarea
            placeholder="Pasidalinkite naujiena ar klausimu su kaimynais…"
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={5}
            className="resize-none bg-transparent"
          />
          <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 6, background: 'var(--color-surface-hover)', border: '1px solid var(--color-ghost-border)', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: 11 }}>
            <ImagePlus size={12} /> Nuotrauka
          </button>
        </div>
        {imagePreviews.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {imagePreviews.map((src, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden' }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => {
                  setImageFiles(p => p.filter((_, j) => j !== i));
                  setImagePreviews(p => p.filter((_, j) => j !== i));
                }} style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, background: 'rgba(0,0,0,0.6)', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: 'var(--muted-foreground)' }}>
          <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} style={{ width: 13, height: 13, accentColor: 'var(--color-accent)', cursor: 'pointer' }} />
          Skelbti anonimiškai
        </label>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid var(--color-ghost-border)', background: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: 13 }}>Atšaukti</button>
          <button onClick={handleSubmit} disabled={!body.trim() || submitting} style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: 'var(--color-accent)', cursor: body.trim() ? 'pointer' : 'not-allowed', color: '#fff', fontSize: 13, fontWeight: 600, opacity: body.trim() ? 1 : 0.5 }}>
            {submitting ? 'Skelbiama…' : 'Skelbti'}
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e => handleImageFiles(e.target.files)} />
      </div>
    </div>
  );
}

// ─── thread card ─────────────────────────────────────────────────────────────

function ThreadCard({ post, currentUserId, allUsers, onLike, onDelete }: {
  post: CommunityPost;
  currentUserId: string;
  allUsers: User[];
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const liked = post.likedBy.includes(currentUserId);
  const isOwn = post.authorId === currentUserId;
  const category = deriveCategory(post.body);
  const views = mockViews(post.id);

  // Use first sentence / first 80 chars as "title"
  const titleRaw = post.body.split(/[.!?]/)[0].trim();
  const title = titleRaw.length > 80 ? titleRaw.slice(0, 80) + '…' : titleRaw;

  // Real participants: author first, then up to 3 likers
  const authorUser = post.isAnonymous ? null : allUsers.find(u => u.id === post.authorId);
  const likerUsers = post.likedBy
    .map(id => allUsers.find(u => u.id === id))
    .filter(Boolean) as User[];
  const participants: User[] = authorUser
    ? [authorUser, ...likerUsers.filter(u => u.id !== authorUser.id)].slice(0, 4)
    : likerUsers.slice(0, 4);
  const extraCount = Math.max(0, (authorUser ? 1 : 0) + likerUsers.length - 4);

  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid var(--color-ghost-border)' }}>
      {/* Category */}
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted-ash-2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>
        {category}
      </div>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-midnight-ink)', lineHeight: 1.4, flex: 1 }}>
          {title}
        </span>
        {/* Avatar stack */}
        {participants.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {participants.map((user, i) => (
              <div key={user.id} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: participants.length - i, borderRadius: '50%', border: '2px solid #fff' }}>
                <Avatar name={user.fullName} avatarUrl={user.avatarUrl} bg={user.avatarBg} size={26} />
              </div>
            ))}
            {extraCount > 0 && (
              <div style={{ marginLeft: -8, width: 26, height: 26, borderRadius: '50%', background: 'var(--color-surface-hover)', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--muted-foreground)' }}>
                +{extraCount}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Stats row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-muted-ash-2)', flexWrap: 'wrap' }}>
        <button onClick={() => onLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#e53e3e' : 'var(--color-muted-ash-2)', padding: 0, fontSize: 12 }}>
          <Heart size={13} fill={liked ? 'currentColor' : 'none'} strokeWidth={2} />
          {post.likedBy.length} patinka
        </button>
        <span style={{ opacity: 0.4 }}>•</span>
        <span>{views} peržiūrų</span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span>
          {post.isAnonymous ? 'Anonimas' : post.authorName.split(' ')[0]}
          {' '}rašė{' '}
          {new Date(post.createdAt).toLocaleDateString('lt-LT', { month: 'short', day: 'numeric' })}
        </span>
        {isOwn && (
          <>
            <span style={{ opacity: 0.4 }}>•</span>
            <button onClick={() => onDelete(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted-ash-2)', display: 'flex', alignItems: 'center', gap: 3, padding: 0, fontSize: 12 }}>
              <Trash2 size={11} /> Ištrinti
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function BendruomenePage() {
  const { session, users, units, estates, communityPosts, addCommunityPost, deleteCommunityPost, toggleCommunityPostLike } = useStore();
  const [search, setSearch] = useState('');
  const [compose, setCompose] = useState(false);

  const userId = session.userId ?? '';
  const unit = units.find(u => u.ownerUserId === userId);
  const estate = unit ? estates.find(e => e.id === unit.estateId) : null;
  const estateId = estate?.id ?? '';

  const allPosts = communityPosts.filter(p => p.estateId === estateId);
  const posts = search
    ? allPosts.filter(p => p.body.toLowerCase().includes(search.toLowerCase()))
    : allPosts;

  const handleSubmit = useCallback(async (body: string, files: File[], anonymous: boolean) => {
    await addCommunityPost(estateId, body, files, [], anonymous);
  }, [addCommunityPost, estateId]);

  return (
    <PageShell
      title="Bendruomenė"
      subtitle={estate?.name ?? 'Bendruomenės naujienos ir įrašai'}
      bodyStyle={{ padding: '0' }}
    >
      {compose && <ComposeDialog onClose={() => setCompose(false)} onSubmit={handleSubmit} />}

      {/* Hero */}
      <div style={{ padding: '28px 28px 20px', borderBottom: '1px solid var(--color-ghost-border)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-midnight-ink)', margin: '0 0 6px', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
          Dalinkitės, klauskite ir bendraukite
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: '0 0 18px', maxWidth: 520 }}>
          Namo bendruomenė — pasidalinkite naujienomis, užduokite klausimus ir sužinokite, kas vyksta aplink jus.
        </p>

        {/* Search + compose bar */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Ieškoti įrašų…"
              style={{
                width: '100%', boxSizing: 'border-box', paddingLeft: 40, paddingRight: 16, paddingTop: 11, paddingBottom: 11,
                borderRadius: 12, border: '1px solid var(--color-ghost-border)',
                background: 'var(--color-input-bg)', color: 'var(--color-midnight-ink)', fontSize: 14, outline: 'none',
              }}
            />
          </div>
          <button
            onClick={() => setCompose(true)}
            style={{
              width: 44, height: 44, borderRadius: 12, border: 'none', background: 'var(--color-accent)',
              color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              fontSize: 22, lineHeight: 1,
            }}
            aria-label="Naujas įrašas"
          >+</button>
        </div>
      </div>

      {/* Two-column body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 0 }}>

        {/* ── Left: discussions ── */}
        <div style={{ padding: '20px 28px 32px', borderRight: '1px solid var(--color-ghost-border)', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-midnight-ink)' }}>Įrašai</span>
            <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: 12 }}>
              Naujausi <ChevronDown size={13} />
            </button>
          </div>

          {posts.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 14 }}>
              <MessageSquare size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
              <div>Nerasta įrašų</div>
            </div>
          ) : (
            posts.map(post => (
              <ThreadCard
                key={post.id}
                post={post}
                currentUserId={userId}
                allUsers={users}
                onLike={toggleCommunityPostLike}
                onDelete={deleteCommunityPost}
              />
            ))
          )}
        </div>

        {/* ── Right: sidebar ── */}
        <div style={{ padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Trending */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <TrendingUp size={14} style={{ color: 'var(--color-accent)' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-midnight-ink)' }}>Kas vyksta šią savaitę</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {TRENDING.map(item => (
                <div key={item.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--color-ghost-border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-midnight-ink)', marginBottom: 5, lineHeight: 1.35 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.5, marginBottom: 8 }}>{item.body}</div>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent)', fontSize: 12, fontWeight: 600, padding: 0 }}>
                    Skaityti daugiau <ArrowRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Popular topics */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Hash size={14} style={{ color: 'var(--color-accent)' }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-midnight-ink)' }}>Populiarios temos</span>
              </div>
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent)', fontSize: 12, fontWeight: 600, padding: 0 }}>Visos</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {TOPICS.map(topic => (
                <button
                  key={topic}
                  onClick={() => setSearch(topic === 'Pranešimai' ? 'dėmesio' : topic.toLowerCase())}
                  style={{
                    padding: '5px 12px', borderRadius: 100,
                    border: '1px solid var(--color-ghost-border)',
                    background: 'var(--color-surface-raised)',
                    color: 'var(--muted-foreground)', fontSize: 12, cursor: 'pointer',
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          </section>

          {/* Tips exchange */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} style={{ color: 'var(--color-accent)' }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-midnight-ink)' }}>Kaimynų patarimai</span>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent)', fontSize: 12, fontWeight: 600, padding: 0 }}>Visi</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TIPS.map(tip => (
                <div key={tip.id} style={{ padding: '12px 14px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-ghost-border)', borderRadius: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent)', marginBottom: 5 }}>{tip.author}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{tip.text}</div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </PageShell>
  );
}
