import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** SEO-013: the parent organization named in the JSON-LD is also said in plain words on the About page. */
const schemaSource = readFileSync(new URL('./schema.ts', import.meta.url), 'utf8');
const en = JSON.parse(readFileSync(new URL('../i18n/ui/en.json', import.meta.url), 'utf8'));

describe('About page names the parent organization (SEO-013)', () => {
  it('shows the parent organization from the JSON-LD builder in the About body', () => {
    const parent = schemaSource.match(/parentOrganization: \{ '@type': 'Organization', name: '([^']+)' \}/)?.[1];
    expect(parent).toBeTruthy();
    const about: string = en.pages.about.bodyHtml;
    expect(about).toContain(`Creative Activities is published by ${parent} `);
  });
});
