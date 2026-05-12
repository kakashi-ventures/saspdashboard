// Audiences screen — archetype grid + evidence drawer
const { Pill, SectionHeader } = window;

const CHANNEL_LABEL = { digital:'Digital servicing', hybrid:'Hybrid advisory', branch:'Branch advisory' };
const COMMS_LABEL = { formal:'Formal', friendly:'Friendly', technical:'Technical' };

function BandRow({ label, value, range, domainMin, domainMax }) {
  const span = domainMax - domainMin;
  const left = ((range.min - domainMin) / span) * 100;
  const right = ((range.max - domainMin) / span) * 100;
  const sweet = ((range.sweet - domainMin) / span) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[12px] text-ink-500">{label}</span>
        <span className="text-[12px] num text-ink-900 font-semibold tracking-tight">{value}</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-paper-200">
        <div className="absolute inset-y-0 bg-brand-surface rounded-full" style={{ left:`${left}%`, width:`${right-left}%` }}/>
        <div className="absolute -top-1 -bottom-1 w-[2px] bg-navy-900 rounded-full" style={{ left:`calc(${sweet}% - 1px)` }}/>
      </div>
    </div>
  );
}

function SourceIcon({ src }) {
  if (src === 'x' || src === 'X') return <window.Icons.X_logo size={11}/>;
  return <window.Icons.Reddit size={12}/>;
}

function ArchetypeCard({ a, onUse, density, onToast }) {
  const [open, setOpen] = useState(false);
  const compact = density === 8;
  const detailed = density === 4;

  return (
    <article className="rounded-2xl bg-paper-0 hairline overflow-hidden flex flex-col group hover:shadow-lift transition-shadow">
      {/* Hero */}
      <div className="p-6 pb-5 flex flex-col gap-5 flex-1">
        <header className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-paper-100 ring-1 ring-ink-100 shrink-0">
            <img src={a.portrait} alt="" className="w-full h-full object-cover" loading="lazy"
                 onError={(e)=>{ e.currentTarget.style.display='none'; }}/>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <h3 className="text-[18px] leading-tight font-semibold tracking-[-0.01em] text-ink-900 truncate">{a.name}</h3>
              <span className="text-[13px] text-ink-400 num shrink-0">{a.age}</span>
            </div>
            <p className="text-[12px] text-ink-500 leading-snug mt-1 line-clamp-2">{a.tagline}</p>
          </div>
          <div className="rounded-full px-2.5 py-1 bg-brand-surface text-navy-900 text-[12px] font-semibold num shrink-0 ring-1 ring-navy-900/10">
            {a.matchScore}
          </div>
        </header>

        <div className="text-[12px] text-ink-500 num leading-relaxed">
          <span>{a.region}</span>
          <span className="text-ink-300 mx-1.5">·</span>
          <span>{a.income}</span>
          <span className="text-ink-300 mx-1.5">·</span>
          <span>{a.lifeStage}</span>
        </div>

        {detailed && (
          <p className="text-[13px] text-ink-700 leading-relaxed border-l-2 border-navy-700 pl-3.5">
            {a.summary}
          </p>
        )}

        {/* Comfort bands */}
        {!compact && (
          <div className="space-y-3.5 pt-1">
            <BandRow
              label="APR comfort"
              value={`${a.rate.sweet.toFixed(2)}%`}
              range={a.rate}
              domainMin={3.5}
              domainMax={8}
            />
            <BandRow
              label="Term horizon"
              value={`${a.term.sweet} mo`}
              range={a.term}
              domainMin={12}
              domainMax={84}
            />
          </div>
        )}

        {/* Servicing line */}
        {!compact && (
          <div className="flex items-center gap-2 text-[12px] text-ink-700">
            <span className="font-medium text-ink-800">{CHANNEL_LABEL[a.channel]}</span>
            <span className="text-ink-300">·</span>
            <span className="text-ink-500">{COMMS_LABEL[a.comms]} tone</span>
          </div>
        )}

        {/* Wants / avoids */}
        {!compact && (
          <div className="space-y-2 text-[12px] leading-snug">
            <div className="flex gap-3">
              <span className="text-navy-900 font-medium shrink-0 w-[52px]">Wants</span>
              <span className="text-ink-700 min-w-0">{a.likes.slice(0, detailed ? 4 : 3).join(' · ')}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-700 font-medium shrink-0 w-[52px]">Avoids</span>
              <span className="text-ink-700 min-w-0">{a.distrust.slice(0, 3).join(' · ')}</span>
            </div>
          </div>
        )}

        {compact && (
          <div className="space-y-2 text-[12px] mt-auto">
            <BandRow
              label="APR comfort"
              value={`${a.rate.sweet.toFixed(2)}%`}
              range={a.rate}
              domainMin={3.5}
              domainMax={8}
            />
          </div>
        )}
      </div>

      {/* Evidence drawer */}
      <button onClick={()=>setOpen(o=>!o)}
        className="w-full px-6 py-3 flex items-center justify-between text-[12px] text-ink-500 hover:text-ink-900 hover:bg-paper-50 border-t border-ink-100/80 transition-colors">
        <span className="inline-flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-brand-accent"/>
          {a.quotes.length} quotes · {a.crmMatches.toLocaleString()} CRM matches
        </span>
        <span className={`transition-transform ${open?'rotate-180':''} text-ink-400`}>
          <window.Icons.Chevron size={13}/>
        </span>
      </button>
      <div className={`drawer ${open?'open':''} bg-paper-50`}>
        <div>
          <div className="px-6 pt-3 pb-5 space-y-2">
            {a.quotes.map((q,i)=>(
              <div key={i} className="rounded-lg bg-paper-0 hairline p-3 flex gap-3">
                <div className={`shrink-0 w-7 h-7 rounded-md grid place-items-center ${q.source==='x'?'bg-ink-900 text-paper-0':'bg-paper-100 text-ink-700'}`}>
                  <SourceIcon src={q.source}/>
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] text-ink-900 leading-snug">{q.text}</p>
                  <div className="flex items-center gap-2 text-[11px] text-ink-400 mt-1.5">
                    <span className="font-medium text-ink-500">{q.source==='x'? q.handle : q.author}</span>
                    {q.sub && <span>· {q.sub}</span>}
                    <button
                      onClick={()=>onToast?.('Citation opened', `${q.source === 'x' ? q.handle : q.author} loaded in mock evidence viewer.`)}
                      className="ml-auto inline-flex items-center gap-1 text-ink-500 hover:text-ink-900">
                      <window.Icons.External size={11}/> Open
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="rounded-lg bg-brand-surface p-3 flex items-center gap-2 text-[12px] text-navy-900">
              <window.Icons.Audiences size={14}/> {a.internal}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3.5 border-t border-ink-100/80 flex items-center justify-end bg-paper-50/40">
        <button onClick={()=>onUse(a)}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-navy-900 hover:text-navy-700 group/use">
          Use in stress test
          <window.Icons.ArrowRight size={14} className="transition-transform group-hover/use:translate-x-0.5"/>
        </button>
      </div>
    </article>
  );
}

function SegmentsGenerationGate({ productName, onComplete }) {
  const [phase, setPhase] = useState('idle');
  const [stepIdx, setStepIdx] = useState(0);
  const steps = [
    'Clustering CRM cohorts on affordability & life-stage…',
    'Aligning clusters with validated social signals…',
    'Scoring trust, channel & comms preferences…',
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
        <SectionHeader
          eyebrow="Phase 2 · Customer segments"
          title="Generate customer segments"
          sub={`Signals are in for ${productName || 'this product'}. Run clustering to distil them into named, evidence-backed segments.`}
        />
        <div className="rounded-2xl bg-paper-0 hairline p-10 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-brand-surface grid place-items-center text-navy-900">
            <window.Icons.Audiences size={26}/>
          </div>
          <div className="text-[16px] font-semibold text-ink-900 mt-4">No segments yet</div>
          <div className="text-[12px] text-ink-500 mt-1.5 max-w-[52ch] mx-auto leading-snug">
            We've collected the signals — now let's turn them into customer segments. The clustering pass weighs CRM data, policy constraints, and social evidence.
          </div>
          <button onClick={() => { setPhase('running'); setStepIdx(0); }}
            className="mt-5 px-4 py-2 rounded-md text-[13px] font-semibold bg-brand text-ink-900 hover:bg-brand-emphasis inline-flex items-center gap-1.5">
            <window.Icons.Spark size={14}/> Generate segments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Phase 2 · Customer segments"
        title="Generating customer segments…"
        sub={`Clustering ${productName || 'this product'}'s data. A real pass would take a few minutes — mock mode is faster.`}
      />
      <div className="rounded-2xl bg-paper-0 hairline p-10">
        <div className="mx-auto w-14 h-14 rounded-full bg-brand-surface grid place-items-center text-navy-900 mb-5">
          <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        </div>
        <div className="space-y-2.5 max-w-[440px] mx-auto">
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

function Audiences({ archetypes, onUse, density, setDensity, lastGenerated='09:18', onRegenerated, onToast, needsGeneration=false, productName='', onGenerated }) {
  const [generating, setGenerating] = useState(needsGeneration);
  const [filter, setFilter] = useState('');
  const [regenning, setRegenning] = useState(false);
  const [regenCount, setRegenCount] = useState(0);
  const [newPosts, setNewPosts] = useState(418);
  const [newContacts, setNewContacts] = useState(12);
  if (generating) {
    return (
      <SegmentsGenerationGate
        productName={productName}
        onComplete={() => { setGenerating(false); onGenerated?.(); onToast?.('Segments ready', `${productName} now has ${archetypes.length} customer segments.`); }}
      />
    );
  }
  const visible = archetypes.filter(a => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.tagline.toLowerCase().includes(q) || a.region.toLowerCase().includes(q);
  });
  const cols = density === 4
    ? 'grid-cols-1 md:grid-cols-2'
    : density === 6
      ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4';
  const shown = visible.slice(0, density);
  const handleRegenerate = () => {
    if (regenning) return;
    setRegenning(true);
    onToast?.('Regenerating customer segments', 'Mock clustering pass started across CRM, policy docs, claims, and social evidence.');
    setTimeout(() => {
      const nextCount = regenCount + 1;
      const nextTime = nextCount === 1 ? '09:54' : `10:${String(3 + nextCount).padStart(2, '0')}`;
      setRegenCount(nextCount);
      setNewPosts(n => n + 37);
      setNewContacts(n => n + 3);
      setRegenning(false);
      onRegenerated?.(nextTime);
      onToast?.('Segment set updated', `${archetypes.length} customer segments refreshed at ${nextTime}.`);
    }, 850);
  };

  const changeDensity = (n) => {
    setDensity(n);
    onToast?.('Layout density changed', `Showing up to ${n} segment cards.`);
  };

  const segmentCount = archetypes.length;

  return (
    <div data-screen-label="02 Audiences" className="space-y-10">
      <SectionHeader
        eyebrow="Phase 2 · Customer segments"
        title={`${segmentCount} customer segments distilled from your data`}
        sub="Auto-generated from CRM records, credit and policy docs, and public market chatter. Every affordability, trust, and coverage trait is backed by evidence."
        right={
          <div className="flex items-center gap-2">
            <div className="hairline rounded-md flex items-center gap-1.5 px-2.5 py-1.5 bg-paper-0">
              <window.Icons.Search size={13} className="text-ink-400"/>
              <input value={filter} onChange={e=>setFilter(e.target.value)}
                placeholder="Filter segments" className="bg-transparent text-[12px] outline-none w-44 placeholder:text-ink-400"/>
            </div>
            <button onClick={handleRegenerate} disabled={regenning}
              className={`px-3 py-1.5 rounded-md text-[12px] hairline text-ink-700 inline-flex items-center gap-1.5 ${regenning ? 'bg-brand-surface cursor-wait' : 'bg-paper-0 hover:bg-paper-50'}`}>
              <window.Icons.Refresh size={13}/> {regenning ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>
        }
      />

      {/* Quiet status row — no card chrome */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-ink-500 -mt-4">
        <span className="inline-flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"/>
          <span>Last regenerated <span className="text-ink-700 num font-medium">{lastGenerated}</span></span>
        </span>
        <span className="text-ink-300">·</span>
        <span>
          <span className="font-medium text-ink-700 num">+{newPosts}</span> new posts
          <span className="mx-1.5 text-ink-300">·</span>
          <span className="font-medium text-ink-700 num">+{newContacts}</span> CRM records
        </span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-[0.12em] text-ink-400">Density</span>
          <div className="hairline rounded-md flex p-0.5 bg-paper-0">
            {[4,6,8].map(n => (
              <button key={n} onClick={()=>changeDensity(n)}
                className={`px-2.5 py-1 rounded text-[12px] font-medium num ${density===n?'bg-brand-surface text-navy-900':'text-ink-400 hover:text-ink-700'}`}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl bg-paper-0 hairline py-16 px-8 flex flex-col items-center text-center gap-3">
          <div className="w-10 h-10 rounded-full grid place-items-center bg-paper-100 text-ink-400">
            <window.Icons.Search size={16}/>
          </div>
          <div className="text-[14px] font-semibold text-ink-900">No segments match "{filter}"</div>
          <div className="text-[12px] text-ink-500 max-w-sm">Try a broader keyword, region, or life stage — or clear the filter to see every segment.</div>
          <button onClick={()=>setFilter('')}
            className="mt-2 text-[12px] font-medium text-navy-900 hover:text-navy-700 inline-flex items-center gap-1.5">
            Clear filter <window.Icons.ArrowRight size={12}/>
          </button>
        </div>
      ) : (
        <div className={`grid ${cols} gap-6`}>
          {shown.map(a => <ArchetypeCard key={a.id} a={a} onUse={onUse} density={density} onToast={onToast}/>)}
        </div>
      )}

      {visible.length > density && (
        <div className="text-center text-[12px] text-ink-400">
          Showing {density} of {visible.length} customer segments — increase density above to see more.
        </div>
      )}
    </div>
  );
}

window.Audiences = Audiences;
