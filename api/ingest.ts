// Daily crawl orchestrator. Wired to Vercel Cron via vercel.json.
//
// Flow:
//   1. crawlIntermediarySources() → raw paragraph posts from partitaiva.it
//      (Finanzaonline is blocked by Cloudflare — see api/_lib/intermediary.ts)
//   2. Cheap keyword pre-filter (quickThemeGuess) — drop OTHER
//   3. Dedupe by original_hash
//   4. paraphraseWithClaude() — paraphrase + theme tag + verbatim guard
//   5. writeSignal() as pending
//   6. recordLastRun() so we can detect silent breakage
//
// Cron triggers GET with a Vercel-injected User-Agent. We also accept POST for
// manual smoke-testing via curl.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { crawlIntermediarySources } from './_lib/intermediary';
import { quickThemeGuess } from './_lib/themes';
import {
  hashOriginal,
  isDuplicate,
  newSignalId,
  recordLastRun,
  writeSignal,
  type Signal,
} from './_lib/storage';
import { paraphraseWithLLM, VerbatimLeakError } from './_lib/paraphrase';

const MAX_PARAPHRASES_PER_RUN = 12; // hard cap so a slow Claude run can't exhaust the function budget

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const t0 = Date.now();
  let posts_seen = 0;
  let posts_added = 0;
  let errors: string[] = [];

  try {
    const crawl = await crawlIntermediarySources();
    posts_seen = crawl.posts.length;
    if (crawl.fetch_errors > 0) {
      // Surface specific error messages so silent breakage (selector drift, IP block) is debuggable.
      errors.push(...crawl.fetch_errors_detail.slice(0, 3));
    }

    // Pre-filter by keywords. Drops generic "ciao" replies before we spend tokens.
    const onTopic = crawl.posts.filter(p => quickThemeGuess(p.text) !== 'OTHER');

    let processed = 0;
    for (const post of onTopic) {
      if (processed >= MAX_PARAPHRASES_PER_RUN) break;

      const original_hash = hashOriginal(post.text);
      if (await isDuplicate(original_hash)) continue;

      try {
        const para = await paraphraseWithLLM(post.text);
        if (para.theme === 'OTHER') continue;
        const sig: Signal = {
          id: newSignalId(),
          status: 'pending',
          paraphrase: para.paraphrase,
          theme: para.theme,
          source_url: post.thread_url,
          source_label: post.source_label,
          thread_title: post.thread_title,
          original_hash,
          original_excerpt: post.text.slice(0, 80) + (post.text.length > 80 ? '…' : ''),
          captured_at: Date.now(),
        };
        await writeSignal(sig);
        posts_added++;
        processed++;
      } catch (e) {
        if (e instanceof VerbatimLeakError) {
          errors.push(`verbatim leak: ${e.ngram}`);
        } else {
          errors.push(String((e as Error)?.message ?? e).slice(0, 200));
        }
        processed++;
      }
    }
  } catch (e) {
    errors.push(`fatal: ${String((e as Error)?.message ?? e).slice(0, 300)}`);
  }

  const error = errors.length ? errors.slice(0, 5).join(' | ') : undefined;
  await recordLastRun({ ts: Date.now(), posts_seen, posts_added, ...(error ? { error } : {}) });

  res.status(error ? 207 : 200).json({
    ok: !error,
    duration_ms: Date.now() - t0,
    posts_seen,
    posts_added,
    error,
  });
}
