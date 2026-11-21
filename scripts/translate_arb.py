#!/usr/bin/env python3
"""Fill missing app strings in lib/l10n/arb/app_<locale>.arb with machine translations.

Only keys that exist in app_en.arb and are missing (or empty) in a locale file are
translated. Existing translations are never overwritten. A key that a previous run
left in English is already in the file, so it is not retried: delete that key from
the locale file first to retry it. Output follows the key
order of app_en.arb, has no @key metadata (only @@locale), and uses the same JSON
formatting as the rest of the catalog. Every translation is machine-made and stays
unreviewed; this script does not touch docs/specs/release-status.json.

Protection:
- {placeholders} and brand names are swapped for {tokenN} markers before
  translation and restored afterwards. A translation that changes, drops or adds a
  placeholder is rejected.
- ICU plural/select messages keep their structure, keywords and placeholder names;
  only the text inside the branches is translated. Messages that cannot be parsed
  safely (including ones with apostrophes, which ICU treats as quoting) keep the
  English text for that key and are listed.

Uses the same unofficial clients5 endpoint, URL chunking, retries and worker pool as
scripts/translate_all_languages.py (website dictionaries). Only English UI strings
are sent.

    python3 scripts/translate_arb.py                 # every app locale
    python3 scripts/translate_arb.py --locale fr de  # selected locales
    python3 scripts/translate_arb.py --dry-run       # count only, no network
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Callable

ROOT = Path(__file__).resolve().parents[1]
ARB_DIR = ROOT / 'lib/l10n/arb'
EN_PATH = ARB_DIR / 'app_en.arb'

# App locale -> translation service code. Locales not listed use their own code.
SERVICE_CODES = {
    'pt_BR': 'pt',
    'pt_PT': 'pt-PT',
    'zh_Hans': 'zh-CN',
    'zh_Hant': 'zh-TW',
    'nb': 'no',      # Norwegian Bokmål
    'fil': 'tl',     # Filipino
    'he': 'iw',      # Hebrew (legacy code)
    'jv': 'jw',      # Javanese (legacy code)
}

# Base files that the app never selects (docs/engineering/localization.md) stay empty.
NOT_TRANSLATED_BASES = {'en', 'pt', 'zh'}

BRAND_TERMS = ('Creative Activities',)
# Placeholders ({name}) and brand names are masked before translation. The service
# translates placeholder names inside braces, and it localizes ASCII digits in some
# scripts (Assamese, Odia), so each segment is tried with digit, then letter, then
# bracket markers. A segment whose markers do not come back exactly stays in English.
MASK_SOURCE = re.compile('|'.join([r'\{[^{}]*\}'] + [re.escape(b) for b in BRAND_TERMS]))
MARKER_STYLES = {
    'digit': (lambda i: f'{{{i}}}', re.compile(r'\{(\d+)\}')),
    'letter': (lambda i: '{q' + 'abcdefghijklmnopqrstuvwxyz'[i] + '}', re.compile(r'\{q([a-z])\}')),
    'bracket': (lambda i: f'⟦{i}⟧', re.compile(r'⟦(\d+)⟧')),
}

ICU_HEAD = re.compile(r'^\s*([A-Za-z_]\w*)\s*,\s*(plural|select)\s*,')
ICU_ANYWHERE = re.compile(r'\{\s*[A-Za-z_]\w*\s*,\s*(plural|select)\s*,')
ICU_BRANCH = re.compile(r'\s*([^\s{}]+)\s*\{')
PLACEHOLDER_NAME = re.compile(r'^\s*[A-Za-z_]\w*\s*$')


class UnsafeMessage(ValueError):
    """A message or segment cannot be translated without risking its structure."""


# ---------------------------------------------------------------- parsing

def _find_close(s: str, start: int) -> int:
    depth = 0
    for i in range(start, len(s)):
        if s[i] == '{':
            depth += 1
        elif s[i] == '}':
            depth -= 1
            if depth == 0:
                return i
    raise UnsafeMessage('unbalanced braces')


def _parse_seq(s: str, top: bool) -> list[tuple]:
    """Parse s into nodes: ('text', str), ('ph', raw), ('icu', name, kind, branches)."""
    nodes: list[tuple] = []
    buf: list[str] = []
    pos = 0
    while pos < len(s):
        c = s[pos]
        if c == '}':
            raise UnsafeMessage('unbalanced braces')
        if c != '{':
            buf.append(c)
            pos += 1
            continue
        close = _find_close(s, pos)
        inner = s[pos + 1:close]
        if buf:
            nodes.append(('text', ''.join(buf)))
            buf = []
        head = ICU_HEAD.match(inner)
        if head:
            nodes.append(('icu', head.group(1), head.group(2),
                          _parse_branches(inner[head.end():])))
        elif PLACEHOLDER_NAME.match(inner):
            nodes.append(('ph', s[pos:close + 1]))
        else:
            raise UnsafeMessage(f'unsupported brace content: {inner[:40]!r}')
        pos = close + 1
    if buf:
        nodes.append(('text', ''.join(buf)))
    return nodes


def _parse_branches(body: str) -> list[tuple[str, list[tuple]]]:
    branches = []
    i = 0
    while True:
        m = ICU_BRANCH.match(body, i)
        if not m:
            break
        open_idx = m.end() - 1
        close = _find_close(body, open_idx)
        branches.append((m.group(1), _parse_seq(body[open_idx + 1:close], top=False)))
        i = close + 1
    if not branches or body[i:].strip():
        raise UnsafeMessage('malformed plural or select branches')
    return branches


def parse_message(message: str) -> list[tuple]:
    if '{' not in message and '}' not in message:
        return [('text', message)] if message else []
    if "'" in message and ICU_ANYWHERE.search(message):
        raise UnsafeMessage('apostrophe in an ICU message (ICU quoting)')
    return _parse_seq(message, top=True)


# ---------------------------------------------------------------- segments

def _needs_translation(raw: str) -> bool:
    """True when the run has letters outside its placeholders (no letters, no call)."""
    return any(ch.isalpha() for ch in re.sub(r'\{[^{}]*\}', '', raw))


def segments(nodes: list[tuple]) -> list[str]:
    """Raw text runs (text and placeholders together) that need translation."""
    found: list[str] = []
    run: list[str] = []

    def flush():
        if run:
            raw = ''.join(run)
            if _needs_translation(raw):
                found.append(raw)
            run.clear()

    for node in nodes:
        if node[0] == 'icu':
            flush()
            for _selector, branch in node[3]:
                found.extend(segments(branch))
        else:
            run.append(node[1])
    flush()
    return found


def render(nodes: list[tuple], translated: dict[str, str]) -> str:
    out: list[str] = []
    run: list[str] = []

    def flush():
        if run:
            raw = ''.join(run)
            out.append(translated.get(raw, raw))
            run.clear()

    for node in nodes:
        if node[0] == 'icu':
            flush()
            _, name, kind, branches = node
            parts = [f'{selector}{{{render(branch, translated)}}}'
                     for selector, branch in branches]
            out.append('{' + f'{name}, {kind}, ' + ' '.join(parts) + '}')
        else:
            run.append(node[1])
    flush()
    return ''.join(out)


# ---------------------------------------------------------------- protection

def mask(text: str, style: str) -> tuple[str, list[str]]:
    """Replace placeholders and brand names with markers. Returns text and originals."""
    make, _ = MARKER_STYLES[style]
    originals: list[str] = []

    def swap(match: re.Match) -> str:
        if len(originals) >= 26:
            raise UnsafeMessage('too many placeholders for a marker style')
        originals.append(match.group(0))
        return make(len(originals) - 1)

    return MASK_SOURCE.sub(swap, text), originals


def _marker_index(style: str, key: str) -> int:
    return int(key) if style != 'letter' else ord(key) - ord('a')


def unmask(text: str, originals: list[str], style: str) -> str:
    """Restore markers. Raises UnsafeMessage on a marker the service invented."""
    _, pattern = MARKER_STYLES[style]

    def swap(match: re.Match) -> str:
        index = _marker_index(style, match.group(1))
        if index >= len(originals):
            raise UnsafeMessage('invented marker in translation')
        return originals[index]

    return pattern.sub(swap, text)


def check_masked(source: str, output: str, style: str) -> str:
    """Return the output if its markers match the source exactly, else raise."""
    _, pattern = MARKER_STYLES[style]
    if not output.strip():
        raise UnsafeMessage('empty translation')
    if Counter(pattern.findall(source)) != Counter(pattern.findall(output)):
        raise UnsafeMessage('placeholders changed')
    if output.count('{') != output.count('}'):
        raise UnsafeMessage('unbalanced braces in translation')
    return output


def split_edges(raw: str) -> tuple[str, str, str]:
    core = raw.strip()
    lead = raw[:len(raw) - len(raw.lstrip())]
    trail = raw[len(raw.rstrip()):]
    return lead, core, trail


# ---------------------------------------------------------------- service

Translator = Callable[[list[str], str], list[str | None]]


def translate_chunk_texts(texts: list[str], tl: str) -> list[str | None]:
    """Translate short UI strings with the clients5 endpoint; None marks a failure."""
    results: list[str | None] = []
    for chunk in make_chunks(texts, max_chars=1400):
        params = [('client', 'dict-chrome-ex'), ('sl', 'en'), ('tl', tl)] + [('q', t) for t in chunk]
        url = 'https://clients5.google.com/translate_a/t?' + urllib.parse.urlencode(params)
        req = urllib.request.Request(
            url, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'})
        translated = None
        for attempt in range(3):
            try:
                with urllib.request.urlopen(req, timeout=10) as r:
                    res = json.loads(r.read().decode('utf-8'))
                if isinstance(res, list) and len(res) == len(chunk):
                    translated = res
                    break
            except Exception:
                time.sleep(0.2 * (attempt + 1))
        results.extend(
            (t.strip() if isinstance(t, str) and t.strip() else None)
            for t in (translated or [None] * len(chunk)))
        time.sleep(0.08)
    return results


def make_chunks(items: list[str], max_chars: int = 1400) -> list[list[str]]:
    chunks: list[list[str]] = []
    curr: list[str] = []
    curr_len = 0
    for item in items:
        item_len = len(urllib.parse.quote(item)) + 3  # &q=...
        if curr and curr_len + item_len > max_chars:
            chunks.append(curr)
            curr, curr_len = [item], item_len
        else:
            curr.append(item)
            curr_len += item_len
    if curr:
        chunks.append(curr)
    return chunks


def translate_raw_segments(raws: list[str], tl: str,
                           translate: Translator = translate_chunk_texts) -> dict[str, str]:
    """Map each raw segment to its checked translation. Failed segments are left out."""
    result: dict[str, str] = {}
    pending = list(dict.fromkeys(raws))
    for style in MARKER_STYLES:
        if not pending:
            break
        done, pending = _translate_in_style(pending, tl, translate, style)
        result.update(done)
    return result


def _translate_in_style(raws: list[str], tl: str, translate: Translator,
                        style: str) -> tuple[dict[str, str], list[str]]:
    prepared: dict[str, tuple[str, str, str, list[str]]] = {}
    rejected: list[str] = []
    for raw in raws:
        lead, core, trail = split_edges(raw)
        try:
            masked, originals = mask(core, style)
        except UnsafeMessage:
            rejected.append(raw)
            continue
        prepared[raw] = (lead, trail, masked, originals)
    unique = list(dict.fromkeys(p[2] for p in prepared.values()))
    outputs = dict(zip(unique, translate(unique, tl))) if unique else {}
    done: dict[str, str] = {}
    for raw, (lead, trail, masked, originals) in prepared.items():
        out = outputs.get(masked)
        try:
            if out is None:
                raise UnsafeMessage('no service result')
            restored = unmask(check_masked(masked, out, style), originals, style)
        except UnsafeMessage:
            rejected.append(raw)
            continue
        done[raw] = lead + restored + trail
    return done, rejected


# ---------------------------------------------------------------- locale files

def load_arb(path: Path) -> dict[str, str]:
    """Load an ARB file. Duplicate keys keep the last value, as Dart's JSON decoder does."""
    return json.loads(path.read_text(encoding='utf-8'))


def service_code(locale: str) -> str:
    return SERVICE_CODES.get(locale, locale)


def fill_locale(en: dict, existing: dict, locale: str, tl: str,
                translate: Translator = translate_chunk_texts) -> tuple[dict, list[str], list[str]]:
    """Return (new catalog, filled keys, keys left in English with reasons)."""
    english_keys = [k for k in en if not k.startswith('@')]
    missing = [k for k in english_keys
               if k not in existing or not str(existing[k]).strip()]

    plans: dict[str, list[tuple]] = {}
    reasons: dict[str, str] = {}
    for key in missing:
        try:
            plans[key] = parse_message(en[key])
        except UnsafeMessage as exc:
            reasons[key] = str(exc)

    all_raw = [raw for nodes in plans.values() for raw in segments(nodes)]
    translated = translate_raw_segments(all_raw, tl, translate) if all_raw else {}

    filled: list[str] = []
    values: dict[str, str] = {}
    for key, nodes in plans.items():
        if any(raw not in translated for raw in segments(nodes)):
            reasons[key] = 'a segment failed the placeholder or service check'
            continue
        values[key] = render(nodes, translated)
        filled.append(key)
    left_english = [f'{key}: {reasons.get(key, "unknown")}'
                    for key in missing if key not in values]

    out: dict[str, str] = {'@@locale': existing.get('@@locale', locale)}
    for key in english_keys:
        if key in existing and str(existing[key]).strip():
            out[key] = existing[key]
        elif key in values:
            out[key] = values[key]
        else:
            out[key] = en[key]
    for key in existing:
        if key not in out and not key.startswith('@'):
            out[key] = existing[key]  # keep stray keys; check_arb reports them
    return out, filled, left_english


def dump(catalog: dict) -> str:
    return json.dumps(catalog, indent=2, ensure_ascii=False) + '\n'


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    parser.add_argument('--locale', nargs='*', help='ARB locale names (default: all)')
    parser.add_argument('--dry-run', action='store_true', help='count missing keys only')
    parser.add_argument('--workers', type=int, default=4)
    args = parser.parse_args(argv)

    en = load_arb(EN_PATH)
    paths = sorted(ARB_DIR.glob('app_*.arb'))
    locales = [p.stem.removeprefix('app_') for p in paths]
    locales = [loc for loc in locales if loc not in NOT_TRANSLATED_BASES]
    if args.locale:
        unknown = sorted(set(args.locale) - set(locales))
        if unknown:
            parser.error(f'unknown locale(s): {", ".join(unknown)}')
        locales = [loc for loc in locales if loc in args.locale]

    def work(locale: str):
        path = ARB_DIR / f'app_{locale}.arb'
        existing = load_arb(path)
        if args.dry_run:
            missing = [k for k in en if not k.startswith('@') and k not in existing]
            return locale, None, missing, []
        catalog, filled, left = fill_locale(en, existing, locale, service_code(locale))
        path.write_text(dump(catalog), encoding='utf-8')
        return locale, filled, None, left

    summary = []
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(work, loc) for loc in locales]
        for fut in as_completed(futures):
            locale, filled, missing, left = fut.result()
            if missing is not None:
                summary.append(f'{locale}: {len(missing)} missing')
            else:
                summary.append(f'{locale}: filled {len(filled)}, English {len(left)}')
                for item in left:
                    summary.append(f'  {locale} left in English: {item}')
    print('\n'.join(sorted(summary)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
