#!/usr/bin/env python3
"""Per-language translation inventory (L10N-001).

    python3 scripts/l10n_inventory.py           # print the Markdown table
    python3 scripts/l10n_inventory.py --write   # also write docs/specs/global/language-inventory.md

For every language code it counts, per surface: app strings (lib/l10n/arb),
website UI, games and play strings (site/src/i18n), translated guides
(site/src/content/guides-i18n) and store listings (metadata/i18n). It also
reads the app review fields in docs/specs/release-status.json and counts
placeholder strings (values containing " ... " or ending in "...").

The website has no reviewed-language list yet. The Site review column reads
REVIEWED_LANGUAGES from site/src/i18n/locales.ts when that constant exists.
It is found with a regular expression, not a TypeScript parser, and it reads
"none recorded" when the constant is absent. Language names come from the
englishName fields in the same file, parsed the same way, with the CSV name as
fallback.

The counts are of keys and files, not of translation quality. Standard library
only. Nothing here publishes or sends anything.
"""
import argparse
import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENGLISH = 'en'
DATE = '2026-11-21'
OUTPUT_RELATIVE = 'docs/specs/global/language-inventory.md'
CSV_RELATIVE = 'docs/languages.csv'
STATUS_RELATIVE = 'docs/specs/release-status.json'
LOCALES_RELATIVE = 'site/src/i18n/locales.ts'
ARB_RELATIVE = 'lib/l10n/arb'
SITE_JSON_RELATIVE = {
    'ui': 'site/src/i18n/ui',
    'games': 'site/src/i18n/games',
    'play': 'site/src/i18n/play',
}
GUIDES_EN_RELATIVE = 'site/src/content/guides'
GUIDES_I18N_RELATIVE = 'site/src/content/guides-i18n'
STORE_RELATIVE = 'metadata/i18n'
STORE_EN_RELATIVE = 'metadata/en-US'
GUIDE_SUFFIXES = ('.md', '.mdx')
KEYED_SURFACES = ('app', 'ui', 'games', 'play')
PLACEHOLDER_SURFACES = ('app', 'ui', 'games', 'play', 'store')
COLUMNS = [
    'Code', 'Language', 'App keys', 'Store listing', 'Site UI keys',
    'Games keys', 'Play keys', 'Guides', 'App review', 'Site review',
    'Reviewer', 'Missing keys', 'Placeholders app/ui/games/play/store',
]


def load_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def flatten_strings(value, prefix=''):
    """Map dotted paths to every string leaf of a JSON value."""
    found = {}
    if isinstance(value, dict):
        for key, child in value.items():
            path = f'{prefix}.{key}' if prefix else key
            found.update(flatten_strings(child, path))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            found.update(flatten_strings(child, f'{prefix}[{index}]'))
    elif isinstance(value, str):
        found[prefix] = value
    return found


def read_app_strings(root, code):
    path = root / ARB_RELATIVE / f"app_{code.replace('-', '_')}.arb"
    if not path.is_file():
        return None
    data = load_json(path)
    return {key: value for key, value in data.items()
            if not key.startswith('@') and isinstance(value, str)}


def read_site_strings(root, surface, code):
    path = root / SITE_JSON_RELATIVE[surface] / f'{code}.json'
    if not path.is_file():
        return None
    data = load_json(path)
    if isinstance(data, dict):
        # Top-level "_note" entries are instructions for translators, not strings to translate.
        data = {key: value for key, value in data.items() if not key.startswith('_')}
    return flatten_strings(data)


def read_store_strings(root, code):
    if code == ENGLISH:
        # The English listing is plain text files, so it has no JSON strings to count.
        return {} if (root / STORE_EN_RELATIVE).is_dir() else None
    path = root / STORE_RELATIVE / f'{code}.json'
    if not path.is_file():
        return None
    data = load_json(path)
    strings = {}
    for section in ('app_store', 'google_play'):
        strings.update(flatten_strings(data.get(section, {}), section))
    return strings


def guide_paths(base):
    """Relative paths of the guide files under base, or None when there is no folder."""
    if not base.is_dir():
        return None
    return {path.relative_to(base).as_posix() for path in base.rglob('*')
            if path.is_file() and path.name.endswith(GUIDE_SUFFIXES)}


def read_guides(root, code):
    if code == ENGLISH:
        return guide_paths(root / GUIDES_EN_RELATIVE)
    return guide_paths(root / GUIDES_I18N_RELATIVE / code)


def is_placeholder(text):
    """True for a value with a spaced ellipsis or one that ends in an ellipsis."""
    return ' ... ' in text or text.rstrip().endswith('...')


def count_placeholders(values):
    return sum(1 for value in values if is_placeholder(value))


def discover_codes(root):
    """Every language code that has any file, plus the codes in docs/languages.csv."""
    codes = {ENGLISH}
    csv_path = root / CSV_RELATIVE
    if csv_path.is_file():
        with csv_path.open(encoding='utf-8', newline='') as handle:
            rows = list(csv.reader(handle))
        codes.update(row[0].strip() for row in rows[1:] if row and row[0].strip())
    arb_dir = root / ARB_RELATIVE
    if arb_dir.is_dir():
        codes.update(path.stem[len('app_'):].replace('_', '-')
                     for path in arb_dir.glob('app_*.arb'))
    for relative in SITE_JSON_RELATIVE.values():
        folder = root / relative
        if folder.is_dir():
            codes.update(path.stem for path in folder.glob('*.json'))
    guides = root / GUIDES_I18N_RELATIVE
    if guides.is_dir():
        codes.update(path.name for path in guides.iterdir() if path.is_dir())
    store = root / STORE_RELATIVE
    if store.is_dir():
        codes.update(path.stem for path in store.glob('*.json'))
    return codes


def language_names(root):
    """englishName per code from site/src/i18n/locales.ts, read with a regular expression."""
    path = root / LOCALES_RELATIVE
    if not path.is_file():
        return {}
    pattern = re.compile(r"code: '([^']+)'.*?englishName: '([^']+)'")
    return dict(pattern.findall(path.read_text(encoding='utf-8')))


def csv_names(root):
    path = root / CSV_RELATIVE
    if not path.is_file():
        return {}
    with path.open(encoding='utf-8', newline='') as handle:
        rows = list(csv.reader(handle))
    names = {}
    for row in rows[1:]:
        if len(row) >= 4 and row[0].strip():
            names[row[0].strip()] = row[3].split(';')[0].strip()
    return names


def parse_reviewed_languages(text):
    """Codes in REVIEWED_LANGUAGES, or None when the constant does not exist."""
    match = re.search(r'REVIEWED_LANGUAGES\b[^=]*=\s*(?:new Set\()?\[([^\]]*)\]', text)
    if not match:
        return None
    return re.findall(r"['\"]([^'\"]+)['\"]", match.group(1))


def read_release_languages(root):
    path = root / STATUS_RELATIVE
    if not path.is_file():
        return {}
    return load_json(path).get('localization', {}).get('languages', {})


def read_surface(root, surface, code):
    if surface == 'app':
        return read_app_strings(root, code)
    if surface == 'store':
        return read_store_strings(root, code)
    return read_site_strings(root, surface, code)


def percent(present, total):
    return 100 if total == 0 else round(100 * present / total)


def build_rows(root=ROOT):
    """One dict per language code, sorted by code. Missing inputs count as empty."""
    root = Path(root)
    names = {**csv_names(root), **language_names(root)}
    release = read_release_languages(root)
    reviewed_path = root / LOCALES_RELATIVE
    reviewed = (parse_reviewed_languages(reviewed_path.read_text(encoding='utf-8'))
                if reviewed_path.is_file() else None)
    english_keys = {surface: read_surface(root, surface, ENGLISH) or {}
                    for surface in KEYED_SURFACES}
    english_guides = read_guides(root, ENGLISH) or set()

    rows = []
    for code in sorted(discover_codes(root), key=str.lower):
        row = {'code': code, 'language': names.get(code, '')}
        row['keys'] = {}
        missing_total = 0
        strings_by_surface = {}
        for surface in KEYED_SURFACES:
            strings = read_surface(root, surface, code)
            strings_by_surface[surface] = strings or {}
            reference = english_keys[surface]
            present = len(set(reference) & set(strings)) if strings else 0
            row['keys'][surface] = {'present': present, 'total': len(reference),
                                    'file': strings is not None}
            missing_total += len(reference) - present
        row['missing_keys'] = missing_total

        store = read_store_strings(root, code)
        row['store'] = store is not None
        strings_by_surface['store'] = store or {}

        guides = read_guides(root, code)
        matched = len(english_guides & guides) if guides else 0
        row['guides'] = {'present': matched, 'total': len(english_guides),
                         'folder': guides is not None}

        row['placeholders'] = {
            surface: count_placeholders(strings_by_surface[surface].values())
            for surface in PLACEHOLDER_SURFACES
        }

        if code == ENGLISH:
            row['app_review'] = 'source'
            row['site_review'] = 'source'
            row['reviewer'] = ''
        else:
            entry = release.get(code)
            row['app_review'] = entry.get('status', 'unknown') if entry else 'not listed'
            row['reviewer'] = (entry.get('reviewer') or '') if entry else ''
            if reviewed is None:
                row['site_review'] = 'none recorded'
            else:
                row['site_review'] = 'reviewed' if code in reviewed else 'unreviewed'
        rows.append(row)
    return rows


def format_keys(cell):
    if not cell['file']:
        return f"no file (0/{cell['total']})"
    return f"{cell['present']}/{cell['total']} ({percent(cell['present'], cell['total'])}%)"


def render_table(rows):
    lines = ['| ' + ' | '.join(COLUMNS) + ' |',
             '|' + '|'.join(['---'] * len(COLUMNS)) + '|']
    for row in rows:
        keys = row['keys']
        guides = row['guides']
        guide_cell = (f"{guides['present']}/{guides['total']} "
                      f"({percent(guides['present'], guides['total'])}%)"
                      if guides['folder'] else f"no folder (0/{guides['total']})")
        placeholders = '/'.join(str(row['placeholders'][surface])
                                for surface in PLACEHOLDER_SURFACES)
        cells = [
            row['code'],
            row['language'],
            format_keys(keys['app']),
            'yes' if row['store'] else 'no',
            format_keys(keys['ui']),
            format_keys(keys['games']),
            format_keys(keys['play']),
            guide_cell,
            row['app_review'],
            row['site_review'],
            row['reviewer'],
            str(row['missing_keys']),
            placeholders,
        ]
        lines.append('| ' + ' | '.join(cell.replace('|', '\\|') for cell in cells) + ' |')
    return '\n'.join(lines)


def render_document(table):
    return f"""# Language inventory

Dated {DATE}. Generated by `python3 scripts/l10n_inventory.py --write`; do not edit
the table by hand. Re-run the script on each release (L10N-001). The counts are
of keys and files, not of translation quality: a complete key set can still hold
weak wording, and a placeholder count flags text to re-translate, not a score.
Native review is recorded only in the review columns.

## Columns

- **Code**: the locale code used by the files. Codes outside docs/languages.csv (`fil`, `pt-BR`, `pt-PT`, `zh-Hans`, `zh-Hant`) have files on the site or in the app but no CSV row.
- **Language**: English name from site/src/i18n/locales.ts, with the CSV name as fallback.
- **App keys**: keys in lib/l10n/arb/app_<code>.arb (non-`@` keys) present in English, out of the English total.
- **Store listing**: yes when metadata/i18n/<code>.json exists (English: metadata/en-US/ exists).
- **Site UI keys**, **Games keys**, **Play keys**: leaf strings in site/src/i18n/ui, games and play JSON present in the English file, out of the English total. Top-level `_note` entries are ignored.
- **Guides**: translated .md and .mdx files under site/src/content/guides-i18n/<code>/ that match an English guide path, out of the English guide count. Files with no English match are not counted.
- **App review**: `status` from docs/specs/release-status.json `localization.languages`. "not listed" means the app status file has no entry for the code.
- **Site review**: REVIEWED_LANGUAGES in site/src/i18n/locales.ts. "none recorded" means that constant does not exist yet.
- **Reviewer**: the reviewer named in release-status.json. Empty until a native reviewer signs off (L10N-003).
- **Missing keys**: App + Site UI + Games + Play keys absent from the language, summed. A missing file counts as all of its keys. Guides and store are shown separately.
- **Placeholders app/ui/games/play/store**: string values that contain " ... " or end in "...", per surface. Guides are not counted because they are Markdown prose.

{table}
"""


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--write', action='store_true',
                        help=f'also write {OUTPUT_RELATIVE}')
    args = parser.parse_args(argv)
    table = render_table(build_rows(ROOT))
    print(table)
    if args.write:
        output = ROOT / OUTPUT_RELATIVE
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(render_document(table), encoding='utf-8')
        print(f'wrote {OUTPUT_RELATIVE}', file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
