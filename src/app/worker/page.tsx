'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import {
  Mic, Square, Send, Paperclip, ChevronDown, ChevronUp,
  Wand2, Loader2, X, Play, Pause, LogOut, Info, RotateCcw,
} from 'lucide-react';
import { toDataURL, generateId } from '@/lib/files';
import { formatRelative } from '@/lib/fmt';
import type { WorkAttachment } from '@/lib/types';

/* ─── Pulse ring animation injected once ─────────────────────────────────── */
const PULSE_STYLE = `
  @keyframes pulse-ring {
    0%   { transform: scale(1);   opacity: 0.5; }
    70%  { transform: scale(1.55); opacity: 0; }
    100% { transform: scale(1.55); opacity: 0; }
  }
  @keyframes record-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;

type Tab = 'voice' | 'text';
type RecordState = 'idle' | 'recording' | 'stopped';

export default function WorkerPage() {
  const router = useRouter();
  const { currentUser, workEngagements, units, estates, submitWorkUpdate, signOut,
    updatesForEngagement, setWorkUpdateTranscription } = useStore();

  const user = currentUser();
  const engagement = user?.engagementId
    ? workEngagements.find(e => e.id === user.engagementId)
    : null;
  const unit = engagement ? units.find(u => u.id === engagement.unitId) : null;
  const estate = unit ? estates.find(e => e.id === unit.estateId) : null;
  const updates = engagement ? updatesForEngagement(engagement.id) : [];

  /* ── UI state ── */
  const [tab, setTab] = useState<Tab>('voice');
  const [showInfo, setShowInfo] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<WorkAttachment[]>([]);
  const [sent, setSent] = useState(false);

  /* ── Voice state ── */
  const [recState, setRecState] = useState<RecordState>('idle');
  const [recSeconds, setRecSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── Voice handlers ── */
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const reader = new FileReader();
        reader.onload = () => setAudioDataUrl(reader.result as string);
        reader.readAsDataURL(blob);
      };
      recorder.start(200);
      mediaRef.current = recorder;
      setRecState('recording');
      setRecSeconds(0);
      timerRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
    } catch {
      alert('Nepavyko pasiekti mikrofono.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecState('stopped');
  }, []);

  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    setAudioDataUrl(null);
    setTranscription('');
    setText('');
    setRecState('idle');
    setRecSeconds(0);
    setPlaying(false);
  }, []);

  async function transcribe() {
    if (!audioBlob) return;
    setTranscribing(true);
    try {
      const fd = new FormData();
      fd.append('audio', audioBlob, 'recording.webm');
      const res = await fetch('/api/transcribe', { method: 'POST', body: fd });
      const data = await res.json() as { text?: string };
      if (data.text) { setTranscription(data.text); setText(data.text); }
    } catch { /* ignore */ }
    setTranscribing(false);
  }

  function togglePlay() {
    if (!audioRef.current || !audioDataUrl) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  }

  async function handleAttachment(file: File) {
    try {
      const dataUrl = await toDataURL(file);
      setAttachments(p => [...p, { id: generateId(), name: file.name, mimeType: file.type, dataUrl }]);
    } catch (e) { alert(e instanceof Error ? e.message : 'Klaida'); }
  }

  async function handleSend() {
    if (!engagement || !user) return;
    const hasContent = tab === 'voice' ? !!audioDataUrl : !!text.trim();
    if (!hasContent && !attachments.length) return;

    submitWorkUpdate({
      engagementId: engagement.id,
      authorId: user.id,
      authorName: user.fullName,
      authorRole: 'worker',
      inputType: tab,
      text: text.trim(),
      audioDataUrl: audioDataUrl ?? undefined,
      transcription: transcription || undefined,
      translations: {},
      attachments,
    });

    setText(''); setAttachments([]); resetRecording();
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  }

  function handleSignOut() { signOut(); router.push('/login'); }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  /* ── No project ── */
  if (!engagement || !unit) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <style>{PULSE_STYLE}</style>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--color-midnight-ink)', marginBottom: 8 }}>Projektas nepriskirtas</p>
          <p style={{ fontSize: 14, color: 'var(--color-muted-ash-2)' }}>Kreipkitės į darbo vadovą dėl priskyrimo.</p>
        </div>
      </div>
    );
  }

  const canSend = tab === 'voice' ? (!!audioDataUrl || !!text.trim()) : !!text.trim();

  return (
    <div className="worker-root" style={{ minHeight: '100dvh', background: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
      <style>{PULSE_STYLE}</style>

      {/* ── Slim context strip ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--color-sidebar-bg)',
        padding: '10px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{estate?.name}</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>Butas {unit.number} · {unit.floor} aukštas</p>
        </div>
        <button
          onClick={() => setShowInfo(s => !s)}
          style={{ width: 32, height: 32, borderRadius: '50%', background: showInfo ? 'var(--color-teal)' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}
          title="Projekto informacija"
        >
          <Info size={14} style={{ color: showInfo ? '#0c3d4a' : 'rgba(255,255,255,0.7)' }} />
        </button>
        <button
          onClick={handleSignOut}
          style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          title="Atsijungti"
        >
          <LogOut size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
        </button>
      </div>

      {/* ── Collapsible info panel ── */}
      {showInfo && (
        <div style={{ background: 'var(--color-sidebar-bg)', padding: '0 20px 16px', animation: 'slide-up 0.2s ease' }}>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 14 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
            {[
              { label: 'Vadovas', value: engagement.managerName },
              { label: 'El. paštas', value: engagement.managerEmail },
              { label: 'Statusas', value: engagement.status === 'active' ? 'Aktyvus' : 'Baigtas' },
              { label: 'Specialybė', value: user?.role === 'worker' ? 'Darbininkas' : 'Vadovas' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div style={{ flex: 1, padding: '24px 20px 32px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 540, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>

        {/* Greeting */}
        <div style={{ animation: 'slide-up 0.3s ease' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--color-midnight-ink)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            Sveiki, {user?.fullName.split(' ')[0]}
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-muted-ash-2)', marginTop: 4 }}>Pateikite šios dienos ataskaitą</p>
        </div>

        {/* ── Main submission zone ── */}
        <div style={{
          background: 'var(--color-sidebar-bg)',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(12,61,74,0.2)',
          animation: 'slide-up 0.35s ease',
        }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', padding: '14px 14px 0' }}>
            {(['voice', 'text'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '10px 0', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', border: 'none', fontFamily: 'inherit',
                  borderRadius: 12, transition: 'background 0.2s, color 0.2s',
                  background: tab === t ? 'rgba(103,205,205,0.18)' : 'transparent',
                  color: tab === t ? 'var(--color-teal)' : 'rgba(255,255,255,0.35)',
                  letterSpacing: '0.02em', textTransform: 'uppercase',
                }}
              >
                {t === 'voice' ? 'Balsas' : 'Tekstas'}
              </button>
            ))}
          </div>

          {/* Voice tab */}
          {tab === 'voice' && (
            <div style={{ padding: '28px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              {recState === 'idle' && (
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Pulse rings */}
                  <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', border: '2px solid rgba(103,205,205,0.3)', animation: 'pulse-ring 2s ease-out infinite', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', border: '2px solid rgba(103,205,205,0.2)', animation: 'pulse-ring 2s ease-out infinite 0.6s', pointerEvents: 'none' }} />
                  <button
                    onClick={startRecording}
                    style={{
                      width: 120, height: 120, borderRadius: '50%',
                      background: 'rgba(103,205,205,0.12)',
                      border: '1.5px solid rgba(103,205,205,0.35)',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                      transition: 'background 0.2s, transform 0.1s, border-color 0.2s',
                      boxShadow: 'inset 0 1px 0 rgba(103,205,205,0.1)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(103,205,205,0.22)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(103,205,205,0.6)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(103,205,205,0.12)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(103,205,205,0.35)'; }}
                    onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)'; }}
                    onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                  >
                    <Mic size={32} style={{ color: 'var(--color-teal)' }} strokeWidth={1.5} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Įrašyti</span>
                  </button>
                </div>
              )}

              {recState === 'recording' && (
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', border: '2px solid rgba(220,38,38,0.4)', animation: 'pulse-ring 1.2s ease-out infinite', pointerEvents: 'none' }} />
                  <button
                    onClick={stopRecording}
                    style={{
                      width: 120, height: 120, borderRadius: '50%',
                      background: 'rgba(220,38,38,0.15)',
                      border: '1.5px solid rgba(220,38,38,0.5)',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                      transition: 'transform 0.1s',
                    }}
                    onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)'; }}
                    onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                  >
                    <Square size={28} style={{ color: '#ef4444', animation: 'record-pulse 1s ease-in-out infinite', fill: '#ef4444' }} />
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', color: '#ef4444', fontVariantNumeric: 'tabular-nums' }}>{fmt(recSeconds)}</span>
                  </button>
                </div>
              )}

              {recState === 'stopped' && audioDataUrl && (
                <div style={{ width: '100%', animation: 'fade-in 0.3s ease' }}>
                  {/* Playback row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.06)', borderRadius: 14, marginBottom: 12 }}>
                    <button
                      onClick={togglePlay}
                      style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--color-teal)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.1s' }}
                      onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.92)'; }}
                      onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                    >
                      {playing ? <Pause size={15} style={{ color: '#0c3d4a' }} /> : <Play size={15} style={{ color: '#0c3d4a' }} />}
                    </button>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Įrašas · {fmt(recSeconds)}</p>
                    </div>
                    <button onClick={resetRecording} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'rgba(255,255,255,0.35)', transition: 'color 0.15s' }} title="Iš naujo">
                      <RotateCcw size={15} />
                    </button>
                  </div>

                  {/* Transcribe */}
                  {!transcription ? (
                    <button
                      onClick={transcribe}
                      disabled={transcribing}
                      style={{
                        width: '100%', padding: '10px 0', fontSize: 13, fontWeight: 600,
                        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 12, cursor: transcribing ? 'default' : 'pointer', fontFamily: 'inherit',
                        color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'background 0.15s',
                      }}
                    >
                      {transcribing
                        ? <><Loader2 size={13} style={{ animation: 'spin-slow 1s linear infinite' }} /> Transkribuojama…</>
                        : <><Wand2 size={13} /> AI transkripcija</>
                      }
                    </button>
                  ) : (
                    <div style={{ padding: '10px 14px', background: 'rgba(103,205,205,0.1)', borderRadius: 12, border: '1px solid rgba(103,205,205,0.2)' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-teal)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Transkripcija</p>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{transcription}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Spacer between recorder and bottom actions */}
              <div style={{ height: 8 }} />
            </div>
          )}

          {/* Text tab */}
          {tab === 'text' && (
            <div style={{ padding: '20px 20px 0' }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={5}
                placeholder="Aprašykite šiandienos darbus…"
                style={{
                  width: '100%', padding: '14px 16px', fontSize: 14, lineHeight: 1.65,
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 14, outline: 'none', fontFamily: 'inherit', fontWeight: 400,
                  resize: 'none', boxSizing: 'border-box', color: 'rgba(255,255,255,0.9)',
                  caretColor: 'var(--color-teal)', transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(103,205,205,0.5)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              />
            </div>
          )}

          {/* ── Bottom action bar ── */}
          <div style={{ padding: '14px 20px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Attachments */}
            <input ref={fileRef} type="file" multiple accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => { Array.from(e.target.files ?? []).forEach(handleAttachment); e.target.value = ''; }} />
            <button
              onClick={() => fileRef.current?.click()}
              style={{ width: 40, height: 40, borderRadius: 12, background: attachments.length > 0 ? 'rgba(103,205,205,0.18)' : 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', transition: 'background 0.15s' }}
              title="Pridėti nuotrauką"
            >
              <Paperclip size={16} style={{ color: attachments.length > 0 ? 'var(--color-teal)' : 'rgba(255,255,255,0.45)' }} />
              {attachments.length > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: 'var(--color-accent)', fontSize: 9, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {attachments.length}
                </span>
              )}
            </button>

            {/* Attachment chips */}
            {attachments.length > 0 && (
              <div style={{ flex: 1, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {attachments.map(a => (
                  <span key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '3px 8px 3px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: 100, color: 'rgba(255,255,255,0.7)' }}>
                    {a.mimeType.startsWith('image/') && <img src={a.dataUrl} alt="" style={{ width: 14, height: 14, borderRadius: 3, objectFit: 'cover' }} />}
                    {a.name.length > 12 ? a.name.slice(0, 12) + '…' : a.name}
                    <button onClick={() => setAttachments(p => p.filter(x => x.id !== a.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'rgba(255,255,255,0.4)' }}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {attachments.length === 0 && <div style={{ flex: 1 }} />}

            {/* Send */}
            <button
              onClick={handleSend}
              disabled={!canSend || sent}
              style={{
                height: 40, padding: '0 20px', borderRadius: 12, border: 'none', cursor: canSend ? 'pointer' : 'default',
                background: sent ? 'var(--color-success)' : canSend ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                color: canSend || sent ? '#fff' : 'rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700,
                fontFamily: 'inherit', flexShrink: 0,
                transition: 'background 0.2s, transform 0.1s',
                transform: 'scale(1)',
              }}
              onMouseDown={e => { if (canSend) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)'; }}
              onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
            >
              {sent ? 'Išsiųsta' : <><Send size={14} /> Siųsti</>}
            </button>
          </div>
        </div>

        {/* Audio element (hidden) */}
        {audioDataUrl && (
          <audio ref={audioRef} src={audioDataUrl} onEnded={() => setPlaying(false)} style={{ display: 'none' }} />
        )}

        {/* ── Collapsible history ── */}
        {updates.length > 0 && (
          <div style={{ animation: 'slide-up 0.4s ease' }}>
            <button
              onClick={() => setShowHistory(s => !s)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 18px', background: 'var(--color-paper-white)',
                border: '1px solid var(--color-ghost-border)', borderRadius: 16,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-teal)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-ghost-border)'; }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--color-cloud-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-midnight-ink)' }}>{updates.length}</span>
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-midnight-ink)' }}>Pateiktos ataskaitos</p>
                {updates[updates.length - 1] && (
                  <p style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', marginTop: 1 }}>
                    Paskutinė {formatRelative(updates[updates.length - 1].createdAt)}
                  </p>
                )}
              </div>
              {showHistory ? <ChevronUp size={16} style={{ color: 'var(--color-muted-ash-2)', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: 'var(--color-muted-ash-2)', flexShrink: 0 }} />}
            </button>

            {showHistory && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6, animation: 'slide-up 0.2s ease' }}>
                {[...updates].reverse().map(update => (
                  <div key={update.id} style={{ padding: '12px 18px', background: 'var(--color-paper-white)', border: '1px solid var(--color-ghost-border)', borderRadius: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: update.inputType === 'voice' ? 'rgba(103,205,205,0.15)' : 'var(--color-cloud-canvas)', color: update.inputType === 'voice' ? 'var(--color-sidebar-bg)' : 'var(--color-muted-ash)' }}>
                        {update.inputType === 'voice' ? 'Balsas' : 'Tekstas'}
                      </span>
                      {update.attachments.length > 0 && (
                        <span style={{ fontSize: 11, color: 'var(--color-muted-ash-2)' }}>{update.attachments.length} priedai</span>
                      )}
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-muted-ash-2)' }}>{formatRelative(update.createdAt)}</span>
                    </div>
                    {update.text && <p style={{ fontSize: 13, color: 'var(--color-midnight-ink)', lineHeight: 1.55 }}>{update.text}</p>}
                    {update.attachments.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        {update.attachments.map(att =>
                          att.mimeType.startsWith('image/') ? (
                            <img key={att.id} src={att.dataUrl} alt={att.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--color-ghost-border)' }} />
                          ) : (
                            <span key={att.id} style={{ fontSize: 11, padding: '3px 8px', background: 'var(--color-cloud-canvas)', borderRadius: 8, color: 'var(--color-muted-ash)' }}>{att.name}</span>
                          )
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
