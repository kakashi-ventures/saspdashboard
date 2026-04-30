// App shell — side rail, top status, common bits
const { useState, useEffect, useRef, useMemo, useCallback } = React;

function SideRail({ screen, setScreen }) {
  const items = [
    { id:'portfolio', label:'Portfolio', Icon: window.Icons.Portfolio },
    { id:'sources',   label:'Signals',   Icon: window.Icons.Sources },
    { id:'audiences', label:'Segments',  Icon: window.Icons.Audiences },
    { id:'simulator', label:'Simulator', Icon: window.Icons.Simulator },
  ];
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[72px] bg-paper-0 flex flex-col items-center z-30">
      <div className="h-[60px] w-full grid place-items-center border-b border-ink-100/80 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-navy-900 text-paper-0 grid place-items-center">
          <window.Icons.Logo size={20} />
        </div>
      </div>
      <div className="w-full flex-1 flex flex-col items-center border-r border-ink-100/80 py-5">
        <nav className="flex flex-col gap-1 items-center">
          {items.map(({id,label,Icon}) => {
            const active = screen === id;
            return (
              <button key={id} onClick={()=>setScreen(id)}
                className={`group relative w-12 h-12 rounded-xl grid place-items-center transition
                  ${active ? 'bg-brand-surface text-navy-900' : 'text-ink-500 hover:text-ink-900 hover:bg-paper-100'}`}>
                <Icon size={20} stroke={active?1.8:1.6}/>
                <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-ink-900 text-paper-0 text-[11px] font-medium opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">{label}</span>
                {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-brand"/>}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col items-center gap-2 text-ink-400">
          <div className="w-9 h-9 rounded-full bg-paper-100 grid place-items-center text-[11px] font-semibold text-ink-700">FT</div>
        </div>
      </div>
    </aside>
  );
}

function TenantSwitcher({ orgs=[], activeOrgId, activeProductId, onSelectOrg, onSelectProduct }) {
  const [open, setOpen] = useState(false);
  const [previewOrgId, setPreviewOrgId] = useState(activeOrgId);
  const ref = useRef(null);
  const activeOrg = orgs.find(org => org.id === activeOrgId) || orgs[0];
  const activeProduct = activeOrg?.products.find(item => item.id === activeProductId) || activeOrg?.products[0];
  const previewOrg = orgs.find(org => org.id === previewOrgId) || activeOrg;

  useEffect(() => {
    setPreviewOrgId(activeOrgId);
  }, [activeOrgId]);

  useEffect(() => {
    const close = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  if (!activeOrg || !activeProduct) return null;

  const chooseOrg = (org) => {
    setPreviewOrgId(org.id);
    onSelectOrg?.(org.id);
  };

  const chooseProduct = (product) => {
    onSelectProduct?.(previewOrg.id, product.id);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative shrink-0 self-center">
      <button onClick={()=>setOpen(o=>!o)}
        className="w-[270px] rounded-lg bg-paper-0 hover:bg-paper-50 px-3 py-2 text-left flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-navy-900 text-paper-0 grid place-items-center text-[11px] font-semibold">
          {activeOrg.name.split(' ').map(part => part[0]).join('').slice(0,2)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-400 font-medium">Institution</div>
          <div className="text-[13px] font-semibold text-ink-900 truncate">{activeOrg.name}</div>
          <div className="text-[11px] text-ink-500 truncate">{activeProduct.name}</div>
        </div>
        <window.Icons.Chevron size={14} className={`text-ink-400 transition ${open?'rotate-180':''}`}/>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-[620px] rounded-xl bg-paper-0 hairline shadow-lift z-50 overflow-hidden">
          <div className="grid grid-cols-[240px_1fr]">
            <div className="border-r border-ink-100/80 p-3 bg-paper-50">
              <div className="text-[11px] uppercase tracking-[0.14em] text-ink-400 font-medium px-2 mb-2">Institution layer</div>
              <div className="space-y-1">
                {orgs.map(org => {
                  const selected = org.id === activeOrgId;
                  return (
                    <button key={org.id} onClick={()=>chooseOrg(org)}
                      className={`w-full rounded-lg p-2.5 text-left flex items-start gap-2.5 ${selected ? 'bg-brand-surface text-navy-900' : 'hover:bg-paper-0 text-ink-700'}`}>
                      <div className={`mt-0.5 w-7 h-7 rounded-md grid place-items-center text-[11px] font-semibold ${selected ? 'bg-navy-900 text-paper-0' : 'bg-paper-100 text-ink-600'}`}>
                        {org.name.split(' ').map(part => part[0]).join('').slice(0,2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-semibold truncate">{org.name}</div>
                        <div className="text-[11px] text-ink-500 truncate">{org.plan} · {org.region}</div>
                      </div>
                      {selected && <window.Icons.Check size={13} className="mt-1 text-navy-700"/>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3">
              <div className="flex items-center justify-between px-2 mb-2">
                <div className="text-[11px] uppercase tracking-[0.14em] text-ink-400 font-medium">Product portfolio</div>
                <div className="text-[11px] text-ink-400">{previewOrg.products.length} products</div>
              </div>
              <div className="space-y-1">
                {previewOrg.products.map(product => {
                  const selected = previewOrg.id === activeOrgId && product.id === activeProductId;
                  return (
                    <button key={product.id} onClick={()=>chooseProduct(product)}
                      className={`w-full rounded-lg p-3 text-left hairline ${selected ? 'bg-brand-surface' : 'bg-paper-0 hover:bg-paper-50'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-2 h-2 rounded-full ${selected ? 'bg-brand' : 'bg-ink-200'}`}/>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="text-[13px] font-semibold text-ink-900 truncate">{product.name}</div>
                            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-paper-100 text-ink-500">{product.status}</span>
                          </div>
                          <div className="text-[12px] text-ink-500 mt-0.5 truncate">{product.segment}</div>
                          <div className="mt-2 flex items-center gap-3 text-[11px] text-ink-400 num">
                            <span>{product.items} records</span>
                            <span>{product.rate.toFixed(2)}%</span>
                            <span>{product.term} mo</span>
                          </div>
                        </div>
                        {selected && <window.Icons.Check size={14} className="text-navy-700"/>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TopBar({
  project='Digital Personal Loan · Young Professionals 25–35',
  subtitle='Banca Esempio Italia · v0.4 draft',
  orgs=[],
  activeOrgId,
  activeProductId,
  onSelectOrg,
  onSelectProduct,
  mockTime='09:42',
  savedAt='09:42',
  onShare,
  onSave,
  tourCompleted=false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const demoParams = new URLSearchParams();
  if (activeOrgId) demoParams.set('org', activeOrgId);
  if (activeProductId) demoParams.set('product', activeProductId);
  const demoHref = `SASP-tour.html${demoParams.toString() ? `?${demoParams.toString()}` : ''}`;

  useEffect(() => {
    const close = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <header className="border-b border-ink-100/80 bg-paper-0/90 backdrop-blur sticky top-0 z-20">
      <div className="max-w-[1440px] mx-auto px-8 h-[60px] flex items-center gap-5">
        <TenantSwitcher
          orgs={orgs}
          activeOrgId={activeOrgId}
          activeProductId={activeProductId}
          onSelectOrg={onSelectOrg}
          onSelectProduct={onSelectProduct}
        />
        <div className="hidden lg:block h-8 w-px bg-ink-100"/>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold text-ink-900 truncate">{project}</div>
        </div>
        <div className="flex items-center gap-1.5">
          {!tourCompleted && (
            <a href={demoHref} data-demo-link="true" className="px-2.5 py-1.5 rounded-md text-[12px] font-semibold text-navy-900 bg-brand-surface hover:bg-brand-surface border border-green-200 inline-flex items-center gap-1.5" title="Watch the SASP demo tour">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 2v8l7-4z"/></svg>
              Watch demo
            </a>
          )}
          <button onClick={onSave} className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-ink-900 text-paper-0 hover:bg-brand-emphasis">Save</button>
          <div ref={menuRef} className="relative">
            <button onClick={()=>setMenuOpen(o=>!o)} aria-label="More" className="px-2 py-1.5 rounded-md text-ink-500 hover:text-ink-900 hover:bg-paper-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-[220px] rounded-xl bg-paper-0 hairline shadow-lift z-50 overflow-hidden">
                <button onClick={()=>{ setMenuOpen(false); onShare?.(); }} className="w-full px-4 py-2.5 text-left text-[12px] text-ink-800 hover:bg-paper-50">Share scenario</button>
                <div className="px-4 py-2 text-[11px] text-ink-400 num border-t border-ink-100/80">{subtitle}</div>
                <div className="px-4 pb-2.5 text-[11px] text-ink-400 num">Saved {savedAt} · {mockTime}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function StatusStrip({ ready=true, onPrimary, onToast, logItems=[], itemCount=12718, sourceCount=6 }) {
  const [logOpen, setLogOpen] = useState(false);
  const [running, setRunning] = useState(false);

  const handlePrimary = () => {
    if (running) return;
    setRunning(true);
    onToast?.('Generating financial segments', 'Mock model pass started over bank CRM, policy docs, X, and Reddit.');
    setTimeout(() => {
      setRunning(false);
      onPrimary?.();
    }, 900);
  };

  const logs = logItems.length ? logItems : [
    '09:42 · Salesforce banking cohort map refreshed',
    '09:40 · Reddit stream added 38 consumer finance posts',
    '09:37 · Website crawl indexed loan and policy FAQ updates',
  ];

  return (
    <div className="space-y-2">
      <div className="rounded-xl bg-paper-0 hairline px-5 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full ${ready?'bg-brand-accent':'bg-amber-500'} animate-pulse`}/>
          <span className="text-[13px] font-medium text-ink-800">{running ? 'Generating customer segments' : 'Receiving data from sources'}</span>
        </div>
        <div className="text-[12px] text-ink-400 num">{itemCount.toLocaleString()} records · last sync 2 min ago · {sourceCount} sources connected</div>
        <div className="ml-auto flex items-center gap-3">
          <button onClick={()=>setLogOpen(o=>!o)} className="text-[12px] text-ink-500 hover:text-ink-900">
            {logOpen ? 'Hide log' : 'View log'}
          </button>
          <button onClick={handlePrimary} disabled={running}
            className={`px-3.5 py-2 rounded-md text-[12px] font-semibold inline-flex items-center gap-1.5 ${running ? 'bg-brand-accent text-paper-0 cursor-wait' : 'bg-brand text-ink-900 hover:bg-brand-emphasis'}`}>
            <window.Icons.Spark size={14}/> {running ? 'Generating...' : 'Generate segments'}
          </button>
        </div>
      </div>

      {logOpen && (
        <div className="rounded-xl bg-paper-0 hairline p-4">
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-400 font-medium mb-2">Recent activity</div>
          <div className="space-y-1.5">
            {logs.map((item) => (
              <div key={item} className="text-[12px] text-ink-700 num">{item}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Pill({ children, tone='ink', size='sm' }) {
  const tones = {
    ink:   'bg-paper-100 text-ink-700',
    green: 'bg-brand-surface text-navy-900',
    greenSolid: 'bg-brand text-ink-900',
    outline: 'text-ink-700 hairline bg-paper-0',
    distrust: 'bg-amber-100 text-amber-700',
    amber: 'bg-amber-100 text-amber-700',
  };
  const sizes = { xs:'text-[11px] px-1.5 py-0.5', sm:'text-[12px] px-2 py-0.5', md:'text-[12px] px-2.5 py-1' };
  return <span className={`inline-flex items-center gap-1 rounded-full font-medium ${tones[tone]} ${sizes[size]}`}>{children}</span>;
}

function SectionHeader({ eyebrow, title, sub, right }) {
  return (
    <div className="flex items-end justify-between gap-6 mb-5">
      <div>
        {eyebrow && <div className="text-[11px] uppercase tracking-[0.14em] text-ink-400 font-medium mb-2">{eyebrow}</div>}
        <h1 className="text-[24px] leading-tight font-semibold tracking-[-0.01em] text-ink-900">{title}</h1>
        {sub && <p className="text-[13px] text-ink-500 mt-1.5 max-w-[60ch]">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

// Initial-on-color avatar for customer segments — abstract identity, deterministic color cycle
function SegmentAvatar({ name, id, size = 'md', className = '' }) {
  const palette = [
    'bg-navy-900 text-paper-0',
    'bg-brand-accent text-paper-0',
    'bg-navy-700 text-paper-0',
    'bg-ink-700 text-paper-0',
    'bg-green-700 text-paper-0',
  ];
  const hash = String(id || name || '').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const tone = palette[hash % palette.length];
  const initial = (name?.charAt(0) || '?').toUpperCase();
  const sizeCls = {
    xs: 'w-7 h-7 text-[11px]',
    sm: 'w-12 h-12 text-[15px]',
    md: 'w-16 h-16 text-[20px]',
  }[size] || 'w-16 h-16 text-[20px]';
  return (
    <div className={`rounded-full grid place-items-center shrink-0 font-semibold tracking-[-0.02em] select-none ${sizeCls} ${tone} ${className}`} aria-hidden="true">
      {initial}
    </div>
  );
}

window.SideRail = SideRail;
window.TopBar = TopBar;
window.StatusStrip = StatusStrip;
window.Pill = Pill;
window.SectionHeader = SectionHeader;
window.SegmentAvatar = SegmentAvatar;
