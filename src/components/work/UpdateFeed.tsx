'use client';

import { useState } from 'react';
import { Sparkles, Calendar, CalendarRange, Layers, X } from 'lucide-react';
import Spinner from '@/components/shared/Spinner';
import { useStore } from '@/lib/store';

import EmptyState from '@/components/shared/EmptyState';
import UpdateCard from './UpdateCard';
import Btn from '@/components/shared/Btn';
import { formatDateTime } from '@/lib/fmt';
import type { WorkUpdate } from '@/lib/types';

function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
    .replace(/^#{1,3} (.+)$/gm, '<strong>$1</strong>')
    .replace(/^\s*[\*\-] (.+)$/gm, '• $1')
    .replace(/\n/g, '<br/>');
}

interface Props {
  engagementId: string;
  unitLabel: string;
  readOnly?: boolean;
  // grouping — driven externally when allowGrouping=true
  allowGrouping?: boolean;
  groupMode?: boolean;
  selectedIds?: Set<string>;
  onToggleGroupMode?: () => void;
  onToggleSelect?: (id: string) => void;
  onCancelGroup?: () => void;
}

export default function UpdateFeed({
  engagementId, unitLabel, readOnly = false,
  allowGrouping = false,
  groupMode = false,
  selectedIds = new Set(),
  onToggleGroupMode,
  onToggleSelect,
  onCancelGroup,
}: Props) {
  const { updatesForEngagement, summariesForEngagement, addAISummary } = useStore();
  const updates = updatesForEngagement(engagementId);
  const summaries = summariesForEngagement(engagementId);

  const [generatingDaily, setGeneratingDaily] = useState(false);
  const [generatingWeekly, setGeneratingWeekly] = useState(false);
  const [showSummaries, setShowSummaries] = useState(false);

  async function generateSummary(period: 'daily' | 'weekly') {
    const now = Date.now();
    const cutoff = period === 'daily'
      ? now - 24 * 60 * 60 * 1000
      : now - 7 * 24 * 60 * 60 * 1000;
    const filtered: WorkUpdate[] = updates.filter(u => new Date(u.createdAt).getTime() >= cutoff);
    const setter = period === 'daily' ? setGeneratingDaily : setGeneratingWeekly;
    setter(true);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: filtered, period, unitInfo: unitLabel }),
      });
      const data = await res.json() as { text?: string; error?: string };
      if (data.text) {
        addAISummary({ engagementId, period, generatedAt: new Date().toISOString(), text: data.text });
        setShowSummaries(true);
      }
    } finally { setter(false); }
  }

  const latestSummaries = {
    daily: [...summaries].filter(s => s.period === 'daily').sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0],
    weekly: [...summaries].filter(s => s.period === 'weekly').sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0],
  };

  const workerUpdates = updates.filter(u => u.authorRole === 'worker');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* AI Summary controls */}
      {!readOnly && (
        <div style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-ghost-border)', borderRadius: 14, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: summaries.length > 0 ? 12 : 0, flexWrap: 'wrap' }}>
            <Sparkles size={15} style={{ color: 'var(--color-electric-violet)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-midnight-ink)', flex: 1 }}>AI Santrauka</span>
            <Btn variant="ghost" size="sm" disabled={generatingDaily} onClick={() => generateSummary('daily')}
              icon={generatingDaily ? <Spinner size={12} /> : <Calendar size={12} />}>
              {generatingDaily ? 'Generuojama…' : 'Dienos'}
            </Btn>
            <Btn variant="ghost" size="sm" disabled={generatingWeekly} onClick={() => generateSummary('weekly')}
              icon={generatingWeekly ? <Spinner size={12} /> : <CalendarRange size={12} />}>
              {generatingWeekly ? 'Generuojama…' : 'Savaitės'}
            </Btn>
            {summaries.length > 0 && (
              <button onClick={() => setShowSummaries(s => !s)} style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                {showSummaries ? 'Slėpti' : `Rodyti (${summaries.length})`}
              </button>
            )}
          </div>
          {showSummaries && Object.entries(latestSummaries).map(([period, summary]) =>
            summary ? (
              <div key={period} style={{ padding: '12px 14px', background: 'var(--color-purple-tint-md)', borderRadius: 10, marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-electric-violet)', textTransform: 'uppercase' }}>
                    {period === 'daily' ? 'Dienos' : 'Savaitės'} santrauka
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-muted-ash-2)' }}>{formatDateTime(summary.generatedAt)}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-midnight-ink)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(summary.text) }} />
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Updates list */}
      <div style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-ghost-border)', borderRadius: 14, padding: 20 }}>
        {/* Grouping toolbar */}
        {allowGrouping && workerUpdates.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {!groupMode ? (
              <Btn variant="ghost" size="sm" icon={<Layers size={12} />} onClick={onToggleGroupMode}>
                Grupuoti darbininkų ataskaitas
              </Btn>
            ) : (
              <>
                <span style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', flex: 1 }}>
                  {selectedIds.size === 0 ? 'Spustelėkite ataskaitas žemiau…' : `Pasirinkta: ${selectedIds.size} — žiūrėkite formą viršuje`}
                </span>
                <Btn variant="ghost" size="sm" icon={<X size={12} />} onClick={onCancelGroup}>
                  Atšaukti
                </Btn>
              </>
            )}
          </div>
        )}

        {updates.length === 0 ? (
          <EmptyState icon={Sparkles} title="Ataskaitų dar nėra" subtitle="Darbininkai ataskaitų dar nepateikė." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {updates.map(u => (
              <UpdateCard
                key={u.id}
                update={u}
                selectable={groupMode && u.authorRole === 'worker'}
                selected={selectedIds.has(u.id)}
                onToggle={() => onToggleSelect?.(u.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
