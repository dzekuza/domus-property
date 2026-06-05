'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, Square, Play, Pause, RotateCcw } from 'lucide-react';
import Btn from '@/components/shared/Btn';

interface Props {
  onRecorded: (blob: Blob, dataUrl: string) => void;
}

type RecordState = 'idle' | 'recording' | 'stopped';

export default function VoiceRecorder({ onRecorded }: Props) {
  const [state, setState] = useState<RecordState>('idle');
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        const reader = new FileReader();
        reader.onload = () => onRecorded(blob, reader.result as string);
        reader.readAsDataURL(blob);
      };
      recorder.start(200);
      mediaRef.current = recorder;
      setState('recording');
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch {
      alert('Nepavyko pasiekti mikrofono.');
    }
  }, [onRecorded]);

  const stopRecording = useCallback(() => {
    mediaRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setState('stopped');
  }, []);

  const reset = useCallback(() => {
    setAudioUrl(null);
    setState('idle');
    setSeconds(0);
    setPlaying(false);
  }, []);

  function togglePlay() {
    if (!audioRef.current || !audioUrl) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {state === 'idle' && (
        <button
          onClick={startRecording}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '16px 24px', borderRadius: 16,
            background: 'rgba(255,255,255,0.06)',
            border: '2px dashed rgba(255,255,255,0.18)',
            cursor: 'pointer', fontFamily: 'inherit',
            color: 'var(--color-muted-ash)', fontSize: 14, fontWeight: 500,
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-teal)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.18)'; }}
        >
          <Mic size={20} style={{ color: 'var(--color-accent)' }} />
          Spustelėkite norėdami įrašyti
        </button>
      )}

      {state === 'recording' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 14 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: '#fca5a5' }}>Įrašoma… {fmt(seconds)}</span>
          <button
            onClick={stopRecording}
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}
          >
            <Square size={12} /> Sustabdyti
          </button>
        </div>
      )}

      {state === 'stopped' && audioUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.06)', borderRadius: 12 }}>
            <button onClick={togglePlay} style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-sidebar-bg)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
              {playing ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <span style={{ fontSize: 13, color: 'var(--color-muted-ash)' }}>Įrašas ({fmt(seconds)})</span>
            <button onClick={reset} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, color: 'var(--color-muted-ash)' }}>
              <RotateCcw size={11} /> Įrašyti iš naujo
            </button>
          </div>
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setPlaying(false)}
            style={{ display: 'none' }}
          />
        </div>
      )}
    </div>
  );
}
