// SEO-029: which built pages may canonicalize to another page. Pure functions, so the rule is
// unit-tested (src/lib/canonical-rules.test.ts) and check-site.mjs only supplies the build.

/**
 * Print and alternate templates: a page that repeats an indexable page's words in another layout.
 * Its canonical must point at the target. Add a template only for a duplicate presentation of the
 * same content; a page with different materials, steps or safety notes canonicalizes to itself.
 */
export const CANONICAL_ALTERNATES = [
  // Large-print card (WEB-018): the same steps as the standard card, in bigger type.
  // Source: src/pages/activity/[slug]/large-print.astro, rendered by LargePrintView.astro.
  {
    name: 'large-print card',
    match: /^\/activity\/([^/]+)\/large-print\/$/,
    target: (m) => `/activity/${m[1]}/`,
  },
];

/**
 * The problem with a page's canonical link, or null when it is right.
 * Every page self-canonicalizes unless it matches a template above; a template page must canonicalize
 * to its target, and the target must be a built, indexable page (targetIndexable answers that).
 * @param {string} path the page's path, such as `/activity/wrap-a-small-gift/large-print/`
 * @param {string | undefined} canonical the href of the page's rel="canonical" link
 * @param {{ site: string, targetIndexable: (path: string) => boolean }} options
 * @returns {string | null}
 */
export function canonicalError(path, canonical, { site, targetIndexable }) {
  const template = CANONICAL_ALTERNATES.find((t) => t.match.test(path));
  if (!template) {
    return canonical === `${site}${path}` ? null : `canonical ${canonical} should be ${site}${path}`;
  }
  const target = template.target(path.match(template.match));
  if (canonical !== `${site}${target}`) {
    return `${template.name} canonical ${canonical} should be ${site}${target}`;
  }
  if (!targetIndexable(target)) return `${template.name} canonical target ${target} is not a built, indexable page`;
  return null;
}
