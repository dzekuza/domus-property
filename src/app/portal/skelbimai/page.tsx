'use client';

import { useState } from 'react';
import { Plus, Trash2, Tag, Phone, Mail, X, Search, Info, KeyRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import Btn from '@/components/shared/Btn';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/lib/store';
import type { BulletinCategory } from '@/lib/types';

const CATEGORIES: { value: BulletinCategory; label: string; color: string; bg: string; icon: LucideIcon }[] = [
  { value: 'Parduodu',    label: 'Parduodu',    color: '#076836', bg: 'rgba(7,104,54,0.09)',   icon: Tag      },
  { value: 'Ieškau',     label: 'Ieškau',      color: '#7c3aed', bg: 'rgba(124,58,237,0.09)', icon: Search   },
  { value: 'Informacija', label: 'Informacija', color: '#0369a1', bg: 'rgba(3,105,161,0.09)',  icon: Info     },
  { value: 'Prarasta',   label: 'Prarasta',    color: '#b45309', bg: 'rgba(180,83,9,0.09)',    icon: KeyRound },
];

const ALL_FILTER = 'Visi';

function categoryConfig(cat: BulletinCategory) {
  return CATEGORIES.find(c => c.value === cat) ?? CATEGORIES[0];
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'Ką tik';
  if (mins < 60) return `prieš ${mins} min.`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `prieš ${hrs} val.`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `prieš ${days} d.`;
  return new Date(iso).toLocaleDateString('lt-LT');
}

const EMPTY_FORM = { category: 'Parduodu' as BulletinCategory, title: '', body: '', contact: '' };

export default function SkelbimaiPage() {
  const { bulletinPosts, addBulletinPost, deleteBulletinPost, session } = useStore();

  const [filter, setFilter]     = useState<BulletinCategory | typeof ALL_FILTER>(ALL_FILTER);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [errors, setErrors]     = useState<Partial<typeof EMPTY_FORM>>({});
  const [submitting, setSubmitting] = useState(false);

  const userId = session.userId;

  const visible = filter === ALL_FILTER
    ? bulletinPosts
    : bulletinPosts.filter(p => p.category === filter);

  function validate() {
    const e: Partial<typeof EMPTY_FORM> = {};
    if (!form.title.trim()) e.title = 'Įveskite pavadinimą';
    if (!form.body.trim())  e.body  = 'Įveskite aprašymą';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    addBulletinPost({ category: form.category, title: form.title.trim(), body: form.body.trim(), contact: form.contact.trim() || undefined });
    setForm(EMPTY_FORM); setErrors({}); setSubmitting(false); setDialogOpen(false);
  }

  function openDialog() { setForm(EMPTY_FORM); setErrors({}); setDialogOpen(true); }

  return (
    <>
      <PageShell
        title="Skelbimų lenta"
        subtitle="Gyventojų skelbimai ir pranešimai"
        actions={<Btn variant="primary" onClick={openDialog} icon={<Plus size={14} />}>Rašyti skelbimą</Btn>}
        bodyStyle={{ padding: '16px 24px 24px' }}
      >
        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[ALL_FILTER, ...CATEGORIES.map(c => c.value)].map((cat) => {
            const active = filter === cat;
            const cfg = cat !== ALL_FILTER ? categoryConfig(cat as BulletinCategory) : null;
            const CatIcon = cfg?.icon;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat as BulletinCategory | typeof ALL_FILTER)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 14px', borderRadius: 'var(--radius-pill)', fontSize: 13, fontWeight: active ? 600 : 500,
                  cursor: 'pointer', border: 'none', fontFamily: 'inherit', transition: 'all 0.15s',
                  background: active ? (cfg?.color ?? 'rgba(255,255,255,0.18)') : 'rgba(255,255,255,0.07)',
                  color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                }}
              >
                {CatIcon && <CatIcon size={12} />}
                {cat}
                {cat !== ALL_FILTER && (
                  <span style={{ fontSize: 11, opacity: 0.75 }}>
                    {bulletinPosts.filter(p => p.category === cat).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Posts grid */}
        {visible.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.50)', marginBottom: 6 }}>Skelbimų nėra</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Būkite pirmi — parašykite skelbimą!</p>
          </div>
        ) : (
          <div className="bulletin-grid">
            {visible.map((post) => {
              const cfg = categoryConfig(post.category);
              const isOwn = post.authorId === userId;
              return (
                <div
                  key={post.id}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: 14,
                    display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 16px 14px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: cfg.color, background: cfg.bg, padding: '3px 10px', borderRadius: 100 }}>
                        <cfg.icon size={11} />
                        {cfg.label}
                      </span>
                      {isOwn && (
                        <button
                          onClick={() => deleteBulletinPost(post.id)}
                          title="Ištrinti skelbimą"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.40)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--color-danger)')}
                          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.40)')}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.92)', lineHeight: 1.3, fontFamily: 'var(--font-display)' }}>
                      {post.title}
                    </p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)', lineHeight: 1.6, flex: 1 }}>
                      {post.body}
                    </p>
                    {post.contact && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: 8 }}>
                        {post.contact.includes('@')
                          ? <Mail size={13} style={{ color: 'rgba(255,255,255,0.55)', flexShrink: 0 }} />
                          : <Phone size={13} style={{ color: 'rgba(255,255,255,0.55)', flexShrink: 0 }} />
                        }
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.88)' }}>{post.contact}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.55)', flexShrink: 0, border: '1px solid rgba(255,255,255,0.10)' }}>
                        {post.authorName[0]}
                      </div>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', fontWeight: 500 }}>
                        {post.authorName}
                        <span style={{ opacity: 0.6 }}> · Butas {post.unitNumber}</span>
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', flexShrink: 0, marginLeft: 8 }}>
                      {relativeTime(post.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageShell>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--font-display)' }}>Naujas skelbimas</DialogTitle>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500 }}>Kategorija</label>
              <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v as BulletinCategory }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <c.icon size={13} style={{ color: c.color }} />{c.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500 }}>Pavadinimas <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <Input placeholder="pvz. Parduodu sofą…" value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(x => ({ ...x, title: undefined })); }} style={errors.title ? { borderColor: 'var(--color-danger)' } : undefined} />
              {errors.title && <p style={{ fontSize: 12, color: 'var(--color-danger)', marginTop: -2 }}>{errors.title}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500 }}>Aprašymas <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <Textarea placeholder="Detaliau aprašykite skelbimą…" rows={4} value={form.body} onChange={e => { setForm(f => ({ ...f, body: e.target.value })); setErrors(x => ({ ...x, body: undefined })); }} style={errors.body ? { borderColor: 'var(--color-danger)', resize: 'vertical' } : { resize: 'vertical' }} />
              {errors.body && <p style={{ fontSize: 12, color: 'var(--color-danger)', marginTop: -2 }}>{errors.body}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500 }}>Kontaktai <span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.45)' }}>(neprivaloma)</span></label>
              <Input placeholder="Telefonas arba el. paštas" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
              <Btn variant="secondary" onClick={() => setDialogOpen(false)} icon={<X size={13} />}>Atšaukti</Btn>
              <Btn variant="primary" onClick={handleSubmit} disabled={submitting} icon={<Plus size={13} />}>Skelbti</Btn>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
