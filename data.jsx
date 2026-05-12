// SASP placeholder data — multi-tenant, multi-product
//
// File layout:
//   1. Hand-written showcase archetypes (Italian personal loan — the Sunday-demo content)
//   2. PRODUCT_DEFAULTS and TENANTS_DATA (catalog)
//   3. Fabrication primitives (region flavor, archetype templates, seeded RNG)
//   4. fabricateProductPack — turns a product spec into {archetypes, sources}
//   5. ARCHETYPES_BY_PRODUCT / SOURCES_BY_PRODUCT lookups, built from TENANTS_DATA
//   6. localStorage merge for custom products created at runtime
//   7. Resolvers + back-compat aliases consumed by tour-script.js

// Demo mode: wipe any persisted custom orgs/products/onboarding flag on every
// page load so each visit acts as a fresh user (onboarding modal shows, no
// leftover products). In-session creates still live in memory until refresh.
try {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('sasp_custom_products_v1');
    localStorage.removeItem('sasp_demo_org_id');
  }
} catch (e) { /* ignore */ }

// ───────────────────────────────────────────────────────────────────────────
// 1. Showcase archetypes — Italian personal loan for young professionals (25–35)
// ───────────────────────────────────────────────────────────────────────────

const PERSONAL_LOAN_ARCHETYPES = [
  {
    id: 'marco',
    name: 'Marco',
    age: 34,
    tagline: 'Risk-averse renter comparing mortgage and protection cover',
    region: 'Milan',
    income: '€38–46k',
    lifeStage: 'Renting, partnered, no kids',
    job: 'Mid-level designer at a SaaS company',
    portrait: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=480&q=80&auto=format&fit=crop',
    accent: 'green',
    matchScore: 87,
    crmMatches: 1240,
    rate:    { min: 4.8, max: 5.8, sweet: 5.4 },
    term:    { min: 36,  max: 72,  sweet: 60  },
    channel:    'hybrid',
    comms:      'friendly',
    likes:    ['transparent APR', 'no hidden fees', 'mobile-first', 'fixed rate', 'clear amortization'],
    distrust: ['big banks', 'long contracts', 'bundled insurance upsell'],
    summary: "Researches everything twice. Has a spreadsheet with every bank's TAEG, TAN, fees, and payment-protection add-ons. Will switch in a heartbeat if a competitor undercuts.",
    quotes: [
      { source:'reddit', sub:'r/ItalyPersonalFinance', author:'u/marco_milano', text:"Looked at five banks for a personal loan and the only one with a clear amortization table was the smallest one. The big ones bury fees in the fine print." },
      { source:'reddit', sub:'r/personalfinance',     author:'u/quietsaver',  text:"Fixed rate every time. I don't sleep well with variable, even if it's slightly cheaper on paper." },
      { source:'x',      handle:'@marcoinmi',          text:"Cool, another bank ad with 'starting from 4.9%' that turns into 6.7% once you add the insurance you can't refuse." },
      { source:'reddit', sub:'r/Fire',                  author:'u/3pct_rule',   text:"Anyone else just open the app, see the full repayment schedule, and only then decide? That's the bare minimum." },
    ],
    internal: '1,240 bank CRM records match this profile (renters, 30–35, salaried, Milan/Turin/Bologna).',
  },
  {
    id: 'sofia',
    name: 'Sofia',
    age: 29,
    tagline: 'Freelance borrower with irregular income and thin underwriting file',
    region: 'Bologna',
    income: '€22–48k variable',
    lifeStage: 'Single, P. IVA forfettario',
    job: 'Self-employed copywriter',
    portrait: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=480&q=80&auto=format&fit=crop',
    accent: 'green',
    matchScore: 79,
    crmMatches: 480,
    rate:    { min: 5.0, max: 6.4, sweet: 5.7 },
    term:    { min: 24,  max: 60,  sweet: 48  },
    channel:    'digital',
    comms:      'friendly',
    likes:    ['flexible installments', 'pause months', 'digital signature', 'no branch visits', 'transparent pricing'],
    distrust: ['rigid repayment schedules', 'KYC and income-proof red tape'],
    summary: "Income swings month to month. Cares less about headline APR than whether the product gives her cash-flow relief when a client pays late.",
    quotes: [
      { source:'x',      handle:'@sofiawrites',         text:"Banks treating freelancers like a credit risk in 2026 is wild. My income over 3 years is more stable than half my employed friends'." },
      { source:'reddit', sub:'r/ItalyPersonalFinance', author:'u/partita_iva_life', text:"The only product that ever made sense for me had a 'salta una rata' option twice a year. Everything else assumes you get paid on the 27th." },
      { source:'x',      handle:'@bolognaUX',           text:"If you make me upload three payslips I don't have, you don't actually want freelance customers." },
    ],
    internal: '480 bank CRM records with P. IVA forfettario classification.',
  },
  {
    id: 'luca',
    name: 'Luca',
    age: 32,
    tagline: 'Dual-income household optimizing rates, deposits, and cover',
    region: 'Turin',
    income: '€68–80k household',
    lifeStage: 'Married, planning first child',
    job: 'Engineering manager',
    portrait: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=480&q=80&auto=format&fit=crop',
    accent: 'green',
    matchScore: 82,
    crmMatches: 920,
    rate:    { min: 4.2, max: 5.4, sweet: 4.9 },
    term:    { min: 24,  max: 48,  sweet: 36  },
    channel:    'digital',
    comms:      'technical',
    likes:    ['early repayment', 'API access', 'best APR', 'open-banking pull', 'detailed breakdowns'],
    distrust: ['relationship managers', 'phone calls', 'paper'],
    summary: "Will repay early if there is no penalty. Wants side-by-side comparison with his primary bank, deposit returns, and any required insurance cover. Reads the prospectus.",
    quotes: [
      { source:'reddit', sub:'r/Fire',                 author:'u/optimizer_to', text:"Always negotiate the early-repayment clause. The default is fine for the bank, terrible for you. Half a point lower beats most cashback offers." },
      { source:'x',      handle:'@luca_eng',           text:"If I can't see the full TAEG with one click I assume you're hiding something." },
      { source:'reddit', sub:'r/personalfinance',     author:'u/coffee_indexes', text:"36 months over 60. Less interest, fewer surprises, done." },
    ],
    internal: '920 bank CRM records in dual-income brackets, ages 30–35.',
  },
  {
    id: 'giulia',
    name: 'Giulia',
    age: 27,
    tagline: 'Recent expat returnee rebuilding credit bureau history',
    region: 'Rome',
    income: '€32–38k',
    lifeStage: 'Single, just back from Berlin',
    job: 'Data analyst at a bank (not ours)',
    portrait: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=480&q=80&auto=format&fit=crop',
    accent: 'green',
    matchScore: 71,
    crmMatches: 210,
    rate:    { min: 5.2, max: 6.6, sweet: 5.9 },
    term:    { min: 36,  max: 60,  sweet: 48  },
    channel:    'digital',
    comms:      'formal',
    likes:    ['English-language docs', 'fast onboarding', 'SPID login', 'no in-branch visits'],
    distrust: ['Italian-only paperwork', 'fax machines', 'queue numbers'],
    summary: "Spent four years abroad. CRIF profile is thin. Wants the digital banking, onboarding, and credit decisioning experience she had in Germany, in Italy.",
    quotes: [
      { source:'reddit', sub:'r/ItalyPersonalFinance', author:'u/back_to_rome', text:"Came back after 4 years in Berlin. CRIF basically forgot I exist. Two banks rejected me on data, not credit." },
      { source:'x',      handle:'@giuliaback',         text:"Why is the only bank with a usable English UI a neobank with no Italian license for personal loans?" },
      { source:'reddit', sub:'r/expats',               author:'u/eu_returnee',   text:"SPID + IBAN should be enough to onboard. It is, in some banks. Just not the one I bank with." },
    ],
    internal: '210 bank CRM records flagged as recent EU returnees.',
  },
  {
    id: 'davide',
    name: 'Davide',
    age: 31,
    tagline: 'Side-hustling borrower, working-capital curious',
    region: 'Naples',
    income: '€34k + side',
    lifeStage: 'Renting with friends',
    job: 'Public-sector employee + e-commerce side',
    portrait: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=480&q=80&auto=format&fit=crop',
    accent: 'green',
    matchScore: 68,
    crmMatches: 360,
    rate:    { min: 4.6, max: 5.8, sweet: 5.2 },
    term:    { min: 12,  max: 36,  sweet: 24  },
    channel:    'digital',
    comms:      'friendly',
    likes:    ['short term', 'working capital', 'fast disbursement', 'no insurance bundle'],
    distrust: ['mandatory insurance', 'long terms', 'branch managers'],
    summary: "Wants the credit disbursed yesterday so he can fund inventory for his side-shop. Hates opaque advisory language and mandatory PPI add-ons.",
    quotes: [
      { source:'x',      handle:'@davide_napoli',     text:"If your loan offer requires me to schedule a 'consulenza' I'm out. Just give me the rate." },
      { source:'reddit', sub:'r/ItalyPersonalFinance', author:'u/sidehustle_na',  text:"Got the loan in 4 working days. Other bank wanted 11. Speed is the product." },
      { source:'reddit', sub:'r/personalfinance',     author:'u/mini_inventory', text:"Short term, no insurance, paid off in 18. The trick is not getting talked into the 5-year option." },
    ],
    internal: '360 bank CRM records with declared secondary income.',
  },
  {
    id: 'elena',
    name: 'Elena',
    age: 26,
    tagline: 'First-time borrower, advice-seeking retail customer',
    region: 'Florence',
    income: '€28–32k',
    lifeStage: 'Living with parents',
    job: 'Junior accountant',
    portrait: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=480&q=80&auto=format&fit=crop',
    accent: 'green',
    matchScore: 74,
    crmMatches: 540,
    rate:    { min: 5.4, max: 6.8, sweet: 6.1 },
    term:    { min: 36,  max: 72,  sweet: 60  },
    channel:    'hybrid',
    comms:      'friendly',
    likes:    ['advisor available', 'predictable installments', 'reassurance', 'simple language'],
    distrust: ['fine print', 'jargon', 'aggressive marketing'],
    summary: "First loan ever. Wants someone to explain APR, installment risk, and optional insurance clearly. Will choose the bank her parents trust if the rate is within half a point.",
    quotes: [
      { source:'reddit', sub:'r/ItalyPersonalFinance', author:'u/elena_fi', text:"This is my first loan, can someone explain TAEG vs TAN like I'm five? The bank app definitely won't." },
      { source:'x',      handle:'@elenafirenze',      text:"Walked into a branch just to be told 'do it on the app'. Then I open the app and it tells me to call the branch. Make it stop." },
      { source:'reddit', sub:'r/personalfinance',    author:'u/firsttime',     text:"I think I want a longer term so the monthly is small enough to ignore. Is that bad?" },
    ],
    internal: '540 bank CRM records under 28 with no prior loan products.',
  },
];

const PERSONAL_LOAN_SOURCES = {
  company: [
    { id:'gdrive',  name:'Google Drive',     status:'connected', last:'2 min ago',   count:'240 docs',     hint:'Credit policy, policy wording, customer interviews, market research' },
    { id:'web',     name:'Website crawl',    status:'connected', last:'14 min ago',  count:'78 pages',     hint:'banca-example.it — products, disclosures, FAQ, blog' },
    { id:'crm',     name:'CRM (Salesforce)', status:'connected', last:'1 hour ago',  count:'12,400 records', hint:'Anonymized banking cohorts and policyholder segments' },
    { id:'csv',     name:'CSV upload',       status:'idle',      last:'—',           count:'0 files',      hint:'Drop deposit, claims, broker, or underwriting spreadsheets' },
  ],
  x: {
    hashtags: ['#personalfinance', '#prestito', '#tassi', '#mutui', '#assicurazioni'],
    accounts: ['@finanzaitaliana', '@money_lab', '@banking_watch'],
    posts: 4820,
    rate: '+62/min',
  },
  reddit: {
    subs: ['r/ItalyPersonalFinance', 'r/personalfinance', 'r/Fire', 'r/Insurance'],
    posts: 1340,
    rate: '+18/min',
  },
  linkedin: {
    hashtags: ['#banking', '#insurance', '#personalfinance', '#mortgage', '#fintech'],
    accounts: ['@bancaesempio', '@nordcredit', '@medbancassurance'],
    posts: 2110,
    rate: '+24/min',
    references: [
      'Cleaner disclosure pages drive more advisor callbacks than discount banners.',
      'Embedded protection cover works when the underwriting story is explained upfront.',
      'Corporate clients prefer faster salary-switch flows and fewer document steps.',
    ],
  },
  ticker: [
    { src:'reddit', t:'"Fixed rate every time. I don\'t sleep well with variable…"' },
    { src:'x',      t:'"Cool, another bank ad with \'starting from 4.9%\'…"' },
    { src:'reddit', t:'"Banks treating freelancers like a credit risk in 2026 is wild."' },
    { src:'x',      t:'"If your loan offer requires me to schedule a consulenza I\'m out."' },
    { src:'reddit', t:'"Got the loan in 4 working days. Speed is the product."' },
    { src:'linkedin', t:'"Corporate clients are asking for cleaner disclosures and embedded protection cover."' },
    { src:'linkedin', t:'"Salary-switch incentives matter more than banner ads in the corporate segment."' },
    { src:'x',      t:'"Optional insurance is fine. Mandatory protection cover kills trust."' },
    { src:'reddit', t:'"My CRIF profile is thin after 4 years in Berlin."' },
  ],
};

// ───────────────────────────────────────────────────────────────────────────
// 2. Product defaults + tenant catalog
// ───────────────────────────────────────────────────────────────────────────

const PRODUCT_DEFAULTS = {
  type: 'Personal loan',
  rate: 6.2,        // %
  term: 60,         // months
  amount: 12000,    // €
  upfrontFee: 1.2,  // %
  repaymentCadence: 'monthly',
  features: {
    digitalOnly: true,
    advisor: false,
    earlyExitWaiver: false,
    loyaltyPerk: false,
    flexiblePause: false,
    insuranceBundle: false,
    salarySwitch: false,
    jointApplication: false,
  },
};

const TENANTS_DATA = [
  {
    id: 'banca-esempio',
    name: 'Banca Esempio Italia',
    plan: 'Enterprise',
    region: 'Italy',
    products: [
      {
        id: 'personal-loan-young-pros',
        name: 'Digital Personal Loan',
        segment: 'Young Professionals 25-35',
        type: 'Personal loan',
        status: 'v0.4 draft',
        rate: 6.2,
        term: 60,
        amount: 12000,
        items: '12,718',
        upfrontFee: 1.1,
        repaymentCadence: 'monthly',
        features: { digitalOnly: true, advisor: false, earlyExitWaiver: false, flexiblePause: false, insuranceBundle: false, salarySwitch: false, jointApplication: false },
      },
      {
        id: 'green-mortgage',
        name: 'Green Home Mortgage',
        segment: 'First-home buyers',
        type: 'Mortgage',
        status: 'v0.2 concept',
        rate: 4.85,
        term: 72,
        amount: 240000,
        items: '8,441',
        upfrontFee: 0.8,
        repaymentCadence: 'monthly',
        features: { digitalOnly: false, advisor: true, earlyExitWaiver: true, flexiblePause: false, insuranceBundle: false, salarySwitch: true, jointApplication: true },
      },
      {
        id: 'flex-savings',
        name: 'Flexible Deposit Account',
        segment: 'Mass affluent savers',
        type: 'Deposit',
        status: 'v0.1 test',
        rate: 3.1,
        term: 24,
        amount: 18000,
        items: '5,214',
        upfrontFee: 0.4,
        repaymentCadence: 'monthly',
        features: { digitalOnly: true, advisor: true, earlyExitWaiver: true, flexiblePause: true, insuranceBundle: false, salarySwitch: true, jointApplication: false },
      },
    ],
  },
  {
    id: 'nord-credit',
    name: 'Nord Credit Union',
    plan: 'Growth',
    region: 'Nordics',
    products: [
      {
        id: 'startup-credit-line',
        name: 'SME Working Capital Line',
        segment: 'Founder-led SMEs',
        type: 'SME credit',
        status: 'pilot',
        rate: 7.1,
        term: 48,
        amount: 35000,
        items: '4,880',
        upfrontFee: 1.6,
        repaymentCadence: 'monthly',
        features: { digitalOnly: true, advisor: true, earlyExitWaiver: true, flexiblePause: true, insuranceBundle: false, salarySwitch: true, jointApplication: false },
      },
      {
        id: 'retirement-bridge',
        name: 'Pension Bridge Plan',
        segment: 'Late-career planners',
        type: 'Pension',
        status: 'research',
        rate: 5.4,
        term: 72,
        amount: 22000,
        items: '3,102',
        upfrontFee: 0.9,
        repaymentCadence: 'monthly',
        features: { digitalOnly: false, advisor: true, earlyExitWaiver: false, flexiblePause: false, insuranceBundle: true, salarySwitch: false, jointApplication: false },
      },
    ],
  },
  {
    id: 'med-finance',
    name: 'Med Bancassurance Lab',
    plan: 'Sandbox',
    region: 'Spain',
    products: [
      {
        id: 'clinic-equipment-loan',
        name: 'Clinic Equipment Finance',
        segment: 'Independent clinics',
        type: 'SME credit',
        status: 'demo',
        rate: 6.75,
        term: 60,
        amount: 42000,
        items: '2,776',
        upfrontFee: 1.4,
        repaymentCadence: 'monthly',
        features: { digitalOnly: true, advisor: true, earlyExitWaiver: false, flexiblePause: true, insuranceBundle: false, salarySwitch: true, jointApplication: false },
      },
      {
        id: 'family-protection',
        name: 'Family Protection Cover',
        segment: 'New parents',
        type: 'Protection insurance',
        status: 'draft',
        rate: 5.9,
        term: 36,
        amount: 9000,
        items: '3,641',
        upfrontFee: 0.7,
        repaymentCadence: 'monthly',
        features: { digitalOnly: true, advisor: false, earlyExitWaiver: false, flexiblePause: false, insuranceBundle: true, salarySwitch: false, jointApplication: true },
      },
    ],
  },
];

// ───────────────────────────────────────────────────────────────────────────
// 3. Fabrication primitives
// ───────────────────────────────────────────────────────────────────────────

// Deterministic seeded RNG so a given productId always renders the same archetypes.
function _hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function _rng(seed) {
  let s = seed >>> 0;
  return function next() {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = s;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function _pick(arr, rng) { return arr[Math.floor(rng() * arr.length)]; }
function _pickN(arr, n, rng) {
  const out = []; const used = new Set();
  while (out.length < n && used.size < arr.length) {
    const idx = Math.floor(rng() * arr.length);
    if (used.has(idx)) continue;
    used.add(idx); out.push(arr[idx]);
  }
  return out;
}

function _fill(s, ctx) {
  return String(s).replace(/\{(\w+)\}/g, (_, k) => (k in ctx ? ctx[k] : ''));
}

// Region flavor — city pools, income bands, subs, hashtags. Italian flavor is deepest
// because that's our prospect; others read coherent without being deeply researched.
const REGION_FLAVOR = {
  Italy: {
    cities: ['Milan', 'Turin', 'Bologna', 'Rome', 'Naples', 'Florence', 'Bari', 'Padua'],
    namesM: ['Andrea', 'Stefano', 'Matteo', 'Lorenzo', 'Riccardo', 'Gabriele', 'Tommaso', 'Alessandro'],
    namesF: ['Chiara', 'Francesca', 'Martina', 'Alessia', 'Federica', 'Valentina', 'Beatrice', 'Camilla'],
    incomeMid:  ['€32–42k', '€34–44k', '€36–48k'],
    incomeLow:  ['€22–28k', '€24–30k', '€26–32k'],
    incomeHigh: ['€55–70k', '€48–62k', '€60–75k household'],
    incomeVar:  ['€22–48k variable', '€28–52k variable', '€26–44k irregular'],
    subs: ['r/ItalyPersonalFinance', 'r/personalfinance', 'r/Fire', 'r/Italia'],
    handleSuffix: 'it',
  },
  Nordics: {
    cities: ['Stockholm', 'Oslo', 'Copenhagen', 'Helsinki', 'Aarhus', 'Bergen'],
    namesM: ['Lars', 'Erik', 'Niko', 'Jonas', 'Anders', 'Mikkel', 'Henrik', 'Oskar'],
    namesF: ['Sofie', 'Astrid', 'Ingrid', 'Helena', 'Linnea', 'Maja', 'Frida', 'Sigrid'],
    incomeMid:  ['€42–55k', '€44–58k', '€46–60k'],
    incomeLow:  ['€28–36k', '€30–38k'],
    incomeHigh: ['€68–88k', '€72–92k household'],
    incomeVar:  ['€32–62k variable', '€28–58k variable'],
    subs: ['r/eupersonalfinance', 'r/SwedenFI', 'r/Norge', 'r/personalfinance'],
    handleSuffix: 'nordic',
  },
  Spain: {
    cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao', 'Málaga', 'Zaragoza'],
    namesM: ['Pablo', 'Javier', 'Diego', 'Mateo', 'Adrián', 'Hugo', 'Álvaro', 'Daniel'],
    namesF: ['Lucía', 'Sofía', 'María', 'Paula', 'Carmen', 'Marta', 'Elena', 'Ana'],
    incomeMid:  ['€26–34k', '€28–38k', '€30–40k'],
    incomeLow:  ['€20–26k', '€22–28k'],
    incomeHigh: ['€48–64k', '€52–68k household'],
    incomeVar:  ['€20–42k variable', '€24–46k autónomo'],
    subs: ['r/SpainFIRE', 'r/spain', 'r/eupersonalfinance', 'r/personalfinance'],
    handleSuffix: 'es',
  },
  Iberia: {
    cities: ['Lisbon', 'Porto', 'Madrid', 'Barcelona', 'Valencia'],
    namesM: ['João', 'Pedro', 'Diogo', 'Tiago', 'Pablo', 'Diego'],
    namesF: ['Beatriz', 'Inês', 'Sofia', 'Lucía', 'María'],
    incomeMid:  ['€24–32k', '€26–34k', '€28–36k'],
    incomeLow:  ['€18–24k', '€20–26k'],
    incomeHigh: ['€44–58k', '€50–64k household'],
    incomeVar:  ['€18–38k variable', '€22–42k recibos verdes'],
    subs: ['r/portugal', 'r/SpainFIRE', 'r/eupersonalfinance'],
    handleSuffix: 'iberia',
  },
  DACH: {
    cities: ['Berlin', 'Munich', 'Vienna', 'Zurich', 'Hamburg', 'Frankfurt'],
    namesM: ['Lukas', 'Maximilian', 'Felix', 'Jonas', 'David', 'Sebastian'],
    namesF: ['Emma', 'Hannah', 'Mia', 'Sophie', 'Lea', 'Anna'],
    incomeMid:  ['€46–58k', '€48–62k', '€50–64k'],
    incomeLow:  ['€32–40k', '€34–42k'],
    incomeHigh: ['€72–92k', '€78–98k household'],
    incomeVar:  ['€36–68k variable', '€32–64k freelance'],
    subs: ['r/Finanzen', 'r/germany', 'r/eupersonalfinance'],
    handleSuffix: 'de',
  },
};

// Hashtag pools per product type. Italian leans local; others kept generic.
const TYPE_HASHTAGS = {
  'Personal loan':       ['#prestito', '#finanziamento', '#tassi', '#personalfinance'],
  'Mortgage':            ['#mutui', '#primacasa', '#casa', '#tassi', '#mortgage'],
  'Deposit':             ['#risparmio', '#deposito', '#tassi', '#savings'],
  'SME credit':          ['#piva', '#liquidità', '#fido', '#sme', '#workingcapital'],
  'Pension':             ['#pensione', '#previdenza', '#retirement'],
  'Protection insurance':['#assicurazione', '#famiglia', '#protezione', '#insurance'],
};

const TYPE_LINKEDIN_REFERENCES = {
  'Personal loan': [
    'Cleaner disclosure pages drive more advisor callbacks than discount banners.',
    'Embedded protection cover works when the underwriting story is explained upfront.',
    'Salary-switch incentives matter more than banner ads in the salaried segment.',
  ],
  'Mortgage': [
    'Energy-class disclosures move conversion more than headline rate cuts on green-home offers.',
    'First-home buyers convert on advisor-led journeys at 2x the rate of pure-digital flows.',
    'Joint application UX is still the biggest drop-off on under-35 mortgage funnels.',
  ],
  'Deposit': [
    'Liquidity guarantees outperform headline yield on deposit acquisition campaigns.',
    'Mass-affluent savers respond to time-locked yields when the early-exit waiver is explicit.',
    'Tax-treatment clarity is the most common reason savers move banks for deposits.',
  ],
  'SME credit': [
    'Founders prioritise time-to-disbursement over headline rate when financing inventory.',
    'Working-capital lines convert when the early-repayment clause is shown before sign-up.',
    'Document-upload friction is the top reason SME credit applications get abandoned.',
  ],
  'Pension': [
    'Late-career planners want transparent fee disclosures more than peak performance figures.',
    'Bridge-product framing converts better than retirement-product framing for 55–62 cohorts.',
    'Adviser availability is the single biggest trust signal for pension-bridge buyers.',
  ],
  'Protection insurance': [
    'Family-protection take-up doubles when the claims process is shown upfront, not in the wording.',
    'Bundled protection cover converts when the unbundled price is also disclosed.',
    'New-parent cohorts respond to clear coverage examples more than to premium discounts.',
  ],
};

const TYPE_NOUN = {
  'Personal loan': 'loan',
  'Mortgage': 'mortgage',
  'Deposit': 'deposit',
  'SME credit': 'credit line',
  'Pension': 'pension plan',
  'Protection insurance': 'cover',
};

// Portrait pool — reuses the showcase URLs. Image-onError handler hides broken images.
const PORTRAIT_POOL = [
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=480&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=480&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=480&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=480&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?w=480&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=480&q=80&auto=format&fit=crop',
];

// Archetype templates — each composes into a coherent persona for a given product+region.
// rateOffset / termOffset are applied to the product's headline rate/term to produce
// each archetype's comfort band, so personas always relate to the actual product.
const ARCHETYPE_TEMPLATES = {
  'value-hunter': {
    accent: 'green',
    channel: 'digital',
    comms: 'technical',
    gender: 'any',
    ageRange: [29, 38],
    lifeStages: ['Married, no kids', 'Partnered, dual income', 'Single, settled', 'Married, planning kids'],
    jobs: ['Engineering manager', 'Product manager', 'Senior analyst', 'Consultant', 'Solutions architect'],
    incomeBand: 'incomeHigh',
    matchScore: [78, 88],
    crmRange: [820, 1380],
    likes: ['transparent APR', 'no hidden fees', 'best rate', 'detailed breakdowns', 'side-by-side comparison'],
    distrust: ['bundled extras', 'opaque fees', 'relationship-manager calls'],
    rateOffset: { min: -0.6, max: +0.4, sweet: -0.2 },
    termOffset: { min: -12, max: +12, sweet: -6 },
    tagline: 'Rate-sensitive shopper comparing every {noun} in the market',
    summary: 'Spreadsheet on every {noun} offer in {region}. Switches the moment a competitor undercuts by half a point. Reads the fine print before signing anything.',
    quoteScaffolds: [
      { source:'reddit', subKey:0, authorPrefix:'rates_', text:'Compared five {noun} offers in {region}. The cheap headline rate hides a 1.2% upfront fee in three of them.' },
      { source:'x',      handlePrefix:'compare_',         text:"If your {noun} offer needs a 'consulenza' to see the real APR, I'm out." },
      { source:'reddit', subKey:1, authorPrefix:'fineprint_', text:'Headline {rate}% turns into {rateUp}% after the bundled extras. Same story everywhere.' },
    ],
    internalPattern: '{crm} bank CRM records flagged rate-sensitive in the {segmentLower} cohort.',
  },

  'cashflow-volatile': {
    accent: 'green',
    channel: 'digital',
    comms: 'friendly',
    gender: 'any',
    ageRange: [27, 36],
    lifeStages: ['Single, P. IVA forfettario', 'Freelance, partnered', 'Self-employed, single', 'Contract, no kids'],
    jobs: ['Freelance copywriter', 'Independent consultant', 'Self-employed designer', 'Contract developer', 'Autónomo translator'],
    incomeBand: 'incomeVar',
    matchScore: [70, 82],
    crmRange: [320, 720],
    likes: ['flexible installments', 'pause months', 'digital signature', 'no income-proof red tape', 'salta una rata option'],
    distrust: ['rigid repayment schedules', 'three-payslip requirements', 'branch-only onboarding'],
    rateOffset: { min: -0.2, max: +0.8, sweet: +0.2 },
    termOffset: { min: -18, max: +6, sweet: -6 },
    tagline: 'Freelance applicant with irregular income and a thin underwriting file',
    summary: 'Income swings month to month. Cares less about headline APR than whether the {noun} gives cash-flow relief when a client pays late. Drops out of any flow that demands three months of payslips.',
    quoteScaffolds: [
      { source:'x',      handlePrefix:'piva_',     text:"Banks treating freelancers like a credit risk in 2026 is wild. My income over 3 years is more stable than half my employed friends'." },
      { source:'reddit', subKey:0, authorPrefix:'partita_iva_', text:"Only {noun} that ever made sense for me had a 'pause' option twice a year. Everything else assumes you get paid on the 27th." },
      { source:'x',      handlePrefix:'flex_',     text:"If you make me upload three payslips I don't have, you don't actually want freelance customers." },
    ],
    internalPattern: '{crm} bank CRM records with self-employed / autónomo classification in {region}.',
  },

  'digital-native-optimizer': {
    accent: 'green',
    channel: 'digital',
    comms: 'technical',
    gender: 'any',
    ageRange: [30, 39],
    lifeStages: ['Partnered, no kids', 'Married, dual income', 'Single, settled, optimising', 'Married, one child'],
    jobs: ['Software engineer', 'Engineering manager', 'Data scientist', 'Product lead', 'Tech lead'],
    incomeBand: 'incomeHigh',
    matchScore: [80, 90],
    crmRange: [640, 1180],
    likes: ['early repayment', 'open-banking pull', 'API access', 'one-click full disclosure', 'detailed amortization'],
    distrust: ['relationship managers', 'mandatory phone calls', 'paper signatures'],
    rateOffset: { min: -0.8, max: +0.2, sweet: -0.4 },
    termOffset: { min: -24, max: 0, sweet: -12 },
    tagline: 'Optimiser repaying early, negotiating clauses, and pulling APR from one click',
    summary: 'Will repay early if there is no penalty. Wants side-by-side comparison with the primary bank account before signing the {noun}. Reads the prospectus.',
    quoteScaffolds: [
      { source:'reddit', subKey:2, authorPrefix:'optimizer_', text:'Always negotiate the early-repayment clause on a {noun}. The default is fine for the bank, terrible for you. Half a point lower beats most cashback offers.' },
      { source:'x',      handlePrefix:'apr_',                  text:"If I can't see the full TAEG with one click I assume you're hiding something." },
      { source:'reddit', subKey:1, authorPrefix:'shorterm_',  text:'Shorter term over longer term. Less interest, fewer surprises, done.' },
    ],
    internalPattern: '{crm} bank CRM records in dual-income brackets, ages 30–35, in {region}.',
  },

  'returnee-thin-file': {
    accent: 'green',
    channel: 'digital',
    comms: 'formal',
    gender: 'any',
    ageRange: [26, 34],
    lifeStages: ['Single, just back', 'Partnered, recent returnee', 'Single, expat returnee'],
    jobs: ['Data analyst', 'Consultant', 'Researcher', 'Operations lead', 'Senior associate'],
    incomeBand: 'incomeMid',
    matchScore: [66, 78],
    crmRange: [160, 380],
    likes: ['English-language docs', 'fast onboarding', 'digital ID login', 'no in-branch visits'],
    distrust: ['domestic-only paperwork', 'fax machines', 'queue numbers'],
    rateOffset: { min: -0.2, max: +1.0, sweet: +0.3 },
    termOffset: { min: -12, max: +12, sweet: 0 },
    tagline: 'Recent returnee rebuilding domestic credit-bureau history',
    summary: 'Spent four years abroad. Credit-bureau profile is thin. Wants the digital banking, onboarding, and credit decisioning experience of a neobank, in the local market.',
    quoteScaffolds: [
      { source:'reddit', subKey:0, authorPrefix:'back_to_', text:'Came back after 4 years abroad. CRIF / SCHUFA basically forgot I exist. Two banks rejected me on data, not credit.' },
      { source:'x',      handlePrefix:'returnee_',           text:'Why is the only bank with a usable English UI a neobank without a license for {noun} here?' },
      { source:'reddit', subKey:1, authorPrefix:'eu_',       text:'Digital ID + IBAN should be enough to onboard. It is, in some banks. Just not the one I bank with.' },
    ],
    internalPattern: '{crm} bank CRM records flagged as recent EU returnees in {region}.',
  },

  'growth-borrower': {
    accent: 'green',
    channel: 'digital',
    comms: 'friendly',
    gender: 'any',
    ageRange: [28, 38],
    lifeStages: ['Founder, early stage', 'Side-hustle scaling', 'Owner-operator'],
    jobs: ['Founder', 'Owner-operator', 'Side-business operator', 'E-commerce founder', 'Small-clinic owner'],
    incomeBand: 'incomeMid',
    matchScore: [68, 80],
    crmRange: [240, 540],
    likes: ['fast disbursement', 'working capital', 'no insurance bundle', 'short term option'],
    distrust: ['mandatory insurance', 'long terms', 'branch-only flows'],
    rateOffset: { min: -0.4, max: +0.6, sweet: 0 },
    termOffset: { min: -24, max: 0, sweet: -12 },
    tagline: 'Side-hustler or founder needing capital before the next inventory cycle',
    summary: 'Wants the {noun} disbursed yesterday so they can fund inventory or the next hire. Hates opaque advisory language and mandatory bundled add-ons.',
    quoteScaffolds: [
      { source:'x',      handlePrefix:'founder_',          text:"If your {noun} offer requires me to schedule a 'consulenza' I'm out. Just give me the rate." },
      { source:'reddit', subKey:0, authorPrefix:'sidehustle_', text:'Got the {noun} in 4 working days. Other bank wanted 11. Speed is the product.' },
      { source:'reddit', subKey:1, authorPrefix:'noinsurance_', text:'Short term, no insurance, paid off early. The trick is not getting talked into the 5-year option.' },
    ],
    internalPattern: '{crm} bank CRM records with declared secondary income or P. IVA in {region}.',
  },

  'first-time-cautious': {
    accent: 'green',
    channel: 'hybrid',
    comms: 'friendly',
    gender: 'any',
    ageRange: [25, 33],
    lifeStages: ['Living with parents', 'Newly partnered', 'First-time buyer', 'Early career'],
    jobs: ['Junior accountant', 'Trainee', 'Early-career professional', 'Junior analyst', 'New graduate'],
    incomeBand: 'incomeLow',
    matchScore: [70, 82],
    crmRange: [420, 760],
    likes: ['advisor available', 'predictable installments', 'simple language', 'reassurance'],
    distrust: ['fine print', 'jargon', 'aggressive marketing'],
    rateOffset: { min: -0.2, max: +1.0, sweet: +0.4 },
    termOffset: { min: 0, max: +24, sweet: +12 },
    tagline: 'First-time {noun} buyer, advice-seeking and reassurance-led',
    summary: 'First {noun} ever. Wants someone to explain APR, installment risk, and optional add-ons clearly. Will choose the bank her parents trust if the rate is within half a point.',
    quoteScaffolds: [
      { source:'reddit', subKey:0, authorPrefix:'firsttime_', text:'This is my first {noun}, can someone explain TAEG vs TAN like I am five? The bank app definitely will not.' },
      { source:'x',      handlePrefix:'advisor_',             text:"Walked into a branch just to be told 'do it on the app'. Then the app tells me to call the branch. Make it stop." },
      { source:'reddit', subKey:1, authorPrefix:'longterm_',  text:'I think I want a longer term so the monthly is small enough to ignore. Is that bad?' },
    ],
    internalPattern: '{crm} bank CRM records under 28 with no prior {noun} products in {region}.',
  },
};

// Per-product-type default template set (used when a product has no explicit override).
const TYPE_TEMPLATE_SET = {
  'Personal loan':        ['value-hunter', 'cashflow-volatile', 'first-time-cautious'],
  'Mortgage':             ['digital-native-optimizer', 'first-time-cautious', 'value-hunter'],
  'Deposit':              ['value-hunter', 'growth-borrower', 'digital-native-optimizer'],
  'SME credit':           ['cashflow-volatile', 'growth-borrower', 'digital-native-optimizer'],
  'Pension':              ['first-time-cautious', 'value-hunter'],
  'Protection insurance': ['first-time-cautious', 'returnee-thin-file'],
};

// Map a tenant region (set on TENANTS_DATA) to a REGION_FLAVOR key.
function _regionKeyFor(regionLabel) {
  if (!regionLabel) return 'Italy';
  const label = String(regionLabel);
  if (REGION_FLAVOR[label]) return label;
  if (/spain|iberia|portug/i.test(label)) return 'Spain';
  if (/nordic|sweden|denmark|norway|finland/i.test(label)) return 'Nordics';
  if (/dach|germany|austria|switzer/i.test(label)) return 'DACH';
  return 'Italy';
}

function _fabricateOne(templateId, ctx, idx) {
  const tpl = ARCHETYPE_TEMPLATES[templateId];
  if (!tpl) throw new Error(`Unknown archetype template: ${templateId}`);
  const flavor = REGION_FLAVOR[ctx.regionKey] || REGION_FLAVOR.Italy;
  const rng = _rng(ctx.seed + idx * 1009);

  const pool = (rng() < 0.5) ? flavor.namesF : flavor.namesM;
  const name = _pick(pool, rng);
  const city = _pick(flavor.cities, rng);
  const age = tpl.ageRange[0] + Math.floor(rng() * (tpl.ageRange[1] - tpl.ageRange[0] + 1));
  const lifeStage = _pick(tpl.lifeStages, rng);
  const job = _pick(tpl.jobs, rng);
  const portrait = PORTRAIT_POOL[(_hash(name + city) + idx) % PORTRAIT_POOL.length];
  const incomeBand = flavor[tpl.incomeBand] || flavor.incomeMid;
  const income = _pick(incomeBand, rng);
  const matchScore = tpl.matchScore[0] + Math.floor(rng() * (tpl.matchScore[1] - tpl.matchScore[0] + 1));
  const crmMatches = tpl.crmRange[0] + Math.floor(rng() * (tpl.crmRange[1] - tpl.crmRange[0]));

  // Clamp comfort bands to sane domains so the BandRow renders correctly.
  const baseRate = ctx.productRate;
  const baseTerm = ctx.productTerm;
  const clampRate = (v) => Math.max(2.5, Math.min(9.5, Number(v.toFixed(2))));
  const clampTerm = (v) => Math.max(6, Math.min(96, Math.round(v)));
  const rate = {
    min:   clampRate(baseRate + tpl.rateOffset.min),
    max:   clampRate(baseRate + tpl.rateOffset.max),
    sweet: clampRate(baseRate + tpl.rateOffset.sweet),
  };
  const term = {
    min:   clampTerm(baseTerm + tpl.termOffset.min),
    max:   clampTerm(baseTerm + tpl.termOffset.max),
    sweet: clampTerm(baseTerm + tpl.termOffset.sweet),
  };

  const tokens = {
    name,
    nameLower: name.toLowerCase(),
    region: city,
    type: ctx.productType,
    noun: TYPE_NOUN[ctx.productType] || 'product',
    segment: ctx.segment,
    segmentLower: String(ctx.segment || '').toLowerCase(),
    rate: baseRate.toFixed(2),
    rateUp: (baseRate + 1.3).toFixed(1),
    crm: crmMatches.toLocaleString(),
  };

  const quotes = tpl.quoteScaffolds.map((q, i) => {
    const out = { source: q.source, text: _fill(q.text, tokens) };
    if (q.source === 'x') {
      out.handle = `@${q.handlePrefix}${tokens.nameLower}_${flavor.handleSuffix}`;
    } else {
      out.sub = flavor.subs[(typeof q.subKey === 'number' ? q.subKey : i) % flavor.subs.length];
      out.author = `u/${q.authorPrefix}${tokens.nameLower}`;
    }
    return out;
  });

  return {
    id: `${ctx.productId}-${templateId}-${idx}`,
    name,
    age,
    tagline: _fill(tpl.tagline, tokens),
    region: city,
    income,
    lifeStage,
    job,
    portrait,
    accent: tpl.accent,
    matchScore,
    crmMatches,
    rate,
    term,
    channel: tpl.channel,
    comms: tpl.comms,
    likes: tpl.likes.slice(),
    distrust: tpl.distrust.slice(),
    summary: _fill(tpl.summary, tokens),
    quotes,
    internal: _fill(tpl.internalPattern, tokens),
  };
}

function _fabricateSources(ctx, archetypes) {
  const flavor = REGION_FLAVOR[ctx.regionKey] || REGION_FLAVOR.Italy;
  const hashtags = (TYPE_HASHTAGS[ctx.productType] || ['#personalfinance']).slice(0, 5);
  const references = (TYPE_LINKEDIN_REFERENCES[ctx.productType] || TYPE_LINKEDIN_REFERENCES['Personal loan']).slice();
  const ticker = archetypes.flatMap(a => a.quotes.slice(0, 2).map(q => ({
    src: q.source === 'x' ? 'x' : 'reddit',
    t: `"${(q.text || '').slice(0, 110)}${q.text.length > 110 ? '…' : ''}"`,
  })));
  return {
    company: [
      { id:'gdrive',  name:'Google Drive',     status:'connected', last:'2 min ago',   count:'240 docs',     hint:`Credit policy, ${ctx.productType.toLowerCase()} wording, customer interviews, market research` },
      { id:'web',     name:'Website crawl',    status:'connected', last:'14 min ago',  count:'78 pages',     hint:`Product pages, disclosures, FAQ for ${ctx.productName}` },
      { id:'crm',     name:'CRM (Salesforce)', status:'connected', last:'1 hour ago',  count:'12,400 records', hint:`Anonymized ${ctx.productType.toLowerCase()} cohorts in ${ctx.regionLabel}` },
      { id:'csv',     name:'CSV upload',       status:'idle',      last:'—',           count:'0 files',      hint:'Drop deposit, claims, broker, or underwriting spreadsheets' },
    ],
    x: {
      hashtags,
      accounts: ['@finanzaitaliana', '@money_lab', '@banking_watch'].slice(0, 3),
      posts: 3200 + (ctx.seed % 2400),
      rate: `+${30 + (ctx.seed % 40)}/min`,
    },
    reddit: {
      subs: flavor.subs.slice(0, 4),
      posts: 900 + (ctx.seed % 900),
      rate: `+${10 + (ctx.seed % 20)}/min`,
    },
    linkedin: {
      hashtags,
      accounts: ['@bancaesempio', '@nordcredit', '@medbancassurance'].slice(0, 3),
      posts: 1500 + (ctx.seed % 1600),
      rate: `+${15 + (ctx.seed % 25)}/min`,
      references,
    },
    ticker,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// 4. fabricateProductPack — public entry for both built-ins and custom products
// ───────────────────────────────────────────────────────────────────────────

function fabricateProductPack({ productId, productName, type, region, regionLabel, rate, term, segment }) {
  const regionKey = _regionKeyFor(region || regionLabel);
  const templates = TYPE_TEMPLATE_SET[type] || TYPE_TEMPLATE_SET['Personal loan'];
  const ctx = {
    productId,
    productName: productName || segment || type,
    productType: type,
    productRate: Number(rate) || 5.5,
    productTerm: Number(term) || 48,
    segment: segment || '',
    regionKey,
    regionLabel: regionLabel || regionKey,
    seed: _hash(productId || `${type}-${segment}-${rate}-${term}`),
  };
  const archetypes = templates.map((tid, idx) => _fabricateOne(tid, ctx, idx));
  const sources = _fabricateSources(ctx, archetypes);
  return { archetypes, sources };
}

// ───────────────────────────────────────────────────────────────────────────
// 5. Build per-product lookups from the tenant catalog
// ───────────────────────────────────────────────────────────────────────────

const SHOWCASE_PRODUCT_ID = 'personal-loan-young-pros';

const ARCHETYPES_BY_PRODUCT = {
  [SHOWCASE_PRODUCT_ID]: PERSONAL_LOAN_ARCHETYPES,
};
const SOURCES_BY_PRODUCT = {
  [SHOWCASE_PRODUCT_ID]: PERSONAL_LOAN_SOURCES,
};

for (const tenant of TENANTS_DATA) {
  for (const product of tenant.products) {
    if (product.id === SHOWCASE_PRODUCT_ID) continue;
    const pack = fabricateProductPack({
      productId: product.id,
      productName: product.name,
      type: product.type,
      regionLabel: tenant.region,
      rate: product.rate,
      term: product.term,
      segment: product.segment,
    });
    ARCHETYPES_BY_PRODUCT[product.id] = pack.archetypes;
    SOURCES_BY_PRODUCT[product.id] = pack.sources;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// 6. localStorage merge — custom products created by prospects
// ───────────────────────────────────────────────────────────────────────────

const CUSTOM_STORAGE_KEY = 'sasp_custom_products_v1';

function _readCustomStore() {
  try {
    const raw = (typeof localStorage !== 'undefined') ? localStorage.getItem(CUSTOM_STORAGE_KEY) : null;
    if (!raw) return { products: [], packs: {}, orgs: [] };
    const parsed = JSON.parse(raw);
    return {
      products: Array.isArray(parsed.products) ? parsed.products : [],
      packs: parsed.packs && typeof parsed.packs === 'object' ? parsed.packs : {},
      orgs: Array.isArray(parsed.orgs) ? parsed.orgs : [],
    };
  } catch (e) {
    return { products: [], packs: {}, orgs: [] };
  }
}

function _writeCustomStore(store) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(store));
  } catch (e) { /* ignore quota / privacy errors */ }
}

// Replay stored custom orgs + products on boot, before any consumer reads the lookups.
{
  const store = _readCustomStore();
  for (const org of (store.orgs || [])) {
    if (!org || !org.id) continue;
    if (TENANTS_DATA.some(t => t.id === org.id)) continue;
    TENANTS_DATA.push({
      id: org.id,
      name: org.name || 'My organization',
      plan: org.plan || 'Trial',
      region: org.region || 'Italy',
      products: [],
    });
  }
  for (const entry of store.products) {
    const { orgId, product } = entry;
    if (!product || !product.id) continue;
    const tenant = TENANTS_DATA.find(t => t.id === orgId) || TENANTS_DATA[0];
    if (tenant.products.some(p => p.id === product.id)) continue; // already present
    tenant.products.push(product);
    const pack = store.packs[product.id];
    if (pack && pack.archetypes && pack.sources) {
      ARCHETYPES_BY_PRODUCT[product.id] = pack.archetypes;
      SOURCES_BY_PRODUCT[product.id] = pack.sources;
    } else {
      const rebuilt = fabricateProductPack({
        productId: product.id,
        productName: product.name,
        type: product.type,
        regionLabel: tenant.region,
        rate: product.rate,
        term: product.term,
        segment: product.segment,
      });
      ARCHETYPES_BY_PRODUCT[product.id] = rebuilt.archetypes;
      SOURCES_BY_PRODUCT[product.id] = rebuilt.sources;
    }
  }
}

// Public API for the onboarding modal. Creates an empty tenant, persists it,
// and returns the new org so callers can switch active context to it.
function saveCustomOrg({ name, region }) {
  const id = `org-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const org = {
    id,
    name: (name && name.trim()) || 'My organization',
    plan: 'Trial',
    region: region || 'Italy',
    products: [],
  };
  TENANTS_DATA.push(org);
  const store = _readCustomStore();
  store.orgs = store.orgs || [];
  store.orgs.push({ id: org.id, name: org.name, plan: org.plan, region: org.region, createdAt: Date.now() });
  _writeCustomStore(store);
  return org;
}

// Public API for the create-product modal. Persists, mutates in-memory lookups,
// and returns the new product entry so callers can switch active product to it.
function saveCustomProduct({ orgId, name, type, segment, region, rate, term, amount, features }) {
  const tenant = TENANTS_DATA.find(t => t.id === orgId) || TENANTS_DATA[0];
  const id = `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const product = {
    id,
    name: name || 'Untitled product',
    segment: segment || '—',
    type: type || 'Personal loan',
    status: 'draft',
    rate: Number(rate) || 5.5,
    term: Number(term) || 48,
    amount: Number(amount) || 10000,
    items: '0',
    upfrontFee: 1.0,
    repaymentCadence: 'monthly',
    features: {
      digitalOnly: true,
      advisor: false,
      earlyExitWaiver: false,
      flexiblePause: false,
      insuranceBundle: false,
      salarySwitch: false,
      jointApplication: false,
      ...(features || {}),
    },
  };
  const pack = fabricateProductPack({
    productId: id,
    productName: product.name,
    type: product.type,
    regionLabel: region || tenant.region,
    rate: product.rate,
    term: product.term,
    segment: product.segment,
  });
  tenant.products.push(product);
  ARCHETYPES_BY_PRODUCT[id] = pack.archetypes;
  SOURCES_BY_PRODUCT[id] = pack.sources;

  const store = _readCustomStore();
  store.products.push({ orgId: tenant.id, product, createdAt: Date.now() });
  store.packs[id] = pack;
  _writeCustomStore(store);

  return { orgId: tenant.id, product };
}

// ───────────────────────────────────────────────────────────────────────────
// 7. Resolvers + back-compat aliases
// ───────────────────────────────────────────────────────────────────────────

function getArchetypesFor(productId) {
  return ARCHETYPES_BY_PRODUCT[productId] || ARCHETYPES_BY_PRODUCT[SHOWCASE_PRODUCT_ID];
}

function getSourcesFor(productId) {
  return SOURCES_BY_PRODUCT[productId] || SOURCES_BY_PRODUCT[SHOWCASE_PRODUCT_ID];
}

// Tour script reads DATA.ARCHETYPES / DATA.SOURCES_DATA directly — keep these
// as aliases pointing at the showcase product so the Sunday-demo path is intact.
const ARCHETYPES = ARCHETYPES_BY_PRODUCT[SHOWCASE_PRODUCT_ID];
const SOURCES_DATA = SOURCES_BY_PRODUCT[SHOWCASE_PRODUCT_ID];

// ───────────────────────────────────────────────────────────────────────────
// 8. Fresh-signals client — fetches HITL-validated paraphrases from /api/signals
// ───────────────────────────────────────────────────────────────────────────
//
// Thin fetch wrapper. Returns [] when the API is unreachable (local file://, no
// backend yet, etc.) so the Sources screen degrades gracefully.

async function getFreshSignals({ limit = 12 } = {}) {
  try {
    const res = await fetch(`/api/signals?status=approved&limit=${limit}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return { signals: [], last_run: null, counts: null };
    return await res.json();
  } catch (e) {
    return { signals: [], last_run: null, counts: null };
  }
}

// ───────────────────────────────────────────────────────────────────────────
// 9. Country calibration layers
// ───────────────────────────────────────────────────────────────────────────
//
// Mirrors data/country_layers/it/trust_baseline.json. Keep in sync if the JSON
// is regenerated from ESS11 marginals. Source: ESS11 e04.1 (DOI 10.21338/ess11e04_1),
// fieldwork 2023-2024, IT, raw_n=2865, effective_n=2554.7, weight=pspwght.

const COUNTRY_LAYERS = {
  it: {
    trustBaseline: {
      meta: {
        source: 'ESS11 e04.1',
        doi: '10.21338/ess11e04_1',
        fieldwork: '2023-2024',
        rawN: 2865,
        effectiveN: 2554.7,
        weight: 'pspwght',
        jsonPath: 'data/country_layers/it/trust_baseline.json',
      },
      scale: { min: 0, max: 10, neutralBaseline: 4.4 },
      socialTrust: { compositeMean: 4.385 },
      institutionalTrust: {
        items: {
          trstprl: 4.305, trstlgl: 5.41, trstplc: 6.537,
          trstplt: 3.295, trstprt: 3.257, trstep: 4.519,
        },
        compositeMean: 4.554,
      },
      anchor: 4.4,
    },
    // Directional only. n=60 too small to drive scoring. Surfaced on the
    // methodology disclosure + ?debug=1 panel; NOT consumed by computeTrust.
    trustFreelanceUnder40Directional: {
      meta: {
        source: 'ESS11 e04.1 — under-40 freelance subset (IT)',
        rawN: 60,
        effectiveN: 53.0,
        jsonPath: 'trust_marginals_it_under40_freelance.json',
        caveat: 'n=60 is too thin to statistically distinguish from the general population on Trust or Satisfaction. All observed differences sit inside their own 95% CIs. Directional reference only — do not use as scoring input.',
      },
      socialTrust: { compositeMean: 4.692 },
      institutionalTrust: {
        items: {
          trstprl: 4.605, trstlgl: 5.781, trstplc: 6.619,
          trstplt: 3.258, trstprt: 3.448, trstep: 5.045,
        },
      },
    },
  },
};

window.SASP_DATA = {
  ARCHETYPES,
  PRODUCT_DEFAULTS,
  SOURCES_DATA,
  TENANTS_DATA,
  ARCHETYPES_BY_PRODUCT,
  SOURCES_BY_PRODUCT,
  getArchetypesFor,
  getSourcesFor,
  fabricateProductPack,
  saveCustomOrg,
  saveCustomProduct,
  getFreshSignals,
  SHOWCASE_PRODUCT_ID,
  countryLayers: COUNTRY_LAYERS,
};
