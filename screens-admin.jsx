// screens-admin.jsx — six admin-dashboard screens.

const { useState: useStateA } = React;

/* ============================== ESTATES LIST ============================== */
const ESTATES = [
  { id: 'kalnu', name: 'Kalnų Terasos', addr: 'Vilniaus g. 24, Vilnius', units: 32, sold: 28, status: 'Statoma', cover: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80' },
  { id: 'pajurio', name: 'Pajūrio Namai', addr: 'Šventosios g. 8, Palanga', units: 48, sold: 41, status: 'Statoma', cover: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80' },
  { id: 'svyturys', name: 'Švyturys', addr: 'Tilžės g. 12, Klaipėda', units: 24, sold: 24, status: 'Baigta', cover: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80' },
  { id: 'auksakalniai', name: 'Auksakalniai Loftai', addr: 'Aukštaičių g. 15, Kaunas', units: 18, sold: 12, status: 'Statoma', cover: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=400&q=80' },
  { id: 'baltija', name: 'Baltijos Vartai', addr: 'Jūros g. 33, Palanga', units: 56, sold: 18, status: 'Pardavimas', cover: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&q=80' },
  { id: 'pusyno', name: 'Pušyno Slėnis', addr: 'Pušyno g. 6, Vilnius', units: 14, sold: 4, status: 'Pardavimas', cover: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=400&q=80' },
];

function AdminEstates() {
  const [showNew, setShowNew] = useStateA(false);
  const { setRoute } = useRouter();
  return (
    <>
      <Topbar
        title="Objektai"
        subtitle={`${ESTATES.length} projektai · ${ESTATES.reduce((s,e)=>s+e.units,0)} butai`}
        actions={<>
          <div style={{ position: 'relative' }}>
            <input className="input input-filled" placeholder="Ieškoti..." style={{ width: 240, paddingLeft: 36 }}/>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <Icon name="search" size={14} color="var(--color-muted-ash-2)"/>
            </div>
          </div>
          <button className="btn-primary" onClick={() => setShowNew(true)}><Icon name="plus" size={14}/>Naujas objektas</button>
        </>}
      />
      <div style={{ padding: '24px 32px 40px', flex: 1, overflowY: 'auto' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ paddingLeft: 24 }}>Objektas</th>
                <th>Adresas</th>
                <th style={{ textAlign: 'right' }}>Butai</th>
                <th style={{ textAlign: 'right' }}>Parduota</th>
                <th>Būsena</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ESTATES.map(e => (
                <tr key={e.id} className="row-hover" onClick={() => setRoute('estate-detail')}>
                  <td style={{ paddingLeft: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="photo" style={{ width: 48, height: 48, backgroundImage: `url(${e.cover})`, borderRadius: 8 }}></div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{e.name}</div>
                        <div className="t-meta">{e.id.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-muted-ash)' }}>{e.addr}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{e.units}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span>{e.sold} / {e.units}</span>
                      <div style={{ width: 50, height: 4, background: 'var(--color-cloud-canvas)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${(e.sold/e.units)*100}%`, height: '100%', background: 'var(--color-electric-violet)' }}></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`pill ${e.status === 'Baigta' ? 'pill-success' : e.status === 'Statoma' ? 'pill-violet' : 'pill-warning'}`}>
                      <Icon name="dot" size={8}/>{e.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: 24 }}>
                    <Icon name="chevron-right" size={16} color="var(--color-muted-ash-2)"/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Naujas objektas"
        footer={<>
          <button className="btn-ghost" onClick={() => setShowNew(false)}>Atšaukti</button>
          <button className="btn-primary" onClick={() => setShowNew(false)}>Sukurti</button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label>
            <div className="t-caption" style={{ marginBottom: 6 }}>Pavadinimas</div>
            <input className="input" placeholder="Pvz., Pušyno Slėnis"/>
          </label>
          <label>
            <div className="t-caption" style={{ marginBottom: 6 }}>Adresas</div>
            <input className="input" placeholder="Gatvė, miestas"/>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <label>
              <div className="t-caption" style={{ marginBottom: 6 }}>Butų skaičius</div>
              <input className="input" type="number" placeholder="0"/>
            </label>
            <label>
              <div className="t-caption" style={{ marginBottom: 6 }}>Statyba baigta</div>
              <input className="input" type="text" placeholder="YYYY-MM"/>
            </label>
          </div>
          <div>
            <div className="t-caption" style={{ marginBottom: 6 }}>Viršelio nuotrauka</div>
            <div style={{ padding: 24, border: '1px dashed var(--color-ghost-border)', borderRadius: 8, textAlign: 'center', background: 'var(--color-cloud-canvas)' }}>
              <Icon name="image" size={20} color="var(--color-muted-ash-2)"/>
              <div style={{ fontSize: 14, marginTop: 8, color: 'var(--color-muted-ash)' }}>Įkelkite arba nutempkite</div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

/* ============================== ESTATE DETAIL (3 tabs) ============================== */
const ESTATE_UNITS = [
  { n: 'A-1', floor: 1, area: 42.1, status: 'sold', owner: 'L. Pociūtė' },
  { n: 'A-2', floor: 1, area: 56.8, status: 'sold', owner: 'V. Mockus' },
  { n: 'A-3', floor: 1, area: 68.4, status: 'available', owner: '—' },
  { n: 'B-12', floor: 4, area: 68.4, status: 'sold', owner: 'A. Kazlauskas' },
  { n: 'B-13', floor: 4, area: 72.0, status: 'sold', owner: 'D. Šimkus' },
  { n: 'B-14', floor: 4, area: 84.5, status: 'reserved', owner: 'R. Jankauskas' },
  { n: 'C-21', floor: 7, area: 95.2, status: 'available', owner: '—' },
  { n: 'C-22', floor: 7, area: 102.0, status: 'sold', owner: 'M. Petraitis' },
];

function AdminEstateDetail() {
  const [tab, setTab] = useStateA('units');
  const { setRoute } = useRouter();
  return (
    <>
      <Topbar
        breadcrumbs={['Objektai', 'Kalnų Terasos']}
        title="Kalnų Terasos"
        subtitle="Vilniaus g. 24, Vilnius · 32 butai · Statoma"
        actions={<>
          <button className="btn-ghost"><Icon name="edit" size={14}/>Redaguoti</button>
          <button className="btn-primary"><Icon name="plus" size={14}/>Naujas butas</button>
        </>}
      />
      <div style={{ padding: '24px 32px 0' }}>
        <div className="tabs">
          {[
            { id: 'units',    label: 'Butai',     n: ESTATE_UNITS.length },
            { id: 'photos',   label: 'Nuotraukos', n: 14 },
            { id: 'contacts', label: 'Kontaktai',  n: 6 },
          ].map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label} <span style={{ color: 'var(--color-muted-ash-2)', marginLeft: 4 }}>{t.n}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: '24px 32px 40px', flex: 1, overflowY: 'auto' }}>
        {tab === 'units' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 24 }}>Butas</th>
                  <th>Aukštas</th>
                  <th>Plotas</th>
                  <th>Savininkas</th>
                  <th>Būsena</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ESTATE_UNITS.map((u, i) => (
                  <tr key={i} className="row-hover" onClick={() => setRoute('unit-editor')}>
                    <td style={{ paddingLeft: 24, fontWeight: 500 }}>{u.n}</td>
                    <td>{u.floor}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{u.area.toFixed(1)} m²</td>
                    <td style={{ color: 'var(--color-muted-ash)' }}>{u.owner}</td>
                    <td>
                      <span className={`pill ${u.status === 'sold' ? 'pill-success' : u.status === 'reserved' ? 'pill-warning' : 'pill-neutral'}`}>
                        <Icon name="dot" size={8}/>
                        {u.status === 'sold' ? 'Parduotas' : u.status === 'reserved' ? 'Rezervuotas' : 'Laisvas'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: 24 }}><Icon name="chevron-right" size={16} color="var(--color-muted-ash-2)"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'photos' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 className="h-section">Objekto nuotraukos</h3>
              <button className="btn-primary"><Icon name="upload" size={14}/>Įkelti nuotraukas</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80',
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80',
                'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=80',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80',
                'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=80',
                'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80',
                'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80',
                'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=400&q=80',
              ].map((p, i) => (
                <div key={i} className="photo" style={{ aspectRatio: '4/3', backgroundImage: `url(${p})`, border: '1px solid var(--color-ghost-border)', position: 'relative' }}>
                  <button style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.9)', padding: 4, borderRadius: '50%' }}>
                    <Icon name="trash" size={12}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'contacts' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 className="h-section">Priskirti kontaktai</h3>
              <button className="btn-primary"><Icon name="plus" size={14}/>Priskirti kontaktą</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CONTACTS.slice(0,6).map((c, i) => (
                <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16 }}>
                  <Avatar name={c.name} size={40}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{c.name} <span style={{ color: 'var(--color-muted-ash-2)', fontWeight: 400 }}>· {c.org}</span></div>
                    <div className="t-meta">{c.cat} · {c.phone}</div>
                  </div>
                  <button style={{ padding: 8, borderRadius: 6 }}><Icon name="trash" size={14} color="var(--color-muted-ash-2)"/></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ============================== UNIT EDITOR (5 tabs) ============================== */
function AdminUnitEditor() {
  const [tab, setTab] = useStateA('technical');
  return (
    <>
      <Topbar
        breadcrumbs={['Objektai', 'Kalnų Terasos', 'B-12']}
        title="Butas B-12"
        subtitle="4 aukštas · 68.4 m² · Savininkas: Andrius Kazlauskas"
        actions={<>
          <span className="pill pill-success"><Icon name="check" size={10}/>Visi pakeitimai išsaugoti</span>
          <button className="btn-primary"><Icon name="eye" size={14}/>Peržiūrėti kaip savininkas</button>
        </>}
      />
      <div style={{ padding: '24px 32px 0' }}>
        <div className="tabs">
          {[
            { id: 'technical', label: 'Techninė info' },
            { id: 'documents', label: 'Dokumentai',   n: 12 },
            { id: 'photos',    label: 'Nuotraukos',   n: 8 },
            { id: 'services',  label: 'Paslaugos',    n: 4 },
            { id: 'steps',     label: 'Savininko eiga', n: 8 },
          ].map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}{t.n != null && <span style={{ color: 'var(--color-muted-ash-2)', marginLeft: 4 }}>{t.n}</span>}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: '24px 32px 40px', flex: 1, overflowY: 'auto' }}>
        {tab === 'technical' && (
          <div className="card" style={{ maxWidth: 720 }}>
            <h3 className="h-section" style={{ marginBottom: 4 }}>Techniniai duomenys</h3>
            <p className="t-body" style={{ marginBottom: 24 }}>Šie duomenys rodomi savininkui ir sutartyse.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <label><div className="t-caption" style={{ marginBottom: 6 }}>Buto Nr.</div><input className="input input-filled" defaultValue="B-12"/></label>
              <label><div className="t-caption" style={{ marginBottom: 6 }}>Aukštas</div><input className="input input-filled" defaultValue="4"/></label>
              <label><div className="t-caption" style={{ marginBottom: 6 }}>Korpusas</div><input className="input input-filled" defaultValue="B"/></label>
              <label><div className="t-caption" style={{ marginBottom: 6 }}>Bendras plotas (m²)</div><input className="input input-filled" defaultValue="68.4"/></label>
              <label><div className="t-caption" style={{ marginBottom: 6 }}>Naudingas plotas (m²)</div><input className="input input-filled" defaultValue="62.1"/></label>
              <label><div className="t-caption" style={{ marginBottom: 6 }}>Kambarių skaičius</div><input className="input input-filled" defaultValue="3"/></label>
              <label style={{ gridColumn: 'span 3' }}><div className="t-caption" style={{ marginBottom: 6 }}>Pastabos</div>
                <textarea className="input input-filled" rows={3} defaultValue="Su atvira virtuve, balkonu pietų pusėje."/>
              </label>
            </div>
          </div>
        )}
        {tab === 'documents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {PURCHASE_STEPS.slice(0,5).map(s => (
              <div key={s.id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div className="t-caption" style={{ marginBottom: 2 }}>Žingsnis {String(s.id).padStart(2,'0')}</div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>{s.title}</div>
                  </div>
                  <button className="btn-ghost"><Icon name="upload" size={14}/>Įkelti dokumentą</button>
                </div>
                {s.docs.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {s.docs.map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--color-cloud-canvas)', borderRadius: 6 }}>
                        <Icon name="file" size={14}/>
                        <span style={{ flex: 1, fontSize: 13 }}>{d.name}</span>
                        <span className="t-meta" style={{ fontSize: 12 }}>{d.size}</span>
                        <button style={{ padding: 4 }}><Icon name="download" size={14} color="var(--color-muted-ash-2)"/></button>
                        <button style={{ padding: 4 }}><Icon name="trash" size={14} color="var(--color-muted-ash-2)"/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {tab === 'photos' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 className="h-section">Buto nuotraukos</h3>
              <button className="btn-primary"><Icon name="upload" size={14}/>Įkelti</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
                'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400&q=80',
                'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&q=80',
                'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80',
                'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&q=80',
                'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80',
                'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80',
                'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&q=80',
              ].map((p, i) => (
                <div key={i} className="photo" style={{ aspectRatio: '4/3', backgroundImage: `url(${p})`, border: '1px solid var(--color-ghost-border)' }}></div>
              ))}
            </div>
          </div>
        )}
        {tab === 'services' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 900 }}>
            {SERVICES.map(s => (
              <div key={s.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 8,
                  background: 'var(--color-cloud-canvas)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}><Icon name={s.icon} size={20}/></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</div>
                  <div className="t-meta">{s.provider}</div>
                </div>
                <ToggleSwitch on={s.status === 'done'} />
              </div>
            ))}
          </div>
        )}
        {tab === 'steps' && <StepsControl />}
      </div>
    </>
  );
}

function ToggleSwitch({ on: defOn = false }) {
  const [on, setOn] = useStateA(defOn);
  return (
    <button onClick={() => setOn(!on)} style={{
      width: 40, height: 22, borderRadius: 999,
      background: on ? 'var(--color-electric-violet)' : 'var(--color-cloud-canvas)',
      border: '1px solid ' + (on ? 'var(--color-electric-violet)' : 'var(--color-ghost-border)'),
      position: 'relative', transition: 'background .15s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 20 : 2,
        width: 16, height: 16, borderRadius: '50%',
        background: 'var(--color-paper-white)', transition: 'left .15s',
      }}></div>
    </button>
  );
}

function StepsControl() {
  const [visible, setVisible] = useStateA({1:true,2:true,3:true,4:true,5:true,6:false,7:false,8:false});
  const [invite, setInvite] = useStateA('a.kazlauskas@mail.lt');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
      <div className="card">
        <h3 className="h-section" style={{ marginBottom: 4 }}>Matomi savininkui</h3>
        <p className="t-body" style={{ marginBottom: 20 }}>Įjunkite tik tuos žingsnius, kurie aktualūs šiam butui.</p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {PURCHASE_STEPS.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderTop: '1px solid var(--color-ghost-border)' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                background: 'var(--color-cloud-canvas)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 500, color: 'var(--color-muted-ash)',
              }}>{String(s.id).padStart(2,'0')}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{s.title}</div>
                <div className="t-meta">{s.sub}</div>
              </div>
              <ToggleSwitch on={visible[s.id]}/>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 className="h-section" style={{ marginBottom: 4 }}>Pakviesti savininką</h3>
          <p className="t-body" style={{ marginBottom: 16 }}>Atsiųsime prisijungimo nuorodą el. paštu.</p>
          <input className="input input-filled" value={invite} onChange={e => setInvite(e.target.value)} style={{ marginBottom: 12 }}/>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}><Icon name="send" size={14}/>Siųsti kvietimą</button>
        </div>
        <div className="card-flat" style={{ background: 'var(--color-violet-tint)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Icon name="check" size={14} color="var(--color-electric-violet)"/>
            <span className="t-caption" style={{ color: 'var(--color-electric-violet)' }}>Aktyvus</span>
          </div>
          <div style={{ fontSize: 14, color: 'var(--color-midnight-ink)' }}>
            Savininkas prisijungė paskutinį kartą 2026-05-25.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== DEFECTS LIST (admin) ============================== */
const ADMIN_DEFECTS = [
  { id: 'D-204', estate: 'Kalnų Terasos', unit: 'B-12', owner: 'a.kazlauskas@mail.lt', title: 'Vonios kambario plytelės', status: 'progress', date: '2026-05-22' },
  { id: 'D-203', estate: 'Pajūrio Namai', unit: 'A-08', owner: 'l.pociute@mail.lt',     title: 'Balkono durys nesisuka', status: 'open', date: '2026-05-21' },
  { id: 'D-202', estate: 'Kalnų Terasos', unit: 'B-12', owner: 'a.kazlauskas@mail.lt', title: 'Virtuvės spintelės durelės', status: 'open', date: '2026-05-18' },
  { id: 'D-201', estate: 'Auksakalniai',  unit: 'L-3',  owner: 'm.petraitis@mail.lt',   title: 'Šildymo sistema nedirba', status: 'progress', date: '2026-05-17' },
  { id: 'D-200', estate: 'Švyturys',      unit: 'C-22', owner: 'd.simkus@mail.lt',      title: 'Grindjuostė atšokusi', status: 'resolved', date: '2026-05-12' },
  { id: 'D-199', estate: 'Pajūrio Namai', unit: 'B-04', owner: 'r.jankauskas@mail.lt',  title: 'Sienos tinkas', status: 'resolved', date: '2026-05-10' },
  { id: 'D-198', estate: 'Kalnų Terasos', unit: 'B-12', owner: 'a.kazlauskas@mail.lt', title: 'Virtuvės maišytuvas laša', status: 'resolved', date: '2026-05-05' },
];

function AdminDefects() {
  const [estate, setEstate] = useStateA('all');
  const [status, setStatus] = useStateA('all');
  const { setRoute } = useRouter();
  const filtered = ADMIN_DEFECTS.filter(d =>
    (estate === 'all' || d.estate === estate) &&
    (status === 'all' || d.status === status)
  );
  return (
    <>
      <Topbar
        title="Defektai"
        subtitle={`${filtered.length} pranešimai · ${ADMIN_DEFECTS.filter(d=>d.status!=='resolved').length} laukia veiksmų`}
        actions={<button className="btn-ghost"><Icon name="download" size={14}/>Eksportuoti</button>}
      />
      <div style={{ padding: '24px 32px 40px', flex: 1, overflowY: 'auto' }}>
        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Icon name="filter" size={14} color="var(--color-muted-ash-2)"/>
          <select className="input" value={estate} onChange={e=>setEstate(e.target.value)} style={{ width: 220 }}>
            <option value="all">Visi objektai</option>
            {[...new Set(ADMIN_DEFECTS.map(d=>d.estate))].map(e=><option key={e}>{e}</option>)}
          </select>
          <select className="input" value={status} onChange={e=>setStatus(e.target.value)} style={{ width: 200 }}>
            <option value="all">Visos būsenos</option>
            <option value="open">Atvirti</option>
            <option value="progress">Vykdomi</option>
            <option value="resolved">Išspręsti</option>
          </select>
          <div style={{ flex: 1 }}></div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div className="pill pill-warning"><Icon name="dot" size={8}/>2 atvirti</div>
            <div className="pill pill-violet"><Icon name="dot" size={8}/>2 vykdomi</div>
            <div className="pill pill-success"><Icon name="check" size={10}/>3 išspręsti</div>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ paddingLeft: 24 }}>ID</th>
                <th>Pranešimas</th>
                <th>Objektas / Butas</th>
                <th>Savininkas</th>
                <th>Data</th>
                <th>Būsena</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="row-hover" onClick={() => setRoute('defect-thread')}>
                  <td style={{ paddingLeft: 24, fontVariantNumeric: 'tabular-nums', color: 'var(--color-muted-ash-2)' }}>{d.id}</td>
                  <td style={{ fontWeight: 500 }}>{d.title}</td>
                  <td style={{ color: 'var(--color-muted-ash)' }}>
                    <div>{d.estate}</div>
                    <div className="t-meta">Butas {d.unit}</div>
                  </td>
                  <td style={{ color: 'var(--color-muted-ash)' }}>{d.owner}</td>
                  <td style={{ color: 'var(--color-muted-ash)', fontVariantNumeric: 'tabular-nums' }}>{d.date}</td>
                  <td><StatusPill status={d.status}/></td>
                  <td style={{ textAlign: 'right', paddingRight: 24 }}><Icon name="chevron-right" size={16} color="var(--color-muted-ash-2)"/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ============================== DEFECT THREAD (admin) ============================== */
function AdminDefectThread() {
  const [status, setStatus] = useStateA('progress');
  const [reply, setReply] = useStateA('');
  return (
    <>
      <Topbar
        breadcrumbs={['Defektai', 'D-204']}
        title="Vonios kambario plytelės — siūlių defektas"
        subtitle="Kalnų Terasos · Butas B-12 · A. Kazlauskas"
        actions={<>
          <button className="btn-ghost"><Icon name="trash" size={14}/>Ištrinti</button>
        </>}
      />
      <div style={{ padding: '24px 32px 40px', flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        {/* Thread */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Original */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Avatar name="Andrius Kazlauskas" size={36}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Andrius Kazlauskas</div>
                  <div className="t-meta">Savininkas · 2026-05-22 14:32</div>
                </div>
                <span className="pill pill-neutral">Pradinis pranešimas</span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--color-muted-ash)', marginBottom: 16, lineHeight: 1.5 }}>
                Pastebėjau, kad pora plytelių siūlių yra netolygios prie dušo zonos.
                Vienoje vietoje siūlė šiek tiek prasiplėtusi ir matosi šviesi linija.
                Pridedu nuotraukas, ratu pažymėjau probleminę vietą.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=300&q=80',
                  'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=300&q=80']
                  .map((p,i) => <div key={i} className="photo" style={{ width: 120, height: 90, backgroundImage: `url(${p})`, border: '1px solid var(--color-ghost-border)' }}></div>)}
              </div>
            </div>
            {/* Reply */}
            <div className="card" style={{ background: 'var(--color-violet-tint)', border: '1px solid var(--color-violet-tint-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Avatar name="Tomas Mockus" size={36} bg="var(--color-midnight-ink)"/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Tomas Mockus</div>
                  <div className="t-meta">Domus · 2026-05-23 09:14</div>
                </div>
                <span className="pill pill-violet">Atsakymas</span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--color-muted-ash)', lineHeight: 1.5 }}>
                Ačiū už pranešimą. Užregistravome ir perdavėme statybų grupei.
                Meistras atvyks šią savaitę, su jumis susisieksime dėl tikslaus laiko.
              </div>
            </div>
            {/* Reply composer */}
            <div className="card">
              <div className="t-caption" style={{ marginBottom: 8 }}>Atsakymas savininkui</div>
              <textarea className="input input-filled" rows={4} value={reply} onChange={e=>setReply(e.target.value)} placeholder="Parašykite atsakymą..." style={{ marginBottom: 12 }}/>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button className="btn-ghost"><Icon name="paperclip" size={14}/>Pridėti failą</button>
                <button className="btn-primary"><Icon name="send" size={14}/>Siųsti atsakymą</button>
              </div>
            </div>
          </div>
        </div>
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h4 className="h-section" style={{ fontSize: 16, marginBottom: 16 }}>Būsena</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { id: 'open',     label: 'Atviras',    color: 'var(--color-warning)' },
                { id: 'progress', label: 'Vykdomas',   color: 'var(--color-electric-violet)' },
                { id: 'resolved', label: 'Išspręstas', color: 'var(--color-success)' },
                { id: 'rejected', label: 'Atmestas',   color: 'var(--color-danger)' },
              ].map(s => (
                <button key={s.id} onClick={() => setStatus(s.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: status === s.id ? 'var(--color-cloud-canvas)' : 'transparent',
                  border: '1px solid ' + (status === s.id ? 'var(--color-ghost-border)' : 'transparent'),
                  textAlign: 'left',
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }}></span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{s.label}</span>
                  {status === s.id && <Icon name="check" size={14} color="var(--color-muted-ash-2)" />}
                </button>
              ))}
            </div>
          </div>
          <div className="card">
            <h4 className="h-section" style={{ fontSize: 16, marginBottom: 16 }}>Detalės</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><div className="t-caption" style={{ marginBottom: 2 }}>ID</div><div style={{ fontSize: 14 }}>D-204</div></div>
              <div><div className="t-caption" style={{ marginBottom: 2 }}>Objektas</div><div style={{ fontSize: 14 }}>Kalnų Terasos</div></div>
              <div><div className="t-caption" style={{ marginBottom: 2 }}>Butas</div><div style={{ fontSize: 14 }}>B-12</div></div>
              <div><div className="t-caption" style={{ marginBottom: 2 }}>Patalpa</div><div style={{ fontSize: 14 }}>Vonia</div></div>
              <div><div className="t-caption" style={{ marginBottom: 2 }}>Priskirta</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <Avatar name="Mindaugas Petraitis" size={24}/>
                  <span style={{ fontSize: 13 }}>Mindaugas Petraitis</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================== CONTACTS LIBRARY ============================== */
const CONTACT_CATEGORIES = ['Visi', 'Langai', 'Šildymas', 'Vandentiekis', 'Elektra', 'Internetas', 'Bendrosios patalpos'];

const ADMIN_CONTACTS = [
  ...CONTACTS,
  { cat: 'Vandentiekis', name: 'Aušra Kubilienė', org: 'Vilniaus vandenys', phone: '+370 5 266 4000', mail: 'info@vv.lt' },
  { cat: 'Langai ir durys', name: 'Justas Adomavičius', org: 'Plastlangiai', phone: '+370 654 22113', mail: 'justas@plastlangiai.lt', doc: 'Garantija_durys.pdf' },
  { cat: 'Šildymas', name: 'Tadas Žilinskas', org: 'Termo Pro', phone: '+370 657 44558', mail: 't.zilinskas@termopro.lt' },
];

function AdminContacts() {
  const [cat, setCat] = useStateA('Visi');
  const filtered = cat === 'Visi' ? ADMIN_CONTACTS : ADMIN_CONTACTS.filter(c => c.cat.includes(cat));
  return (
    <>
      <Topbar
        title="Kontaktai"
        subtitle={`${ADMIN_CONTACTS.length} specialistai · globali biblioteka`}
        actions={<button className="btn-primary"><Icon name="plus" size={14}/>Naujas kontaktas</button>}
      />
      <div style={{ padding: '24px 32px 40px', flex: 1, overflowY: 'auto' }}>
        {/* Category pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {CONTACT_CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: '8px 14px', borderRadius: 'var(--radius-pill)', fontSize: 13,
              background: cat === c ? 'var(--color-midnight-ink)' : 'var(--color-paper-white)',
              color: cat === c ? 'var(--color-paper-white)' : 'var(--color-midnight-ink)',
              border: '1px solid ' + (cat === c ? 'var(--color-midnight-ink)' : 'var(--color-ghost-border)'),
            }}>{c}</button>
          ))}
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ paddingLeft: 24 }}>Specialistas</th>
                <th>Kategorija</th>
                <th>Telefonas</th>
                <th>El. paštas</th>
                <th>Dokumentai</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={i} className="row-hover">
                  <td style={{ paddingLeft: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar name={c.name} size={36}/>
                      <div>
                        <div style={{ fontWeight: 500 }}>{c.name}</div>
                        <div className="t-meta">{c.org}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="pill pill-neutral">{c.cat}</span></td>
                  <td style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--color-muted-ash)' }}>{c.phone}</td>
                  <td style={{ color: 'var(--color-muted-ash)' }}>{c.mail}</td>
                  <td>{c.doc ? <span className="pill pill-violet"><Icon name="file" size={10}/>1</span> : <span style={{ color: 'var(--color-muted-ash-2)' }}>—</span>}</td>
                  <td style={{ textAlign: 'right', paddingRight: 24 }}>
                    <div style={{ display: 'inline-flex', gap: 4 }}>
                      <button style={{ padding: 6, borderRadius: 6 }}><Icon name="edit" size={14} color="var(--color-muted-ash-2)"/></button>
                      <button style={{ padding: 6, borderRadius: 6 }}><Icon name="trash" size={14} color="var(--color-muted-ash-2)"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ============================== ADMIN APP WRAPPER ============================== */
function AdminApp({ initialRoute = 'estates' }) {
  return (
    <ScreenRouter role="admin" initialRoute={initialRoute}>
      <ScreenLayout>
        <AdminRoute/>
      </ScreenLayout>
    </ScreenRouter>
  );
}
function AdminRoute() {
  const { route } = useRouter();
  switch (route) {
    case 'estates':       return <AdminEstates/>;
    case 'estate-detail': return <AdminEstateDetail/>;
    case 'unit-editor':   return <AdminUnitEditor/>;
    case 'defects':       return <AdminDefects/>;
    case 'defect-thread': return <AdminDefectThread/>;
    case 'contacts':      return <AdminContacts/>;
    default:              return <AdminEstates/>;
  }
}

Object.assign(window, { AdminApp });
