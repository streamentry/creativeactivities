/**
 * A small YAML reader for the frontmatter this site writes: block mappings,
 * block sequences, plain/quoted/folded scalars and flow arrays. It exists so
 * the localization checks can run in vitest without a new dependency. It is
 * not a general YAML parser; anything outside this subset throws.
 */

export interface FrontmatterSplit {
  frontmatter: Record<string, unknown>;
  body: string;
}

const KEY = /^([A-Za-z_][\w-]*|"[^"]*"|'[^']*')\s*:(\s|$)/;

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

interface Cursor {
  lines: string[];
  index: number;
}

/** Splits a Markdown document into its `---` frontmatter and body. */
export function splitFrontmatter(source: string): FrontmatterSplit {
  const match = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(source);
  if (!match) return { frontmatter: {}, body: source };
  const parsed = parseYamlSubset(match[1]);
  const frontmatter = isRecord(parsed) ? parsed : {};
  return { frontmatter, body: source.slice(match[0].length) };
}

/** Parses the YAML subset used by the site's content frontmatter. */
export function parseYamlSubset(text: string): Record<string, unknown> {
  const cursor: Cursor = { lines: text.split(/\r?\n/), index: 0 };
  const value = parseBlock(cursor, -1);
  if (value === undefined) return {};
  if (!isRecord(value)) throw new Error('yaml-subset: document root must be a mapping');
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function indentOf(line: string): number {
  return line.length - line.trimStart().length;
}

function isBlank(line: string): boolean {
  const trimmed = line.trim();
  return trimmed === '' || trimmed.startsWith('#');
}

function skipBlank(cursor: Cursor): void {
  while (cursor.index < cursor.lines.length && isBlank(cursor.lines[cursor.index])) cursor.index += 1;
}

/** Reads the block that starts at the next content line, if it is indented deeper than `parentIndent`. */
function parseBlock(cursor: Cursor, parentIndent: number): Json | undefined {
  skipBlank(cursor);
  if (cursor.index >= cursor.lines.length) return undefined;
  const line = cursor.lines[cursor.index];
  const indent = indentOf(line);
  if (indent <= parentIndent) return undefined;
  const content = line.trim();
  if (content === '-' || content.startsWith('- ')) return parseSequence(cursor, indent);
  if (KEY.test(content)) return parseMapping(cursor, indent);
  cursor.index += 1;
  return parseScalar(content);
}

function parseMapping(cursor: Cursor, indent: number): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (;;) {
    skipBlank(cursor);
    if (cursor.index >= cursor.lines.length) break;
    const line = cursor.lines[cursor.index];
    if (indentOf(line) !== indent) break;
    const content = line.trim();
    if (content === '-' || content.startsWith('- ')) break;
    const match = KEY.exec(content);
    if (!match) throw new Error(`yaml-subset: cannot parse line ${cursor.index + 1}: ${content}`);
    const key = unquoteKey(match[1]);
    const rest = content.slice(match[0].length).trim();
    cursor.index += 1;
    out[key] = parseValue(cursor, indent, rest);
  }
  return out;
}

function parseSequence(cursor: Cursor, indent: number): unknown[] {
  const out: unknown[] = [];
  for (;;) {
    skipBlank(cursor);
    if (cursor.index >= cursor.lines.length) break;
    const line = cursor.lines[cursor.index];
    if (indentOf(line) !== indent) break;
    const content = line.trim();
    if (!(content === '-' || content.startsWith('- '))) break;
    const rest = content.slice(1).trim();
    if (rest === '') {
      cursor.index += 1;
      out.push(parseBlock(cursor, indent) ?? null);
      continue;
    }
    // Re-read the item text as a line indented to its own column, so a
    // mapping that starts on the dash line continues on the lines below it.
    const column = indent + (content.length - content.slice(1).trimStart().length);
    cursor.lines[cursor.index] = ' '.repeat(column) + rest;
    if (KEY.test(rest)) {
      out.push(parseMapping(cursor, column));
    } else {
      cursor.index += 1;
      out.push(parseValue(cursor, indent, rest, true));
    }
  }
  return out;
}

/** The value after `key:` or `- `: inline text, a block scalar, a flow array, or a nested block. */
function parseValue(cursor: Cursor, parentIndent: number, rest: string, inlineItem = false): Json {
  if (/^[>|][+-]?$/.test(rest)) return readBlockScalar(cursor, parentIndent, rest);
  if (rest !== '') {
    if (rest.startsWith('"') && !closesDoubleQuote(rest)) return readMultilineQuoted(cursor, rest);
    return parseScalar(rest);
  }
  if (inlineItem) return null;
  skipBlank(cursor);
  if (cursor.index < cursor.lines.length) {
    const next = cursor.lines[cursor.index];
    const nextIndent = indentOf(next);
    const trimmed = next.trim();
    const isSequenceAtSameLevel = nextIndent === parentIndent && (trimmed === '-' || trimmed.startsWith('- '));
    if (isSequenceAtSameLevel) return parseSequence(cursor, nextIndent);
  }
  return parseBlock(cursor, parentIndent) ?? null;
}

function readBlockScalar(cursor: Cursor, parentIndent: number, header: string): string {
  const collected: string[] = [];
  let blockIndent = -1;
  while (cursor.index < cursor.lines.length) {
    const line = cursor.lines[cursor.index];
    if (line.trim() === '') {
      collected.push('');
      cursor.index += 1;
      continue;
    }
    const indent = indentOf(line);
    if (indent <= parentIndent) break;
    if (blockIndent === -1) blockIndent = indent;
    collected.push(line.slice(Math.min(blockIndent, indent)));
    cursor.index += 1;
  }
  while (collected.length > 0 && collected[collected.length - 1] === '') collected.pop();
  const chomp = header.endsWith('-') ? '' : '\n';
  if (header.startsWith('|')) return collected.join('\n') + chomp;
  // Folded: single line breaks become spaces, each blank line becomes a newline.
  let folded = '';
  collected.forEach((text, i) => {
    if (i === 0) {
      folded = text;
    } else if (text === '') {
      folded += '\n';
    } else if (collected[i - 1] === '') {
      folded += text;
    } else {
      folded += ' ' + text;
    }
  });
  return folded + chomp;
}

function closesDoubleQuote(text: string): boolean {
  let escaped = false;
  for (let i = 1; i < text.length; i += 1) {
    const ch = text[i];
    if (escaped) {
      escaped = false;
    } else if (ch === '\\') {
      escaped = true;
    } else if (ch === '"') {
      return true;
    }
  }
  return false;
}

/** A double-quoted scalar that continues onto following lines (lines are joined with a space). */
function readMultilineQuoted(cursor: Cursor, first: string): Json {
  let text = first;
  while (cursor.index < cursor.lines.length && !closesDoubleQuote(text)) {
    text += ' ' + cursor.lines[cursor.index].trim();
    cursor.index += 1;
  }
  return parseScalar(text);
}

function unquoteKey(key: string): string {
  if (key.startsWith('"') || key.startsWith("'")) return key.slice(1, -1);
  return key;
}

function parseScalar(raw: string): Json {
  const text = stripComment(raw.trim());
  if (text === '[]') return [];
  if (text === '{}') return {};
  if (text.startsWith('[') && text.endsWith(']')) {
    return splitFlow(text.slice(1, -1)).map((item) => parseScalar(item));
  }
  if (text.startsWith('"')) {
    const end = closingQuoteIndex(text);
    if (end === -1) throw new Error(`yaml-subset: unterminated quoted text: ${text}`);
    return JSON.parse(text.slice(0, end + 1)) as string;
  }
  if (text.startsWith("'")) {
    if (!text.endsWith("'") || text.length < 2) throw new Error(`yaml-subset: unterminated quoted text: ${text}`);
    return text.slice(1, -1).replace(/''/g, "'");
  }
  if (text === 'null' || text === '~') return null;
  if (text === 'true') return true;
  if (text === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  return text;
}

function closingQuoteIndex(text: string): number {
  let escaped = false;
  for (let i = 1; i < text.length; i += 1) {
    const ch = text[i];
    if (escaped) escaped = false;
    else if (ch === '\\') escaped = true;
    else if (ch === '"') return i;
  }
  return -1;
}

/** Drops a trailing ` # comment` that sits outside quotes. */
function stripComment(text: string): string {
  if (text.startsWith('"') || text.startsWith("'")) {
    const end = text.startsWith('"') ? closingQuoteIndex(text) : text.indexOf("'", 1);
    if (end === -1) return text;
    const tail = text.slice(end + 1).trim();
    return tail === '' || tail.startsWith('#') ? text.slice(0, end + 1) : text;
  }
  const hash = text.search(/\s#/);
  return hash === -1 ? text : text.slice(0, hash).trimEnd();
}

function splitFlow(inner: string): string[] {
  const items: string[] = [];
  let current = '';
  let quote: string | null = null;
  for (let i = 0; i < inner.length; i += 1) {
    const ch = inner[i];
    if (quote) {
      current += ch;
      if (ch === '\\' && quote === '"') {
        current += inner[i + 1] ?? '';
        i += 1;
      } else if (ch === quote) {
        quote = null;
      }
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
    } else if (ch === ',') {
      items.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim() !== '') items.push(current.trim());
  return items;
}
