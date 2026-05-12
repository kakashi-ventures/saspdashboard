// LLM-based paraphrase + theme tag, with verbatim-leak guard.
//
// v0 uses OpenAI (gpt-4o-mini) because the project's existing API key is from
// OpenAI (`sk-proj-…`). The methodology is LLM-vendor-agnostic — paraphrase is a
// mechanical step, not the core epistemic work. Swappable to Claude / others
// later without changing the pipeline contract.
//
// Posture (per INGESTION_NARRATIVE.md §3 / §5):
//   - Paraphrase MUST preserve semantic content while breaking exact string match.
//   - Reject any paraphrase that contains 4+ consecutive normalized tokens from the
//     original. Re-prompt up to MAX_RETRIES with a hardening note before giving up.
//   - Native-Italian HITL is still the final gate downstream — this guard is the
//     mechanical defence, not a substitute for human review.

import OpenAI from 'openai';
import { THEMES_PROMPT_BLOCK, type ThemeId } from './themes';

const MODEL = 'gpt-4o-mini';
const MAX_RETRIES = 2;
const VERBATIM_NGRAM = 4;

let _client: OpenAI | null = null;
function client(): OpenAI {
  if (_client) return _client;
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not set');
  _client = new OpenAI({ apiKey: key });
  return _client;
}

export interface ParaphraseResult {
  paraphrase: string;
  theme: ThemeId;
  confidence: number; // 0-1
  retries: number;
}

export class VerbatimLeakError extends Error {
  constructor(public readonly ngram: string) {
    super(`Paraphrase reproduced verbatim: "${ngram}"`);
    this.name = 'VerbatimLeakError';
  }
}

function normalizeTokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-zàèéìòù0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter(t => t.length > 0);
}

function ngrams(tokens: string[], n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) out.push(tokens.slice(i, i + n).join(' '));
  return out;
}

export function detectVerbatimLeak(original: string, paraphrase: string): string | null {
  const origTokens = normalizeTokens(original);
  const paraTokens = normalizeTokens(paraphrase);
  if (paraTokens.length < VERBATIM_NGRAM) return null;
  const origNgrams = new Set(ngrams(origTokens, VERBATIM_NGRAM));
  for (const g of ngrams(paraTokens, VERBATIM_NGRAM)) {
    if (origNgrams.has(g)) return g;
  }
  return null;
}

const SYSTEM_PROMPT = `You are processing Italian-language editorial paragraphs about Italian mortgages, P.IVA / freelance finance, and rate dynamics for an audience-research pipeline. Your job:

1. PARAPHRASE the paragraph in Italian, preserving the speaker's belief, fear, heuristic, framing, or reasoning pattern. The paraphrase must not reproduce any sequence of 4 or more consecutive words from the original. Restructure phrasing aggressively. Keep the same register (formal/informal/sarcastic).

2. THEME-TAG using exactly one of these IDs:
${THEMES_PROMPT_BLOCK}

3. RATE your confidence in the theme assignment 0.0–1.0.

Output JSON only, no preamble or commentary:
{"paraphrase": "...", "theme": "A|B|C|D|E|F|OTHER", "confidence": 0.0-1.0}

If the paragraph is off-topic (not about mortgages, freelance finance, rates, costs, regulation, or Italian banking), return theme "OTHER".`;

function buildUserMessage(original: string, retryNote?: string): string {
  const base = `Italian text to process:\n\n${original}`;
  return retryNote ? `${base}\n\n${retryNote}` : base;
}

interface RawResponse {
  paraphrase?: unknown;
  theme?: unknown;
  confidence?: unknown;
}

function parseResponse(text: string): RawResponse {
  // Tolerate leading/trailing whitespace and ```json fences.
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  try {
    return JSON.parse(trimmed) as RawResponse;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]) as RawResponse; } catch { /* fallthrough */ }
    }
    throw new Error(`LLM returned non-JSON: ${trimmed.slice(0, 200)}`);
  }
}

function coerceTheme(raw: unknown): ThemeId {
  const s = String(raw || '').toUpperCase().trim();
  if (['A', 'B', 'C', 'D', 'E', 'F', 'OTHER'].includes(s)) return s as ThemeId;
  return 'OTHER';
}

export async function paraphraseWithLLM(original: string): Promise<ParaphraseResult> {
  let lastLeak: string | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const retryNote = attempt > 0 && lastLeak
      ? `Your previous attempt reproduced the verbatim phrase "${lastLeak}". Rewrite more aggressively — split clauses, swap synonyms, restructure word order. Do not preserve any 4-word sequence from the original.`
      : undefined;

    const resp = await client().chat.completions.create({
      model: MODEL,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserMessage(original, retryNote) },
      ],
    });

    const content = resp.choices[0]?.message?.content;
    if (!content) throw new Error('OpenAI returned empty content');
    const parsed = parseResponse(content);
    const paraphrase = String(parsed.paraphrase || '').trim();
    if (!paraphrase) throw new Error('Empty paraphrase from LLM');

    const leak = detectVerbatimLeak(original, paraphrase);
    if (leak) {
      lastLeak = leak;
      continue;
    }
    return {
      paraphrase,
      theme: coerceTheme(parsed.theme),
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.5)),
      retries: attempt,
    };
  }
  throw new VerbatimLeakError(lastLeak ?? '(unknown ngram)');
}
