// screens-owner.jsx — six owner-portal screens. Each is a stateful component
// rendered inside an artboard via <OwnerApp initialRoute="..." />.

const { useState: useStateO } = React;

/* ============================== PAGRINDINIS (purchase journey) ============================== */
const PURCHASE_STEPS = [
  { id: 1, title: 'Preliminari sutartis', sub: 'Pasirašyta 2024-08-12', status: 'done',
    docs: [{ name: 'Preliminari_sutartis.pdf', size: '482 KB' }] },
  { id: 2, title: 'Notarinė sutartis', sub: 'Pasirašyta 2025-01-20', status: 'done',
    docs: [{ name: 'Notarine_sutartis.pdf', size: '1.2 MB' }, { name: 'Notaro_pazyma.pdf', size: '210 KB' }] },
  { id: 3, title: 'Registrų centro išrašas', sub: 'Gautas 2025-02-04', status: 'done',
    docs: [{ name: 'RC_israsas_2025-02-04.pdf', size: '380 KB' }] },
  { id: 4, title: 'Mokėjimo kvitas', sub: 'Patvirtintas 2025-02-18', status: 'done',
    docs: [{ name: 'Kvitas_galutinis.pdf', size: '92 KB' }] },
  { id: 5, title: 'Buto priėmimo-perdavimo aktas', sub: 'Laukiamas jūsų parašas',
    status: 'progress', allowUpload: true,
    docs: [{ name: 'Perdavimo_aktas_DRAFT.pdf', size: '610 KB' }] },
  { id: 6, title: 'Raktų perdavimas', sub: 'Planuojama 2026-06-04', status: 'pending', docs: [] },
  { id: 7, title: 'Komunalinių paslaugų aktyvavimas', sub: '4 sutartys', status: 'pending', docs: [] },
  { id: 8, title: 'Galutinė apžiūra', sub: 'Po 30 d. nuo perdavimo', status: 'pending', docs: [] },
];

function OwnerPagrindinis() {
  const [open, setOpen] = useStateO(5);
  const completed = PURCHASE_STEPS.filter(s => s.status === 'done').length;
  return (
    <>
      <Topbar
        title="Pirkimo eiga"
        subtitle="Sekite visus jūsų buto įsigijimo etapus vienoje vietoje."
        actions={<button className="btn-primary"><Icon name="download" size={14}/>Eksportuoti</button>}
      />
      <div style={{ padding: '24px 32px 40px', flex: 1, overflowY: 'auto' }}>
        {/* Property hero card */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', alignItems: 'stretch', marginBottom: 24 }}>
          <div className="photo" style={{
            width: 240, flexShrink: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80')",
          }}></div>
          <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="t-caption" style={{ marginBottom: 8 }}>Jūsų objektas</div>
              <h2 className="h-display" style={{ fontSize: 32 }}>Kalnų Terasos · Butas B-12</h2>
              <p className="t-body" style={{ marginTop: 8 }}>Vilniaus g. 24, Vilnius · 4 aukštas · 68.4 m²</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 16 }}>
              <div>
                <div className="t-caption" style={{ marginBottom: 4 }}>Eiga</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 220, height: 6, background: 'var(--color-cloud-canvas)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${(completed/PURCHASE_STEPS.length)*100}%`, height: '100%', background: 'var(--color-electric-violet)' }}></div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{completed} / {PURCHASE_STEPS.length} žingsnių</span>
                </div>
              </div>
              <div style={{ height: 32, width: 1, background: 'var(--color-ghost-border)' }}></div>
              <div>
                <div className="t-caption" style={{ marginBottom: 4 }}>Planuojamas raktų perdavimas</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>2026 m. birželio 4 d.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Accordion steps */}
        <h3 className="h-section" style={{ marginBottom: 16 }}>Eigos žingsniai</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PURCHASE_STEPS.map(step => {
            const isOpen = open === step.id;
            const isDone = step.status === 'done';
            const isProgress = step.status === 'progress';
            return (
              <div key={step.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <button
                  onClick={() => setOpen(isOpen ? null : step.id)}
                  style={{
                    width: '100%', padding: '20px 24px',
                    display: 'flex', alignItems: 'center', gap: 20,
                    textAlign: 'left',
                  }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    flexShrink: 0,
                    background: isDone ? 'var(--color-electric-violet)' : isProgress ? 'var(--color-violet-tint)' : 'var(--color-cloud-canvas)',
                    color: isDone ? 'var(--color-paper-white)' : isProgress ? 'var(--color-electric-violet)' : 'var(--color-muted-ash-2)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 500,
                    border: isProgress ? '1px solid var(--color-electric-violet)' : 'none',
                  }}>
                    {isDone ? <Icon name="check" size={16} /> : String(step.id).padStart(2,'0')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 2 }}>{step.title}</div>
                    <div className="t-meta">{step.sub}</div>
                  </div>
                  <StatusPill status={step.status} />
                  <Icon name="chevron-down" size={18} color="var(--color-muted-ash-2)" />
                </button>
                {isOpen && (
                  <div className="fade-in" style={{ padding: '0 24px 20px', borderTop: '1px solid var(--color-ghost-border)', marginTop: 0 }}>
                    {step.docs.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 16 }}>
                        {step.docs.map((d, i) => (
                          <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px 16px',
                            background: 'var(--color-cloud-canvas)',
                            borderRadius: 8,
                          }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 6,
                              background: 'var(--color-paper-white)',
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <Icon name="file" size={16} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 14, fontWeight: 500 }}>{d.name}</div>
                              <div className="t-meta">{d.size}</div>
                            </div>
                            <button className="btn-pill-sm"><Icon name="download" size={12}/>Atsisiųsti</button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ paddingTop: 16, color: 'var(--color-muted-ash-2)', fontSize: 14 }}>
                        Dokumentai bus paskelbti, kai šis etapas bus aktyvus.
                      </div>
                    )}
                    {step.allowUpload && (
                      <div style={{ marginTop: 16, padding: 16, border: '1px dashed var(--color-ghost-border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>Pasirašykite ir įkelkite skenuotą aktą</div>
                          <div className="t-meta">PDF, iki 10 MB</div>
                        </div>
                        <button className="btn-primary"><Icon name="upload" size={14}/>Įkelti</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ============================== DEFEKTAI ============================== */
const DEFECTS = [
  { id: 'D-204', title: 'Vonios kambario plytelės — siūlių defektas', status: 'progress',
    submitted: '2026-05-22', room: 'Vonia',
    photos: ['https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80'],
    thread: [
      { who: 'owner', name: 'Jūs', date: '2026-05-22', text: 'Pastebėjau, kad pora plytelių siūlių yra netolygios prie dušo zonos.', attachments: 1 },
      { who: 'admin', name: 'Tomas, Domus', date: '2026-05-23', text: 'Ačiū už pranešimą. Užregistravome. Meistras atvyks šią savaitę, susisieksime dėl laiko.', attachments: 0 },
    ]
  },
  { id: 'D-198', title: 'Virtuvės spintelės — durelės nesisuka tolygiai', status: 'open',
    submitted: '2026-05-18', room: 'Virtuvė',
    photos: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80'],
    thread: [
      { who: 'owner', name: 'Jūs', date: '2026-05-18', text: 'Vienos durelės kabinetinėje spintelėje nesisuka iki galo, atsiveria pačios.', attachments: 2 },
    ]
  },
  { id: 'D-187', title: 'Svetainės grindjuostė — atšokusi', status: 'resolved',
    submitted: '2026-04-30', room: 'Svetainė',
    photos: [],
    thread: [
      { who: 'owner', name: 'Jūs', date: '2026-04-30', text: 'Grindjuostė atšokusi prie balkono durų.', attachments: 1 },
      { who: 'admin', name: 'Tomas, Domus', date: '2026-05-02', text: 'Sutvarkyta. Patikrinkite ir patvirtinkite.', attachments: 0 },
      { who: 'owner', name: 'Jūs', date: '2026-05-03', text: 'Patvirtinu, viskas gerai. Ačiū.', attachments: 0 },
    ]
  },
];

function OwnerDefektai() {
  const [showNew, setShowNew] = useStateO(false);
  const [expanded, setExpanded] = useStateO('D-204');
  const [filter, setFilter] = useStateO('all');
  const filtered = filter === 'all' ? DEFECTS : DEFECTS.filter(d => d.status === filter);
  return (
    <>
      <Topbar
        title="Defektai"
        subtitle="Praneškite apie pastebėtus trūkumus ir sekite atsakymus."
        actions={<button className="btn-primary" onClick={() => setShowNew(true)}><Icon name="plus" size={14}/>Naujas pranešimas</button>}
      />
      <div style={{ padding: '24px 32px 40px', flex: 1, overflowY: 'auto' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { id: 'all', label: 'Visi', n: DEFECTS.length },
            { id: 'open', label: 'Atviri', n: DEFECTS.filter(d=>d.status==='open').length },
            { id: 'progress', label: 'Vykdomi', n: DEFECTS.filter(d=>d.status==='progress').length },
            { id: 'resolved', label: 'Išspręsti', n: DEFECTS.filter(d=>d.status==='resolved').length },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '8px 14px', borderRadius: 'var(--radius-pill)', fontSize: 13,
              background: filter === f.id ? 'var(--color-midnight-ink)' : 'var(--color-paper-white)',
              color: filter === f.id ? 'var(--color-paper-white)' : 'var(--color-midnight-ink)',
              border: '1px solid ' + (filter === f.id ? 'var(--color-midnight-ink)' : 'var(--color-ghost-border)'),
            }}>
              {f.label} <span style={{ opacity: 0.6, marginLeft: 4 }}>{f.n}</span>
            </button>
          ))}
        </div>

        {/* Defect cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(d => (
            <div key={d.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <span className="t-caption">{d.id}</span>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--color-muted-ash-2)' }}></span>
                    <span className="t-caption" style={{ textTransform: 'none', letterSpacing: 0 }}>{d.room}</span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>{d.title}</div>
                  <div className="t-meta">Pateikta {d.submitted} · {d.thread.length} žinutė(s)</div>
                </div>
                <StatusPill status={d.status} />
                <button onClick={() => setExpanded(expanded === d.id ? null : d.id)} style={{ padding: 6, borderRadius: 6 }}>
                  <Icon name={expanded === d.id ? 'chevron-down' : 'chevron-right'} size={18} color="var(--color-muted-ash-2)"/>
                </button>
              </div>
              {expanded === d.id && (
                <div className="fade-in" style={{ borderTop: '1px solid var(--color-ghost-border)', background: 'var(--color-cloud-canvas)', padding: '20px 24px' }}>
                  {d.photos.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                      {d.photos.map((p, i) => (
                        <div key={i} className="photo" style={{ width: 96, height: 96, backgroundImage: `url(${p})`, border: '1px solid var(--color-ghost-border)' }}></div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {d.thread.map((m, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12 }}>
                        <Avatar name={m.name} size={32} bg={m.who === 'admin' ? 'var(--color-midnight-ink)' : undefined} />
                        <div style={{ flex: 1, background: 'var(--color-paper-white)', padding: 12, borderRadius: 8, border: '1px solid var(--color-ghost-border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</span>
                            <span className="t-meta" style={{ fontSize: 12 }}>{m.date}</span>
                          </div>
                          <div style={{ fontSize: 14, color: 'var(--color-muted-ash)' }}>{m.text}</div>
                          {m.attachments > 0 && (
                            <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-muted-ash-2)' }}>
                              <Icon name="paperclip" size={12}/>{m.attachments} priedas(-ai)
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                    <input className="input" placeholder="Parašykite atsakymą..." style={{ flex: 1 }} />
                    <button className="btn-ghost" style={{ padding: 12, borderRadius: 'var(--radius-pill)' }}><Icon name="paperclip" size={14}/></button>
                    <button className="btn-primary"><Icon name="send" size={14}/>Siųsti</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* New defect modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Naujas defektas"
        footer={<>
          <button className="btn-ghost" onClick={() => setShowNew(false)}>Atšaukti</button>
          <button className="btn-primary" onClick={() => setShowNew(false)}>Pateikti</button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label>
            <div className="t-caption" style={{ marginBottom: 6 }}>Patalpa</div>
            <select className="input">
              <option>Vonia</option><option>Virtuvė</option><option>Svetainė</option><option>Miegamasis</option><option>Koridorius</option><option>Balkonas</option>
            </select>
          </label>
          <label>
            <div className="t-caption" style={{ marginBottom: 6 }}>Trumpas pavadinimas</div>
            <input className="input" placeholder="Pvz., Plytelės siūlės defektas" />
          </label>
          <label>
            <div className="t-caption" style={{ marginBottom: 6 }}>Aprašymas</div>
            <textarea className="input" rows={4} placeholder="Aprašykite problemą..."></textarea>
          </label>
          <div>
            <div className="t-caption" style={{ marginBottom: 6 }}>Nuotraukos / vaizdo įrašai</div>
            <div style={{ padding: 24, border: '1px dashed var(--color-ghost-border)', borderRadius: 8, textAlign: 'center', background: 'var(--color-cloud-canvas)' }}>
              <Icon name="upload" size={20} color="var(--color-muted-ash-2)"/>
              <div style={{ fontSize: 14, marginTop: 8, color: 'var(--color-muted-ash)' }}>Įkelkite arba nutempkite failus</div>
              <div className="t-meta" style={{ marginTop: 4 }}>JPG, PNG, MP4 · iki 50 MB</div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

/* ============================== NUOTRAUKOS ============================== */
const PHOTO_SECTIONS = [
  { title: 'Bendras vaizdas', date: '2026-05-15', photos: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
  ]},
  { title: 'Virtuvė ir svetainė', date: '2026-05-15', photos: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&q=80',
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80',
  ]},
  { title: 'Vonia ir tualetas', date: '2026-05-15', photos: [
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
    'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&q=80',
  ]},
  { title: 'Miegamieji', date: '2026-05-15', photos: [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80',
  ]},
];

function OwnerNuotraukos() {
  const [lightbox, setLightbox] = useStateO(null);
  return (
    <>
      <Topbar
        title="Nuotraukos"
        subtitle="Buto perdavimo metu padarytos nuotraukos."
        actions={<button className="btn-ghost"><Icon name="download" size={14}/>Atsisiųsti visas</button>}
      />
      <div style={{ padding: '24px 32px 40px', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {PHOTO_SECTIONS.map((sec, i) => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h3 className="h-section">{sec.title}</h3>
                  <div className="t-meta" style={{ marginTop: 2 }}>{sec.photos.length} nuotraukos · {sec.date}</div>
                </div>
                <button className="btn-pill-sm">Žiūrėti visas</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {sec.photos.map((p, j) => (
                  <button key={j} onClick={() => setLightbox(p)} className="photo" style={{
                    aspectRatio: '4/3', backgroundImage: `url(${p})`,
                    border: '1px solid var(--color-ghost-border)', cursor: 'zoom-in',
                  }}></button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{
          position: 'absolute', inset: 0, background: 'rgba(32,32,32,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
        }}>
          <button onClick={(e) => { e.stopPropagation(); setLightbox(null); }} style={{
            position: 'absolute', top: 24, right: 24,
            background: 'var(--color-paper-white)', padding: 10, borderRadius: '50%',
          }}><Icon name="x" size={20}/></button>
          <img src={lightbox} style={{ maxWidth: '85%', maxHeight: '85%', borderRadius: 12 }}/>
        </div>
      )}
    </>
  );
}

/* ============================== SUTARTYS (utility contracts) ============================== */
const SERVICES = [
  { id: 'elec',  icon: 'bolt',  name: 'Elektra',           provider: 'ESO',         status: 'done',     date: '2026-05-01' },
  { id: 'water', icon: 'drop',  name: 'Vanduo ir nuotekos', provider: 'Vilniaus vandenys', status: 'progress', date: 'Vykdoma' },
  { id: 'heat',  icon: 'flame', name: 'Šildymas',           provider: 'Vilniaus šilumos tinklai', status: 'pending', date: 'Laukiama' },
  { id: 'waste', icon: 'trash', name: 'Atliekų išvežimas',  provider: 'Ecoservice',  status: 'pending', date: 'Laukiama' },
];

function OwnerSutartys() {
  return (
    <>
      <Topbar
        title="Paslaugų sutartys"
        subtitle="Komunalinių paslaugų sutarčių būsena jūsų butui."
      />
      <div style={{ padding: '24px 32px 40px', flex: 1, overflowY: 'auto' }}>
        {/* Warning banner */}
        <div style={{
          background: 'var(--color-warning-tint)',
          border: '1px solid #f1e0b6',
          borderRadius: 8, padding: 16, marginBottom: 24,
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <Icon name="alert" size={18} color="var(--color-warning)"/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-warning)', marginBottom: 2 }}>3 sutartys laukia jūsų veiksmų</div>
            <div style={{ fontSize: 13, color: 'var(--color-muted-ash)' }}>Po nuosavybės registracijos turite pasirašyti likusias komunalinių paslaugų sutartis per 14 dienų.</div>
          </div>
          <button className="btn-primary">Pradėti</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {SERVICES.map(s => (
            <div key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 8,
                  background: s.status === 'done' ? 'var(--color-violet-tint)' : 'var(--color-cloud-canvas)',
                  color: s.status === 'done' ? 'var(--color-electric-violet)' : 'var(--color-midnight-ink)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={s.icon} size={22}/>
                </div>
                <StatusPill status={s.status}/>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 500 }}>{s.name}</div>
                <div className="t-meta" style={{ marginTop: 2 }}>{s.provider}</div>
              </div>
              <div style={{ height: 1, background: 'var(--color-ghost-border)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="t-caption" style={{ marginBottom: 2 }}>Aktyvavimo data</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{s.date}</div>
                </div>
                {s.status === 'done' ? (
                  <button className="btn-pill-sm"><Icon name="file" size={12}/>Sutartis</button>
                ) : (
                  <button className="btn-primary">Pasirašyti</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================== KONTAKTAI ============================== */
const CONTACTS = [
  { cat: 'Langai ir durys', name: 'Mindaugas Petraitis', org: 'Vikra UAB', phone: '+370 612 34567', mail: 'm.petraitis@vikra.lt', doc: 'Garantija_langai.pdf' },
  { cat: 'Šildymas',       name: 'Dovydas Šimkus',      org: 'Termo Servisas', phone: '+370 698 11223', mail: 'servisas@termo.lt', doc: 'Sildymo_sistemos_instrukcija.pdf' },
  { cat: 'Vandentiekis',   name: 'Rimas Jankauskas',    org: 'Aqua Lab',      phone: '+370 656 33445', mail: 'rimas@aqualab.lt' },
  { cat: 'Internetas',     name: 'Telia',               org: 'Pagalbos linija', phone: '1817', mail: 'pagalba@telia.lt' },
  { cat: 'Elektra',        name: 'Andrius Vaitkus',     org: 'ESO',           phone: '1802', mail: '—' },
  { cat: 'Bendrosios patalpos', name: 'Domus pagalba', org: 'Domus', phone: '+370 5 246 8800', mail: 'pagalba@domus.lt', doc: 'Namo_taisykles.pdf' },
];

function OwnerKontaktai() {
  return (
    <>
      <Topbar
        title="Kontaktai"
        subtitle="Su jūsų objektu susiję specialistai ir paslaugos."
      />
      <div style={{ padding: '24px 32px 40px', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {CONTACTS.map((c, i) => (
            <div key={i} className="card" style={{ display: 'flex', gap: 16 }}>
              <Avatar name={c.name} size={48}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t-caption" style={{ marginBottom: 4 }}>{c.cat}</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{c.name}</div>
                <div className="t-meta" style={{ marginBottom: 12 }}>{c.org}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-muted-ash)' }}>
                    <Icon name="phone" size={14}/>{c.phone}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-muted-ash)' }}>
                    <Icon name="mail" size={14}/>{c.mail}
                  </div>
                </div>
                {c.doc && (
                  <button className="btn-pill-sm" style={{ marginTop: 12 }}>
                    <Icon name="download" size={12}/>{c.doc}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================== NUSTATYMAI ============================== */
function OwnerNustatymai() {
  const [name, setName] = useStateO('Andrius Kazlauskas');
  const [phone, setPhone] = useStateO('+370 612 34567');
  const [saved, setSaved] = useStateO(false);
  return (
    <>
      <Topbar
        title="Nustatymai"
        subtitle="Tvarkykite savo paskyros informaciją."
      />
      <div style={{ padding: '24px 32px 40px', flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 640 }}>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 className="h-section" style={{ marginBottom: 4 }}>Asmeninė informacija</h3>
            <p className="t-body" style={{ marginBottom: 24 }}>Šie duomenys naudojami sutarčių ir dokumentų ruošime.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <label>
                <div className="t-caption" style={{ marginBottom: 6 }}>Vardas ir pavardė</div>
                <input className="input input-filled" value={name} onChange={e => { setName(e.target.value); setSaved(false); }}/>
              </label>
              <label>
                <div className="t-caption" style={{ marginBottom: 6 }}>Telefono numeris</div>
                <input className="input input-filled" value={phone} onChange={e => { setPhone(e.target.value); setSaved(false); }}/>
              </label>
            </div>
            <label style={{ display: 'block', marginBottom: 24 }}>
              <div className="t-caption" style={{ marginBottom: 6 }}>El. paštas</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input className="input" value="a.kazlauskas@mail.lt" disabled style={{ background: 'var(--color-cloud-canvas)', color: 'var(--color-muted-ash-2)' }}/>
                <span className="pill pill-neutral"><Icon name="lock" size={10}/>Nekeičiamas</span>
              </div>
              <div className="t-meta" style={{ marginTop: 6 }}>El. pašto pakeitimui susisiekite su Domus pagalba.</div>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn-primary" onClick={() => setSaved(true)}>Išsaugoti pakeitimus</button>
              {saved && <span className="pill pill-success"><Icon name="check" size={10}/>Išsaugota</span>}
            </div>
          </div>

          <div className="card">
            <h3 className="h-section" style={{ marginBottom: 4 }}>Saugumas</h3>
            <p className="t-body" style={{ marginBottom: 20 }}>Slaptažodis ir prisijungimas.</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--color-ghost-border)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Slaptažodis</div>
                <div className="t-meta">Paskutinį kartą keistas prieš 4 mėnesius</div>
              </div>
              <button className="btn-ghost">Keisti slaptažodį</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--color-ghost-border)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Dviejų veiksnių autentifikacija</div>
                <div className="t-meta">Papildomas saugumo sluoksnis prisijungiant</div>
              </div>
              <button className="btn-ghost">Įjungti</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================== OWNER APP WRAPPER ============================== */
function OwnerApp({ initialRoute = 'pagrindinis' }) {
  return (
    <ScreenRouter role="owner" initialRoute={initialRoute}>
      <ScreenLayout>
        <OwnerRoute />
      </ScreenLayout>
    </ScreenRouter>
  );
}
function OwnerRoute() {
  const { route } = useRouter();
  switch (route) {
    case 'pagrindinis': return <OwnerPagrindinis/>;
    case 'defektai':    return <OwnerDefektai/>;
    case 'nuotraukos':  return <OwnerNuotraukos/>;
    case 'sutartys':    return <OwnerSutartys/>;
    case 'kontaktai':   return <OwnerKontaktai/>;
    case 'nustatymai':  return <OwnerNustatymai/>;
    default:            return <OwnerPagrindinis/>;
  }
}

Object.assign(window, { OwnerApp });
