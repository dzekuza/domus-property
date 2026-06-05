'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Building2, Home, ImagePlus, Users, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import type { CommunityMention } from '@/lib/types';
import PageHeader from '@/components/layout/PageHeader';
import Btn from '@/components/shared/Btn';
import EmptyState from '@/components/shared/EmptyState';
import CommunityPostCard from '@/components/community/CommunityPostCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ─── Admin compose dialog ─────────────────────────────────────────────────────

interface AdminComposeProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (estateId: string, body: string, files: File[], mentions: CommunityMention[]) => Promise<void>;
  estates: { id: string; name: string }[];
  units: { id: string; estateId: string; number: string }[];
}

function AdminComposeDialog({ open, onClose, onSubmit, estates, units }: AdminComposeProps) {
  const [selectedEstateId, setSelectedEstateId] = useState('');
  const [body, setBody] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [mentions, setMentions] = useState<CommunityMention[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const tagOptions = useMemo<CommunityMention[]>(() => {
    if (!selectedEstateId) return [];
    const estate = estates.find(e => e.id === selectedEstateId);
    if (!estate) return [];
    return [
      { type: 'estate', id: estate.id, label: estate.name },
      ...units.filter(u => u.estateId === selectedEstateId).map(u => ({ type: 'unit' as const, id: u.id, label: u.number })),
    ];
  }, [selectedEstateId, estates, units]);

  const filteredOptions = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return q === '' ? tagOptions : tagOptions.filter(o => o.label.toLowerCase().includes(q));
  }, [tagOptions, mentionQuery]);

  function handleBodyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setBody(val);
    const cursor = e.target.selectionStart ?? val.length;
    const before = val.slice(0, cursor);
    const match = before.match(/@([^\s@]*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setMentionStart(cursor - match[0].length);
    } else {
      setMentionQuery(null);
    }
  }

  function selectMention(opt: CommunityMention) {
    const after = body.slice(mentionStart + 1 + (mentionQuery?.length ?? 0));
    setBody(body.slice(0, mentionStart) + `@${opt.label} ` + after);
    setMentions(prev => prev.find(m => m.id === opt.id) ? prev : [...prev, opt]);
    setMentionQuery(null);
  }

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
    if (!trimmed || !selectedEstateId) return;
    setSubmitting(true);
    await onSubmit(selectedEstateId, trimmed, imageFiles, mentions);
    setBody(''); setImageFiles([]); setImagePreviews([]); setMentions([]);
    setSelectedEstateId('');
    setSubmitting(false);
    onClose();
  }

  function handleClose() {
    setBody(''); setImageFiles([]); setImagePreviews([]); setMentions([]); setMentionQuery(null);
    setSelectedEstateId('');
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent style={{ maxWidth: 520 }}>
        <DialogHeader><DialogTitle>Naujas įrašas</DialogTitle></DialogHeader>

        {/* Estate selector */}
        <Select value={selectedEstateId} onValueChange={(v) => { setSelectedEstateId(v ?? ''); setMentions([]); }}>
          <SelectTrigger>
            <SelectValue placeholder="Pasirinkite namą…" />
          </SelectTrigger>
          <SelectContent>
            {estates.map(e => (
              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Mention dropdown + textarea */}
        <div style={{ position: 'relative' }}>
          {mentionQuery !== null && filteredOptions.length > 0 && (
            <div className="glass" style={{
              position: 'absolute', bottom: '100%', left: 0, right: 0, zIndex: 60,
              borderRadius: 12,
              maxHeight: 180, overflowY: 'auto',
              marginBottom: 4,
            }}>
              {filteredOptions.map(opt => (
                <button
                  key={opt.id}
                  onMouseDown={e => { e.preventDefault(); selectMention(opt); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                    padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 13, color: 'var(--color-midnight-ink)', textAlign: 'left',
                  }}
                >
                  {opt.type === 'estate'
                    ? <Building2 size={14} style={{ color: 'var(--color-electric-violet)', flexShrink: 0 }} />
                    : <Home size={14} style={{ color: 'var(--color-electric-violet)', flexShrink: 0 }} />
                  }
                  <span style={{ fontWeight: 500 }}>{opt.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-ash)', marginLeft: 'auto' }}>
                    {opt.type === 'estate' ? 'Namas' : 'Butas'}
                  </span>
                </button>
              ))}
            </div>
          )}

          <Textarea
            placeholder={selectedEstateId ? 'Rašykite pranešimą… Naudokite @ norėdami pažymėti butą ar namą.' : 'Pirmiau pasirinkite namą.'}
            value={body}
            onChange={handleBodyChange}
            onBlur={() => setTimeout(() => setMentionQuery(null), 150)}
            disabled={!selectedEstateId}
            rows={5}
            style={{ resize: 'none', fontSize: 14 }}
          />
        </div>

        {/* Active mentions */}
        {mentions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {mentions.map(m => (
              <span key={m.id} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 12, fontWeight: 500, color: 'var(--color-electric-violet)',
                background: 'var(--color-violet-tint)', borderRadius: 'var(--radius-pill)',
                padding: '3px 10px',
              }}>
                {m.type === 'estate' ? <Building2 size={11} /> : <Home size={11} />}
                @{m.label}
                <button
                  onClick={() => setMentions(prev => prev.filter(x => x.id !== m.id))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'inherit' }}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Image previews */}
        {imagePreviews.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {imagePreviews.map((src, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden' }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  onClick={() => removeImage(i)}
                  style={{
                    position: 'absolute', top: 4, right: 4, width: 20, height: 20,
                    background: 'rgba(0,0,0,0.55)', borderRadius: '50%', border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  }}
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e => handleImageFiles(e.target.files)} />

        <DialogFooter style={{ justifyContent: 'space-between' }}>
          <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()} style={{ gap: 6 }} disabled={!selectedEstateId}>
            <ImagePlus size={15} /> Nuotrauka
          </Button>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={handleClose}>Atšaukti</Button>
            <Button onClick={handleSubmit} disabled={!body.trim() || !selectedEstateId || submitting}>
              {submitting ? 'Skelbiama…' : 'Skelbti'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminBendruomenePage() {
  const { session, estates, units, communityPosts, addCommunityPost, deleteCommunityPost, toggleCommunityPostLike } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterEstateId, setFilterEstateId] = useState('all');

  const userId = session.userId ?? '';

  const posts = filterEstateId === 'all'
    ? [...communityPosts].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : communityPosts.filter(p => p.estateId === filterEstateId);

  const handleSubmit = useCallback(async (estateId: string, body: string, files: File[], mentions: CommunityMention[]) => {
    await addCommunityPost(estateId, body, files, mentions);
  }, [addCommunityPost]);

  return (
    <div>
      <PageHeader
        title="Bendruomenė"
        subtitle="Visų namų bendruomenių įrašai"
        actions={
          <Btn variant="primary" size="sm" onClick={() => setDialogOpen(true)}>
            Rašyti įrašą
          </Btn>
        }
      />

      {/* Estate filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {[{ id: 'all', name: 'Visi namai' }, ...estates].map(e => (
          <button
            key={e.id}
            onClick={() => setFilterEstateId(e.id)}
            style={{
              padding: '5px 14px', borderRadius: 'var(--radius-pill)', fontSize: 13, fontWeight: 500,
              border: '1px solid',
              borderColor: filterEstateId === e.id ? 'var(--color-electric-violet)' : 'rgba(255,255,255,0.12)',
              color: filterEstateId === e.id ? 'var(--color-electric-violet)' : 'rgba(255,255,255,0.6)',
              background: filterEstateId === e.id ? 'var(--color-violet-tint)' : 'transparent',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {e.name}
          </button>
        ))}
      </div>

      {posts.length === 0 ? (
        <EmptyState icon={Users} title="Nėra įrašų" subtitle="Šiam namui dar nėra bendruomenės įrašų." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {posts.map(post => (
            <CommunityPostCard
              key={post.id}
              post={post}
              currentUserId={userId}
              canDelete={true}
              onLike={toggleCommunityPostLike}
              onDelete={deleteCommunityPost}
            />
          ))}
        </div>
      )}

      <AdminComposeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        estates={estates}
        units={units}
      />
    </div>
  );
}
