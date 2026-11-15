import { SITE } from './site';

/**
 * "Suggest a correction" as a plain mailto link (COM-031). It works without JavaScript and without an
 * account. The body carries only the page address and three prompts: nothing about the reader.
 */
export const CORRECTION_PROMPTS = [
  'What is wrong:',
  'Where on the page:',
  'Your email if you want a reply (optional):',
] as const;

/** The canonical absolute address of a page, with any query string or fragment removed. */
export function canonicalPageUrl(path: string): string {
  if (!path.startsWith('/')) throw new Error(`Page path must start with a slash: ${path}`);
  const clean = path.split(/[?#]/, 1)[0];
  return `${SITE.url}${clean}`;
}

export function correctionBody(pageUrl: string): string {
  const lines = [
    'Tell us what is wrong on this page. You do not need an account.',
    '',
    `Page: ${pageUrl}`,
    '',
    ...CORRECTION_PROMPTS.flatMap((prompt) => [prompt, '']),
  ];
  return lines.join('\r\n');
}

/** A mailto link to the support address, with the subject and body encoded. */
export function correctionMailto({ title, path }: { title: string; path: string }): string {
  const subject = `Correction: ${title.trim()}`;
  const body = correctionBody(canonicalPageUrl(path));
  return `mailto:${SITE.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
