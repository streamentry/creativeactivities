#!/usr/bin/env python3
"""Writes the launch gate table for app and website languages (L10N-002).

    python3 scripts/launch_gates.py            # print the table
    python3 scripts/launch_gates.py --write    # write docs/specs/global/launch-gates.md

Launch order is the review order in docs/engineering/native-review.md ("Review
order"). Every gate is read from a record already in the repository; this
script sets no status and changes no record. Keys beginning with "_" in a UI
dictionary are notes and are not compared.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATUS_FILE = ROOT / 'docs/specs/release-status.json'
REVIEW_GUIDE = ROOT / 'docs/engineering/native-review.md'
LOCALES_TS = ROOT / 'site/src/i18n/locales.ts'
ARB_DIR = ROOT / 'lib/l10n/arb'
UI_DIR = ROOT / 'site/src/i18n/ui'
STORE_DIR = ROOT / 'metadata/i18n'
OUTPUT = ROOT / 'docs/specs/global/launch-gates.md'
AS_OF = '2026-11-21'
SOURCE = 'en'

# Names in the review-order table that differ from englishName in locales.ts.
NAME_ALIASES = {
    'Traditional Chinese': 'zh-Hant',
    'Simplified Chinese': 'zh-Hans',
    'Punjabi': 'pa',
}


def english_names(text: str) -> dict[str, str]:
    """Map each website language code to its English name (locales.ts)."""
    pairs = re.findall(r"\{ code: '([^']+)'.*?englishName: '([^']+)'", text)
    return {code: name for code, name in pairs}


def quoted_codes(body: str) -> list[str]:
    return re.findall(r"'([^']+)'", body)


def held_from_index(text: str) -> set[str]:
    match = re.search(r'HELD_FROM_INDEX[^=]*=\s*new Set\(\[(.*?)\]\)', text, re.S)
    if not match:
        raise SystemExit('HELD_FROM_INDEX not found in locales.ts')
    return set(quoted_codes(match.group(1)))


def reviewed_languages(text: str) -> list[str]:
    match = re.search(r'export const REVIEWED_LANGUAGES[^=]*=\s*\[(.*?)\]', text, re.S)
    if not match:
        raise SystemExit('REVIEWED_LANGUAGES not found in locales.ts')
    return quoted_codes(match.group(1))


def launch_order(guide: str, names: dict[str, str]) -> list[str]:
    """Language codes in the review order of native-review.md, rows 1 to 50."""
    by_name = {english: code for code, english in names.items()}
    by_name.update(NAME_ALIASES)
    codes: list[str] = []
    for line in guide.splitlines():
        if not line.startswith('| '):
            continue
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        if len(cells) < 2:
            continue
        order = cells[0]
        if order == 'Order' or set(order) <= set('-'):
            continue
        span = re.fullmatch(r'(\d+)(?: to (\d+))?', order)
        if not span:
            continue
        first = int(span.group(1))
        last = int(span.group(2) or first)
        row_names = [n.strip() for n in cells[1].split(',')]
        if len(row_names) != last - first + 1:
            raise SystemExit(f'review order row {order} lists {len(row_names)} names')
        for name in row_names:
            if name not in by_name:
                raise SystemExit(f'review order names an unknown language: {name}')
            codes.append(by_name[name])
    if len(set(codes)) != len(codes):
        raise SystemExit('review order repeats a language')
    return codes


def arb_path(code: str) -> Path:
    return ARB_DIR / f"app_{code.replace('-', '_')}.arb"


def app_strings_gate(code: str, english_keys: set[str]) -> str:
    path = arb_path(code)
    if not path.exists():
        return 'no'
    data = json.loads(path.read_text(encoding='utf-8'))
    keys = {k for k in data if not k.startswith('@')}
    missing = english_keys - keys
    empty = [k for k in keys & english_keys if not str(data[k]).strip()]
    if missing or empty:
        return f'no ({len(missing)} missing, {len(empty)} empty)'
    return 'yes'


def flat_keys(node: object, prefix: str = '') -> set[str]:
    if not isinstance(node, dict):
        return {prefix}
    keys: set[str] = set()
    for key, value in node.items():
        if key.startswith('_'):
            continue
        keys |= flat_keys(value, f'{prefix}.{key}' if prefix else key)
    return keys


def website_ui_gate(code: str, english_keys: set[str]) -> str:
    path = UI_DIR / f'{code}.json'
    if not path.exists():
        return 'no'
    keys = flat_keys(json.loads(path.read_text(encoding='utf-8')))
    missing = english_keys - keys
    if missing:
        return f'no ({len(missing)} missing)'
    return 'yes'


def build_rows() -> tuple[list[dict[str, str]], list[str]]:
    locales = LOCALES_TS.read_text(encoding='utf-8')
    names = english_names(locales)
    held = held_from_index(locales)
    reviewed = set(reviewed_languages(locales))
    status = json.loads(STATUS_FILE.read_text(encoding='utf-8'))['localization']['languages']
    english_app = {k for k in json.loads(arb_path(SOURCE).read_text(encoding='utf-8'))
                   if not k.startswith('@')}
    english_ui = flat_keys(json.loads((UI_DIR / f'{SOURCE}.json').read_text(encoding='utf-8')))
    order = launch_order(REVIEW_GUIDE.read_text(encoding='utf-8'), names)
    rows = []
    for number, code in enumerate(order, start=1):
        entry = status.get(code, {})
        rows.append({
            'number': str(number),
            'language': names.get(code, '?'),
            'code': code,
            'app': app_strings_gate(code, english_app),
            'ui': website_ui_gate(code, english_ui),
            'store': 'yes' if (STORE_DIR / f'{code}.json').exists() else 'no',
            'reviewer': 'yes' if entry.get('reviewer') else 'no',
            'reviewed': 'yes' if code in reviewed else 'no',
            'indexable': 'no' if code in held else 'yes',
        })
    outside = [code for code in status if code not in order]
    return rows, outside


def render(rows: list[dict[str, str]], outside: list[str]) -> str:
    total = len(rows)
    count = lambda key: sum(1 for r in rows if r[key].startswith('yes'))  # noqa: E731
    lines = [
        '# Launch gates',
        '',
        f'Dated {AS_OF}. Generated by `python3 scripts/launch_gates.py --write`; do not edit by hand.',
        '',
        'Order: the review order in [native-review.md](../../engineering/native-review.md).',
        'Each gate is read from its record: app strings from `lib/l10n/arb/`, website UI from',
        '`site/src/i18n/ui/`, store listing from `metadata/i18n/`, reviewer from',
        '`docs/specs/release-status.json`, website review from `REVIEWED_LANGUAGES` and indexing',
        'from `HELD_FROM_INDEX` in `site/src/i18n/locales.ts`.',
        '',
        'The spend gate for every language is a maintainer decision (day-30 rule, L10N-002). No',
        'review budget is committed beyond it without that decision.',
        '',
        f'Summary: app strings complete {count("app")} of {total}; website UI complete '
        f'{count("ui")} of {total}; store listing present {count("store")} of {total}; native '
        f'reviewer recorded {count("reviewer")} of {total}; website reviewed {count("reviewed")} '
        f'of {total}; indexable today {count("indexable")} of {total}.',
        '',
        '| # | Language | Code | App strings complete | Website UI complete | Store listing present '
        '| Native reviewer recorded | Website reviewed | Indexable today | Spend gate |',
        '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ]
    for r in rows:
        lines.append(
            f"| {r['number']} | {r['language']} | `{r['code']}` | {r['app']} | {r['ui']} | "
            f"{r['store']} | {r['reviewer']} | {r['reviewed']} | {r['indexable']} | "
            'maintainer decision |'
        )
    lines += [
        '',
        f'Outside the launch order ({len(outside)} codes in `release-status.json`, no gate row until '
        'they are placed under L10N-030): ' + ', '.join(f'`{c}`' for c in outside) + '.',
        '',
    ]
    return '\n'.join(lines)


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--write', action='store_true', help='write docs/specs/global/launch-gates.md')
    args = parser.parse_args(argv)
    rows, outside = build_rows()
    text = render(rows, outside)
    if args.write:
        OUTPUT.write_text(text, encoding='utf-8')
        print(f'wrote {OUTPUT}')
    else:
        sys.stdout.write(text)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
