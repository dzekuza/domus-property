'use client';

import { useState, useRef } from 'react';
import { Mic, Paperclip, ChevronDown, ChevronUp, Play, Pause, Languages, Eye, Receipt } from 'lucide-react';
import { useStore } from '@/lib/store';
import Avatar from '@/components/shared/Avatar';
import TranslationBlock from './TranslationBlock';
import { formatRelative } from '@/lib/fmt';
import type { WorkUpdate } from '@/lib/types';

/* ── Mini audio player ──────────────────────────────────────────── */
function MiniAudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  function toggle() {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  }

  const fmt = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return '--:--';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };

  const pct = duration > 0 && isFinite(duration) ? (current / duration) * 100 : 0;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 12px',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 12, marginTop: 10,
    }}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={e => setCurrent((e.target as HTMLAudioElement).currentTime)}
        onLoadedMetadata={e => setDuration((e.target as HTMLAudioElement).duration)}
        onEnded={() => { setPlaying(false); setCurrent(0); }}
      />
      <button
        onClick={toggle}
        style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--color-sidebar-bg)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.8'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
      >
        {playing
          ? <Pause size={11} fill="#fff" style={{ color: '#fff' }} />
          : <Play size={11} fill="#fff" style={{ color: '#fff', marginLeft: 1 }} />
        }
      </button>

      {/* Progress track */}
      <div
        style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 100, overflow: 'hidden', cursor: 'pointer' }}
        onClick={e => {
          if (!audioRef.current || !duration) return;
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
        }}
      >
        <div style={{ height: '100%', background: 'var(--color-teal)', width: `${pct}%`, transition: 'width 0.1s linear', borderRadius: 100 }} />
      </div>

      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontVariantNumeric: 'tabular-nums', flexShrink: 0, letterSpacing: '0.02em' }}>
        {fmt(current)} / {fmt(duration)}
      </span>
    </div>
  );
}

/* ── Main card ──────────────────────────────────────────────────── */
interface Props {
  update: WorkUpdate;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: () => void;
}

export default function UpdateCard({ update, selectable = false, selected = false, onToggle }: Props) {
  const { setWorkUpdateTranslation } = useStore();
  const [showTranscription, setShowTranscription] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const isManager = update.authorRole === 'work_manager';
  const roleLabel = isManager ? 'Vadovas' : 'Darbininkas';
  const roleBg = isManager ? '#e8f5ee' : '#fdf3df';
  const roleColor = isManager ? '#166534' : '#854d0e';

  return (
    <>
      {update.toOwner && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: 'var(--color-accent)', marginBottom: 4, paddingLeft: 2 }}>
          <Eye size={11} />
          {update.groupedIds ? 'Sugrupuota ataskaita savininkui' : 'Žinutė savininkui'}
        </div>
      )}
      <div
        style={{
          display: 'flex', gap: 0, padding: '14px',
          background: selected ? 'rgba(232,119,60,0.12)' : 'rgba(255,255,255,0.06)',
          borderRadius: 12,
          border: selected ? '1.5px solid var(--color-accent)' : '1.5px solid rgba(255,255,255,0.10)',
          cursor: selectable ? 'pointer' : 'default',
          transition: 'background 0.15s, border-color 0.15s',
        }}
        onClick={selectable ? onToggle : undefined}
      >
        {selectable && (
          <div style={{
            width: 18, height: 18, borderRadius: 5, border: `2px solid ${selected ? 'var(--color-accent)' : 'rgba(255,255,255,0.25)'}`,
            background: selected ? 'var(--color-accent)' : 'rgba(255,255,255,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'center',
            transition: 'background 0.15s, border-color 0.15s',
          }}>
            {selected && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6, flexWrap: 'wrap' }}>
            <Avatar name={update.authorName} bg={roleBg} size={28} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.01em' }}>
              {update.authorName}
            </span>

            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: roleBg, color: roleColor, letterSpacing: '0.01em' }}>
              {roleLabel}
            </span>

            {update.inputType === 'voice' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--color-teal)', background: 'rgba(103,205,205,0.12)', padding: '2px 7px', borderRadius: 100 }}>
                <Mic size={10} strokeWidth={2} /> Balso
              </span>
            )}

            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.01em' }}>
              {formatRelative(update.createdAt)}
            </span>
          </div>

          {/* Body text */}
          {update.text && (
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.92)', lineHeight: 1.65, margin: 0 }}>
              {update.text}
            </p>
          )}

          {/* Audio player */}
          {update.inputType === 'voice' && update.audioDataUrl && (
            <MiniAudioPlayer src={update.audioDataUrl} />
          )}

          {/* Transcription toggle */}
          {update.transcription && update.inputType === 'voice' && (
            <div style={{ marginTop: 8 }}>
              <button
                onClick={() => setShowTranscription(s => !s)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 11, fontWeight: 500,
                  color: 'rgba(255,255,255,0.6)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', padding: '2px 0',
                  letterSpacing: '0.01em',
                }}
              >
                <div className="t-icon-swap" data-state={showTranscription ? 'b' : 'a'}>
                  <span className="t-icon" data-icon="a"><ChevronDown size={11} /></span>
                  <span className="t-icon" data-icon="b"><ChevronUp size={11} /></span>
                </div>
                Transkripcija
              </button>
              <div style={{ overflow: 'hidden', maxHeight: showTranscription ? 300 : 0, transition: 'max-height 0.35s cubic-bezier(0.22, 1, 0.36, 1)' }}>
                <div
                  className="t-panel-slide"
                  data-open={showTranscription ? 'true' : 'false'}
                  style={{
                    marginTop: 6, padding: '10px 12px',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 10, fontSize: 13,
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.6, fontStyle: 'italic',
                    borderLeft: '2px solid rgba(255,255,255,0.12)',
                  }}
                >
                  {update.transcription}
                </div>
              </div>
            </div>
          )}

          {/* Attachments */}
          {update.attachments.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {update.attachments.map(att => {
                const isImage = att.mimeType.startsWith('image/');
                return isImage ? (
                  <button key={att.id} onClick={() => setLightboxUrl(att.dataUrl ?? null)}
                    style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', cursor: 'zoom-in', padding: 0, background: 'none' }}>
                    <img src={att.dataUrl} alt={att.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ) : (
                  <a key={att.id} href={att.dataUrl} download={att.name}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12, color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
                    <Paperclip size={11} />
                    {att.name}
                  </a>
                );
              })}
            </div>
          )}

          {/* Bill summary */}
          {update.billSummary && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '4px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}>
              <Receipt size={11} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
              <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>{update.billSummary.vendorName ?? 'Sąskaita'}</span>
              {update.billSummary.totalAmount != null && (
                <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>{update.billSummary.totalAmount.toFixed(2)} {update.billSummary.currency ?? 'EUR'}</span>
              )}
            </div>
          )}

          {/* Translation — collapsed by default */}
          <div style={{ marginTop: 10 }}>
            {!showTranslate ? (
              <button
                onClick={() => setShowTranslate(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 11, fontWeight: 500,
                  color: 'rgba(255,255,255,0.6)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', padding: '2px 0',
                  letterSpacing: '0.01em',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.92)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)'; }}
              >
                <Languages size={11} />
                Versti
                <ChevronDown size={10} />
              </button>
            ) : (
              <TranslationBlock
                updateId={update.id}
                sourceText={update.text}
                translations={update.translations}
                onTranslated={(lang, text) => setWorkUpdateTranslation(update.id, lang, text)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: 24 }}
        >
          <img src={lightboxUrl} alt="" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, objectFit: 'contain' }} />
        </div>
      )}
    </>
  );
}
