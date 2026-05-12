// App root — wires screens together
const {
  PRODUCT_DEFAULTS,
  TENANTS_DATA,
  getArchetypesFor,
  getSourcesFor,
  saveCustomProduct,
} = window.SASP_DATA;

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
  const defaultOrg = TENANTS_DATA[0];

  const orgFromProduct = requestedProductId
    ? TENANTS_DATA.find(org => org.products.some(product => product.id === requestedProductId))
    : null;
  const org = TENANTS_DATA.find(item => item.id === requestedOrgId) || orgFromProduct || defaultOrg;
  const product = org.products.find(item => item.id === requestedProductId) || org.products[0];

  return { org, product };
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
    if (initial.product.id) tourParams.set('product', initial.product.id);
    try { window.location.replace(`SASP-tour.html${tourParams.toString() ? `?${tourParams.toString()}` : ''}`); } catch (e) {}
    return true;
  });
  const [screen, setScreen] = useState('portfolio');
  const [activeOrgId, setActiveOrgId] = useState(firstOrg.id);
  const [activeProductId, setActiveProductId] = useState(firstProduct.id);
  const [archetypes, setArchetypes] = useState(() => getArchetypesFor(firstProduct.id));
  const [sources, setSources] = useState(() => getSourcesFor(firstProduct.id));
  const [archetype, setArchetype] = useState(() => getArchetypesFor(firstProduct.id)[0]);
  const [product, setProduct] = useState(productStateFrom(firstProduct));
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
  const activeProduct = activeOrg.products.find(item => item.id === activeProductId) || activeOrg.products[0];

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
    const nextProduct = nextOrg.products.find(item => item.id === productId) || nextOrg.products[0];
    const nextArchetypes = getArchetypesFor(nextProduct.id);
    setActiveOrgId(nextOrg.id);
    setActiveProductId(nextProduct.id);
    setProduct(productStateFrom(nextProduct));
    setArchetypes(nextArchetypes);
    setSources(getSourcesFor(nextProduct.id));
    setArchetype(nextArchetypes[0]);
    showToast('Financial product context switched', `${nextOrg.name} · ${nextProduct.name} is now active.`);
  };

  const selectTenantOrg = (orgId) => {
    const nextOrg = TENANTS_DATA.find(org => org.id === orgId) || firstOrg;
    selectTenantProduct(nextOrg.id, nextOrg.products[0].id);
  };

  const handleGenerate = () => {
    const time = advanceMockClock(4);
    setLastGenerated(time);
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
    setScreen('sources');
    showToast('Product created', `${newProduct.name} is now active — review its signals.`);
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

  return (
    <div className="min-h-screen">
      <window.SideRail screen={screen} setScreen={setScreen}/>
      <div className="pl-[72px]">
        <window.TopBar
          project={`${activeProduct.name} · ${activeProduct.segment}`}
          subtitle={`${activeOrg.name} · ${activeProduct.status}`}
          orgs={TENANTS_DATA}
          activeOrgId={activeOrg.id}
          activeProductId={activeProduct.id}
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
              activeProductId={activeProduct.id}
              onSelectOrg={selectTenantOrg}
              onSelectProduct={selectTenantProduct}
              onCreateProduct={handleCreateCustomProduct}
              onOpenSimulator={()=>setScreen('simulator')}
              onToast={showToast}
            />
          )}
          {screen === 'sources' && (
            <window.Sources data={sources} onPrimary={handleGenerate} onToast={showToast}/>
          )}
          {screen === 'audiences' && (
            <window.Audiences
              archetypes={archetypes}
              onUse={useArchetype}
              density={density}
              setDensity={(n)=>setTweak('cardDensity', n)}
              lastGenerated={lastGenerated}
              onRegenerated={(time)=>setLastGenerated(time)}
              onToast={showToast}
            />
          )}
          {screen === 'simulator' && (
            <window.Simulator
              archetype={archetype}
              archetypes={archetypes}
              product={product}
              setProduct={setProduct}
              onPickArchetype={setArchetype}
              onToast={showToast}
            />
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
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
