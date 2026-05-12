// App root — wires screens together
const {
  PRODUCT_DEFAULTS,
  TENANTS_DATA,
  getArchetypesFor,
  getSourcesFor,
  saveCustomOrg,
  saveCustomProduct,
} = window.SASP_DATA;

const DEMO_ORG_KEY = 'sasp_demo_org_id';

function mockTime(offset = 0) {
  const total = 9 * 60 + 42 + offset;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function productStateFrom(catalogProduct) {
  return {
    ...PRODUCT_DEFAULTS,
    type: catalogProduct.type,
    rate: catalogProduct.rate,
    term: catalogProduct.term,
    amount: catalogProduct.amount,
    upfrontFee: catalogProduct.upfrontFee ?? PRODUCT_DEFAULTS.upfrontFee,
    repaymentCadence: catalogProduct.repaymentCadence ?? PRODUCT_DEFAULTS.repaymentCadence,
    features: {
      ...PRODUCT_DEFAULTS.features,
      ...catalogProduct.features,
    },
  };
}

function initialTenantSelection() {
  const params = new URLSearchParams(window.location.search);
  const requestedOrgId = params.get('org');
  const requestedProductId = params.get('product');

  let storedDemoOrgId = null;
  try { storedDemoOrgId = localStorage.getItem(DEMO_ORG_KEY); } catch (e) {}
  const demoOrg = storedDemoOrgId ? TENANTS_DATA.find(t => t.id === storedDemoOrgId) : null;

  const defaultOrg = demoOrg || TENANTS_DATA[0];

  const orgFromProduct = requestedProductId
    ? TENANTS_DATA.find(org => org.products.some(product => product.id === requestedProductId))
    : null;
  const org = TENANTS_DATA.find(item => item.id === requestedOrgId) || orgFromProduct || defaultOrg;
  const product = org.products.find(item => item.id === requestedProductId) || org.products[0] || null;

  return { org, product, needsOnboarding: !storedDemoOrgId };
}

function shouldRedirectToTour() {
  return false;
}

function App() {
  const initial = React.useMemo(() => initialTenantSelection(), []);
  const firstOrg = initial.org;
  const firstProduct = initial.product;
  const [redirecting] = useState(() => {
    if (!shouldRedirectToTour()) return false;
    const tourParams = new URLSearchParams();
    if (initial.org.id) tourParams.set('org', initial.org.id);
    if (initial.product && initial.product.id) tourParams.set('product', initial.product.id);
    try { window.location.replace(`SASP-tour.html${tourParams.toString() ? `?${tourParams.toString()}` : ''}`); } catch (e) {}
    return true;
  });
  const [showOnboarding, setShowOnboarding] = useState(initial.needsOnboarding);
  const [screen, setScreen] = useState('portfolio');
  const [activeOrgId, setActiveOrgId] = useState(firstOrg.id);
  const [activeProductId, setActiveProductId] = useState(firstProduct ? firstProduct.id : null);
  const [archetypes, setArchetypes] = useState(() => firstProduct ? getArchetypesFor(firstProduct.id) : []);
  const [sources, setSources] = useState(() => firstProduct ? getSourcesFor(firstProduct.id) : null);
  const [archetype, setArchetype] = useState(() => firstProduct ? getArchetypesFor(firstProduct.id)[0] : null);
  const [product, setProduct] = useState(() => firstProduct ? productStateFrom(firstProduct) : PRODUCT_DEFAULTS);
  const [freshProductIds, setFreshProductIds] = useState(() => new Set());
  const [freshSegmentProductIds, setFreshSegmentProductIds] = useState(() => new Set());
  const [mockOffset, setMockOffset] = useState(0);
  const [savedAt, setSavedAt] = useState(mockTime(0));
  const [lastGenerated, setLastGenerated] = useState(mockTime(-24));
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // Tweaks
  const [tweaks, setTweak] = window.useTweaks(/*EDITMODE-BEGIN*/{ "cardDensity": 4 }/*EDITMODE-END*/);
  const density = [4,6,8].includes(tweaks.cardDensity) ? tweaks.cardDensity : 4;
  const [tourCompleted, setTourCompleted] = useState(() => {
    try { return localStorage.getItem('sasp_tour_completed') === '1'; } catch (e) { return false; }
  });
  useEffect(() => {
    const tick = () => {
      try {
        const completed = localStorage.getItem('sasp_tour_completed') === '1';
        setTourCompleted(prev => prev !== completed ? completed : prev);
      } catch (e) {}
    };
    window.addEventListener('focus', tick);
    window.addEventListener('storage', tick);
    return () => {
      window.removeEventListener('focus', tick);
      window.removeEventListener('storage', tick);
    };
  }, []);
  const activeOrg = TENANTS_DATA.find(org => org.id === activeOrgId) || firstOrg;
  const activeProduct = activeOrg.products.find(item => item.id === activeProductId) || activeOrg.products[0] || null;

  const advanceMockClock = (minutes = 1) => {
    const nextOffset = mockOffset + minutes;
    setMockOffset(nextOffset);
    return mockTime(nextOffset);
  };

  const showToast = useCallback((title, detail) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ title, detail });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const useArchetype = (a) => {
    setArchetype(a);
    setScreen('simulator');
    showToast('Offer simulator ready', `${a.name} loaded with bank CRM, policy, and market evidence.`);
  };

  const selectTenantProduct = (orgId, productId) => {
    const nextOrg = TENANTS_DATA.find(org => org.id === orgId) || firstOrg;
    const nextProduct = nextOrg.products.find(item => item.id === productId) || nextOrg.products[0] || null;
    setActiveOrgId(nextOrg.id);
    if (!nextProduct) {
      setActiveProductId(null);
      setArchetypes([]);
      setSources(null);
      setArchetype(null);
      setProduct(PRODUCT_DEFAULTS);
      return;
    }
    const nextArchetypes = getArchetypesFor(nextProduct.id);
    setActiveProductId(nextProduct.id);
    setProduct(productStateFrom(nextProduct));
    setArchetypes(nextArchetypes);
    setSources(getSourcesFor(nextProduct.id));
    setArchetype(nextArchetypes[0]);
    showToast('Financial product context switched', `${nextOrg.name} · ${nextProduct.name} is now active.`);
  };

  const selectTenantOrg = (orgId) => {
    const nextOrg = TENANTS_DATA.find(org => org.id === orgId) || firstOrg;
    if (!nextOrg.products.length) {
      setActiveOrgId(nextOrg.id);
      setActiveProductId(null);
      setArchetypes([]);
      setSources(null);
      setArchetype(null);
      setProduct(PRODUCT_DEFAULTS);
      return;
    }
    selectTenantProduct(nextOrg.id, nextOrg.products[0].id);
  };

  const handleOnboardingSubmit = ({ name }) => {
    const newOrg = saveCustomOrg({ name });
    try { localStorage.setItem(DEMO_ORG_KEY, newOrg.id); } catch (e) {}
    setActiveOrgId(newOrg.id);
    setActiveProductId(null);
    setArchetypes([]);
    setSources(null);
    setArchetype(null);
    setProduct(PRODUCT_DEFAULTS);
    setScreen('portfolio');
    setShowOnboarding(false);
    showToast('Welcome to SASP', `${newOrg.name} workspace created. Add your first product to begin.`);
  };

  const handleCreateOrg = ({ name }) => {
    const newOrg = saveCustomOrg({ name });
    setActiveOrgId(newOrg.id);
    setActiveProductId(null);
    setArchetypes([]);
    setSources(null);
    setArchetype(null);
    setProduct(PRODUCT_DEFAULTS);
    setScreen('portfolio');
    showToast('Organization created', `${newOrg.name} is now active. Add your first product to begin.`);
  };

  const handleSignalsGenerated = (productId) => {
    setFreshProductIds(prev => {
      if (!prev.has(productId)) return prev;
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
    // Stay on the Signals page once it's populated; the user can navigate to
    // Segments themselves via the sidebar or the StatusStrip's "Generate
    // segments" button when they're ready.
  };

  const handleSegmentsGenerated = (productId) => {
    setFreshSegmentProductIds(prev => {
      if (!prev.has(productId)) return prev;
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

  const handleGenerate = () => {
    const time = advanceMockClock(4);
    setLastGenerated(time);
    // Coming from the Signals page's "Generate segments" button — the
    // StatusStrip already showed its own spinner, so dismiss the empty-state
    // gate and drop the user straight onto the populated segments grid.
    if (activeProduct) {
      setFreshSegmentProductIds(prev => {
        if (!prev.has(activeProduct.id)) return prev;
        const next = new Set(prev);
        next.delete(activeProduct.id);
        return next;
      });
    }
    setScreen('audiences');
    showToast('Segment set ready', `${archetypes.length} customer segments regenerated at ${time}.`);
  };

  const handleCreateCustomProduct = (payload) => {
    const { orgId, product: newProduct } = saveCustomProduct({ ...payload, orgId: payload.orgId || activeOrg.id });
    const nextArchetypes = getArchetypesFor(newProduct.id);
    setActiveOrgId(orgId);
    setActiveProductId(newProduct.id);
    setProduct(productStateFrom(newProduct));
    setArchetypes(nextArchetypes);
    setSources(getSourcesFor(newProduct.id));
    setArchetype(nextArchetypes[0]);
    setFreshProductIds(prev => {
      const next = new Set(prev);
      next.add(newProduct.id);
      return next;
    });
    setFreshSegmentProductIds(prev => {
      const next = new Set(prev);
      next.add(newProduct.id);
      return next;
    });
    setScreen('sources');
    showToast('Product created', `${newProduct.name} is ready — generate its social signals to continue.`);
  };

  const handleSave = () => {
    const time = advanceMockClock(1);
    setSavedAt(time);
    showToast('Offer draft saved', `Scenario snapshot saved at ${time}.`);
  };

  const handleShare = () => {
    showToast('Offer scenario link copied', `Mock link: sasp.local/${activeOrg.id}/${activeProduct.id}`);
  };

  if (redirecting) return null;

  const projectLabel = activeProduct
    ? `${activeProduct.name} · ${activeProduct.segment}`
    : `${activeOrg.name} workspace`;
  const subtitleLabel = activeProduct
    ? `${activeOrg.name} · ${activeProduct.status}`
    : `${activeOrg.name} · no product yet`;
  const needsSignalsGen = activeProduct ? freshProductIds.has(activeProduct.id) : false;
  const needsSegmentsGen = activeProduct ? freshSegmentProductIds.has(activeProduct.id) : false;

  return (
    <div className="min-h-screen">
      <window.SideRail screen={screen} setScreen={setScreen}/>
      <div className="pl-[72px]">
        <window.TopBar
          project={projectLabel}
          subtitle={subtitleLabel}
          orgs={TENANTS_DATA}
          activeOrgId={activeOrg.id}
          activeProductId={activeProduct ? activeProduct.id : null}
          onSelectOrg={selectTenantOrg}
          onSelectProduct={selectTenantProduct}
          savedAt={savedAt}
          mockTime={mockTime(mockOffset)}
          onSave={handleSave}
          onShare={handleShare}
          tourCompleted={tourCompleted}
        />
        <main className="max-w-[1440px] mx-auto px-8 py-8">
          {screen === 'portfolio' && (
            <window.Portfolio
              orgs={TENANTS_DATA}
              activeOrgId={activeOrg.id}
              activeProductId={activeProduct ? activeProduct.id : null}
              onSelectOrg={selectTenantOrg}
              onSelectProduct={selectTenantProduct}
              onCreateProduct={handleCreateCustomProduct}
              onCreateOrg={handleCreateOrg}
              onOpenSimulator={()=>setScreen('sources')}
              onToast={showToast}
            />
          )}
          {screen === 'sources' && (
            sources ? (
              <window.Sources
                data={sources}
                onPrimary={handleGenerate}
                onToast={showToast}
                needsGeneration={needsSignalsGen}
                productName={activeProduct ? activeProduct.name : ''}
                onGenerated={() => activeProduct && handleSignalsGenerated(activeProduct.id)}
              />
            ) : (
              <window.NoProductPlaceholder onGoToPortfolio={()=>setScreen('portfolio')}/>
            )
          )}
          {screen === 'audiences' && (
            archetypes && archetypes.length ? (
              <window.Audiences
                archetypes={archetypes}
                onUse={useArchetype}
                density={density}
                setDensity={(n)=>setTweak('cardDensity', n)}
                lastGenerated={lastGenerated}
                onRegenerated={(time)=>setLastGenerated(time)}
                onToast={showToast}
                needsGeneration={needsSegmentsGen}
                productName={activeProduct ? activeProduct.name : ''}
                onGenerated={() => activeProduct && handleSegmentsGenerated(activeProduct.id)}
              />
            ) : (
              <window.NoProductPlaceholder onGoToPortfolio={()=>setScreen('portfolio')}/>
            )
          )}
          {screen === 'simulator' && (
            archetype ? (
              <window.Simulator
                archetype={archetype}
                archetypes={archetypes}
                product={product}
                setProduct={setProduct}
                onPickArchetype={setArchetype}
                onToast={showToast}
              />
            ) : (
              <window.NoProductPlaceholder onGoToPortfolio={()=>setScreen('portfolio')}/>
            )
          )}
          <footer className="mt-16 text-[11px] text-ink-400 text-center num">
            SASP
          </footer>
        </main>
      </div>

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection title="Segments" hint="How densely the customer segment grid is packed">
          <window.TweakRadio
            label="Card density"
            value={density}
            onChange={(n)=>setTweak('cardDensity', n)}
            options={[
              { value: 4, label: '4' },
              { value: 6, label: '6' },
              { value: 8, label: '8' },
            ]}
          />
        </window.TweakSection>
      </window.TweaksPanel>

      {toast && (
        <div className="fixed right-5 bottom-5 z-50 w-[320px] rounded-xl bg-ink-900 text-paper-0 shadow-lift p-4">
          <div className="text-[13px] font-semibold">{toast.title}</div>
          {toast.detail && <div className="text-[12px] text-paper-200/80 mt-1 leading-snug">{toast.detail}</div>}
        </div>
      )}

      {showOnboarding && (
        <OnboardingModal onSubmit={handleOnboardingSubmit}/>
      )}
    </div>
  );
}

function OnboardingModal({ onSubmit }) {
  const [name, setName] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim() });
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/60 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-[460px] rounded-2xl bg-paper-0 shadow-lift hairline overflow-hidden">
        <header className="px-6 pt-6 pb-2">
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-400 font-medium">Welcome</div>
          <div className="text-[20px] font-semibold text-ink-900 mt-1 leading-tight">What's your organization name?</div>
          <div className="text-[12px] text-ink-500 mt-1.5 max-w-[44ch]">We'll spin up an empty workspace so you can add your first product and watch signals come in.</div>
        </header>
        <div className="px-6 py-5">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.12em] text-ink-400 font-medium">Organization name</span>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e)=>setName(e.target.value)}
              placeholder="e.g. Banca Esempio Italia"
              className="mt-1.5 w-full rounded-md hairline bg-paper-0 px-3 py-2.5 text-[14px] text-ink-900 outline-none focus:ring-2 focus:ring-brand"/>
          </label>
        </div>
        <footer className="px-6 py-4 bg-paper-50 border-t border-ink-100 flex items-center justify-end">
          <button type="submit" disabled={!name.trim()}
            className={`px-4 py-2 rounded-md text-[13px] font-semibold inline-flex items-center gap-1.5 ${name.trim() ? 'bg-brand text-ink-900 hover:bg-brand-emphasis' : 'bg-paper-100 text-ink-400 cursor-not-allowed'}`}>
            Continue <window.Icons.ArrowRight size={13}/>
          </button>
        </footer>
      </form>
    </div>
  );
}

function NoProductPlaceholder({ onGoToPortfolio }) {
  return (
    <div className="rounded-2xl bg-paper-0 hairline p-10 text-center max-w-[560px] mx-auto mt-12">
      <div className="text-[15px] font-semibold text-ink-900">No active product</div>
      <div className="text-[12px] text-ink-500 mt-1.5 max-w-[40ch] mx-auto">Create your first product in the portfolio to unlock signals, segments, and the simulator.</div>
      <button onClick={onGoToPortfolio} className="mt-4 px-3.5 py-2 rounded-md text-[12px] font-semibold bg-brand text-ink-900 hover:bg-brand-emphasis">
        Go to portfolio
      </button>
    </div>
  );
}

window.NoProductPlaceholder = NoProductPlaceholder;

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
