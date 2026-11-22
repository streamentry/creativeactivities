/**
 * Lets Node run the site's TypeScript finder modules directly. The site's
 * extensionless relative imports (such as './activities') resolve to the
 * matching `.ts` file. Used only by export-finder-fixture.ts, with:
 *   node --import ./site/scripts/ts-extension-hooks.mjs --experimental-strip-types <script>
 */
import { register } from 'node:module';

register(
  'data:text/javascript,' +
    encodeURIComponent(`
      import { existsSync } from 'node:fs';
      import { fileURLToPath } from 'node:url';
      export async function resolve(specifier, context, nextResolve) {
        const isRelative = specifier.startsWith('./') || specifier.startsWith('../');
        if (isRelative && context.parentURL && !/\\.[cm]?[jt]s$/.test(specifier)) {
          const candidate = new URL(specifier + '.ts', context.parentURL);
          if (existsSync(fileURLToPath(candidate))) {
            return nextResolve(candidate.href, context);
          }
        }
        return nextResolve(specifier, context);
      }
    `),
);
