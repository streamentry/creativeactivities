// Validates every content record against the Zod schemas in src/content.config.ts (PLAT-011).
// The schemas and collection folders are read from that file, not copied. Two Astro virtual
// modules it imports (`astro:content` and `astro/loaders`) are replaced by shims that keep the
// schema objects and the glob options, so no build runs. Front matter is parsed by the same
// helper Astro's content loader calls; it is a dependency of astro, not of this site, so it is
// reached from astro's install and no package is added.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire, registerHooks } from 'node:module';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Replacements for the Astro virtual modules the config imports. */
const SHIMS = {
  'astro:content': 'export const defineCollection = (config) => config;',
  'astro/loaders': 'export const glob = (options) => ({ glob: options });',
};

let hooksInstalled = false;
let collectionsPromise;
let frontmatterPromise;

/** `./lib/x` written without an extension, which Node does not resolve; finds `x.ts` or `x/index.ts`. */
function resolveExtensionless(specifier, parentURL) {
  if (!parentURL || !/^\.{1,2}\//.test(specifier) || /\.[cm]?[jt]s$/.test(specifier)) return null;
  const parentDir = dirname(fileURLToPath(parentURL));
  for (const candidate of [`${specifier}.ts`, `${specifier}/index.ts`]) {
    const file = resolve(parentDir, candidate);
    if (existsSync(file)) return pathToFileURL(file).href;
  }
  return null;
}

function installHooks() {
  if (hooksInstalled) return;
  hooksInstalled = true;
  registerHooks({
    resolve(specifier, context, nextResolve) {
      if (Object.hasOwn(SHIMS, specifier)) {
        return { url: `data:text/javascript,${encodeURIComponent(SHIMS[specifier])}`, shortCircuit: true };
      }
      const local = resolveExtensionless(specifier, context.parentURL);
      if (local) return { url: local, shortCircuit: true };
      return nextResolve(specifier, context);
    },
  });
}

/** The collections as src/content.config.ts declares them: `{ [name]: { loader: { glob: { pattern, base } }, schema } }`. */
export function loadCollections() {
  collectionsPromise ??= (async () => {
    installHooks();
    const configUrl = pathToFileURL(join(SITE_ROOT, 'src/content.config.ts')).href;
    const mod = await import(configUrl);
    return mod.collections;
  })();
  return collectionsPromise;
}

/** The front matter parser Astro's content loader uses (`@astrojs/internal-helpers`, which reads YAML with `yaml`). */
function loadFrontmatterParser() {
  frontmatterPromise ??= (async () => {
    const siteRequire = createRequire(join(SITE_ROOT, 'package.json'));
    const fromAstro = createRequire(siteRequire.resolve('astro/package.json'));
    const helper = await import(pathToFileURL(fromAstro.resolve('@astrojs/internal-helpers/frontmatter')).href);
    return helper;
  })();
  return frontmatterPromise;
}

/** Turns a glob such as `**\/*.md` or `*.md` into a matcher for paths relative to the base folder. */
export function patternToRegExp(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const body = escaped
    .replace(/\*\*\//g, '\u0000')
    .replace(/\*/g, '[^/]*')
    .replace(/\u0000/g, '(?:.*/)?');
  return new RegExp(`^${body}$`);
}

/** Files under `baseDir` matching `pattern`, as posix paths relative to `baseDir`. Dot files and folders are skipped, as Astro's glob loader does. */
export function listRecordFiles(baseDir, pattern) {
  if (!existsSync(baseDir)) return [];
  const matcher = patternToRegExp(pattern);
  return readdirSync(baseDir, { recursive: true, encoding: 'utf8' })
    .map((entry) => entry.split(sep).join('/'))
    .filter((entry) => !entry.split('/').some((segment) => segment.startsWith('.')))
    .filter((entry) => matcher.test(entry) && statSync(join(baseDir, entry)).isFile())
    .sort();
}

/** Zod issues as `{ field, message }`. The field is the dotted path, or `(record)` for a rule on the whole record. */
export function issuesOf(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) return [];
  return result.error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join('.') : '(record)',
    message: issue.message,
  }));
}

/** Parses one record's front matter and validates it. Returns the issues; an empty list means valid. */
export async function checkRecord(schema, contents) {
  const { parseFrontmatter, extractFrontmatter } = await loadFrontmatterParser();
  if (extractFrontmatter(contents) === undefined) {
    return [{ field: '(front matter)', message: 'no --- front matter block found' }];
  }
  let data;
  try {
    data = parseFrontmatter(contents).frontmatter;
  } catch (error) {
    return [{ field: '(front matter)', message: `YAML error: ${error.message.split('\n')[0]}` }];
  }
  return issuesOf(schema, data);
}

/**
 * Validates every collection under `root` (this site by default). A collection whose folder is
 * missing counts as zero records, so a fixture root can hold only the types it tests.
 */
export async function validateContent({ root = SITE_ROOT } = {}) {
  const started = performance.now();
  const collections = await loadCollections();
  const types = [];
  const failures = [];
  for (const [name, collection] of Object.entries(collections)) {
    const { base, pattern } = collection.loader.glob;
    const baseDir = resolve(root, base);
    const files = listRecordFiles(baseDir, pattern);
    let invalid = 0;
    for (const file of files) {
      const absolute = join(baseDir, file);
      const issues = await checkRecord(collection.schema, readFileSync(absolute, 'utf8'));
      if (issues.length > 0) {
        invalid += 1;
        failures.push({ collection: name, file: relative(root, absolute).split(sep).join('/'), issues });
      }
    }
    types.push({ name, files: files.length, valid: files.length - invalid, invalid });
  }
  return { types, failures, ms: performance.now() - started };
}

/** One line per invalid record, then a summary per record type. */
export function formatReport({ types, failures, ms }) {
  const lines = failures.map(
    (failure) => `FAIL ${failure.file}: ${failure.issues.map((issue) => `${issue.field}: ${issue.message}`).join('; ')}`,
  );
  if (lines.length > 0) lines.push('');
  lines.push('Record type            files  valid  invalid');
  for (const type of types) {
    lines.push(
      `${type.name.padEnd(20)} ${String(type.files).padStart(6)} ${String(type.valid).padStart(6)} ${String(type.invalid).padStart(8)}`,
    );
  }
  const files = types.reduce((sum, type) => sum + type.files, 0);
  lines.push('');
  lines.push(`${files} records checked, ${failures.length} invalid, ${(ms / 1000).toFixed(2)} s`);
  return lines.join('\n');
}
