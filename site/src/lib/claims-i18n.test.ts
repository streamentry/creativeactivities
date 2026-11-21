import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findTermHits, formPattern, maskUrls, validateClaimTerms, type ClaimTermEntry } from './claims-i18n';

const DATA = JSON.parse(readFileSync(new URL('../data/claims-i18n.json', import.meta.url), 'utf8')) as {
  languages: string[];
  entries: ClaimTermEntry[];
};

const entry = (id: string, lang: string, forms: string[]): ClaimTermEntry => ({
  id,
  terms: { [lang]: { forms, basis: forms.length ? 'test' : null } },
});

const hitsOf = (text: string, lang: string, forms: string[]) => findTermHits(text, lang, [entry('t', lang, forms)]);

describe('word boundaries', () => {
  it('matches a whole word and not a longer word that contains it', () => {
    expect(hitsOf('Nejde o terapii.', 'cs', ['terapii'])).toHaveLength(1);
    expect(hitsOf('arteterapii', 'cs', ['terapii'])).toHaveLength(0);
    expect(hitsOf('terapiis', 'cs', ['terapii'])).toHaveLength(0);
  });

  it('treats a hyphen as a boundary, so a compound counts its part', () => {
    expect(hitsOf('Art-thérapie ou activité créative', 'fr', ['thérapie'])).toHaveLength(1);
  });

  it('matches a multi-word form across a line break', () => {
    const hits = hitsOf('Ningún juego prevenga\n la demencia aquí.', 'es', ['prevenga la demencia']);
    expect(hits).toHaveLength(1);
    expect(hits[0].line).toBe(1);
  });
});

describe('case and Unicode', () => {
  it('folds case for Latin and Czech diacritics', () => {
    expect(hitsOf('Keine THERAPIE hier', 'de', ['Therapie'])).toHaveLength(1);
    expect(hitsOf('LÉČBA se nekoná', 'cs', ['léčba'])).toHaveLength(1);
  });

  it('matches a decomposed accent against a precomposed form', () => {
    const decomposed = 'Art-thérapie';
    expect(hitsOf(decomposed, 'fr', ['thérapie'])).toHaveLength(1);
  });
});

describe('Arabic', () => {
  it('matches an inflected form with tanween, since the mark does not end the word', () => {
    expect(hitsOf('ليس علاجًا', 'ar', ['علاج'])).toHaveLength(1);
  });

  it('matches the term behind a prefix such as ب or ال', () => {
    expect(hitsOf('بالعلاج الفني', 'ar', ['علاج'])).toHaveLength(1);
    expect(hitsOf('العلاج بالفن', 'ar', ['علاج'])).toHaveLength(1);
  });

  it('does not match when letters follow the term, as in a different word', () => {
    expect(hitsOf('علاجات متعددة', 'ar', ['علاج'])).toHaveLength(0);
  });
});

describe('Bengali', () => {
  it('matches a term followed by a space, and not a longer word with a letter attached', () => {
    expect(hitsOf('এগুলো থেরাপি নয়', 'bn', ['থেরাপি'])).toHaveLength(1);
    expect(hitsOf('থেরাপিস্ট', 'bn', ['থেরাপি'])).toHaveLength(0);
  });
});

describe('sources', () => {
  it('ignores a term inside a URL', () => {
    expect(hitsOf('See https://example.org/therapie-guide for more.', 'de', ['therapie'])).toHaveLength(0);
    // The URL "https://a.b/c" is 13 characters; it becomes 13 spaces, and the newline stays.
    expect(maskUrls('x https://a.b/c y\nz')).toBe(`x ${' '.repeat(13)} y\nz`);
  });

  it('reports the 1-based line and the matched text as written', () => {
    const hits = hitsOf('a\nb\nUna TERAPIA', 'es', ['terapia']);
    expect(hits).toEqual([{ id: 't', form: 'terapia', matched: 'TERAPIA', line: 3 }]);
  });

  it('returns nothing for a language with no cell, or an empty forms list', () => {
    expect(findTermHits('terapia', 'da', [entry('t', 'es', ['terapia'])])).toEqual([]);
    expect(hitsOf('terapia', 'es', [])).toEqual([]);
  });

  it('keeps hits from several entries in line order', () => {
    const entries = [entry('a', 'de', ['Therapie']), entry('b', 'de', ['Behandlung'])];
    const hits = findTermHits('Behandlung\nTherapie', 'de', entries);
    expect(hits.map((h) => [h.id, h.line])).toEqual([
      ['b', 1],
      ['a', 2],
    ]);
  });
});

describe('formPattern', () => {
  it('escapes regex characters in a form', () => {
    expect(hitsOf('a.b and axb', 'es', ['a.b'])).toHaveLength(1);
    expect(formPattern('a.b', 'es').flags).toContain('u');
  });
});

describe('data file', () => {
  it('is well formed for the seven planned languages', () => {
    expect(DATA.languages).toEqual(['ar', 'bn', 'cs', 'da', 'de', 'es', 'fr']);
    expect(validateClaimTerms(DATA)).toEqual([]);
  });

  it('reports a filled cell without a basis, and an empty cell that has one', () => {
    const bad = {
      languages: ['de'],
      entries: [
        { id: 'x', terms: { de: { forms: ['Therapie'], basis: null } } },
        { id: 'y', terms: { de: { forms: [], basis: 'something' } } },
      ],
    };
    const problems = validateClaimTerms(bad);
    expect(problems).toContain('x/de: a filled cell needs a basis');
    expect(problems).toContain('y/de: an empty cell has basis null');
  });

  it('reports a missing cell and duplicate ids', () => {
    const bad = {
      languages: ['de', 'es'],
      entries: [
        { id: 'x', terms: { de: { forms: [], basis: null } } },
        { id: 'x', terms: { de: { forms: [], basis: null }, es: { forms: [], basis: null } } },
      ],
    };
    const problems = validateClaimTerms(bad);
    expect(problems).toContain('x/es: cell missing');
    expect(problems).toContain('duplicate entry id x');
  });
});
