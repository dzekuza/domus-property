'use client';

import { useState } from 'react';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/shared/Card';
import EmptyState from '@/components/shared/EmptyState';
import Btn from '@/components/shared/Btn';

export default function NuotraukosPage() {
  const { effectiveUser, unitOf, photoSections } = useStore();
  const effUser = effectiveUser();
  const unit = effUser?.unitId ? unitOf(effUser.id) : null;
  const sections = unit ? photoSections.filter(s => s.unitId === unit.id) : [];

  const [lightbox, setLightbox] = useState<{ urls: string[]; idx: number } | null>(null);

  function openLightbox(urls: string[], idx: number) { setLightbox({ urls, idx }); }
  function closeLightbox() { setLightbox(null); }
  function prev() { if (!lightbox) return; setLightbox({ ...lightbox, idx: (lightbox.idx - 1 + lightbox.urls.length) % lightbox.urls.length }); }
  function next() { if (!lightbox) return; setLightbox({ ...lightbox, idx: (lightbox.idx + 1) % lightbox.urls.length }); }

  return (
    <div>
      <PageHeader title="Nuotraukos" actions={<Btn variant="ghost" icon={<Download size={14} />}>Atsisiųsti visas</Btn>} />

      {sections.length === 0 ? (
        <Card><EmptyState icon={ImageIcon} title="Nuotraukų dar nėra" subtitle="Nuotraukos bus pridėtos kai butas bus paruoštas." /></Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {sections.map(section => (
            <Card key={section.id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>{section.title}</h2>
                  <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', marginTop: 2 }}>{section.date} · {section.photoUrls.length} nuotraukos</p>
                </div>
                <Btn variant="ghost" size="sm" onClick={() => openLightbox(section.photoUrls, 0)}>Žiūrėti visas</Btn>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {section.photoUrls.slice(0, 4).map((url, idx) => (
                  <button key={idx} onClick={() => openLightbox(section.photoUrls, idx)} style={{ border: 'none', padding: 0, cursor: 'pointer', borderRadius: 'var(--radius-image)', overflow: 'hidden', aspectRatio: '4/3' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div onClick={closeLightbox} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={e => { e.stopPropagation(); closeLightbox(); }} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <X size={18} />
          </button>
          <button onClick={e => { e.stopPropagation(); prev(); }} style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <ChevronLeft size={22} />
          </button>
          <img onClick={e => e.stopPropagation()} src={lightbox.urls[lightbox.idx]} alt="" style={{ maxWidth: '80vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 12 }} />
          <button onClick={e => { e.stopPropagation(); next(); }} style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <ChevronRight size={22} />
          </button>
          <div style={{ position: 'absolute', bottom: 20, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
            {lightbox.idx + 1} / {lightbox.urls.length}
          </div>
        </div>
      )}
    </div>
  );
}
