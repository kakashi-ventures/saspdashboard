// Simulator — dial, live mood, verdict
const { Pill: SPill } = window;

function Dial({ value, min=2, max=10, step=0.1, onChange, sweet }) {
  // Map value to angle. -135deg .. +135deg
  const angle = ((value - min) / (max - min)) * 270 - 135;
  const sweetAngle = ((sweet - min) / (max - min)) * 270 - 135;
  const dragging = useRef(false);
  const ref = useRef(null);

  const setFromPointer = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    const x = (e.touches?.[0]?.clientX ?? e.clientX) - cx;
    const y = (e.touches?.[0]?.clientY ?? e.clientY) - cy;
    let deg = Math.atan2(y, x) * 180 / Math.PI + 90; // 0deg up
    if (deg > 180) deg -= 360;
    deg = Math.max(-135, Math.min(135, deg));
    const t = (deg + 135) / 270;
    let v = min + t * (max - min);
    v = Math.round(v / step) * step;
    onChange(Number(v.toFixed(2)));
  }, [min, max, step, onChange]);

  useEffect(() => {
    const move = (e) => { if (dragging.current) { e.preventDefault(); setFromPointer(e); } };
    const up = () => { dragging.current = false; document.body.style.cursor=''; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive:false });
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [setFromPointer]);

  // Tick marks
  const ticks = [];
  const tickCount = 27;
  for (let i = 0; i <= tickCount; i++) {
    const a = -135 + (i / tickCount) * 270;
    const major = i % 3 === 0;
    ticks.push(
      <div key={i} className="absolute left-1/2 top-1/2" style={{ transform:`translate(-50%, -50%) rotate(${a}deg)` }}>
        <div className={`${major?'h-2.5 w-[2px] bg-ink-700':'h-1.5 w-[1px] bg-ink-300'}`}
             style={{ transform:'translateY(-105px)' }}/>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center select-none">
      <div ref={ref}
           onMouseDown={(e)=>{ dragging.current=true; document.body.style.cursor='grabbing'; setFromPointer(e); }}
           onTouchStart={(e)=>{ dragging.current=true; setFromPointer(e); }}
           className="dial-shell relative w-[260px] h-[260px] rounded-full grid place-items-center cursor-grab active:cursor-grabbing">
        {/* tick ring */}
        <div className="absolute inset-0">{ticks}</div>

        {/* sweet zone arc */}
        <svg className="absolute inset-0" viewBox="0 0 260 260">
          <defs>
            <mask id="sweetmask">
              <rect width="260" height="260" fill="black"/>
              <circle cx="130" cy="130" r="118" stroke="white" strokeWidth="6" fill="none"
                strokeDasharray={`${(20/360)*2*Math.PI*118} ${2*Math.PI*118}`}
                strokeDashoffset={-((sweetAngle + 90 - 10)/360)*2*Math.PI*118}
                transform="rotate(-90 130 130)" strokeLinecap="round"/>
            </mask>
          </defs>
          <rect width="260" height="260" fill="#1FA968" opacity="0.45" mask="url(#sweetmask)"/>
        </svg>

        {/* knob */}
        <div className="dial-knob relative w-[170px] h-[170px] rounded-full grid place-items-center"
             style={{ transform:`rotate(${angle}deg)`, transition: dragging.current?'none':'transform 0.18s ease' }}>
          {/* indicator line */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[3px] h-7 rounded-full bg-brand"/>
          {/* center dot */}
          <div className="w-2 h-2 rounded-full bg-ink-300"/>
        </div>

        {/* readout */}
        <div className="absolute pointer-events-none flex flex-col items-center">
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400 font-medium mt-[88px]">APR / rate</div>
          <div className="num text-[32px] font-semibold tracking-[-0.02em] text-ink-900 leading-none mt-1">
            {value.toFixed(2)}<span className="text-ink-400 text-[18px] font-normal">%</span>
          </div>
        </div>
      </div>
      <div className="mt-3 text-[11px] text-ink-500 num">
        Price comfort <span className="text-navy-900 font-semibold">{sweet.toFixed(2)}%</span>
      </div>
    </div>
  );
}

function Toggle({ label, hint, on, onChange }) {
  return (
    <button onClick={()=>onChange(!on)}
      className="w-full text-left py-2.5 flex items-start gap-3 group">
      <span className={`mt-0.5 w-8 h-[18px] rounded-full transition relative shrink-0 ${on?'bg-brand':'bg-ink-200 group-hover:bg-ink-300'}`}>
        <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-paper-0 shadow-card transition-all ${on?'left-[14px]':'left-0.5'}`}/>
      </span>
      <span className="min-w-0 flex-1">
        <div className={`text-[12px] font-medium leading-tight ${on?'text-ink-900':'text-ink-700'}`}>{label}</div>
        <div className="text-[11px] text-ink-400 leading-snug mt-0.5">{hint}</div>
      </span>
    </button>
  );
}

function parseIncomeRange(str) {
  const nums = [...String(str).matchAll(/(\d+(?:\.\d+)?)/g)].map(match => Number(match[1]));
  if (!nums.length) return { min: 30, max: 40 };
  if (nums.length === 1) return { min: nums[0], max: nums[0] };
  return { min: Math.min(...nums), max: Math.max(...nums) };
}

function sourceTrustMeta(source) {
  if (source === 'reddit') return { trust: 72, effect: 28 };
  if (source === 'x' || source === 'X') return { trust: 58, effect: 42 };
  return { trust: 64, effect: 36 };
}

function buildMarketingAngle(archetype, product, score) {
  const income = parseIncomeRange(archetype.income);
  let points = Math.max(0, Math.min(100, Math.round(score * 0.55)));
  const cues = [];
  const cautions = [];

  if (product.rate <= archetype.rate.sweet) {
    points += 18;
    cues.push('lead with price');
  } else if (product.rate <= archetype.rate.max) {
    points += 10;
    cues.push('lead with fairness');
  } else {
    points -= 12;
    cautions.push('rate needs soft framing');
  }

  if (product.upfrontFee <= 0.8) {
    points += 10;
    cues.push('low-fee entry');
  } else if (product.upfrontFee > 2.5) {
    points -= 14;
    cautions.push('fee-sensitive audience');
  }

  if (product.amount <= income.max * 2500 || product.type === 'Deposit') {
    points += 6;
  }
  if (product.type === 'Mortgage' || product.features.jointApplication) {
    points += 8;
    cues.push('household / joint framing');
  }
  if (product.features.digitalOnly) {
    points += 6;
    cues.push('speed and convenience');
  }
  if (product.features.salarySwitch) {
    points += 8;
    cues.push('switch bonus');
  }
  if (product.features.flexiblePause) {
    points += 6;
    cues.push('flexibility');
  }
  if (product.features.insuranceBundle) {
    points -= 10;
    cautions.push('insurance bundle requires trust-first copy');
  }
  if (product.repaymentCadence === 'weekly' && product.type === 'Personal loan') {
    points -= 8;
    cautions.push('weekly cadence feels too aggressive');
  }
  if (product.repaymentCadence === 'biweekly') {
    points += 4;
    cues.push('cash-flow friendly cadence');
  }

  let level;
  let label;
  let lead;
  if (points >= 75) {
    level = 'Aggressive';
    label = 'Go hard on acquisition';
    lead = 'Use direct performance marketing: strongest APR, switch bonus, and fast-approval language.';
  } else if (points >= 55) {
    level = 'Assertive';
    label = 'Push clear value';
    lead = 'Use confident pricing-led copy, but keep one trust cue in the message.';
  } else if (points >= 35) {
    level = 'Balanced';
    label = 'Lead with proof';
    lead = 'Use a measured mix of price, flexibility, and reassurance.';
  } else {
    level = 'Trust-first';
    label = 'Keep it soft';
    lead = 'Use advisor-led, low-pressure language and explain the product before the CTA.';
  }

  if (cautions.length) {
    lead = `${lead} Watch ${cautions[0]}.`;
  }

  const headlineParts = [];
  if (product.rate <= archetype.rate.sweet + 0.05) headlineParts.push('best price');
  if (product.upfrontFee <= 1) headlineParts.push('low fee');
  if (product.features.salarySwitch) headlineParts.push('switch bonus');
  if (product.features.flexiblePause) headlineParts.push('payment holiday');
  if (product.features.jointApplication) headlineParts.push('joint application');
  if (product.features.digitalOnly) headlineParts.push('instant online flow');
  if (!headlineParts.length) headlineParts.push('clear pricing');

  return {
    level,
    label,
    lead,
    aggressiveness: Math.max(0, Math.min(100, points)),
    headline: headlineParts.slice(0, 3).join(' + '),
    cues: cues.slice(0, 4),
  };
}

function RangeField({ label, hint, value, min, max, step=1, unit='', onChange, formatValue }) {
  const display = typeof formatValue === 'function' ? formatValue(value) : `${value}${unit}`;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] text-ink-700 font-medium">{label}</span>
        <span className="text-[12px] text-ink-900 num font-semibold tracking-tight">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e=>onChange(Number(e.target.value))}
        className="sasp w-full"
      />
      {hint && <div className="text-[11px] text-ink-400 leading-snug">{hint}</div>}
    </div>
  );
}

function SelectField({ label, hint, value, options, onChange }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] text-ink-700 font-medium">{label}</span>
        {hint && <span className="text-[11px] text-ink-400">{hint}</span>}
      </div>
      <div className="hairline rounded-md flex p-0.5 bg-paper-50">
        {options.map(option => (
          <button
            key={option.value}
            onClick={()=>onChange(option.value)}
            className={`flex-1 px-2.5 py-1.5 rounded text-[12px] font-medium transition ${value===option.value ? 'bg-paper-0 text-ink-900 shadow-card' : 'text-ink-500 hover:text-ink-900'}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Trust axis (0-10), anchored to ESS11 IT social-trust composite (4.385).
// Mirrored in data/country_layers/it/trust_baseline.json.
//
// Math: additive per item. For each entry in archetype.distrust / archetype.likes,
// the first matching category contributes its weight (first-match-wins so a
// single phrase isn't double-counted). Multiple items in the same category DO
// accumulate. Penalty/bonus totals are then clamped before being applied.
function computeTrust(archetype) {
  const baseline = window.SASP_DATA?.countryLayers?.it?.trustBaseline?.anchor ?? 4.4;
  const deltas = [];
  const distrust = (archetype.distrust || []).map(s => s.toLowerCase());
  const likes    = (archetype.likes    || []).map(s => s.toLowerCase());

  const distrustHits = [
    [/big bank|long contract|relationship manager/, 0.6, 'distrust of incumbents/contracts'],
    [/hidden|bundled|upsell|insurance/,             0.5, 'distrust of bundled/hidden fees'],
    [/red tape|kyc|paper|paperwork|income.?proof/,  0.4, 'distrust of bureaucratic friction'],
    [/rigid|inflexible|schedule/,                   0.3, 'distrust of rigid schedules'],
  ];
  let distrustPenalty = 0;
  distrust.forEach(item => {
    for (const [re, w, why] of distrustHits) {
      if (re.test(item)) {
        distrustPenalty += w;
        deltas.push({ delta: -w, why: `"${item}" → ${why}` });
        break;
      }
    }
  });
  distrustPenalty = Math.min(distrustPenalty, 2.0);

  const likeHits = [
    [/transparent|clear|breakdown|amortization|open.?banking|api/, 0.4, 'values transparency'],
    [/digital|mobile|signature|self.?serve/,                       0.3, 'comfortable with digital'],
    [/flexible|pause|early repayment|exit/,                        0.3, 'rewards optionality'],
    [/fixed rate|no hidden|no fees/,                               0.3, 'values pricing certainty'],
  ];
  let likeBonus = 0;
  likes.forEach(item => {
    for (const [re, w, why] of likeHits) {
      if (re.test(item)) {
        likeBonus += w;
        deltas.push({ delta: +w, why: `"${item}" → ${why}` });
        break;
      }
    }
  });
  likeBonus = Math.min(likeBonus, 1.6);

  let score = baseline - distrustPenalty + likeBonus;
  if (archetype.channel === 'branch')  { score += 0.3; deltas.push({ delta: +0.3, why: 'branch-preferring channel' }); }
  if (archetype.channel === 'digital') { score -= 0.2; deltas.push({ delta: -0.2, why: 'digital-only channel' }); }
  if (archetype.comms === 'technical') { score -= 0.2; deltas.push({ delta: -0.2, why: 'technical/skeptical comms' }); }
  if (archetype.comms === 'friendly')  { score += 0.2; deltas.push({ delta: +0.2, why: 'friendly comms' }); }

  score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));
  return {
    score,
    baseline,
    delta: Math.round((score - baseline) * 10) / 10,
    deltas,
    source: 'ESS11 e04.1 (IT)',
    sampleEffectiveN: 2554.7,
  };
}

// Simulation logic
function simulate(archetype, product) {
  let score = 100;
  const reasons = [];
  const suggestions = [];

  const income = parseIncomeRange(archetype.income);

  // Rate
  const r = product.rate;
  const sweet = archetype.rate.sweet;
  const max = archetype.rate.max;
  if (r > max) {
    const over = r - max;
    score -= Math.min(40, over * 18);
    reasons.push(`APR of ${r.toFixed(2)}% is ${over.toFixed(2)} points above ${archetype.name}'s upper affordability tolerance (${max}%).`);
    suggestions.push(`Reprice the offer to ${(sweet).toFixed(2)}% APR — inside ${archetype.name}'s price comfort band.`);
  } else if (r > sweet) {
    score -= (r - sweet) * 12;
    reasons.push(`APR of ${r.toFixed(2)}% is ${(r-sweet).toFixed(2)} points above the target price point (${sweet}%) — interested but cautious.`);
    suggestions.push(`Trim APR by ${(r-sweet).toFixed(1)} points to land at ${sweet.toFixed(2)}%.`);
  } else {
    score += 4;
  }

  // Amount
  const amount = product.amount || 0;
  const annualIncomeCap = income.max * 1000;
  if (amount > annualIncomeCap * 2.5 && product.type !== 'Mortgage') {
    score -= 10;
    reasons.push(`Requested amount of €${amount.toLocaleString()} looks heavy against ${archetype.name}'s income profile.`);
    suggestions.push('Reduce the ticket size or offer staged disbursement.');
  } else if (amount > annualIncomeCap * 3.5 && product.type === 'Mortgage') {
    score -= 6;
    reasons.push(`Mortgage ticket of €${amount.toLocaleString()} pushes affordability and LTV pressure.`);
  } else if (amount > annualIncomeCap * 4.5) {
    score -= 4;
    reasons.push(`Cover or credit amount of €${amount.toLocaleString()} is stretching this segment.`);
  } else {
    score += 2;
  }

  // Upfront fee
  if (product.upfrontFee > 2.5) {
    score -= 6;
    reasons.push(`Upfront fee of ${product.upfrontFee.toFixed(1)}% risks fee-friction for this segment.`);
    suggestions.push('Trim origination fees or surface a clean fee waiver.');
  } else if (product.upfrontFee < 0.5) {
    score += 2;
  }

  // Term
  if (product.term > archetype.term.max) {
    score -= 12;
    reasons.push(`${product.term}-month term is longer than ${archetype.name}'s preferred repayment or cover horizon (max ${archetype.term.max} mo).`);
    suggestions.push(`Offer a ${archetype.term.sweet}-month default with an option to extend after eligibility review.`);
  } else if (product.term < archetype.term.min) {
    score -= 8;
    reasons.push(`${product.term}-month term is too short — pushes the monthly installment or premium out of reach.`);
  }

  // Channel
  if (product.features.digitalOnly && archetype.channel === 'branch') {
    score -= 10; reasons.push(`Digital-only onboarding excludes ${archetype.name}'s preferred branch advisory channel.`);
    suggestions.push('Add an optional branch or banker-assisted signing path.');
  }
  if (!product.features.advisor && archetype.channel === 'hybrid') {
    score -= 4;
    suggestions.push(`Add a soft banker or insurance advisor option — ${archetype.name} prefers hybrid servicing.`);
  }

  // Features
  if (!product.features.earlyExitWaiver && archetype.likes.some(l=>/early|repayment|exit/i.test(l))) {
    score -= 6;
    suggestions.push(`Add an early repayment or surrender-fee waiver — top trust-builder for ${archetype.name}.`);
  }
  if (product.features.insuranceBundle && archetype.distrust.some(d=>/insurance|hidden|fee/i.test(d))) {
    score -= 8;
    reasons.push(`Bundled protection cover triggers ${archetype.name}'s hidden-fee and add-on distrust.`);
    suggestions.push('Make insurance or protection cover explicit and opt-in, not bundled.');
  }
  if (product.features.flexiblePause && archetype.likes.some(l=>/pause|flex/i.test(l))) {
    score += 6;
  }
  if (product.features.salarySwitch && archetype.likes.some(l=>/open-banking|api|transparent|digital/i.test(l))) {
    score += 4;
    reasons.push(`Salary switch incentive strengthens banking lock-in for ${archetype.name}.`);
  }
  if (product.features.jointApplication && /mortgage|first child|family|married/i.test(`${archetype.tagline} ${archetype.lifeStage}`)) {
    score += 5;
    reasons.push(`Joint application support helps ${archetype.name} spread underwriting risk.`);
  } else if (product.features.jointApplication) {
    score -= 2;
    suggestions.push('Keep joint application optional, not default, for single-applicant journeys.');
  }
  if (product.repaymentCadence === 'biweekly' && archetype.likes.some(l=>/flex|working capital|pause/i.test(l))) {
    score += 4;
  } else if (product.repaymentCadence === 'weekly' && product.type === 'Personal loan') {
    score -= 4;
    reasons.push('Weekly repayments feel too tight for this consumer loan.');
  }

  score = Math.max(15, Math.min(99, Math.round(score)));
  const marketing = buildMarketingAngle(archetype, product, score);

  // Sentiment
  let mood, verdict, verb;
  if (score >= 80)      { mood='delighted'; verdict='go';     verb='Proceed to pilot'; }
  else if (score >= 65) { mood='curious';   verdict='go';     verb='Proceed with watchlist'; }
  else if (score >= 45) { mood='skeptical'; verdict='adjust'; verb='Reprice before launch'; }
  else                  { mood='hostile';   verdict='no';     verb="Don't launch as-is"; }

  // One-line live verdict
  let line;
  if (r > sweet + 0.05) {
    line = `${archetype.name} is interested, but APR is ${(r-sweet).toFixed(1)} points above the price comfort band.`;
  } else if (r < sweet - 0.3) {
    line = `${archetype.name} would move on this pricing — check margin, risk cost, and capital assumptions.`;
  } else {
    line = `${archetype.name} reads this as fair — APR is squarely inside the price comfort band.`;
  }

  // Receipts (pull 2 quotes, prefer rate-relevant ones)
  const receipts = archetype.quotes.slice(0, 3);

  return { score, mood, verdict, verb, line, reasons: reasons.slice(0,3), suggestions: suggestions.slice(0,4), receipts, marketing, trust: computeTrust(archetype) };
}

const MOOD_META = {
  delighted: { color:'#1FA968', bg:'#E2F4E9', label:'High intent',    emoji:'🤝', tone:'green' },
  curious:   { color:'#188A56', bg:'#E2F4E9', label:'Consideration',  emoji:'🤔', tone:'green' },
  skeptical: { color:'#D8910F', bg:'#FBEFD2', label:'At-risk',        emoji:'😐', tone:'amber' },
  hostile:   { color:'#A6660A', bg:'#FBEFD2', label:'Low intent',     emoji:'🙅', tone:'amber' },
};

function MoodVisual({ mood, score }) {
  const m = MOOD_META[mood];
  return (
    <div className="relative h-[260px] rounded-2xl overflow-hidden hairline" style={{ background: m.bg }}>
      <div className="absolute inset-0 mood-blob" style={{
        background: `radial-gradient(60% 60% at 30% 35%, ${m.color}55 0%, transparent 60%),
                     radial-gradient(50% 50% at 75% 70%, ${m.color}44 0%, transparent 60%)`
      }}/>
      <div className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center">
          <div className="text-[32px] leading-none">{m.emoji}</div>
          <div className="mt-3 text-[11px] uppercase tracking-[0.18em] font-semibold" style={{color:m.color}}>{m.label}</div>
          <div className="num text-[32px] font-semibold tracking-[-0.02em] text-ink-900 mt-1 leading-none">{score}<span className="text-ink-400 text-[18px] font-normal">/100</span></div>
          <div className="text-[11px] text-ink-500 mt-1.5 num">offer-fit score</div>
        </div>
      </div>
      {/* traffic light bar */}
      <div className="absolute bottom-3 left-3 right-3 h-1.5 rounded-full bg-paper-0/60 hairline overflow-hidden">
        <div className="h-full transition-all duration-300" style={{ width:`${score}%`, background:m.color }}/>
      </div>
    </div>
  );
}

function Simulator({ archetype, product, setProduct, onPickArchetype, archetypes, onToast }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const sim = useMemo(() => simulate(archetype, product), [archetype, product]);
  const [resultSim, setResultSim] = useState(sim);
  const [running, setRunning] = useState(false);
  const [runCount, setRunCount] = useState(0);
  const [runTime, setRunTime] = useState('09:42');
  const income = parseIncomeRange(archetype.income);

  useEffect(() => { /* reset result on archetype change */ setResultSim(simulate(archetype, product)); }, [archetype.id]);

  const setRate = (rate) => setProduct(p => ({ ...p, rate }));
  const setTerm = (term) => setProduct(p => ({ ...p, term }));
  const setAmount = (amount) => setProduct(p => ({ ...p, amount }));
  const setFee = (upfrontFee) => setProduct(p => ({ ...p, upfrontFee }));
  const setCadence = (repaymentCadence) => setProduct(p => ({ ...p, repaymentCadence }));
  const setFeat = (k, v) => setProduct(p => ({ ...p, features: { ...p.features, [k]: v } }));
  const setType = (type) => setProduct(p => ({ ...p, type }));
  const pickArchetype = (a) => {
    onPickArchetype(a);
    setPickerOpen(false);
    onToast?.('Customer segment switched', `${a.name} is now loaded in the offer simulator.`);
  };
  const runSimulation = () => {
    if (running) return;
    setRunning(true);
    onToast?.('Running offer simulation', `Testing ${product.type} against ${archetype.name}.`);
    setTimeout(() => {
      const nextCount = runCount + 1;
      const nextTime = nextCount === 1 ? '09:49' : `10:${String(4 + nextCount).padStart(2, '0')}`;
      setRunCount(nextCount);
      setRunTime(nextTime);
      setResultSim(sim);
      setRunning(false);
      onToast?.('Offer simulation complete', `${archetype.name} scored ${sim.score}/100 in mock run ${String(nextCount).padStart(2, '0')}.`);
    }, 700);
  };
  const tryNextArchetype = () => {
    const index = archetypes.findIndex(a => a.id === archetype.id);
    const next = archetypes[(index + 1) % archetypes.length];
    pickArchetype(next);
  };

  const verdictColor =
    resultSim.verdict==='go'     ? { fg:'text-navy-900', bg:'bg-brand-surface',  badge:'bg-brand text-paper-0' } :
    resultSim.verdict==='adjust' ? { fg:'text-amber-700', bg:'bg-amber-100', badge:'bg-amber-500 text-paper-0' } :
                                   { fg:'text-amber-700', bg:'bg-amber-100', badge:'bg-ink-900 text-paper-0' };

  return (
    <div data-screen-label="03 Simulator" className="space-y-6">
      <window.SectionHeader
        eyebrow="Phase 3 · Stress test"
        title="Stress-test a financial product against a segment"
        sub="Adjust APR, term, cover, and servicing choices. Watch customer intent move before locking a launch verdict."
        right={
          <div className="flex items-center gap-2 text-[11px] text-ink-500">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md hairline bg-paper-0">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"/>
              <span>Stress test · {running ? 'running' : 'idle'}</span>
            </span>
            <span className="num text-ink-400">{archetype.name}</span>
          </div>
        }
      />

      <div className="grid grid-cols-12 gap-6 items-stretch">
        {/* LEFT — Setup */}
        <section className="col-span-12 lg:col-span-4 rounded-2xl bg-paper-0 hairline h-full flex flex-col divide-y divide-ink-100/80">
          {/* Segment picker */}
          <div className="p-6">
            <div className="text-[11px] uppercase tracking-[0.14em] text-ink-400 font-medium mb-3">Customer segment</div>
            <button onClick={()=>setPickerOpen(o=>!o)}
              className="w-full flex items-center gap-3 text-left group">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-paper-100 ring-1 ring-ink-100 shrink-0">
                <img src={archetype.portrait} alt="" className="w-full h-full object-cover"/>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-ink-900 leading-tight">
                  {archetype.name} <span className="text-ink-400 num font-normal">{archetype.age}</span>
                </div>
                <div className="text-[12px] text-ink-500 truncate mt-0.5">{archetype.tagline}</div>
              </div>
              <window.Icons.Chevron size={14} className={`text-ink-400 transition group-hover:text-ink-700 ${pickerOpen?'rotate-180':''}`}/>
            </button>
            {pickerOpen && (
              <div className="mt-3 -mx-2 p-1 rounded-lg hairline bg-paper-0 max-h-[240px] overflow-auto scroll-hidden">
                {archetypes.map(a => (
                  <button key={a.id} onClick={()=>pickArchetype(a)}
                    className={`w-full p-2 rounded-md flex items-center gap-2.5 text-left ${a.id===archetype.id?'bg-brand-surface':'hover:bg-paper-50'}`}>
                    <div className="w-7 h-7 rounded-full bg-paper-100 ring-1 ring-ink-100 overflow-hidden shrink-0">
                      <img src={a.portrait} alt="" className="w-full h-full object-cover"/>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-medium text-ink-900">{a.name}</div>
                      <div className="text-[11px] text-ink-500 truncate">{a.tagline}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product type */}
          <div className="p-6">
            <div className="text-[11px] uppercase tracking-[0.14em] text-ink-400 font-medium mb-3">Product type</div>
            <div className="flex flex-wrap gap-1.5">
              {['Personal loan','Mortgage','Deposit','SME credit','Protection insurance','Pension','Investment'].map(t => (
                <button key={t} onClick={()=>setType(t)}
                  className={`text-[12px] px-2.5 py-1.5 rounded-md font-medium transition ${product.type===t?'bg-brand-surface text-navy-900 ring-1 ring-navy-900/15':'text-ink-700 bg-paper-50 hover:bg-paper-100'}`}>{t}</button>
              ))}
            </div>
          </div>

          {/* Dial */}
          <div className="px-6 py-7 grid place-items-center">
            <Dial value={product.rate} min={2} max={9.5} step={0.05} sweet={archetype.rate.sweet} onChange={setRate}/>
          </div>

          {/* Numeric controls */}
          <div className="p-6 space-y-5">
            <RangeField
              label="Amount / cover"
              hint={product.type === 'Protection insurance' ? 'Sum assured or cover amount' : 'Loan size, mortgage ticket, or deposit amount'}
              value={product.amount}
              min={product.type === 'Mortgage' ? 50000 : 1000}
              max={product.type === 'Mortgage' ? 400000 : 50000}
              step={product.type === 'Mortgage' ? 5000 : 500}
              onChange={setAmount}
              formatValue={(n)=>`€${n.toLocaleString()}`}
            />

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-[12px] text-ink-700 font-medium">Term / cover horizon</span>
                <span className="text-[12px] text-ink-900 num font-semibold tracking-tight">
                  {product.term} mo <span className="text-ink-400 font-normal">({(product.term/12).toFixed(1)} yr)</span>
                </span>
              </div>
              <div className="relative h-5 flex items-center">
                {(() => {
                  const min=12, max=84;
                  const a = ((archetype.term.min - min)/(max-min))*100;
                  const b = ((archetype.term.max - min)/(max-min))*100;
                  return <div className="absolute h-1.5 rounded-full bg-brand-surface pointer-events-none" style={{ left:`${a}%`, width:`${b-a}%` }}/>;
                })()}
                <input type="range" min={12} max={84} step={6} value={product.term} onChange={e=>setTerm(+e.target.value)}
                  className="sasp w-full relative z-10"/>
              </div>
              <div className="text-[11px] text-ink-400">
                Customer comfort <span className="text-navy-700 num">{archetype.term.min}–{archetype.term.max} mo</span>
              </div>
            </div>

            <RangeField
              label="Upfront fee"
              hint="Origination fee, issuance charge, or policy loading"
              value={product.upfrontFee}
              min={0}
              max={5}
              step={0.1}
              unit="%"
              onChange={setFee}
            />

            <SelectField
              label="Repayment cadence"
              value={product.repaymentCadence}
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'biweekly', label: 'Biweekly' },
                { value: 'weekly', label: 'Weekly' },
              ]}
              onChange={setCadence}
            />
          </div>

          {/* Servicing toggles */}
          <div className="p-6">
            <div className="text-[11px] uppercase tracking-[0.14em] text-ink-400 font-medium mb-2">Servicing & cover</div>
            <div className="divide-y divide-ink-100/80">
              <Toggle label="Digital-only onboarding" hint="No branch visit, SPID + e-sign" on={product.features.digitalOnly} onChange={v=>setFeat('digitalOnly',v)}/>
              <Toggle label="Banker or insurance advisor" hint="Optional human advisor in-app" on={product.features.advisor} onChange={v=>setFeat('advisor',v)}/>
              <Toggle label="Repayment / surrender-fee waiver" hint="No penalty for early repayment or exit" on={product.features.earlyExitWaiver} onChange={v=>setFeat('earlyExitWaiver',v)}/>
              <Toggle label="Payment holiday flexibility" hint="Pause one installment or premium, twice a year" on={product.features.flexiblePause} onChange={v=>setFeat('flexiblePause',v)}/>
              <Toggle label="Bundled protection cover" hint="Mandatory PPI or insurance bundle" on={product.features.insuranceBundle} onChange={v=>setFeat('insuranceBundle',v)}/>
              <Toggle label="Salary switch incentive" hint="Offer cashback for switching payroll or direct debit" on={product.features.salarySwitch} onChange={v=>setFeat('salarySwitch',v)}/>
              <Toggle label="Joint application support" hint="Let two applicants share underwriting and repayment risk" on={product.features.jointApplication} onChange={v=>setFeat('jointApplication',v)}/>
            </div>
          </div>

          {/* Run button — sits in panel footer */}
          <div className="p-5 mt-auto">
            <button onClick={runSimulation} disabled={running}
              className={`w-full py-3 rounded-xl text-[13px] font-semibold inline-flex items-center justify-center gap-2 shadow-lift transition ${running ? 'bg-brand-accent text-paper-0 cursor-wait' : 'bg-brand text-ink-900 hover:bg-brand-emphasis'}`}>
              <window.Icons.Bolt size={15}/> {running ? 'Running…' : 'Run stress test'}
            </button>
          </div>
        </section>

        {/* MIDDLE — Live reaction */}
        <section className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full">
          <div className="rounded-2xl bg-paper-0 hairline p-6 space-y-5 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-ink-900">Customer reaction</h3>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-500">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"/> live
              </span>
            </div>
            <MoodVisual mood={sim.mood} score={sim.score}/>
            <blockquote className="text-[13px] text-ink-800 leading-relaxed border-l-2 border-navy-700 pl-3.5 italic">
              {sim.line}
            </blockquote>
            {sim.trust && (
              <div className="pt-4 mt-1 border-t border-ink-100/70">
                <div className="flex items-baseline justify-between mb-1.5">
                  <div className="text-[11px] uppercase tracking-[0.14em] text-ink-400 font-medium">Trust (ESS11 IT anchor)</div>
                  <div className="num text-[13px] font-semibold text-ink-900">
                    {sim.trust.score.toFixed(1)}<span className="text-ink-400 font-normal">/10</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-paper-100 overflow-hidden relative">
                  <div className="h-full bg-navy-700" style={{ width: `${(sim.trust.score / 10) * 100}%` }}/>
                  <div className="absolute top-[-2px] bottom-[-2px] w-px bg-amber-500"
                    style={{ left: `${(sim.trust.baseline / 10) * 100}%` }}
                    title={`IT general-population baseline ${sim.trust.baseline}`}/>
                </div>
                <div className="mt-1 text-[11px] text-ink-500">
                  {sim.trust.delta >= 0 ? '+' : ''}{sim.trust.delta.toFixed(1)} vs IT baseline ({sim.trust.baseline}).
                  {' '}See <span className="font-medium text-ink-700">Sources → Trust axis methodology</span>.
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-paper-0 hairline p-6">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-ink-900">Affordability</h3>
              <span className="text-[11px] text-ink-400">vs segment comfort band</span>
            </div>
            <div className="grid grid-cols-3 gap-x-5 gap-y-4">
              {[
                ['APR vs comfort', `${(product.rate - archetype.rate.sweet >= 0 ? '+':'')}${(product.rate-archetype.rate.sweet).toFixed(2)}%`, product.rate <= archetype.rate.sweet+0.05],
                ['Term', `${product.term} mo`,  product.term >= archetype.term.min && product.term <= archetype.term.max],
                ['Amount', `€${product.amount.toLocaleString()}`, product.amount <= income.max * 3000 || product.type === 'Mortgage'],
                ['Servicing', product.features.digitalOnly ? 'Digital' : 'Branch', archetype.channel !== 'branch' || !product.features.digitalOnly],
                ['Fee', `${product.upfrontFee.toFixed(1)}%`, product.upfrontFee <= 2.5],
                ['Cadence', product.repaymentCadence, product.repaymentCadence !== 'weekly' || product.type !== 'Personal loan'],
              ].map(([k,v,ok])=>(
                <div key={k} className="space-y-1">
                  <div className="text-[11px] text-ink-500">{k}</div>
                  <div className={`flex items-center gap-1.5 text-[13px] num font-semibold ${ok?'text-navy-900':'text-amber-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${ok?'bg-brand-accent':'bg-amber-500'}`}/>
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RIGHT — Verdict */}
        <section className="col-span-12 lg:col-span-4 h-full">
          <div className="rounded-2xl bg-paper-0 hairline h-full flex flex-col divide-y divide-ink-100/80">
            {/* Hero verdict */}
            <div className={`p-6 ${verdictColor.bg} rounded-t-2xl`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider ${verdictColor.badge}`}>
                  {resultSim.verdict==='go'?'GO':resultSim.verdict==='adjust'?'ADJUST':"DON'T LAUNCH"}
                </span>
                <span className="text-[11px] text-ink-500 num">{running ? 'Running' : 'Scenario'} · {runTime}</span>
              </div>
              <div className={`text-[24px] font-semibold tracking-[-0.01em] leading-tight ${verdictColor.fg}`}>
                {resultSim.verb}
              </div>
              <div className="mt-2 text-[12px] text-ink-700">
                For <span className="font-semibold">{archetype.name}</span> at {product.rate.toFixed(2)}% APR over {product.term} mo
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-paper-0/70 overflow-hidden">
                  <div className="h-full" style={{ width:`${resultSim.score}%`, background: MOOD_META[resultSim.mood].color }}/>
                </div>
                <span className="num text-[13px] font-semibold text-ink-900">{resultSim.score}<span className="text-ink-400 font-normal">/100</span></span>
              </div>
            </div>

            {/* Why */}
            <div className="p-6 space-y-3">
              <h4 className="text-[13px] font-semibold text-ink-900">Why</h4>
              <ul className="space-y-2.5">
                {(resultSim.reasons.length?resultSim.reasons:['All inputs land inside this segment’s affordability and servicing comfort band.']).map((r,i)=>(
                  <li key={i} className="text-[12px] text-ink-700 flex gap-2.5 leading-relaxed">
                    <span className="num text-ink-300 shrink-0 mt-0.5">{String(i+1).padStart(2,'0')}</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What to change */}
            {resultSim.suggestions.length>0 && (
              <div className="p-6 space-y-3">
                <h4 className="text-[13px] font-semibold text-ink-900">What to change</h4>
                <ul className="space-y-2.5">
                  {resultSim.suggestions.map((s,i)=>(
                    <li key={i} className="text-[12px] text-ink-700 flex gap-2.5 leading-relaxed">
                      <span className="text-navy-700 shrink-0 mt-0.5"><window.Icons.ArrowRight size={12}/></span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Marketing angle */}
            <div className="p-6 space-y-3">
              <div className="flex items-baseline justify-between">
                <h4 className="text-[13px] font-semibold text-ink-900">Marketing angle</h4>
                <span className="text-[11px] text-ink-400 num">{resultSim.marketing.aggressiveness}% aggressive</span>
              </div>
              <div className="h-1 rounded-full bg-paper-100 overflow-hidden">
                <div className="h-full rounded-full bg-navy-900 transition-all duration-300" style={{ width:`${resultSim.marketing.aggressiveness}%` }}/>
              </div>
              <div>
                <div className="text-[13px] font-semibold text-ink-900">{resultSim.marketing.label}</div>
                <div className="text-[12px] text-ink-500 mt-1 leading-relaxed">{resultSim.marketing.lead}</div>
              </div>
              {resultSim.marketing.cues.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {resultSim.marketing.cues.map(cue => (
                    <span key={cue} className="inline-flex items-center rounded-full bg-paper-50 hairline px-2 py-0.5 text-[11px] text-ink-700">{cue}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Evidence */}
            <div className="p-6 space-y-3">
              <h4 className="text-[13px] font-semibold text-ink-900">Evidence</h4>
              <div className="space-y-2.5">
                {resultSim.receipts.slice(0,2).map((q,i)=>(
                  <div key={i} className="flex gap-2.5">
                    <div className={`shrink-0 w-6 h-6 rounded-md grid place-items-center ${q.source==='x'?'bg-ink-900 text-paper-0':'bg-paper-100 text-ink-700'}`}>
                      <SourceIcon src={q.source}/>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-ink-800 leading-snug">{q.text}</p>
                      <div className="text-[11px] text-ink-400 mt-1 num">
                        {q.source==='x'? q.handle : `${q.author} · ${q.sub}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 mt-auto">
              <button onClick={tryNextArchetype}
                className="w-full py-2.5 rounded-md text-[12px] font-medium text-ink-700 hover:bg-paper-50 inline-flex items-center justify-center gap-1.5">
                Try another segment <window.Icons.ArrowRight size={13}/>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SourceIcon({ src }) {
  if (src === 'x' || src === 'X') return <window.Icons.X_logo size={11}/>;
  return <window.Icons.Reddit size={12}/>;
}

window.Simulator = Simulator;
