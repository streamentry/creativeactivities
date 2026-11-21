/**
 * Pure comparison logic for the build's structured-data check (SEO-013, SEO-042, SEO-043, SEO-047).
 * scripts/check-structured-data.mjs reads each built English page and passes its HTML here.
 *
 * Visible text is approximated from the built HTML: scripts, styles, templates, the head and any
 * element with the `hidden` attribute are dropped; inline tags join words, other tags separate them.
 * Closed <details> answers count as visible, because a reader can open them.
 */

const PAGE_ORIGIN = 'https://creativeactivities.org/';

const NAMED_ENTITIES = new Map<string, string>([
  ['amp', '&'],
  ['lt', '<'],
  ['gt', '>'],
  ['quot', '"'],
  ['apos', "'"],
  ['nbsp', ' '],
  ['lsquo', '‘'],
  ['rsquo', '’'],
  ['ldquo', '“'],
  ['rdquo', '”'],
  ['ndash', '–'],
  ['mdash', '—'],
  ['hellip', '…'],
  ['middot', '·'],
  ['bull', '•'],
  ['times', '×'],
  ['copy', '©'],
  ['reg', '®'],
  ['trade', '™'],
  ['eacute', 'é'],
  ['egrave', 'è'],
  ['aacute', 'á'],
  ['ccedil', 'ç'],
  ['ntilde', 'ñ'],
  ['uuml', 'ü'],
  ['ouml', 'ö'],
  ['auml', 'ä'],
  ['szlig', 'ß'],
]);

/** Elements whose content is never shown as page text. */
const SKIPPED_ELEMENTS = /<(script|style|template|noscript|svg|head)\b[\s\S]*?<\/\1\s*>/gi;
const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const INLINE_ELEMENTS = new Set([
  'a', 'abbr', 'b', 'bdi', 'bdo', 'cite', 'code', 'data', 'del', 'dfn', 'em', 'font', 'i', 'ins', 'kbd', 'label',
  'mark', 'q', 's', 'samp', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var',
]);
/** Text that stands in for a value nobody filled in. */
const PLACEHOLDER = /^(todo|tbd|lorem ipsum|undefined|null|nan|\[object object\]|placeholder)$/i;

/** Required fields per type (SEO-013). Types not listed need no extra fields. */
const REQUIRED: Record<string, readonly string[]> = {
  Organization: ['name'],
  WebSite: ['name', 'url'],
  BreadcrumbList: ['itemListElement'],
  ItemList: ['name', 'itemListElement'],
  ListItem: ['position', 'name'],
  FAQPage: ['mainEntity'],
  Question: ['name', 'acceptedAnswer'],
  Answer: ['text'],
  HowTo: ['name', 'step'],
  HowToStep: ['text'],
  HowToSupply: ['name'],
  Article: ['headline', 'author', 'datePublished', 'dateModified', 'image'],
  MedicalWebPage: ['headline', 'author', 'datePublished', 'dateModified', 'image'],
  WebApplication: ['name', 'url', 'image'],
  CreativeWork: ['name', 'url'],
  Offer: ['price', 'priceCurrency'],
};

export interface VisibleContent {
  /** Visible text, whitespace collapsed and entities decoded. */
  text: string;
  /** Absolute URLs of visible links, in document order. */
  links: string[];
}

export interface PageReport {
  /** Top-level JSON-LD types on the page, such as `HowTo` or `FAQPage`. */
  types: string[];
  /** One message per mismatch or missing field; empty when the page passes. */
  problems: string[];
}

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function decodeEntities(value: string): string {
  return value.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (match, body: string) => {
    if (body.startsWith('#')) {
      const hex = body[1] === 'x' || body[1] === 'X';
      const code = hex ? Number.parseInt(body.slice(2), 16) : Number.parseInt(body.slice(1), 10);
      return Number.isInteger(code) && code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES.get(body) ?? match;
  });
}

/** Collapses runs of whitespace (including non-breaking spaces) and trims the ends. */
export function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function hrefOf(attrs: string): string | undefined {
  const m = /(?:^|\s)href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i.exec(attrs);
  return m ? decodeEntities(m[1] ?? m[2] ?? m[3] ?? '') : undefined;
}

function resolveUrl(href: string, pageUrl: string): string | undefined {
  try {
    return new URL(href, pageUrl).href;
  } catch {
    return undefined;
  }
}

/** The visible text and visible links of a built page. */
export function visibleContent(html: string, pageUrl: string = PAGE_ORIGIN): VisibleContent {
  const body = html.replace(/^[\s\S]*?<body\b[^>]*>/i, '').replace(SKIPPED_ELEMENTS, ' ');
  const tokens = /<!--[\s\S]*?-->|<![^>]*>|<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|[^<]+|</g;
  const stack: string[] = [];
  // Depth of the outermost hidden element; content is skipped while it is open.
  let hiddenDepth: number | null = null;
  let text = '';
  const links: string[] = [];

  for (const m of body.matchAll(tokens)) {
    const [token, name, attrs = ''] = m;
    if (name === undefined) {
      if (token.startsWith('<!') || token.startsWith('<?')) continue;
      if (hiddenDepth === null) text += decodeEntities(token);
      continue;
    }
    const tag = name.toLowerCase();
    if (token.startsWith('</')) {
      const at = stack.lastIndexOf(tag);
      if (at >= 0) stack.length = at;
      if (hiddenDepth !== null && stack.length < hiddenDepth) hiddenDepth = null;
      if (hiddenDepth === null && !INLINE_ELEMENTS.has(tag)) text += ' ';
      continue;
    }
    const selfClosing = VOID_ELEMENTS.has(tag) || /\/\s*$/.test(attrs);
    const hidden = /(?:^|\s)hidden(?=[\s=/]|$)/i.test(attrs);
    if (!selfClosing) stack.push(tag);
    if (hidden && !selfClosing && hiddenDepth === null) hiddenDepth = stack.length;
    if (hiddenDepth !== null) continue;
    if (tag === 'a') {
      const href = hrefOf(attrs);
      const absolute = href === undefined ? undefined : resolveUrl(href, pageUrl);
      if (absolute !== undefined) links.push(absolute);
    }
    if (!INLINE_ELEMENTS.has(tag)) text += ' ';
  }
  return { text: normalizeText(text), links };
}

/** Every JSON-LD block on the page, with `@graph` wrappers unpacked, and any blocks that do not parse. */
export function jsonLdNodes(html: string): { nodes: JsonObject[]; problems: string[] } {
  const nodes: JsonObject[] = [];
  const problems: string[] = [];
  for (const m of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(m[1]);
    } catch (error) {
      problems.push(`JSON-LD block does not parse: ${(error as Error).message}`);
      continue;
    }
    for (const item of Array.isArray(parsed) ? parsed : [parsed]) {
      if (!isObject(item)) continue;
      const graph = item['@graph'];
      if (Array.isArray(graph)) nodes.push(...graph.filter(isObject));
      else nodes.push(item);
    }
  }
  return { nodes, problems };
}

export function hasJsonLd(html: string): boolean {
  return /<script\b[^>]*type="application\/ld\+json"/i.test(html);
}

export function typesOf(node: JsonObject): string[] {
  const type = node['@type'];
  if (typeof type === 'string') return [type];
  return Array.isArray(type) ? type.filter((t): t is string => typeof t === 'string') : [];
}

const short = (text: string): string => (text.length > 80 ? `${text.slice(0, 77)}...` : text);

/** HowTo: every step's text appears in the visible text, in step order (SEO-047). */
export function checkHowTo(node: JsonObject, visible: string): string[] {
  const steps: unknown[] = Array.isArray(node.step) ? node.step : [];
  const problems: string[] = [];
  let cursor = 0;
  steps.forEach((step, i) => {
    const raw = isObject(step) ? step.text : step;
    if (typeof raw !== 'string' || normalizeText(raw) === '') return;
    const needle = normalizeText(raw);
    const at = visible.indexOf(needle, cursor);
    if (at >= 0) {
      cursor = at + needle.length;
      return;
    }
    problems.push(
      visible.includes(needle)
        ? `HowTo step ${i + 1} appears in the page out of order: "${short(needle)}"`
        : `HowTo step ${i + 1} is not in the visible page text: "${short(needle)}"`,
    );
  });
  return problems;
}

/** FAQPage: every question and answer appears in the visible text (SEO-042). */
export function checkFaqPage(node: JsonObject, visible: string): string[] {
  const entities = Array.isArray(node.mainEntity) ? node.mainEntity.filter(isObject) : [];
  const problems: string[] = [];
  entities.forEach((question, i) => {
    const answer = isObject(question.acceptedAnswer) ? question.acceptedAnswer.text : undefined;
    const parts: [string, unknown][] = [
      ['question', question.name],
      ['answer', answer],
    ];
    for (const [label, value] of parts) {
      if (typeof value !== 'string' || normalizeText(value) === '') continue;
      if (!visible.includes(normalizeText(value))) {
        problems.push(`FAQ ${label} ${i + 1} is not in the visible page text: "${short(normalizeText(value))}"`);
      }
    }
  });
  return problems;
}

/** ItemList: the listed URLs appear as visible links, in list order (SEO-043). */
export function checkItemList(node: JsonObject, links: string[], pageUrl: string): string[] {
  const items = Array.isArray(node.itemListElement) ? node.itemListElement.filter(isObject) : [];
  const problems: string[] = [];
  let cursor = 0;
  items.forEach((item, i) => {
    const url = typeof item.url === 'string' ? resolveUrl(item.url, pageUrl) : undefined;
    if (url === undefined) return;
    const at = links.indexOf(url, cursor);
    if (at >= 0) {
      cursor = at + 1;
      return;
    }
    problems.push(
      links.includes(url)
        ? `ItemList item ${i + 1} is linked out of order: ${url}`
        : `ItemList item ${i + 1} is not a visible link on the page: ${url}`,
    );
  });
  return problems;
}

/** Every object in the JSON-LD tree, including nested nodes such as questions, steps and publishers. */
function allObjects(value: unknown): JsonObject[] {
  if (Array.isArray(value)) return value.flatMap(allObjects);
  if (!isObject(value)) return [];
  return [value, ...Object.values(value).flatMap(allObjects)];
}

/**
 * Required fields for each typed object (SEO-013). A node with no `@type`, such as `{ "@id": ... }`
 * pointing at another node, is a reference and is not checked here.
 */
export function missingRequiredFields(node: JsonObject): string[] {
  return typesOf(node).flatMap((type) => {
    const missing = (REQUIRED[type] ?? []).filter((field) => node[field] === undefined);
    // A ListItem needs a URL: `item` in a breadcrumb, `url` in an ItemList.
    if (type === 'ListItem' && node.item === undefined && node.url === undefined) missing.push('item or url');
    return missing.map((field) => `${type} is missing required field "${field}"`);
  });
}

/** Empty strings, empty arrays, nulls and placeholder words anywhere in the JSON-LD. */
export function emptyFieldProblems(value: unknown, path = '$'): string[] {
  if (value === null || value === undefined) return [`${path} is ${value === null ? 'null' : 'undefined'}`];
  if (typeof value === 'string') {
    const text = normalizeText(value);
    if (text === '') return [`${path} is an empty string`];
    return PLACEHOLDER.test(text) ? [`${path} is a placeholder value: "${value}"`] : [];
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return [`${path} is an empty array`];
    return value.flatMap((item, i) => emptyFieldProblems(item, `${path}[${i}]`));
  }
  if (isObject(value)) {
    return Object.entries(value).flatMap(([key, item]) => emptyFieldProblems(item, `${path}.${key}`));
  }
  return [];
}

/** Checks one built page. Returns undefined when the page carries no JSON-LD. */
export function checkStructuredData(html: string, pageUrl: string): PageReport | undefined {
  if (!hasJsonLd(html)) return undefined;
  const { nodes, problems: parseProblems } = jsonLdNodes(html);
  const visible = visibleContent(html, pageUrl);
  const problems = [...parseProblems];

  nodes.forEach((node, i) => {
    problems.push(...emptyFieldProblems(node, `node[${i}]`));
    for (const object of allObjects(node)) problems.push(...missingRequiredFields(object));
    // The site's own publisher (top level) must say where it lives; a nested parent organization need not.
    if (typesOf(node).some((t) => t === 'Organization' || t === 'WebSite') && node.url === undefined) {
      problems.push(`${typesOf(node)[0]} at the top level is missing required field "url"`);
    }
    const nodeTypes = typesOf(node);
    if (nodeTypes.includes('HowTo')) problems.push(...checkHowTo(node, visible.text));
    if (nodeTypes.includes('FAQPage')) problems.push(...checkFaqPage(node, visible.text));
    if (nodeTypes.includes('ItemList')) problems.push(...checkItemList(node, visible.links, pageUrl));
  });
  const types = [...new Set(nodes.flatMap(typesOf))];
  return { types, problems };
}
