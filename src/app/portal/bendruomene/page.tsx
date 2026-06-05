'use client';

import { useCallback, useRef, useState } from 'react';
import { ImagePlus, Users, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageShell from '@/components/layout/PageShell';
import Btn from '@/components/shared/Btn';
import EmptyState from '@/components/shared/EmptyState';
import CommunityPostCard from '@/components/community/CommunityPostCard';
import { Textarea } from '@/components/ui/textarea';


function InlineCompose({ onSubmit }: {
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

  function removeImage(i: number) {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    setSubmitting(true);
    await onSubmit(trimmed, imageFiles, anonymous);
    setBody(''); setImageFiles([]); setImagePreviews([]); setAnonymous(false);
    setSubmitting(false);
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      marginBottom: 20,
      padding: '12px 14px',
    }}>
      {/* Textarea with controls inset at bottom-left */}
      <div style={{ position: 'relative' }}>
        <Textarea
          placeholder="Pasidalinkite naujiena ar klausimu su kaimynais…"
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={3}
          style={{ resize: 'none', fontSize: 14, background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', paddingBottom: 40 }}
        />
        <div style={{ position: 'absolute', bottom: 8, left: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: 12 }}>
            <ImagePlus size={13} /> Nuotrauka
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 12, color: 'var(--muted-foreground)' }}>
            <input
              type="checkbox"
              checked={anonymous}
              onChange={e => setAnonymous(e.target.checked)}
              style={{ width: 13, height: 13, accentColor: 'var(--color-accent)', cursor: 'pointer' }}
            />
            Anonimiškai
          </label>
        </div>
      </div>

      {imagePreviews.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {imagePreviews.map((src, i) => (
            <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden' }}>
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, background: 'rgba(0,0,0,0.55)', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Btn variant="primary" size="sm" onClick={handleSubmit} disabled={!body.trim() || submitting}>
          {submitting ? 'Skelbiama…' : 'Skelbti'}
        </Btn>
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e => handleImageFiles(e.target.files)} />
    </div>
  );
}

export default function BendruomenePage() {
  const { session, units, estates, communityPosts, addCommunityPost, deleteCommunityPost, toggleCommunityPostLike } = useStore();

  const userId = session.userId ?? '';
  const unit = units.find(u => u.ownerUserId === userId);
  const estate = unit ? estates.find(e => e.id === unit.estateId) : null;
  const estateId = estate?.id ?? '';

  const posts = communityPosts.filter(p => p.estateId === estateId);

  const handleSubmit = useCallback(async (body: string, files: File[], anonymous: boolean) => {
    await addCommunityPost(estateId, body, files, [], anonymous);
  }, [addCommunityPost, estateId]);

  return (
    <PageShell
      title="Bendruomenė"
      subtitle="Bendruomenės naujienos ir įrašai"
      bodyStyle={{ padding: '20px 24px 28px' }}
    >
      <InlineCompose onSubmit={handleSubmit} />

      {posts.length === 0 ? (
        <EmptyState icon={Users} title="Čia dar nėra įrašų" subtitle="Būkite pirmas — pasidalinkite naujiena su kaimynais." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {posts.map(post => (
            <CommunityPostCard
              key={post.id}
              post={post}
              currentUserId={userId}
              currentUnitId={unit?.id}
              currentEstateId={estateId}
              onLike={toggleCommunityPostLike}
              onDelete={deleteCommunityPost}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
