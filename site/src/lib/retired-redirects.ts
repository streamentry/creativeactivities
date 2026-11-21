/**
 * Old translated dementia guides (retired in English on 2026-11-15) are retired in every language
 * once that language has its new guides. Their addresses stay alive as small redirect pages built by
 * src/pages/[lang]/[section]/[slug].astro, so nobody following an old link or bookmark lands on a 404.
 * Static `_redirects` rules cannot cover them: there are over 10,000 (Cloudflare allows 2,000), and a
 * wildcard rule would send readers of English-guide languages to pages that do not exist.
 */
import { localePath } from '../i18n/locales';
import { RETIRED_GUIDES, guideIdOfPath, isRetiredGuide } from './retired-guides';

/**
 * Where the retired guide `id` in `lang` now points: the replacement guide in the same language when
 * it is translated, a games page in the same language (games exist in every language), otherwise the
 * English page (the English-only dementia hub, or a guide this language shows in English).
 */
export function retiredTarget(lang: string, id: string, hasTranslation: (lang: string, id: string) => boolean): string {
  if (!isRetiredGuide(id)) throw new Error(`${id} is not a retired guide`);
  const target = RETIRED_GUIDES[id] as string;
  if (target.startsWith('/games/')) return localePath(lang, target);
  const targetId = guideIdOfPath(target);
  if (targetId !== null && hasTranslation(lang, targetId)) return localePath(lang, target);
  return target;
}
