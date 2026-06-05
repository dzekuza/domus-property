'use client';

import { useCallback, useRef, useState } from 'react';
import { ImagePlus, Users, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageShell from '@/components/layout/PageShell';
import Btn from '@/components/shared/Btn';
import EmptyState from '@/components/shared/EmptyState';
import CommunityPostCard from '@/components/community/CommunityPostCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

function ComposeDialog({ open, onClose, onSubmit }: {
  open: boolean;
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
    onClose();
  }

  function handleClose() {
    setBody(''); setImageFiles([]); setImagePreviews([]); setAnonymous(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent style={{ maxWidth: 520 }}>
        <DialogHeader><DialogTitle>Naujas įrašas</DialogTitle></DialogHeader>

        <Textarea
          placeholder="Pasidalinkite naujiena ar klausimu su kaimynais…"
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={5}
          style={{ resize: 'none', fontSize: 14 }}
        />

        <label style={{
          display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          padding: '10px 12px', borderRadius: 12,
          background: anonymous ? 'rgba(118,192,61,0.10)' : 'rgba(0,0,0,0.03)',
          border: `1px solid ${anonymous ? 'var(--color-accent)' : 'transparent'}`,
          transition: 'all 0.15s',
          userSelect: 'none',
        }}>
          <input
            type="checkbox"
            checked={anonymous}
            onChange={e => setAnonymous(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: 'var(--color-accent)', cursor: 'pointer', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>Rašyti anonimiškai</div>
            <div style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', marginTop: 1 }}>Jūsų vardas ir buto numeris nebus matomi</div>
          </div>
        </label>

        {imagePreviews.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
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

        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e => handleImageFiles(e.target.files)} />

        <DialogFooter style={{ justifyContent: 'space-between' }}>
          <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()} style={{ gap: 6 }}>
            <ImagePlus size={15} /> Nuotrauka
          </Button>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={handleClose}>Atšaukti</Button>
            <Button onClick={handleSubmit} disabled={!body.trim() || submitting}>
              {submitting ? 'Skelbiama…' : 'Skelbti'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BendruomenePage() {
  const { session, units, estates, communityPosts, addCommunityPost, deleteCommunityPost, toggleCommunityPostLike } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  const userId = session.userId ?? '';
  const unit = units.find(u => u.ownerUserId === userId);
  const estate = unit ? estates.find(e => e.id === unit.estateId) : null;
  const estateId = estate?.id ?? '';

  const posts = communityPosts.filter(p => p.estateId === estateId);

  const handleSubmit = useCallback(async (body: string, files: File[], anonymous: boolean) => {
    await addCommunityPost(estateId, body, files, [], anonymous);
  }, [addCommunityPost, estateId]);

  return (
    <>
      <PageShell
        title="Bendruomenė"
        subtitle="Bendruomenės naujienos ir įrašai"
        actions={<Btn variant="primary" size="sm" onClick={() => setDialogOpen(true)}>Rašyti įrašą</Btn>}
        bodyStyle={{ padding: '20px 24px 28px' }}
      >
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

      <ComposeDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleSubmit} />
    </>
  );
}
