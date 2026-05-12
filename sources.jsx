// Sources screen — unified data integrations + public sources
function IntegrationRow({ icon, name, hint, status, last, count, onResync, onConfigure }) {
  const live = status === 'connected';
  return (
    <div className="rounded-xl hairline bg-paper-0 px-4 py-3 flex items-center gap-4">
      <div className="w-9 h-9 rounded-lg bg-paper-100 grid place-items-center text-ink-700 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="text-[13px] font-semibold text-ink-900 truncate">{name}</div>
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full ${live?'bg-brand-surface text-navy-900':'bg-paper-100 text-ink-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${live?'bg-brand-accent animate-pulse':'bg-ink-300'}`}/>
            {live?'Connected':'Idle'}
          </span>
        </div>
        <div className="text-[12px] text-ink-500 truncate">{hint}</div>
      </div>
      <div className="hidden md:block text-right shrink-0 pr-2">
        <div className="text-[11px] uppercase tracking-wider text-ink-400">Last sync</div>
        <div className="num text-[12px] text-ink-800 font-medium">{last}</div>
      </div>
      <div className="hidden lg:block text-right shrink-0 pr-2 min-w-[120px]">
        <div className="text-[11px] uppercase tracking-wider text-ink-400">Records</div>
        <div className="num text-[12px] text-ink-800 font-medium">{count}</div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onResync} className="px-2.5 py-1.5 rounded-md text-[12px] font-medium hairline bg-paper-0 text-ink-700 hover:bg-paper-50">{live?'Re-sync':'Connect'}</button>
        <button onClick={onConfigure} className="px-2 py-1.5 rounded-md text-[12px] text-ink-500 hover:text-ink-900 hover:bg-paper-100">Configure</button>
      </div>
    </div>
  );
}

function DataIntegrations({ connectors, onAction, onAdd }) {
  const iconFor = {
    gdrive: <window.Icons.Drive size={16}/>,
    web:    <window.Icons.Globe size={16}/>,
    crm:    <window.Icons.Cloud size={16}/>,
    csv:    <window.Icons.Upload size={16}/>,
  };
  const liveCount = connectors.filter(c => c.status === 'connected').length;
  return (
    <div className="rounded-2xl bg-paper-0 hairline p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div>
          <div className="text-[15px] font-semibold text-ink-900">Data integrations</div>
          <div className="text-[12px] text-ink-500">Banking, CRM, policy, and document sources feeding the model</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <window.Pill tone="green" size="xs">{liveCount} of {connectors.length} connected</window.Pill>
          <button onClick={onAdd}
            className="px-2.5 py-1.5 rounded-md text-[12px] font-medium hairline bg-paper-0 text-ink-700 hover:bg-paper-50 inline-flex items-center gap-1.5">
            <window.Icons.Plus size={11}/> Add integration
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {connectors.map(c => (
          <IntegrationRow
            key={c.id}
            icon={iconFor[c.id] || <window.Icons.Cloud size={16}/>}
            name={c.name}
            hint={c.hint}
            status={c.status}
            last={c.last}
            count={c.count}
            onResync={()=>onAction(c.id)}
            onConfigure={()=>onAction(c.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SignalsTile({ logo, name, color, terms, accounts, posts, rate, sub, references=[], onToast }) {
  const [val, setVal] = useState('');
  const [tags, setTags] = useState(terms);
  const [postCount, setPostCount] = useState(posts);
  const add = () => {
    const next = val.trim();
    if (!next) return;
    setTags(t => [...t, next]);
    setPostCount(n => n + 31);
    setVal('');
    onToast?.(`${name} term added`, `${next} is now included in the public source stream.`);
  };
  const remove = (tag) => {
    setTags(t => t.filter(item => item !== tag));
    onToast?.(`${name} term removed`, `${tag} is no longer tracked.`);
  };
  return (
    <div className="rounded-2xl bg-paper-0 hairline p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg grid place-items-center" style={{background:color, color:'#fff'}}>{logo}</div>
          <div>
            <div className="text-[15px] font-semibold text-ink-900">{name}</div>
            <div className="text-[12px] text-ink-500">{sub}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-wider text-ink-400">Posts collected</div>
          <div className="num text-[18px] font-semibold text-ink-900 leading-none mt-0.5">{postCount.toLocaleString()}</div>
          <div className="text-[11px] text-navy-700 num mt-0.5">{rate}</div>
        </div>
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-[0.12em] text-ink-400 font-medium mb-2">{name==='Reddit'?'Finance communities':'Market terms'}</div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map(t => (
            <span key={t} className="inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full hairline bg-paper-0 text-ink-700">
              {t}<button onClick={()=>remove(t)} className="text-ink-300 hover:text-ink-700"><window.Icons.X size={10}/></button>
            </span>
          ))}
          <div className="inline-flex items-center gap-1 hairline rounded-full px-2 py-0.5 bg-paper-50">
            <input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()}
              placeholder="Add term…" className="bg-transparent text-[12px] outline-none w-24 placeholder:text-ink-400"/>
            <button onClick={add} className="text-ink-500 hover:text-ink-900"><window.Icons.Plus size={11}/></button>
          </div>
        </div>
      </div>

      {references.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-ink-400 font-medium mb-2">Recent references</div>
          <div className="space-y-2">
            {references.slice(0, 2).map((ref, idx) => (
              <div key={idx} className="rounded-lg hairline bg-paper-50 px-3 py-2 text-[12px] text-ink-700 leading-snug">
                {ref}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-[11px] uppercase tracking-[0.12em] text-ink-400 font-medium mb-2">Monitored accounts</div>
        <div className="flex flex-wrap gap-1.5">
          {accounts.map(a => <window.Pill key={a} tone="outline" size="sm">{a}</window.Pill>)}
        </div>
      </div>
    </div>
  );
}

function InflowIndicator({ totalItems }) {
  return (
    <div className="rounded-xl bg-brand-surface border border-green-200 px-4 py-2.5 flex items-center gap-3">
      <div className="relative w-8 h-8 grid place-items-center">
        <span className="absolute inset-0 rounded-full bg-green-300/40 pulse-ring"/>
        <span className="relative w-3 h-3 rounded-full bg-brand"/>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-semibold text-navy-900">Receiving data</div>
        <div className="text-[11px] text-navy-900/80 num">{totalItems.toLocaleString()} records collected · updates flowing in real time</div>
      </div>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-navy-700">
        <path d="M12 19V5"/>
        <path d="m6 11 6-6 6 6"/>
      </svg>
    </div>
  );
}

const FRESH_THEME_LABELS = {
  A: 'Income volatility',
  B: 'Tasso fisso vs variabile',
  C: 'Garante / Consap / ISEE',
  D: 'Hidden costs / polizze',
  E: 'Identity language',
  F: 'Market context',
  OTHER: 'Other',
};

function FreshSignalsTile({ onToast }) {
  const [signals, setSignals] = useState([]);
  const [counts, setCounts] = useState(null);
  const [lastRun, setLastRun] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { getFreshSignals } = window.SASP_DATA || {};
      if (!getFreshSignals) { setSignals([]); return; }
      const data = await getFreshSignals({ limit: 12 });
      setSignals(data.signals || []);
      setCounts(data.counts || null);
      setLastRun(data.last_run || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRefresh = () => {
    load();
    onToast?.('Fresh signals refresh', 'Pulled the latest validated paraphrases.');
  };

  const lastIngestLabel = lastRun
    ? `${new Date(lastRun.ts).toLocaleString()} · ${lastRun.posts_added} added, ${lastRun.posts_seen} seen${lastRun.error ? ' ⚠' : ''}`
    : 'no run yet';

  return (
    <div className="rounded-2xl bg-paper-0 hairline p-5 space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[15px] font-semibold text-ink-900">Fresh signals · Finanzaonline</h2>
            <window.Pill tone="green" size="xs">HITL validated</window.Pill>
            <window.Pill tone="outline" size="xs">Live pipeline</window.Pill>
          </div>
          <p className="text-[12px] text-ink-500 mt-1 leading-snug max-w-[60ch]">
            Daily crawl of the Mutui sub-forum → Claude paraphrase (copyright-safe) → native-Italian validator review. Approved signals feed the KO library, not distribution shape.
          </p>
        </div>
        <button onClick={handleRefresh} disabled={loading}
          className="px-3 py-1.5 rounded-md text-[12px] font-medium hairline bg-paper-0 text-ink-700 hover:bg-paper-50 shrink-0">
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-ink-500">
        <span>
          <span className="text-[11px] uppercase tracking-[0.12em] text-ink-400 font-medium">Last ingest</span>
          <span className="num text-ink-700 ml-2">{lastIngestLabel}</span>
        </span>
        {counts && (
          <span className="ml-auto num">
            {counts.approved} approved · {counts.pending} pending · {counts.rejected} rejected
          </span>
        )}
      </div>

      {signals.length === 0 ? (
        <div className="rounded-xl hairline bg-paper-50 px-4 py-6 text-center space-y-1">
          <div className="text-[12px] font-semibold text-ink-700">No validated signals yet</div>
          <div className="text-[11px] text-ink-500 max-w-[44ch] mx-auto">
            The first batch appears after the daily crawl (04:00 UTC) and the validator approves. Until then, this tile sits empty by design.
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {signals.map(sig => (
            <div key={sig.id} className="rounded-xl hairline bg-paper-0 px-4 py-3">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <window.Pill tone="green" size="xs">
                  {sig.theme} · {FRESH_THEME_LABELS[sig.theme] || 'Other'}
                </window.Pill>
                <span className="text-[11px] text-ink-400 num">
                  {new Date(sig.captured_at).toLocaleDateString()}
                </span>
                <a href={sig.source_url} target="_blank" rel="noopener noreferrer"
                  className="ml-auto text-[11px] text-navy-700 hover:underline">
                  Open original ↗
                </a>
              </div>
              <p className="text-[12px] text-ink-800 leading-snug">
                {sig.edited_paraphrase || sig.paraphrase}
              </p>
              {sig.thread_title && (
                <div className="text-[11px] text-ink-400 mt-1.5 truncate">
                  Thread: {sig.thread_title}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SignalsGenerationGate({ productName, onComplete }) {
  const [phase, setPhase] = useState('idle');
  const [stepIdx, setStepIdx] = useState(0);
  const steps = [
    'Connecting to Reddit, LinkedIn, X & finance forums…',
    'Paraphrasing posts (copyright-safe)…',
    'Running native-speaker validator & indexing themes…',
  ];
  useEffect(() => {
    if (phase !== 'running') return;
    if (stepIdx >= steps.length) {
      const done = setTimeout(() => onComplete?.(), 350);
      return () => clearTimeout(done);
    }
    const t = setTimeout(() => setStepIdx(i => i + 1), 550);
    return () => clearTimeout(t);
  }, [phase, stepIdx]);

  if (phase === 'idle') {
    return (
      <div className="space-y-6">
        <window.SectionHeader
          eyebrow="Phase 1 · Signals"
          title="Generate social signals"
          sub={`No signals have been collected for ${productName || 'this product'} yet. Run the pipeline to crawl public sources, paraphrase posts, and validate themes.`}
        />
        <div className="rounded-2xl bg-paper-0 hairline p-10 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-brand-surface grid place-items-center text-navy-900">
            <window.Icons.Spark size={26}/>
          </div>
          <div className="text-[16px] font-semibold text-ink-900 mt-4">Your signal stream is empty</div>
          <div className="text-[12px] text-ink-500 mt-1.5 max-w-[52ch] mx-auto leading-snug">
            We haven't crawled any public chatter for this product yet. Generation usually takes a few seconds in mock mode — real runs go nightly at 04:00 UTC.
          </div>
          <button onClick={() => { setPhase('running'); setStepIdx(0); }}
            className="mt-5 px-4 py-2 rounded-md text-[13px] font-semibold bg-brand text-ink-900 hover:bg-brand-emphasis inline-flex items-center gap-1.5">
            <window.Icons.Spark size={14}/> Generate social signals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <window.SectionHeader
        eyebrow="Phase 1 · Signals"
        title="Generating social signals…"
        sub={`Crawling public sources for ${productName || 'this product'}. This usually takes a few seconds.`}
      />
      <div className="rounded-2xl bg-paper-0 hairline p-10">
        <div className="mx-auto w-14 h-14 rounded-full bg-brand-surface grid place-items-center text-navy-900 mb-5">
          <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        </div>
        <div className="space-y-2.5 max-w-[420px] mx-auto">
          {steps.map((label, i) => {
            const done = i < stepIdx;
            const active = i === stepIdx;
            return (
              <div key={label} className={`flex items-center gap-2.5 text-[12px] ${done ? 'text-ink-500' : active ? 'text-ink-900 font-semibold' : 'text-ink-300'}`}>
                <span className={`w-4 h-4 rounded-full grid place-items-center ${done ? 'bg-brand text-ink-900' : active ? 'bg-brand-surface text-navy-900 ring-2 ring-brand' : 'bg-paper-100 text-ink-400'}`}>
                  {done ? <window.Icons.Check size={10}/> : <span className="w-1 h-1 rounded-full bg-current"/>}
                </span>
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TrustMethodology() {
  const layer = (window.SASP_DATA && window.SASP_DATA.countryLayers && window.SASP_DATA.countryLayers.it) || null;
  const baseline = layer && layer.trustBaseline;
  const freelance = layer && layer.trustFreelanceUnder40Directional;
  const [expanded, setExpanded] = useState(false);
  if (!baseline) return null;

  const debug = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === '1';

  const inst = baseline.institutionalTrust.items;
  const tiles = [
    ['social composite', baseline.socialTrust.compositeMean],
    ['trstprl', inst.trstprl],
    ['trstlgl', inst.trstlgl],
    ['trstplc', inst.trstplc],
    ['trstplt', inst.trstplt],
    ['trstprt', inst.trstprt],
    ['trstep',  inst.trstep],
    ['anchor (neutral)', baseline.anchor],
  ];

  return (
    <section className="rounded-2xl bg-paper-0 hairline p-5 space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="text-[15px] font-semibold text-ink-900">Trust axis methodology</h2>
        <window.Pill tone="green" size="xs">ESS11 calibrated</window.Pill>
        <window.Pill tone="outline" size="xs">IT Country Layer</window.Pill>
      </div>
      <p className="text-[12px] text-ink-700 leading-relaxed">
        Trust scores are anchored to ESS11 Italy population marginals
        (<span className="num">{baseline.meta.source}</span>,
        DOI <span className="num">{baseline.meta.doi}</span>,
        fieldwork {baseline.meta.fieldwork}, weighted with <code>{baseline.meta.weight}</code>,
        effective n = <span className="num">{baseline.meta.effectiveN}</span>).
        Neutral baseline = <span className="num font-semibold">{baseline.anchor}</span> on a 0–10 scale.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[12px]">
        {tiles.map(([k, v]) => (
          <div key={k} className="rounded-lg hairline p-2.5">
            <div className="text-[11px] uppercase tracking-wider text-ink-400">{k}</div>
            <div className="num text-ink-900 font-medium mt-0.5">{v}</div>
          </div>
        ))}
      </div>

      <div className="text-[12px] text-ink-700 leading-relaxed border-l-2 border-navy-700 pl-3 italic">
        The SASP Trust axis is operationalized using the European Social Survey Round 11
        social and institutional trust batteries — the EU's standard validated constructs.
        The Italian general-population baseline (n≈2,865, ESS11 e04.1, fieldwork 2023–24)
        anchors the dashboard's 0–10 trust scale. Segment-specific priors for under-40
        freelance professionals are derived from the same instrument with appropriate
        small-cell caveats. Mortgage-domain signal — confusion, product-specific risk
        perception, decision archetypes — is sourced from Italian-native channels
        (Finanzaonline, Banca d'Italia, Consap, MEF), not from ESS.
      </div>

      <div>
        <button onClick={() => setExpanded(x => !x)}
          className="text-[12px] text-ink-700 underline decoration-dotted hover:text-ink-900">
          {expanded ? 'Hide' : 'Show'} under-40 freelance subset (n=60 — directional only)
        </button>
        {expanded && freelance && (
          <div className="mt-2 rounded-lg hairline bg-paper-50 p-3 text-[12px] text-ink-700 space-y-2">
            <div className="text-ink-900 font-semibold">
              Under-40 freelance subset, IT (raw n={freelance.meta.rawN}, effective n={freelance.meta.effectiveN})
            </div>
            <p className="leading-relaxed">
              The under-40 solo/small freelance cell in ESS11 IT is too thin to
              statistically distinguish from the general population on Trust or
              Satisfaction. Every observed difference — largest +0.53 on EU
              Parliament trust, +0.37 on life satisfaction — sits inside its own
              95% CI. Directional reference only; not a scoring input.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              <div className="rounded-lg hairline bg-paper-0 p-2">
                <div className="text-[11px] uppercase tracking-wider text-ink-400">social composite</div>
                <div className="num text-ink-900 font-medium mt-0.5">{freelance.socialTrust.compositeMean}</div>
              </div>
              {Object.entries(freelance.institutionalTrust.items).map(([k, v]) => (
                <div key={k} className="rounded-lg hairline bg-paper-0 p-2">
                  <div className="text-[11px] uppercase tracking-wider text-ink-400">{k}</div>
                  <div className="num text-ink-900 font-medium mt-0.5">{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {debug && freelance && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-100/40 p-3 text-[12px] space-y-2">
          <div className="flex items-center gap-2">
            <window.Pill tone="amber" size="xs">debug=1</window.Pill>
            <span className="text-ink-700 font-semibold">Raw freelance subset cells</span>
          </div>
          <pre className="text-[11px] text-ink-700 num overflow-auto leading-snug whitespace-pre-wrap">
{JSON.stringify(freelance, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}

function Sources({ data, onPrimary, onToast, needsGeneration=false, productName='', onGenerated }) {
  const [generating, setGenerating] = useState(needsGeneration);
  const [connectors, setConnectors] = useState(data.company);
  const [totalItems, setTotalItems] = useState(12718);
  const [activity, setActivity] = useState([
    '09:42 · Salesforce banking cohort map refreshed',
    '09:40 · Reddit stream added 38 consumer finance posts',
    '09:37 · Website crawl indexed loan and policy FAQ updates',
  ]);
  useEffect(() => { setConnectors(data.company); }, [data]);

  if (generating) {
    return (
      <SignalsGenerationGate
        productName={productName}
        onComplete={() => { setGenerating(false); onGenerated?.(); onToast?.('Social signals ready', `${productName} now has a live signal stream.`); }}
      />
    );
  }

  const bumpCount = (id) => ({
    gdrive: '247 policy docs',
    web: '84 disclosure pages',
    crm: '12,428 customer records',
    csv: '1 portfolio file',
  }[id] || 'updated');

  const handleConnectorAction = (id) => {
    const source = connectors.find(c => c.id === id);
    const wasLive = source?.status === 'connected';
    setConnectors(items => items.map(c => c.id === id ? {
      ...c,
      status: 'connected',
      last: 'just now',
      count: bumpCount(id),
    } : c));
    setTotalItems(n => n + (wasLive ? 24 : 118));
    setActivity(items => [`09:${wasLive ? '47' : '45'} · ${source.name} ${wasLive ? 're-synced' : 'connected'} in mock mode`, ...items].slice(0, 5));
    onToast?.(wasLive ? 'Source re-synced' : 'Source connected', `${source.name} now feeds the customer segmentation model.`);
  };

  const handleAddIntegration = () => {
    onToast?.('Add integration', 'Mock: would open the integration catalog.');
  };

  return (
    <div data-screen-label="01 Sources" className="space-y-6">
      <window.SectionHeader
        eyebrow="Phase 1 · Sources & data"
        title="Connect banking, CRM, and public sources"
        sub="Internal banking data, policy documents, product disclosures, and public consumer chatter feed the customer segmentation model."
      />

      <window.StatusStrip onPrimary={onPrimary} onToast={onToast} logItems={activity} itemCount={totalItems} sourceCount={connectors.length + 3}/>

      <InflowIndicator totalItems={totalItems}/>

      <FreshSignalsTile onToast={onToast}/>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT — Internal data */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-ink-900">Internal data</h2>
            <window.Pill tone="green" size="xs">Regulated</window.Pill>
          </div>

          <DataIntegrations
            connectors={connectors}
            onAction={handleConnectorAction}
            onAdd={handleAddIntegration}
          />

          <div className="rounded-2xl bg-paper-0 hairline p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-[13px] font-semibold text-ink-900">Data sources overview</div>
                <window.Pill tone="green" size="xs">Compliant</window.Pill>
              </div>
              <span className="text-[11px] text-ink-400 num">last audit 6 min ago</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div className="rounded-lg hairline p-2.5">
                <div className="text-[11px] uppercase tracking-wider text-ink-400">Residency</div>
                <div className="text-ink-900 font-medium mt-0.5">EU · Frankfurt</div>
              </div>
              <div className="rounded-lg hairline p-2.5">
                <div className="text-[11px] uppercase tracking-wider text-ink-400">Retention</div>
                <div className="text-ink-900 font-medium mt-0.5 num">36 months</div>
              </div>
              <div className="rounded-lg hairline p-2.5">
                <div className="text-[11px] uppercase tracking-wider text-ink-400">Consent coverage</div>
                <div className="text-ink-900 font-medium mt-0.5 num">98.4%</div>
              </div>
              <div className="rounded-lg hairline p-2.5">
                <div className="text-[11px] uppercase tracking-wider text-ink-400">PII redaction</div>
                <div className="text-ink-900 font-medium mt-0.5">Auto · on collection</div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-[11px] text-ink-500 mb-1.5">
                <span>Records by source</span>
                <span className="num text-ink-400">{totalItems.toLocaleString()} total</span>
              </div>
              <div className="h-2 rounded-full bg-paper-100 overflow-hidden flex">
                <div className="bg-brand" style={{width:'46%'}}/>
                <div className="bg-brand-accent" style={{width:'24%'}}/>
                <div className="bg-amber-500" style={{width:'18%'}}/>
                <div className="bg-ink-300" style={{width:'12%'}}/>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-ink-500 num">
                <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-brand"/>Salesforce 46%</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-accent"/>Drive 24%</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"/>Web crawl 18%</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-ink-300"/>CSV 12%</span>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT — Public sources */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-ink-900">Public sources</h2>
            <window.Pill tone="outline" size="xs">Social listening</window.Pill>
          </div>
          <div className="space-y-3">
            <SignalsTile
              logo={<window.Icons.Reddit size={18}/>}
              name="Reddit" color="#147049"
              sub="Subscribed to consumer finance, mortgage, and insurance communities"
              terms={data.reddit.subs} accounts={[]}
              posts={data.reddit.posts} rate={data.reddit.rate}
              onToast={onToast}/>
            <SignalsTile
              logo={<window.Icons.LinkedIn size={18}/>}
              name="LinkedIn" color="#0A66C2"
              sub="Tracking banker, insurer, and fintech professional chatter"
              terms={data.linkedin.hashtags} accounts={data.linkedin.accounts}
              posts={data.linkedin.posts} rate={data.linkedin.rate}
              references={data.linkedin.references}
              onToast={onToast}/>
            <SignalsTile
              logo={<window.Icons.X_logo size={14}/>}
              name="X" color="#0B1410"
              sub="Tracking bank, insurance, and rate keywords"
              terms={data.x.hashtags} accounts={data.x.accounts}
              posts={data.x.posts} rate={data.x.rate}
              onToast={onToast}/>
          </div>
        </section>
      </div>

      <TrustMethodology/>
    </div>
  );
}

window.Sources = Sources;
