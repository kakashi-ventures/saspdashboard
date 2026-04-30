// Sources screen — unified data integrations + public sources
function IntegrationRow({ icon, name, hint, status, last, count, onResync, onConfigure }) {
  const live = status === 'connected';
  return (
    <div className="rounded-xl hairline bg-paper-0 px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-paper-100 grid place-items-center text-ink-700 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <div className="text-[13px] font-semibold text-ink-900">{name}</div>
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${live?'bg-brand-surface text-navy-900':'bg-paper-100 text-ink-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${live?'bg-brand-accent animate-pulse':'bg-ink-300'}`}/>
            {live?'Connected':'Idle'}
          </span>
        </div>
        <div className="text-[12px] text-ink-500 truncate mt-0.5">{hint}</div>
        <div className="text-[11px] text-ink-400 num mt-1 flex flex-wrap items-center gap-x-2">
          <span>{count}</span>
          <span className="text-ink-300">·</span>
          <span>{last}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onResync} className="px-2.5 py-1.5 rounded-md text-[12px] font-medium hairline bg-paper-0 text-ink-700 hover:bg-paper-50">{live?'Re-sync':'Connect'}</button>
        <button onClick={onConfigure} aria-label="Configure" className="hidden sm:inline-flex px-2 py-1.5 rounded-md text-[12px] text-ink-500 hover:text-ink-900 hover:bg-paper-100">Configure</button>
        <button onClick={onConfigure} aria-label="Configure" className="sm:hidden w-8 h-8 grid place-items-center rounded-md text-ink-500 hover:text-ink-900 hover:bg-paper-100">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>
        </button>
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

function Sources({ data, onPrimary, onToast }) {
  const [connectors, setConnectors] = useState(data.company);
  const [totalItems, setTotalItems] = useState(12718);
  const [activity, setActivity] = useState([
    '09:42 · Salesforce banking cohort map refreshed',
    '09:40 · Reddit stream added 38 consumer finance posts',
    '09:37 · Website crawl indexed loan and policy FAQ updates',
  ]);

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
    </div>
  );
}

window.Sources = Sources;
