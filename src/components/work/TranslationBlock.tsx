'use client';

import { useState } from 'react';
import { Languages } from 'lucide-react';
import Spinner from '@/components/shared/Spinner';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'de', label: 'DE' },
  { code: 'lt', label: 'LT' },
];

interface Props {
  updateId: string;
  sourceText: string;
  translations: Record<string, string>;
  onTranslated: (lang: string, text: string) => void;
}

export default function TranslationBlock({ updateId, sourceText, translations, onTranslated }: Props) {
  const [selectedLang, setSelectedLang] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function translate(lang: string) {
    if (!lang || lang === selectedLang) return;
    setSelectedLang(lang);
    if (translations[lang]) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sourceText, targetLang: lang }),
      });
      const data = await res.json() as { text?: string; error?: string };
      if (data.text) {
        onTranslated(lang, data.text);
      } else {
        setError('Vertimas nepavyko.');
      }
    } catch {
      setError('Vertimas nepavyko.');
    }
    setLoading(false);
  }

  const translatedText = selectedLang ? translations[selectedLang] : null;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Languages size={13} style={{ color: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Versti:</span>
        {LANGS.map(l => (
          <button
            key={l.code}
            onClick={() => translate(l.code)}
            style={{
              padding: '3px 10px', fontSize: 11, fontWeight: 600, borderRadius: 100,
              cursor: 'pointer', border: 'none', fontFamily: 'inherit',
              background: selectedLang === l.code ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.07)',
              color: selectedLang === l.code ? '#fff' : 'rgba(255,255,255,0.7)',
              transition: 'background 0.12s, color 0.12s',
            }}
          >
            {l.label}
          </button>
        ))}
        {loading && <Spinner size={13} color="rgba(255,255,255,0.6)" />}
      </div>
      {translatedText && (
        <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
          {translatedText}
        </div>
      )}
      {error && <p style={{ fontSize: 12, color: 'var(--color-danger)', marginTop: 4 }}>{error}</p>}
    </div>
  );
}
