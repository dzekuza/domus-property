'use client';

import { useRef, useState } from 'react';
import { Building2, ImagePlus, Trash2, Users, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageShell from '@/components/layout/PageShell';
import Btn from '@/components/shared/Btn';
import Avatar from '@/components/shared/Avatar';
import EmptyState from '@/components/shared/EmptyState';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const innerSection: React.CSSProperties = {
  background: 'var(--color-surface-raised)',
  border: '1px solid var(--color-ghost-border)',
  borderRadius: 14,
  overflow: 'hidden',
};

function ComposeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { session, users, estates, addProgressUpdate } = useStore();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [estateId, setEstateId] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const owners = users.filter(u => u.role === 'owner');
  const allSelected = owners.length > 0 && selectedUserIds.length === owners.length;

  function toggleUser(id: string) {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function toggleAll() {
    setSelectedUserIds(allSelected ? [] : owners.map(u => u.id));
  }

  async function handleImages(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files);
    const previews = await Promise.all(arr.map(f => new Promise<string>(res => {
      const r = new FileReader();
      r.onload = e => res(e.target?.result as string);
      r.readAsDataURL(f);
    })));
    setImageFiles(prev => [...prev, ...arr]);
    setImagePreviews(prev => [...prev, ...previews]);
  }

  function removeImage(i: number) {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit() {
    if (!title.trim() || !body.trim() || selectedUserIds.length === 0) return;
    setSubmitting(true);
    await addProgressUpdate({
      estateId: estateId || undefined,
      title: title.trim(),
      body: body.trim(),
      notifiedUserIds: selectedUserIds,
      imageFiles,
    });
    setTitle(''); setBody(''); setSelectedUserIds([]); setEstateId('');
    setImageFiles([]); setImagePreviews([]);
    setSubmitting(false);
    onClose();
  }

  function handleClose() {
    setTitle(''); setBody(''); setSelectedUserIds([]); setEstateId('');
    setImageFiles([]); setImagePreviews([]);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent style={{ maxWidth: 560 }}>
        <DialogHeader><DialogTitle>Naujas atnaujinimas</DialogTitle></DialogHeader>

        {/* Estate (optional) */}
        <select
          value={estateId}
          onChange={e => setEstateId(e.target.value)}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 13,
            border: '1px solid var(--color-ghost-border)',
            background: 'var(--color-surface-raised)',
            color: 'var(--color-midnight-ink)', outline: 'none',
          }}
        >
          <option value="">Visi objektai (nefiltruota)</option>
          {estates.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>

        {/* Title */}
        <input
          placeholder="Antraštė…"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 14,
            border: '1px solid var(--color-ghost-border)',
            background: 'var(--color-surface-raised)',
            color: 'var(--color-midnight-ink)', outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        {/* Body */}
        <textarea
          placeholder="Aprašykite darbu eigą…"
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={5}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 14,
            border: '1px solid var(--color-ghost-border)',
            background: 'var(--color-surface-raised)',
            color: 'var(--color-midnight-ink)', outline: 'none',
            resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />

        {/* Image previews */}
        {imagePreviews.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {imagePreviews.map((src, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden' }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: 3, right: 3, width: 20, height: 20, background: 'rgba(0,0,0,0.55)', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Owner selector */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted-ash)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pranešti savininkams
            </p>
            <button
              onClick={toggleAll}
              style={{ fontSize: 12, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              {allSelected ? 'Atžymėti visus' : 'Pasirinkti visus'}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
            {owners.map(u => {
              const checked = selectedUserIds.includes(u.id);
              return (
                <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 8, cursor: 'pointer', background: checked ? 'rgba(118,192,61,0.07)' : 'transparent', border: `1px solid ${checked ? 'rgba(118,192,61,0.25)' : 'transparent'}`, transition: 'all 0.12s' }}>
                  <input type="checkbox" checked={checked} onChange={() => toggleUser(u.id)} style={{ accentColor: 'var(--color-accent)', width: 15, height: 15, flexShrink: 0 }} />
                  <Avatar name={u.fullName} size={26} bg={u.avatarBg} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-midnight-ink)' }}>{u.fullName}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', marginLeft: 'auto' }}>{u.email}</span>
                </label>
              );
            })}
          </div>
          {selectedUserIds.length > 0 && (
            <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', marginTop: 6 }}>
              Pasirinkta: {selectedUserIds.length} savininkas(-ų)
            </p>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e => handleImages(e.target.files)} />

        <DialogFooter style={{ justifyContent: 'space-between' }}>
          <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()} style={{ gap: 6 }}>
            <ImagePlus size={15} /> Nuotrauka
          </Button>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={handleClose}>Atšaukti</Button>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || !body.trim() || selectedUserIds.length === 0 || submitting}
            >
              {submitting ? 'Skelbiama…' : 'Paskelbti'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DarbuEigaPage() {
  const { progressUpdates, deleteProgressUpdate, users, estates } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <PageShell
        title="Darbu eiga"
        subtitle="Statybos ir remonto darbų atnaujinimai savininkams"
        actions={
          <Btn variant="primary" size="sm" onClick={() => setDialogOpen(true)}>
            Naujas atnaujinimas
          </Btn>
        }
        bodyStyle={{ padding: '20px 28px 28px' }}
      >
        {progressUpdates.length === 0 ? (
          <EmptyState icon={Building2} title="Nėra atnaujinimų" subtitle='Paspauskite "Naujas atnaujinimas" norėdami informuoti savininkus apie darbu eigą.' />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {progressUpdates.map(update => {
              const estate = update.estateId ? estates.find(e => e.id === update.estateId) : null;
              const notified = users.filter(u => update.notifiedUserIds.includes(u.id));
              return (
                <div key={update.id} style={innerSection}>
                  {/* Header */}
                  <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid var(--color-ghost-border)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--color-midnight-ink)', margin: 0 }}>
                          {update.title}
                        </h3>
                        {estate && (
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-accent)', background: 'var(--color-accent-tint)', padding: '2px 8px', borderRadius: 100 }}>
                            {estate.name}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>
                        {update.authorName} · {new Date(update.createdAt).toLocaleDateString('lt-LT', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteProgressUpdate(update.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted-ash-2)', padding: 4, borderRadius: 6, display: 'flex', flexShrink: 0 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '12px 18px' }}>
                    <p style={{ fontSize: 14, color: 'var(--color-midnight-ink)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{update.body}</p>
                  </div>

                  {/* Images */}
                  {update.imageUrls && update.imageUrls.length > 0 && (
                    <div style={{ padding: '0 18px 14px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                      {update.imageUrls.map((url, i) => (
                        <div key={i} style={{ aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden' }}>
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notified owners */}
                  <div style={{ padding: '10px 18px 14px', borderTop: '1px solid var(--color-ghost-border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Users size={13} style={{ color: 'var(--color-muted-ash-2)', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', marginRight: 4 }}>Pranešta:</span>
                    {notified.map(u => (
                      <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.04)', borderRadius: 100, padding: '3px 9px 3px 4px' }}>
                        <Avatar name={u.fullName} size={18} bg={u.avatarBg} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-midnight-ink)' }}>{u.fullName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageShell>

      <ComposeDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}
