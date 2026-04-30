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
        <div className="p-2.5">
          <div className="text-[11px] uppercase tracking-wider text-ink-400">Rate</div>
          <div className="num text-ink-900 font-medium mt-0.5">{product.rate.toFixed(2)}%</div>
        </div>
        <div className="p-2.5">
          <div className="text-[11px] uppercase tracking-wider text-ink-400">Term</div>
          <div className="num text-ink-900 font-medium mt-0.5">{product.term} mo</div>
        </div>
        <div className="p-2.5">
          <div className="text-[11px] uppercase tracking-wider text-ink-400">Amount</div>
          <div className="num text-ink-900 font-medium mt-0.5">{formatAmount(product.amount)}</div>
        </div>
        <div className="p-2.5">
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
          Open simulator <window.Icons.ArrowRight size={12}/>
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

function Portfolio({ orgs=[], activeOrgId, activeProductId, onSelectOrg, onSelectProduct, onOpenSimulator, onToast }) {
  const [showOrgPicker, setShowOrgPicker] = useState(false);
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
    onToast?.('Create new product', 'Mock: would open product creation flow for ' + activeOrg.name + '.');
  };
  const createOrg = () => {
    onToast?.('Create new organization', 'Mock: would open organization onboarding.');
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
    </div>
  );
}

window.Portfolio = Portfolio;
