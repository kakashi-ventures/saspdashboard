// Theme taxonomy A-F, sourced from files/01_signal_corpus.md.
// Definitions are inlined here so the paraphrase prompt and the validator UI share
// one canonical list. If files/01_signal_corpus.md gains a theme G, add it here.

export type ThemeId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'OTHER';

export interface ThemeDef {
  id: ThemeId;
  label: string;
  description: string;
  keywords: string[]; // used for cheap pre-filter before sending to Claude
}

export const THEMES: ThemeDef[] = [
  {
    id: 'A',
    label: 'Income volatility & "the bank doesn\'t trust me"',
    description: 'P.IVA, regime forfettario, irregular income, the asymmetric burden of proof vs dipendenti, broker stigma.',
    keywords: ['partita iva', 'p.iva', 'piva', 'forfettario', 'autonomo', 'autonoma', 'modello unico', 'redditi', 'fatturato', 'busta paga', 'dipendente', 'freelance', 'libero professionista'],
  },
  {
    id: 'B',
    label: 'Tasso fisso vs variabile under shifting BCE expectations',
    description: 'Rate psychology, fisso vs variabile heuristics, surrogate / surrogazione friction, BCE rate context.',
    keywords: ['tasso fisso', 'tasso variabile', 'fisso', 'variabile', 'bce', 'surroga', 'surrogazione', 'tan', 'taeg', 'spread', 'euribor', 'irs', 'mutuo opzione'],
  },
  {
    id: 'C',
    label: 'Garante, Fondo Consap, ISEE — shame, eligibility, gatekeeping',
    description: 'Garante familiare framing, Fondo Garanzia Prima Casa, ISEE thresholds and cliffs, under-36 eligibility.',
    keywords: ['garante', 'fideiussore', 'consap', 'fondo garanzia', 'isee', 'under 36', 'under-36', 'prima casa', 'giovani'],
  },
  {
    id: 'D',
    label: 'Hidden costs, polizze, "what they don\'t tell you"',
    description: 'Mandatory vs optional polizze, hidden fees, perizia, imposta sostitutiva, spread bancario opacity.',
    keywords: ['polizza', 'polizze', 'assicurazione', 'incendio', 'scoppio', 'proteggimutuo', 'perizia', 'imposta sostitutiva', 'spese', 'commissioni', 'spread', 'taeg', 'isc'],
  },
  {
    id: 'E',
    label: 'Identity language — atipico, consumatore, partita IVA paradox',
    description: 'Self-identifying language as atypical, marginal, or paradoxical applicants.',
    keywords: ['atipico', 'atipica', 'consumatore', 'precario', 'precaria', 'co.co.co', 'cocopro', 'partita iva paradox'],
  },
  {
    id: 'F',
    label: 'Market context — erogato, surroghe, BCE policy timing',
    description: 'Macro / market context: aggregate mortgage volumes, surroghe trends, BCE policy timing, fiscal policy, tax incentives, regulatory dynamics shaping Italian retail finance.',
    keywords: [
      // mortgage market specifics
      'erogato', 'surroghe', 'banca d\'italia', 'bankitalia',
      // generic market / temporal
      'mercato', 'q1', 'q2', 'q3', 'q4', 'crescita', 'andamento',
      // fiscal policy / tax incentives that shape applicant context
      'bonus', 'decreto', 'legge di bilancio', 'agevolazione', 'sgravio',
      'credito d\'imposta', 'credito imposta', 'fisco', 'tasse', 'iva',
      'banca', 'banche', 'finanza', 'finanziamento', 'risparmio',
      'bot', 'btp', 'zes', 'ristrutturazione', 'abitazione',
    ],
  },
];

export function themeById(id: string): ThemeDef | undefined {
  return THEMES.find(t => t.id === id);
}

// Cheap keyword pre-filter — returns the best-matching theme by keyword overlap.
// Returns 'OTHER' if no theme has any keyword match. Used to reject off-topic posts
// before they reach Claude.
export function quickThemeGuess(text: string): ThemeId {
  const norm = text.toLowerCase();
  let bestId: ThemeId = 'OTHER';
  let bestScore = 0;
  for (const theme of THEMES) {
    let score = 0;
    for (const kw of theme.keywords) {
      if (norm.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestId = theme.id;
    }
  }
  return bestScore >= 1 ? bestId : 'OTHER';
}

export const THEMES_PROMPT_BLOCK = THEMES
  .map(t => `- ${t.id}: ${t.label} — ${t.description}`)
  .join('\n');
