'use client';

import { useState, useRef } from 'react';
import { Paperclip, Send, Mic, Type, Wand2, X, Eye, Layers, Receipt, CheckCircle, AlertCircle } from 'lucide-react';
import Spinner from '@/components/shared/Spinner';
import { useStore } from '@/lib/store';
import Btn from '@/components/shared/Btn';
import Card from '@/components/shared/Card';
import VoiceRecorder from './VoiceRecorder';
import { generateId } from '@/lib/files';
import { toDataURL } from '@/lib/files';
import type { WorkAttachment, WorkUpdate } from '@/lib/types';

interface BillAnalysis {
  vendor_name: string;
  bill_date: string;
  total_amount: number;
  currency?: string;
  items: Array<{ description: string; quantity?: number; unit_price?: number; line_total?: number }>;
}

interface Props {
  engagementId: string;
  authorId: string;
  authorName: string;
  authorRole: 'work_manager' | 'worker';
  showOwnerToggle?: boolean;
  groupedUpdates?: WorkUpdate[];
  onRemoveGrouped?: (id: string) => void;
  onGroupSent?: () => void;
}

type Tab = 'text' | 'voice';

export default function UpdateForm({ engagementId, authorId, authorName, authorRole, showOwnerToggle = false, groupedUpdates = [], onRemoveGrouped, onGroupSent }: Props) {
  const { submitWorkUpdate, addExpense, workEngagements } = useStore();
  const unitId = workEngagements.find(e => e.id === engagementId)?.unitId ?? '';
  const [tab, setTab] = useState<Tab>('text');
  const [text, setText] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<WorkAttachment[]>([]);
  const [transcribing, setTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toOwner, setToOwner] = useState(false);
  const [billImage, setBillImage] = useState<{ dataUrl: string; name: string } | null>(null);
  const [billAnalyzing, setBillAnalyzing] = useState(false);
  const [billData, setBillData] = useState<BillAnalysis | null>(null);
  const [billError, setBillError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const billRef = useRef<HTMLInputElement>(null);

  function handleRecorded(blob: Blob, dataUrl: string) {
    setAudioBlob(blob);
    setAudioDataUrl(dataUrl);
    setTranscription('');
    setText('');
  }

  async function transcribe() {
    if (!audioBlob) return;
    setTranscribing(true);
    try {
      const fd = new FormData();
      fd.append('audio', audioBlob, 'recording.webm');
      const res = await fetch('/api/transcribe', { method: 'POST', body: fd });
      const data = await res.json() as { text?: string; error?: string };
      if (data.text) {
        setTranscription(data.text);
        setText(data.text);
      }
    } catch {
      /* silently fail — user can type manually */
    }
    setTranscribing(false);
  }

  async function handleAttachment(file: File) {
    try {
      const dataUrl = await toDataURL(file);
      const att: WorkAttachment = {
        id: generateId(),
        name: file.name,
        mimeType: file.type,
        dataUrl,
      };
      setAttachments(prev => [...prev, att]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Klaida įkeliant failą');
    }
  }

  async function handleBill(file: File) {
    if (!file.type.startsWith('image/')) return;
    setBillError(false);
    try {
      const dataUrl = await toDataURL(file);
      setBillImage({ dataUrl, name: file.name });
      setBillData(null);
      setBillAnalyzing(true);
      const res = await fetch('/api/analyze-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl: dataUrl }),
      });
      const data = await res.json() as BillAnalysis & { error?: string };
      if (data.error) { setBillError(true); } else { setBillData(data); }
    } catch {
      setBillError(true);
    }
    setBillAnalyzing(false);
  }

  const hasGrouped = groupedUpdates.length > 0;

  async function handleSubmit() {
    if (!text.trim() && !audioDataUrl && !hasGrouped) return;
    setSubmitting(true);

    // Merge grouped worker updates into text + collect their image attachments
    let mergedText = text.trim();
    const mergedAttachments = [...attachments];
    if (hasGrouped) {
      const groupedLines = groupedUpdates.map(u =>
        `${u.authorName}: ${u.text || '[balso žinutė]'}`
      ).join('\n\n');
      mergedText = mergedText ? `${mergedText}\n\n---\n${groupedLines}` : groupedLines;
      for (const u of groupedUpdates) {
        for (const att of u.attachments) {
          if (att.mimeType.startsWith('image/')) mergedAttachments.push(att);
        }
      }
    }

    submitWorkUpdate({
      engagementId,
      authorId,
      authorName,
      authorRole,
      inputType: tab,
      text: mergedText,
      audioDataUrl: audioDataUrl ?? undefined,
      transcription: transcription || undefined,
      translations: {},
      attachments: mergedAttachments,
      toOwner: (showOwnerToggle ? toOwner : undefined) ?? (hasGrouped ? true : undefined),
      groupedIds: hasGrouped ? groupedUpdates.map(u => u.id) : undefined,
      billSummary: billData ? { vendorName: billData.vendor_name, totalAmount: billData.total_amount, currency: billData.currency } : undefined,
    });
    if (billData && billImage && unitId) {
      addExpense({
        engagementId,
        unitId,
        submittedBy: authorId,
        submittedByName: authorName,
        billImageDataUrl: billImage.dataUrl,
        vendorName: billData.vendor_name,
        billDate: billData.bill_date,
        totalAmount: billData.total_amount,
        items: billData.items,
        currency: billData.currency,
      });
    }
    setText('');
    setAudioBlob(null);
    setAudioDataUrl(null);
    setTranscription('');
    setAttachments([]);
    setBillImage(null);
    setBillData(null);
    setBillError(false);
    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    if (hasGrouped) onGroupSent?.();
  }

  const tabBtn = (t: Tab, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setTab(t)}
      style={{
        flex: 1, padding: '9px 0', fontSize: 13, fontWeight: 600,
        cursor: 'pointer', border: 'none', fontFamily: 'inherit', borderRadius: 9,
        background: tab === t ? 'rgba(0,0,0,0.08)' : 'transparent',
        color: tab === t ? 'var(--color-midnight-ink)' : 'var(--color-muted-ash-2)',
        boxShadow: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      {icon}{label}
    </button>
  );

  return (
    <Card>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-midnight-ink)', marginBottom: 14, letterSpacing: '-0.01em' }}>Nauja ataskaita</p>

      {/* Grouped worker updates — badges */}
      {hasGrouped && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Layers size={12} style={{ color: 'var(--color-accent)' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Sugrupuotos ataskaitos ({groupedUpdates.length})
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {groupedUpdates.map(u => {
              const images = u.attachments.filter(a => a.mimeType.startsWith('image/'));
              return (
                <div key={u.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  padding: '8px 10px',
                  background: 'rgba(232,119,60,0.07)',
                  border: '1px solid rgba(232,119,60,0.25)',
                  borderRadius: 10,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-midnight-ink)' }}>{u.authorName}</span>
                    {u.text && (
                      <p style={{ fontSize: 12, color: 'var(--color-muted-ash)', lineHeight: 1.5, marginTop: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {u.text}
                      </p>
                    )}
                    {images.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                        {images.map(img => (
                          <img key={img.id} src={img.dataUrl} alt={img.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--color-ghost-border)' }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveGrouped?.(u.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--color-muted-ash-2)', flexShrink: 0 }}
                    title="Pašalinti iš grupės"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab switcher */}
      <div style={{ display: 'flex', background: 'var(--color-surface-raised)', padding: 4, borderRadius: 12, gap: 4, marginBottom: 16 }}>
        {tabBtn('text', <Type size={13} />, 'Tekstas')}
        {tabBtn('voice', <Mic size={13} />, 'Balsas')}
      </div>

      {tab === 'text' && (
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={4}
          placeholder="Aprašykite šiandienos darbus…"
          style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: 'var(--color-surface-raised)', border: '1px solid var(--color-ghost-border)', borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'inherit', fontWeight: 400, color: 'var(--foreground)', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
        />
      )}

      {tab === 'voice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <VoiceRecorder onRecorded={handleRecorded} />
          {audioDataUrl && (
            <>
              <Btn
                variant="ghost"
                size="sm"
                disabled={transcribing || !audioBlob}
                onClick={transcribe}
                icon={transcribing ? <Spinner size={12} /> : <Wand2 size={12} />}
              >
                {transcribing ? 'Transkribuojama…' : 'Transkribuoti (AI)'}
              </Btn>
              {transcription && (
                <div style={{ padding: '10px 14px', background: 'rgba(139,92,246,0.15)', borderRadius: 10, border: '1px solid rgba(139,92,246,0.25)' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-electric-violet)', marginBottom: 4 }}>Transkripcija:</p>
                  <p style={{ fontSize: 13, color: 'var(--foreground)', lineHeight: 1.5 }}>{transcription}</p>
                </div>
              )}
              <div>
                <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', marginBottom: 6 }}>Arba įveskite tekstą rankiniu būdu:</p>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  rows={3}
                  placeholder="Pastabos prie įrašo…"
                  style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: 'var(--color-surface-raised)', border: '1px solid var(--color-ghost-border)', borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'inherit', fontWeight: 400, color: 'var(--foreground)', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Attachments */}
      <div style={{ marginTop: 12 }}>
        {attachments.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {attachments.map(att => (
              <div key={att.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'var(--color-surface-raised)', borderRadius: 8, fontSize: 12, color: 'var(--color-muted-ash)' }}>
                {att.mimeType.startsWith('image/') ? (
                  <img src={att.dataUrl} alt={att.name} style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: 4 }} />
                ) : (
                  <Paperclip size={12} style={{ color: 'var(--color-muted-ash-2)' }} />
                )}
                <span>{att.name}</span>
                <button onClick={() => setAttachments(p => p.filter(a => a.id !== att.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--color-muted-ash-2)' }}>
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          style={{ display: 'none' }}
          onChange={e => { Array.from(e.target.files ?? []).forEach(handleAttachment); e.target.value = ''; }}
        />
        <input
          ref={billRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleBill(f); e.target.value = ''; }}
        />
        <div style={{ display: 'flex', gap: 16 }}>
          <button
            onClick={() => fileRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-muted-ash)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
          >
            <Paperclip size={13} /> Pridėti priedą
          </button>
          <button
            onClick={() => billRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: billImage ? 'var(--color-accent)' : 'var(--color-muted-ash)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
          >
            <Receipt size={13} /> {billImage ? 'Sąskaita pridėta' : 'Pridėti sąskaitą'}
          </button>
        </div>

        {/* Bill preview + extracted data */}
        {billImage && (
          <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--color-surface-raised)', borderRadius: 10, border: '1px solid var(--color-ghost-border)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={billImage.dataUrl} alt="Sąskaita" style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 6, border: '1px solid var(--color-ghost-border)', background: '#fff' }} />
              <button
                onClick={() => { setBillImage(null); setBillData(null); setBillError(false); }}
                style={{ position: 'absolute', top: -6, right: -6, width: 16, height: 16, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                <X size={9} style={{ color: '#fff' }} />
              </button>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {billAnalyzing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Spinner size={12} color="var(--color-accent)" />
                  <span style={{ fontSize: 12, color: 'var(--color-muted-ash)' }}>AI analizuoja sąskaitą…</span>
                </div>
              )}
              {billError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={12} style={{ color: 'var(--color-danger, #e55)' }} />
                  <span style={{ fontSize: 12, color: 'var(--color-danger, #e55)' }}>Nepavyko nuskaityti — sąskaita bus išsaugota be duomenų</span>
                </div>
              )}
              {billData && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <CheckCircle size={11} style={{ color: 'var(--color-success)' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-success)' }}>Išlaidos nuskaitytos</span>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-midnight-ink)' }}>{billData.vendor_name}</p>
                  <p style={{ fontSize: 11, color: 'var(--color-muted-ash)' }}>{billData.bill_date} · <strong style={{ color: 'var(--color-accent)' }}>{billData.total_amount.toFixed(2)} {billData.currency ?? 'EUR'}</strong></p>
                  {billData.items.length > 0 && (
                    <p style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', marginTop: 2 }}>{billData.items.length} pozicija(-os)</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showOwnerToggle && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, cursor: 'pointer', userSelect: 'none' }}>
          <div
            onClick={() => setToOwner(s => !s)}
            style={{
              width: 36, height: 20, borderRadius: 10, position: 'relative', flexShrink: 0,
              background: toOwner ? 'var(--color-accent)' : 'rgba(0,0,0,0.15)',
              transition: 'background 0.2s', cursor: 'pointer',
            }}
          >
            <div style={{
              position: 'absolute', top: 2, left: toOwner ? 18 : 2,
              width: 16, height: 16, borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: toOwner ? 'var(--color-midnight-ink)' : 'var(--color-muted-ash-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Eye size={12} />
            Rodyti savininkui
          </span>
        </label>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
        {success && <span style={{ fontSize: 13, color: 'var(--color-success)' }}>Ataskaita pateikta!</span>}
        {!success && <span />}
        <Btn
          variant="primary"
          size="sm"
          disabled={submitting || (!text.trim() && !audioDataUrl && !hasGrouped)}
          onClick={handleSubmit}
          icon={<Send size={13} />}
        >
          {submitting ? 'Siunčiama…' : (toOwner || hasGrouped) ? 'Siųsti savininkui' : 'Siųsti ataskaitą'}
        </Btn>
      </div>
    </Card>
  );
}
