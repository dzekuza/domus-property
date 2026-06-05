'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Receipt, ChevronDown, ChevronUp } from 'lucide-react';


interface Props {
  engagementId: string;
}

export default function ExpenseTable({ engagementId }: Props) {
  const { expensesForEngagement } = useStore();
  const expenses = expensesForEngagement(engagementId);
  const [expanded, setExpanded] = useState<string | null>(null);

  const grandTotal = expenses.reduce((s, e) => s + e.totalAmount, 0);
  const currency = expenses[0]?.currency ?? 'EUR';

  return (
    <div style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-ghost-border)', borderRadius: 14, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: expenses.length > 0 ? 14 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Receipt size={14} style={{ color: 'var(--color-accent)' }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-midnight-ink)' }}>Išlaidos</p>
          {expenses.length > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(232,119,60,0.1)', color: 'var(--color-accent)' }}>
              {expenses.length}
            </span>
          )}
        </div>
        {expenses.length > 0 && (
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-accent)' }}>
            {grandTotal.toFixed(2)} {currency}
          </span>
        )}
      </div>

      {expenses.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', marginTop: 6 }}>
          Išlaidų dar nėra. Pridėkite sąskaitą teikiant ataskaitą.
        </p>
      ) : (
        <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--color-ghost-border)' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 88px 80px 24px', gap: 8, padding: '7px 12px', background: 'var(--color-surface-raised)', fontSize: 10, fontWeight: 700, color: 'var(--color-muted-ash-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <span>Tiekėjas</span><span>Data</span><span style={{ textAlign: 'right' }}>Suma</span><span />
          </div>

          {expenses.map((exp, idx) => (
            <div key={exp.id} style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--color-ghost-border)' }}>
              <div
                onClick={() => setExpanded(s => s === exp.id ? null : exp.id)}
                style={{ display: 'grid', gridTemplateColumns: '1fr 88px 80px 24px', gap: 8, padding: '10px 12px', cursor: 'pointer', background: expanded === exp.id ? 'rgba(0,0,0,0.04)' : 'transparent', transition: 'background 0.12s' }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-midnight-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.vendorName}</span>
                <span style={{ fontSize: 12, color: 'var(--color-muted-ash)' }}>{exp.billDate}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-midnight-ink)', textAlign: 'right' }}>{exp.totalAmount.toFixed(2)} {exp.currency ?? 'EUR'}</span>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted-ash-2)' }}>
                  <div className="t-icon-swap" data-state={expanded === exp.id ? 'b' : 'a'}>
                    <span className="t-icon" data-icon="a"><ChevronDown size={12} /></span>
                    <span className="t-icon" data-icon="b"><ChevronUp size={12} /></span>
                  </div>
                </span>
              </div>

              <div style={{ overflow: 'hidden', maxHeight: expanded === exp.id ? 400 : 0, transition: 'max-height 0.35s cubic-bezier(0.22, 1, 0.36, 1)' }}>
                <div
                  className="t-panel-slide"
                  data-open={expanded === exp.id ? 'true' : 'false'}
                  style={{ padding: '10px 12px 14px', background: 'var(--color-surface-raised)', borderTop: '1px solid var(--color-ghost-border)' }}
                >
                  <div style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
                    <img src={exp.billImageDataUrl} alt="Sąskaita" style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--color-ghost-border)', background: '#fff', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--color-muted-ash-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Pateikė</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>{exp.submittedByName}</p>
                    </div>
                  </div>

                  {exp.items.length > 0 && (
                    <>
                      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-muted-ash-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Pozicijos</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {exp.items.map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12 }}>
                            <span style={{ color: 'var(--color-midnight-ink)' }}>{item.description}</span>
                            {item.line_total != null && (
                              <span style={{ fontWeight: 600, color: 'var(--color-accent)', flexShrink: 0 }}>{item.line_total.toFixed(2)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
