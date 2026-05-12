// Portfolio screen — institution chooser + product catalog
function ProductCard({ product, isActive, onMakeActive, onOpenSimulator }) {
  const featureLabels = {
    digitalOnly: 'Digital-only',
    advisor: 'Advisor',
    earlyExitWaiver: 'Early-exit waiver',
    flexiblePause: 'Flexible pause',
    insuranceBundle: 'Insurance bundle',
    salarySwitch: 'Salary switch',
    jointApplication: 'Joint application',
  };
  const features = Object.entries(product.features || {}).filter(([,v]) => v).map(([k]) => featureLabels[k]).filter(Boolean);
  const formatAmount = (n) => n >= 1000 ? `€${(n/1000).toFixed(n%1000===0?0:1)}k` : `€${n}`;
  return (
    <div className={`rounded-2xl bg-paper-0 hairline p-5 flex flex-col gap-4 ${isActive ? 'ring-1 ring-green-600' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <window.Pill tone="ink" size="xs">{product.type}</window.Pill>
            <window.Pill tone={isActive ? 'green' : 'outline'} size="xs">{isActive ? 'Active' : product.status}</window.Pill>
          </div>
          <div className="text-[15px] font-semibold text-ink-900 truncate">{product.name}</div>
          <div className="text-[12px] text-ink-500 truncate">{product.segment}</div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-paper-100 grid place-items-center text-ink-700 shrink-0">
          <window.Icons.Portfolio size={18}/>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-[12px]">
        <div className="rounded-lg hairline p-2.5">
          <div className="text-[11px] uppercase tracking-wider text-ink-400">Rate</div>
          <div className="num text-ink-900 font-medium mt-0.5">{product.rate.toFixed(2)}%</div>
        </div>
        <div className="rounded-lg hairline p-2.5">
          <div className="text-[11px] uppercase tracking-wider text-ink-400">Term</div>
          <div className="num text-ink-900 font-medium mt-0.5">{product.term} mo</div>
        </div>
        <div className="rounded-lg hairline p-2.5">
          <div className="text-[11px] uppercase tracking-wider text-ink-400">Amount</div>
          <div className="num text-ink-900 font-medium mt-0.5">{formatAmount(product.amount)}</div>
        </div>
        <div className="rounded-lg hairline p-2.5">
          <div className="text-[11px] uppercase tracking-wider text-ink-400">Records</div>
          <div className="num text-ink-900 font-medium mt-0.5">{product.items}</div>
        </div>
      </div>

      {features.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-ink-400 font-medium mb-1.5">Features</div>
          <div className="flex flex-wrap gap-1.5">
            {features.map(f => <window.Pill key={f} tone="outline" size="xs">{f}</window.Pill>)}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mt-auto pt-1">
        <button onClick={onMakeActive} disabled={isActive}
          className={`px-3 py-1.5 rounded-md text-[12px] font-medium hairline ${isActive ? 'bg-brand-surface text-navy-900 cursor-default' : 'bg-paper-0 text-ink-700 hover:bg-paper-50'}`}>
          {isActive ? 'Active context' : 'Make active'}
        </button>
        <button onClick={onOpenSimulator}
          className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-ink-900 text-paper-0 hover:bg-brand-emphasis inline-flex items-center gap-1.5">
          <window.Icons.Spark size={12}/> Generate social signals
        </button>
      </div>
    </div>
  );
}

function CreateProductCard({ onClick }) {
  return (
    <button onClick={onClick}
      className="rounded-2xl border-2 border-dashed border-ink-200 hover:border-brand hover:bg-brand-surface/40 transition p-5 flex flex-col items-center justify-center gap-3 min-h-[260px] text-ink-500 hover:text-navy-900">
      <div className="w-12 h-12 rounded-full bg-paper-100 grid place-items-center">
        <window.Icons.Plus size={20}/>
      </div>
      <div className="text-[15px] font-semibold">Create new product</div>
      <div className="text-[12px] text-ink-400 text-center max-w-[28ch]">Spin up a new financial product in this organization</div>
    </button>
  );
}

const PRODUCT_TYPES = ['Personal loan', 'Mortgage', 'Deposit', 'SME credit', 'Pension', 'Protection insurance'];
const PRODUCT_REGIONS = ['Italy', 'Nordics', 'Spain', 'Iberia', 'DACH'];
const FEATURE_FIELDS = [
  { key: 'digitalOnly',      label: 'Digital-only' },
  { key: 'advisor',          label: 'Advisor' },
  { key: 'earlyExitWaiver',  label: 'Early-exit waiver' },
  { key: 'flexiblePause',    label: 'Flexible pause' },
  { key: 'insuranceBundle',  label: 'Insurance bundle' },
  { key: 'salarySwitch',     label: 'Salary switch' },
  { key: 'jointApplication', label: 'Joint application' },
];

function CreateProductModal({ orgName, defaultRegion, onCancel, onSubmit }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Personal loan');
  const [segment, setSegment] = useState('');
  const [region, setRegion] = useState(defaultRegion && PRODUCT_REGIONS.includes(defaultRegion) ? defaultRegion : 'Italy');
  const [rate, setRate] = useState(5.5);
  const [term, setTerm] = useState(48);
  const [amount, setAmount] = useState(15000);
  const [features, setFeatures] = useState({
    digitalOnly: true, advisor: false, earlyExitWaiver: false,
    flexiblePause: false, insuranceBundle: false, salarySwitch: false, jointApplication: false,
  });

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const toggleFeature = (key) => setFeatures(f => ({ ...f, [key]: !f[key] }));
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit?.({
      name: name.trim(),
      type,
      segment: segment.trim() || `${type} customers`,
      region,
      rate: Number(rate),
      term: Number(term),
      amount: Number(amount),
      features,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/40 backdrop-blur-sm p-4" onMouseDown={onCancel}>
      <form
        onSubmit={handleSubmit}
        onMouseDown={(e)=>e.stopPropagation()}
        className="w-full max-w-[560px] rounded-2xl bg-paper-0 shadow-lift hairline overflow-hidden">
        <header className="px-6 pt-5 pb-4 flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-ink-400 font-medium">New product · {orgName}</div>
            <div className="text-[18px] font-semibold text-ink-900 mt-0.5 leading-tight">Spin up a product to test</div>
            <div className="text-[12px] text-ink-500 mt-1 max-w-[42ch]">We'll fabricate a plausible audience and a source mix to match. Saved locally — clears with browser storage.</div>
          </div>
          <button type="button" onClick={onCancel} className="text-ink-400 hover:text-ink-900 p-1 -m-1">
            <window.Icons.X size={14}/>
          </button>
        </header>
        <div className="px-6 pb-5 space-y-4">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.12em] text-ink-400 font-medium">Product name</span>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e)=>setName(e.target.value)}
              placeholder="e.g. Young Doctors Mortgage"
              className="mt-1.5 w-full rounded-md hairline bg-paper-0 px-3 py-2 text-[13px] text-ink-900 outline-none focus:ring-2 focus:ring-brand"/>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.12em] text-ink-400 font-medium">Type</span>
              <select value={type} onChange={(e)=>setType(e.target.value)}
                className="mt-1.5 w-full rounded-md hairline bg-paper-0 px-3 py-2 text-[13px] text-ink-900 outline-none focus:ring-2 focus:ring-brand">
                {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.12em] text-ink-400 font-medium">Region</span>
              <select value={region} onChange={(e)=>setRegion(e.target.value)}
                className="mt-1.5 w-full rounded-md hairline bg-paper-0 px-3 py-2 text-[13px] text-ink-900 outline-none focus:ring-2 focus:ring-brand">
                {PRODUCT_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.12em] text-ink-400 font-medium">Target segment</span>
            <input
              type="text"
              value={segment}
              onChange={(e)=>setSegment(e.target.value)}
              placeholder="e.g. Freelancers under 40"
              className="mt-1.5 w-full rounded-md hairline bg-paper-0 px-3 py-2 text-[13px] text-ink-900 outline-none focus:ring-2 focus:ring-brand"/>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.12em] text-ink-400 font-medium">Rate %</span>
              <input type="number" step="0.05" min="0.5" max="15" value={rate}
                onChange={(e)=>setRate(e.target.value)}
                className="mt-1.5 w-full rounded-md hairline bg-paper-0 px-3 py-2 text-[13px] text-ink-900 num outline-none focus:ring-2 focus:ring-brand"/>
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.12em] text-ink-400 font-medium">Term · mo</span>
              <input type="number" step="1" min="6" max="120" value={term}
                onChange={(e)=>setTerm(e.target.value)}
                className="mt-1.5 w-full rounded-md hairline bg-paper-0 px-3 py-2 text-[13px] text-ink-900 num outline-none focus:ring-2 focus:ring-brand"/>
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.12em] text-ink-400 font-medium">Amount · €</span>
              <input type="number" step="500" min="500" max="1000000" value={amount}
                onChange={(e)=>setAmount(e.target.value)}
                className="mt-1.5 w-full rounded-md hairline bg-paper-0 px-3 py-2 text-[13px] text-ink-900 num outline-none focus:ring-2 focus:ring-brand"/>
            </label>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-[0.12em] text-ink-400 font-medium">Features</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {FEATURE_FIELDS.map(f => {
                const on = !!features[f.key];
                return (
                  <button type="button" key={f.key} onClick={()=>toggleFeature(f.key)}
                    className={`px-2.5 py-1 rounded-full text-[12px] hairline ${on ? 'bg-brand-surface text-navy-900' : 'bg-paper-0 text-ink-500 hover:text-ink-900'}`}>
                    {on ? '✓ ' : ''}{f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <footer className="px-6 py-4 bg-paper-50 border-t border-ink-100 flex items-center justify-end gap-2">
          <button type="button" onClick={onCancel}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium text-ink-500 hover:text-ink-900 hover:bg-paper-100">
            Cancel
          </button>
          <button type="submit" disabled={!name.trim()}
            className={`px-3.5 py-1.5 rounded-md text-[12px] font-semibold inline-flex items-center gap-1.5 ${name.trim() ? 'bg-brand text-ink-900 hover:bg-brand-emphasis' : 'bg-paper-100 text-ink-400 cursor-not-allowed'}`}>
            <window.Icons.Plus size={12}/> Create product
          </button>
        </footer>
      </form>
    </div>
  );
}

function EmptyPortfolio({ onCreate, orgName }) {
  return (
    <div className="relative">
      {/* Arrow pointing at the New product button in the section header (top-right) */}
      <div className="absolute -top-16 right-2 pointer-events-none hidden md:flex flex-col items-end animate-bounce z-10">
        <div className="text-[12px] font-semibold text-navy-900 bg-brand-surface border border-green-200 rounded-full px-3 py-1 shadow-lift mb-1">
          Start here ↗
        </div>
      </div>
      <div className="rounded-2xl border-2 border-dashed border-ink-200 bg-paper-0 p-10 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-brand-surface grid place-items-center text-navy-900">
          <window.Icons.Plus size={24}/>
        </div>
        <div className="text-[18px] font-semibold text-ink-900 mt-4">Welcome to {orgName}</div>
        <div className="text-[13px] text-ink-500 mt-1.5 max-w-[52ch] mx-auto leading-snug">
          You don't have any products yet. Create your first one to fabricate an audience, surface social signals, and try the offer simulator.
        </div>
        <button onClick={onCreate}
          className="mt-5 px-4 py-2 rounded-md text-[13px] font-semibold bg-brand text-ink-900 hover:bg-brand-emphasis inline-flex items-center gap-1.5">
          <window.Icons.Plus size={13}/> Create your first product
        </button>
        <div className="text-[11px] text-ink-400 mt-3">Takes ~30 seconds — name, type, region, target segment.</div>
      </div>
    </div>
  );
}

function Portfolio({ orgs=[], activeOrgId, activeProductId, onSelectOrg, onSelectProduct, onCreateProduct, onCreateOrg, onOpenSimulator, onToast }) {
  const [showOrgPicker, setShowOrgPicker] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const pickerRef = useRef(null);

  const activeOrg = orgs.find(org => org.id === activeOrgId) || orgs[0];
  if (!activeOrg) return null;

  useEffect(() => {
    const close = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) setShowOrgPicker(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const makeActive = (product) => {
    onSelectProduct?.(activeOrg.id, product.id);
    onToast?.('Context switched', `${activeOrg.name} · ${product.name} is now active.`);
  };

  const openSimulator = (product) => {
    onSelectProduct?.(activeOrg.id, product.id);
    onOpenSimulator?.();
  };

  const createProduct = () => {
    setShowCreate(true);
  };
  const handleSubmitProduct = (payload) => {
    setShowCreate(false);
    onCreateProduct?.({ ...payload, orgId: activeOrg.id });
  };
  const createOrg = () => {
    setShowCreateOrg(true);
  };
  const handleSubmitOrg = ({ name }) => {
    setShowCreateOrg(false);
    onCreateOrg?.({ name });
  };

  return (
    <div className="space-y-6">
      <window.SectionHeader
        title="Product portfolio"
        sub={`${activeOrg.name} — ${activeOrg.products.length} products in catalog.`}
        right={
          <div className="flex items-center gap-2">
            <button onClick={createOrg}
              className="px-3 py-1.5 rounded-md text-[12px] font-medium hairline bg-paper-0 text-ink-700 hover:bg-paper-50 inline-flex items-center gap-1.5">
              <window.Icons.Plus size={12}/> New organization
            </button>
            <button onClick={createProduct}
              className="px-3.5 py-1.5 rounded-md text-[12px] font-semibold bg-brand text-ink-900 hover:bg-brand-emphasis inline-flex items-center gap-1.5">
              <window.Icons.Plus size={13}/> New product
            </button>
          </div>
        }
      />

      {/* Org context strip — quiet, single-org by default */}
      <div className="rounded-2xl bg-paper-0 hairline px-5 py-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-navy-900 text-paper-0 grid place-items-center text-[12px] font-semibold shrink-0">
          {activeOrg.name.split(' ').map(part => part[0]).join('').slice(0,2)}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.12em] text-ink-400 font-medium">Organization</div>
          <div className="text-[15px] font-semibold text-ink-900 truncate">{activeOrg.name}</div>
          <div className="text-[12px] text-ink-500 truncate">{activeOrg.plan} · {activeOrg.region} · {activeOrg.products.length} products</div>
        </div>
        {orgs.length > 1 && (
          <div ref={pickerRef} className="ml-auto relative">
            <button onClick={()=>setShowOrgPicker(o=>!o)}
              className="px-3 py-1.5 rounded-md text-[12px] font-medium text-ink-500 hover:text-ink-900 hover:bg-paper-100 inline-flex items-center gap-1.5">
              Switch organization <window.Icons.Chevron size={12} className={showOrgPicker?'rotate-180 transition':''}/>
            </button>
            {showOrgPicker && (
              <div className="absolute right-0 top-full mt-2 w-[280px] rounded-xl bg-paper-0 hairline shadow-lift z-40 p-2">
                <div className="px-2 pt-1 pb-2 text-[11px] uppercase tracking-[0.12em] text-ink-400 font-medium">Other organizations</div>
                <div className="space-y-1">
                  {orgs.map(org => {
                    const isActive = org.id === activeOrgId;
                    return (
                      <button key={org.id}
                        onClick={()=>{ if (!isActive) { onSelectOrg?.(org.id); onToast?.('Organization switched', `${org.name} is now active.`); } setShowOrgPicker(false); }}
                        className={`w-full rounded-lg p-2.5 text-left flex items-start gap-2.5 ${isActive ? 'bg-brand-surface text-navy-900' : 'hover:bg-paper-50 text-ink-700'}`}>
                        <div className={`mt-0.5 w-7 h-7 rounded-md grid place-items-center text-[11px] font-semibold shrink-0 ${isActive ? 'bg-navy-900 text-paper-0' : 'bg-paper-100 text-ink-600'}`}>
                          {org.name.split(' ').map(part => part[0]).join('').slice(0,2)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[12px] font-semibold truncate">{org.name}</div>
                          <div className="text-[11px] text-ink-500 truncate">{org.products.length} products · {org.region}</div>
                        </div>
                        {isActive && <window.Icons.Check size={13} className="mt-1 text-navy-700"/>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product grid */}
      {activeOrg.products.length === 0 ? (
        <EmptyPortfolio onCreate={createProduct} orgName={activeOrg.name}/>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {activeOrg.products.map(product => {
            const isActive = product.id === activeProductId;
            return (
              <ProductCard
                key={product.id}
                product={product}
                isActive={isActive}
                onMakeActive={()=>makeActive(product)}
                onOpenSimulator={()=>openSimulator(product)}
              />
            );
          })}
          <CreateProductCard onClick={createProduct}/>
        </div>
      )}

      {showCreate && (
        <CreateProductModal
          orgName={activeOrg.name}
          defaultRegion={activeOrg.region}
          onCancel={()=>setShowCreate(false)}
          onSubmit={handleSubmitProduct}
        />
      )}

      {showCreateOrg && (
        <CreateOrgModal
          onCancel={()=>setShowCreateOrg(false)}
          onSubmit={handleSubmitOrg}
        />
      )}
    </div>
  );
}

function CreateOrgModal({ onCancel, onSubmit }) {
  const [name, setName] = useState('');
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit?.({ name: name.trim() });
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/40 backdrop-blur-sm p-4" onMouseDown={onCancel}>
      <form
        onSubmit={handleSubmit}
        onMouseDown={(e)=>e.stopPropagation()}
        className="w-full max-w-[460px] rounded-2xl bg-paper-0 shadow-lift hairline overflow-hidden">
        <header className="px-6 pt-5 pb-3 flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-ink-400 font-medium">New organization</div>
            <div className="text-[18px] font-semibold text-ink-900 mt-0.5 leading-tight">Add another workspace</div>
            <div className="text-[12px] text-ink-500 mt-1 max-w-[42ch]">Each organization has its own product catalog and signal stream.</div>
          </div>
          <button type="button" onClick={onCancel} className="text-ink-400 hover:text-ink-900 p-1 -m-1">
            <window.Icons.X size={14}/>
          </button>
        </header>
        <div className="px-6 py-4">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.12em] text-ink-400 font-medium">Organization name</span>
            <input autoFocus type="text" value={name}
              onChange={(e)=>setName(e.target.value)}
              placeholder="e.g. Banca Esempio Italia"
              className="mt-1.5 w-full rounded-md hairline bg-paper-0 px-3 py-2.5 text-[14px] text-ink-900 outline-none focus:ring-2 focus:ring-brand"/>
          </label>
        </div>
        <footer className="px-6 py-4 bg-paper-50 border-t border-ink-100 flex items-center justify-end gap-2">
          <button type="button" onClick={onCancel}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium text-ink-500 hover:text-ink-900 hover:bg-paper-100">
            Cancel
          </button>
          <button type="submit" disabled={!name.trim()}
            className={`px-3.5 py-1.5 rounded-md text-[12px] font-semibold inline-flex items-center gap-1.5 ${name.trim() ? 'bg-brand text-ink-900 hover:bg-brand-emphasis' : 'bg-paper-100 text-ink-400 cursor-not-allowed'}`}>
            <window.Icons.Plus size={12}/> Create organization
          </button>
        </footer>
      </form>
    </div>
  );
}

window.Portfolio = Portfolio;
