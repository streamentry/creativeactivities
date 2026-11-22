#!/usr/bin/env python3
"""Translate the website into many languages with Claude Haiku (default) or the Antigravity CLI (`agy`).

    python3 scripts/agy_translate.py status
    python3 scripts/agy_translate.py run  --kinds ui,games,play,guides [--langs is,ka] [--jobs 8]
    python3 scripts/agy_translate.py run  --changed-since <git ref> --progress <file>

`--changed-since` refreshes only what changed in English since that commit:
the changed strings of each dictionary (merged into the existing translation)
and every changed guide that is not retired. Finished tasks are recorded in
`--progress`, so a long run can stop and resume.

Kinds: ui, games, play (JSON dictionaries) and guides (markdown). A language
whose file is missing, or still an English copy, is (re)translated; finished
files are skipped, so the script can be stopped and started again. Output is
validated (keys, {placeholders}, HTML tags, plural forms, guide frontmatter)
and a failed chunk is retried and then split. Everything it writes is machine
translated and unreviewed, like the other languages.
"""
from __future__ import annotations

import argparse
import csv
import itertools
import random
import json
import re
import subprocess
import sys
import tempfile
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
I18N = SITE / 'src/i18n'
GUIDES = SITE / 'src/content/guides'
GUIDES_I18N = SITE / 'src/content/guides-i18n'
# Languages whose guides stay in English (src/i18n/english-guides.txt): guides are never translated
# into them; their site and game strings still are.
ENGLISH_GUIDES = {c for line in (SITE / 'src/i18n/english-guides.txt').read_text().splitlines()
                  if not line.lstrip().startswith('#') for c in line.split()}
CSV = SITE.parent / 'docs/languages.csv'
MODEL = 'gemini-3.8-flash-medium'
PLURALS = ('zero', 'one', 'two', 'few', 'many', 'other')
NO_LETTER_GRID = {'zh-Hans', 'zh-Hant', 'ja', 'ko', 'th', 'my', 'yo', 'lo', 'ii', 'bo', 'dz', 'km', 'zh'}
lock = threading.Lock()

RULES = """You are a professional localizer for Creative Activities, a free website of creative activities people do together with someone they care for: crafts for all ages, children's activities, activities across generations, calm creative breaks, and simple picture games, including for adults living with dementia. Dementia is one situation among several; never make a page sound like a dementia site when the English does not.
Rules:
- Warm, plain, respectful adult language, grade 6-8 reading level. Say what a native speaker naturally says; never word for word.
- Say the local equivalent of "people living with dementia" / "the person you care for". Never "patients", "sufferers", "demented", or baby talk. Use the polite-but-warm adult form of address.
- Never claim or imply any activity treats, slows, prevents, cures or "trains" anything. Keep every hedge ("may", "linked with").
- Write numbers of 1,000 and over with this language's own thousands separator (German 1.972, French 1 972, English 1,972); never change the digits.
- Keep EXACTLY: {placeholders} such as {name}, HTML tags and every href/URL, markdown link targets, the brand "Creative Activities", and the store name "Dementia Games: Creative Activities". Keep every number as the same digits, in the same quantity: never spell a number out as a word, never drop or add one (phone numbers, years, counts, minutes).
- Use the language's own punctuation and quotation marks. No emoji, no exclamation-mark praise, no ALL CAPS.
- Never add an emergency number or clinical detail that the English source does not provide. Localize a number only when the source explicitly gives one; if it asks readers to contact local urgent care or services without a number, keep it number-free. Keep cited source titles, publishers and URLs unchanged.
"""


def languages() -> list[dict]:
    out = []
    seen = set()
    with open(CSV, newline='') as f:
        for row in csv.reader(f):
            if not row or not row[0].strip() or row[0].strip() == 'Locale code':
                continue
            code = row[0].strip()
            if code in seen:
                raise ValueError(f'duplicate language code in {CSV}: {code}')
            seen.add(code)
            out.append({'code': code, 'english': row[3].strip(), 'native': row[4].split(',')[0].strip()})
    # Regional variants (pt-BR, pt-PT, zh-Hans, zh-Hant, fil) are site languages but not ISO 639-1
    # rows, so take them from the site's locales.ts; leaving them out once skipped their re-translation.
    for code, m in locale_codes().items():
        if code not in seen and code != 'en':
            out.append({'code': code, 'english': m['english'], 'native': m['native']})
    return out


def locale_codes() -> dict[str, dict]:
    """code -> {english, native, bcp47} from the site's own locales.ts."""
    src = (I18N / 'locales.ts').read_text()
    res = {}
    for m in re.finditer(r"\{ code: '([^']+)', prefix: '[^']*', bcp47: '([^']+)'.*?name: '((?:[^'\\]|\\.)*)', englishName: '((?:[^'\\]|\\.)*)'", src):
        res[m.group(1)] = {'bcp47': m.group(2), 'native': m.group(3), 'english': m.group(4)}
    return res


def plural_cats(bcp47: str) -> list[str]:
    try:
        out = subprocess.run(['node', '-e', f"console.log(JSON.stringify(new Intl.PluralRules('{bcp47}').resolvedOptions().pluralCategories))"],
                             capture_output=True, text=True, timeout=20).stdout
        cats = json.loads(out)
        return [c for c in PLURALS if c in cats] or ['other']
    except Exception:
        return ['other']


MAX_JOBS = 5  # never more than 5 agy/opencode processes at once
slots = threading.BoundedSemaphore(MAX_JOBS)


_rr = itertools.count()
# Default translator (maintainer decision, 2026-11-15): Claude Haiku through the Claude Code CLI,
# run headless with no tools. `--backends agy,opencode` brings back the earlier pool and fallbacks.
HAIKU_MODEL = 'claude-haiku-5-5'
HAIKU_SYSTEM = 'You are a professional website localizer. Output only the requested translation, in the requested format, with no commentary.'
BACKENDS = ['haiku']  # primary pool
# Fallbacks: join the pool only while 'opencode' is rate-limited; once opencode's health check
# passes they drop out again. The two *free* models are separate quota buckets from the paid
# opencode-go and explabs ones, and are DeepSeek / GLM flash models of comparable quality.
FALLBACKS: list[str] = []
LEGACY_FALLBACKS = ['iceman', 'deepseek', 'dsfree', 'glmfree']
ALL_BACKENDS = ['haiku']
OPENCODE_MODEL = 'opencode-go/claude-haiku-5-5'
DEEPSEEK_MODEL = 'explabs/deepseek-v4.1-flash'
DEEPSEEK_FREE_MODEL = 'opencode/deepseek-v4.1-flash-free'
GLM_FREE_MODEL = 'opencode/glm-5.3-flash-free'
ICEMAN_MODEL = 'opencode-go/iceman-contributor-free'
MODEL_FOR = {'opencode': OPENCODE_MODEL, 'deepseek': DEEPSEEK_MODEL, 'dsfree': DEEPSEEK_FREE_MODEL, 'glmfree': GLM_FREE_MODEL, 'iceman': ICEMAN_MODEL}

FREE_BACKENDS = ['iceman', 'dsfree', 'glmfree']


def configure_backends(names: list[str]) -> None:
    """Use these backends; with agy/opencode the old free fallbacks join while opencode is limited."""
    global BACKENDS, FALLBACKS, ALL_BACKENDS
    BACKENDS = list(names)
    FALLBACKS = list(LEGACY_FALLBACKS) if 'opencode' in names else []
    ALL_BACKENDS = [*BACKENDS, *FALLBACKS]


def configure_free_only() -> None:
    global BACKENDS, FALLBACKS, ALL_BACKENDS
    BACKENDS = list(FREE_BACKENDS)
    FALLBACKS = []
    ALL_BACKENDS = list(FREE_BACKENDS)
QUOTA = re.compile(r'weekly limit|hit your (?:\w+ )?limit|limit · resets|RESOURCE_EXHAUSTED|\b429\b|\b402\b|provider\.quota|usage limit|quota|insufficient funds|rate.?limit|too many requests|overloaded', re.I)
AUTH = re.compile(r'authentication required|not logged in|unauthorized|invalid api key|\b401\b|\b403\b', re.I)
fails: dict[str, int] = {}
hits: dict[str, int] = {}
disabled_until: dict[str, float] = {}  # backend -> time.time() when it may be used again
dis_lock = threading.Lock()


def retry_after(msg: str) -> float:
    """Seconds from a 'retry in 30s' / 'Retry-After: 120' / 'try again in 2 minutes' hint, else 0."""
    m = re.search(r'(?:retry[- ]after|retry in|try again in|resets? in)\D{0,3}(\d+(?:\.\d+)?)\s*(ms|s|sec|seconds|m|min|minutes|h|hours)?', msg, re.I)
    if not m:
        return 0.0
    n, u = float(m.group(1)), (m.group(2) or 's').lower()
    return n * (0.001 if u == 'ms' else 60 if u.startswith('m') and u != 'ms' else 3600 if u.startswith('h') else 1)


class BackendError(Exception):
    def __init__(self, kind: str, msg: str):
        super().__init__(msg)
        self.kind = kind  # 'quota' | 'auth' | 'error'


def _run_opencode(argv: list[str], cwd: str, timeout: int) -> str:
    """Run opencode and read its JSON event stream as it arrives.

    When a provider is rate-limited, opencode emits a `retry` event and then waits silently
    until `nextRetryAt` (often 15+ minutes). Waiting that out looks like a hang, so a retry
    event with a rate-limit or quota error ends the call at once as a quota error, with the
    wait carried in the message so the cooldown can honour it."""
    proc = subprocess.Popen(argv, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, cwd=cwd)
    timer = threading.Timer(timeout, proc.kill)
    timer.start()
    text, err, quota_msg = [], '', ''
    try:
        for line in proc.stdout:
            try:
                ev = json.loads(line)
            except ValueError:
                continue
            kind = ev.get('type')
            if kind == 'text':
                text.append(ev.get('part', {}).get('text', ''))
            elif kind == 'error':
                err = json.dumps(ev.get('error', ev))
            elif kind == 'retry':
                detail = json.dumps(ev.get('error', ev))
                if QUOTA.search(detail) or 'rate-limit' in detail:
                    wait = max(0.0, (ev.get('nextRetryAt', 0) - ev.get('timestamp', 0)) / 1000)
                    quota_msg = f'{detail[:160]} retry in {int(wait)}s' if wait else detail[:200]
                    proc.kill()
                    break
        proc.wait()
    finally:
        timer.cancel()
        if proc.poll() is None:
            proc.kill()
    answer = ''.join(text).strip()
    # A quota retry invalidates the whole response. Never publish a partial translation.
    if quota_msg:
        raise BackendError('quota', quota_msg)
    if proc.returncode is not None and proc.returncode < 0 and not answer:
        raise BackendError('error', 'timeout')
    if err and not answer:
        raise BackendError('quota' if QUOTA.search(err) else 'auth' if AUTH.search(err) else 'error', err[:200])
    if not answer:
        raise BackendError('error', 'empty output')
    return answer


def _run(backend: str, prompt: str, cwd: str, timeout: int) -> str:
    """Run one backend; return the answer text or raise BackendError with a classified kind."""
    if backend == 'haiku':
        # Headless Claude Code: no tools, no saved session; the prompt goes on stdin.
        argv = ['claude', '-p', '--model', HAIKU_MODEL, '--output-format', 'text', '--tools', '',
                '--no-session-persistence', '--system-prompt', HAIKU_SYSTEM]
        try:
            r = subprocess.run(argv, input=prompt, capture_output=True, text=True, cwd=cwd, timeout=timeout)
        except subprocess.TimeoutExpired:
            raise BackendError('error', 'timeout')
        answer = r.stdout.strip()
        if r.returncode != 0 or not answer:
            msg = ((r.stderr or '') + answer)[:300] or 'no output'
            raise BackendError('quota' if QUOTA.search(msg) else 'auth' if AUTH.search(msg) else 'error', msg)
        return r.stdout
    if backend == 'agy':
        argv = ['agy', '--model', MODEL, f'-p={prompt}']
    else:
        argv = ['opencode', 'run', '--agent', 'translator', '-m', MODEL_FOR[backend], '--format', 'json', prompt]  # 'translator' = tool-less agent in ~/.config/opencode/opencode.json
    if backend in MODEL_FOR:  # opencode CLI: JSON event stream on stdout
        return _run_opencode(argv, cwd, timeout)
    try:
        r = subprocess.run(argv, capture_output=True, text=True, cwd=cwd, timeout=timeout)
    except subprocess.TimeoutExpired:
        raise BackendError('error', 'timeout')
    raw = r.stdout + r.stderr
    answer = r.stdout.strip()
    # agy prints errors as AGY_ERROR / "Error:" lines instead of an answer
    if (not answer or answer.startswith(('AGY_ERROR', 'Error:', 'error:'))) or (r.returncode != 0 and len(answer) < 400):
        msg = (raw[:300] or 'no output')
        raise BackendError('quota' if QUOTA.search(msg) else 'auth' if AUTH.search(msg) else 'error', msg)
    return r.stdout


def health_check_loop(every: int = 600) -> None:
    """Probe each backend every `every` seconds with a tiny translation. A backend that
    answers is re-enabled at once; one that fails stays paused and the reason is logged."""
    while True:
        time.sleep(every)
        for be in ALL_BACKENDS:
            try:
                with tempfile.TemporaryDirectory() as cwd:
                    out = _run(be, 'Translate to French, output only the translation: "Take your time."', cwd, 240)
                with dis_lock:
                    was = disabled_until.pop(be, 0) > time.time()
                    fails[be] = 0
                print(f'health: {be} ok' + (' (re-enabled)' if was else ''), flush=True)
            except BackendError as e:
                with dis_lock:
                    disabled_until[be] = time.time() + (900 if e.kind == 'quota' else 600)
                print(f'health: {be} {e.kind}: {str(e)[:100]}', flush=True)


def agy(prompt: str, timeout: int = 900) -> str:
    """One translation call, alternating agy and opencode.

    While opencode is rate-limited, the FALLBACKS (DeepSeek on explabs, plus the free DeepSeek and GLM models) join the pool in its place and
    leaves again as soon as opencode is usable. Quota errors put that backend on a cooldown
    and use the others; auth errors disable it for an hour. Only when nothing is usable does it wait."""
    wait = 30
    while True:
        now = time.time()
        with dis_lock:
            pool = list(BACKENDS)
            if disabled_until.get('opencode', 0) > now:
                pool.extend(FALLBACKS)
            usable = [b for b in pool if disabled_until.get(b, 0) <= now]
        if not usable:
            nxt = min(disabled_until.values()) - now
            wait = max(10, min(nxt, 900))
            print(f'all backends limited, waiting {int(wait)}s', flush=True)
            time.sleep(wait)
            continue
        start = next(_rr)
        backoff = 2.0
        for i in range(len(usable)):
            be = usable[(start + i) % len(usable)]
            with slots, tempfile.TemporaryDirectory() as cwd:
                try:
                    out = _run(be, prompt, cwd, timeout)
                    fails[be] = 0
                    hits[be] = 0
                    return out
                except BackendError as e:
                    with dis_lock:
                        if e.kind == 'quota':
                            # honour a "retry in N seconds/minutes" hint, else escalate 5 -> 10 -> 20 -> 40 -> 60 min
                            hint = retry_after(str(e))
                            hits[be] = hits.get(be, 0) + 1
                            cool = hint or min(300 * 2 ** (hits[be] - 1), 3600)
                            cool = cool * random.uniform(1.0, 1.25)
                            if time.time() >= disabled_until.get(be, 0):  # one cooldown per outage, not per racing worker
                                disabled_until[be] = time.time() + cool
                                print(f'{be}: rate limited, cooling down {int(cool)}s ({str(e)[:80]})', flush=True)
                        elif e.kind == 'auth':
                            disabled_until[be] = time.time() + 3600
                            print(f'{be}: AUTH problem, disabled 1 h ({str(e)[:80]})', flush=True)
                        else:
                            fails[be] = fails.get(be, 0) + 1
                            backoff = min(2 ** fails[be], 30) * random.uniform(0.5, 1.5)
                            print(f'{be}: error ({str(e)[:80]})', flush=True)
                            if fails[be] >= 6:
                                disabled_until[be] = time.time() + 600
                                fails[be] = 0
                                print(f'{be}: 6 errors in a row, paused 10 min until the health check passes', flush=True)
        time.sleep(backoff)


def extract_json(text: str):
    text = text.strip()
    m = re.search(r'```(?:json)?\s*\n(.*?)\n```', text, re.S)
    if m:
        text = m.group(1)
    a, b = text.find('{'), text.rfind('}')
    return json.loads(text[a:b + 1])


# ---------------------------------------------------------------- JSON units

def is_plural(v) -> bool:
    return isinstance(v, dict) and v and all(k in PLURALS for k in v)


def units(node, path=()):
    """Yield (path, value) translatable units; plural objects and string lists stay whole."""
    if isinstance(node, str):
        if node.strip():
            yield path, node
    elif is_plural(node):
        yield path, node
    elif isinstance(node, list):
        if node and all(isinstance(x, str) for x in node):
            yield path, node
        else:
            for i, x in enumerate(node):
                yield from units(x, path + (i,))
    elif isinstance(node, dict):
        for k, v in node.items():
            if k.startswith('_') or k in ('id', 'value', 'href', 'icon', 'available'):
                continue
            yield from units(v, path + (k,))


def set_path(root, path, val):
    for p in path[:-1]:
        root = root[p]
    root[path[-1]] = val


def get_path(root, path):
    for p in path:
        root = root[p]
    return root


PH = re.compile(r'\{[^{}]+\}')
TAG = re.compile(r'</?[a-zA-Z][^>]*>')


def sig(v) -> list:
    s = json.dumps(v, ensure_ascii=False)
    return sorted(PH.findall(s)), sorted(TAG.findall(s.replace('\\"', '"')))


def valid_unit(src, out, cats) -> str | None:
    if is_plural(src):
        if not isinstance(out, dict) or set(out) != set(cats) or not all(isinstance(x, str) and x for x in out.values()):
            return f'plural forms must be exactly {cats}'
        sp = sorted(set(PH.findall(json.dumps(src))))
        for x in out.values():
            if sorted(set(PH.findall(x))) != sp and not (set(PH.findall(x)) <= set(sp)):
                return 'placeholder mismatch'
        return None
    if isinstance(src, list):
        if not isinstance(out, list) or len(out) != len(src) or not all(isinstance(x, str) for x in out):
            return 'list length changed'
    elif not isinstance(out, str) or not out.strip():
        return 'empty'
    if isinstance(src, list) or isinstance(out, list):
        ok = sig(src)[1] == sig(out)[1] and set(sig(out)[0]) <= set(sig(src)[0])
    else:
        ok = sig(src)[1] == sig(out)[1] and sorted(set(PH.findall(src))) == sorted(set(PH.findall(out)))
    return None if ok else 'placeholders or HTML tags changed'


def translate_chunk(lang: dict, chunk: dict, cats: list[str], extra: str, depth=0) -> dict:
    keys = list(chunk)
    note = ''
    if any(is_plural(v) for v in chunk.values()):
        note = f'\nKeys whose value is an object of plural forms must be answered with exactly these forms: {cats} (Intl.PluralRules for this language), each a complete natural sentence with the same placeholders.'
    prompt = (f'{RULES}\nTranslate the JSON values from English into {lang["english"]} ({lang["native"]}, code {lang["code"]}). '
              f'Keep every key exactly. Return ONLY one JSON object, no commentary.{note}\n{extra}\n\n'
              + json.dumps(chunk, ensure_ascii=False, indent=1))
    last = ''
    for attempt in range(3):
        try:
            out = extract_json(agy(prompt if not last else prompt + f'\n\nYour previous answer was rejected: {last}. Fix it.'))
            bad = [k for k in keys if k not in out]
            if not bad:
                err = {k: valid_unit(chunk[k], out[k], cats) for k in keys}
                err = {k: e for k, e in err.items() if e}
                if not err:
                    return {k: out[k] for k in keys}
                last = '; '.join(f'{k}: {e}' for k, e in list(err.items())[:5])
            else:
                last = f'missing keys {bad[:5]}'
        except Exception as e:  # noqa: BLE001
            last = f'{type(e).__name__}: {str(e)[:120]}'
    if len(keys) > 1:
        h = len(keys) // 2
        a = translate_chunk(lang, {k: chunk[k] for k in keys[:h]}, cats, extra, depth + 1)
        b = translate_chunk(lang, {k: chunk[k] for k in keys[h:]}, cats, extra, depth + 1)
        return {**a, **b}
    raise RuntimeError(f'{lang["code"]}: {keys[0]} failed: {last}')


def is_play_identifier(path: tuple) -> bool:
    """Play strings that name a picture, a theme or a word group for the code. They are never translated:
    the model rewrote some, which put a card's prompt on the wrong picture."""
    return path[:2] in (('content', 'conversation'), ('content', 'wordSearch')) and path[-1] in ('theme', 'picture', 'value')


def is_play_held(path: tuple) -> bool:
    """Play strings the machine does not write: the picture labels the Flutter app exports (the app's own
    reviewed set, checked against picture_library.g.dart) and the photo-pairs setup and consent copy, which
    stays English until a reviewer signs a translation (PhotoPairs.test.ts)."""
    return path[:1] == ('illustrations',) or path[:2] == ('ui', 'photoPairs')


def translate_json(kind: str, lang: dict, cats: list[str], only: set | None = None) -> Path:
    code = lang['code']
    en = json.loads((I18N / kind / 'en.json').read_text())
    work = json.loads(json.dumps(en))
    existing = I18N / kind / f'{code}.json'
    if only is not None and existing.exists():
        # Keep the current translation and refresh only the changed English strings. A string the
        # language does not have yet is translated too; leaving it out kept it in English for good.
        old = json.loads(existing.read_text())
        only = set(only)
        for path, _ in list(units(en)):
            if path not in only:
                try:
                    set_path(work, path, get_path(old, path))
                except (KeyError, IndexError, TypeError):
                    only.add(path)
    extra = ''
    if kind == 'play':
        content = work.get('content', {})
        content.pop('sayings', None)
        if code in NO_LETTER_GRID:
            content.pop('wordSearch', None)
        else:
            extra = ('wordSearch: use common nouns of 3-6 letters as a reader counts them, no spaces or hyphens, in capitals where the script has them; '
                     '"fill" is at least 10 easy-to-tell-apart letters of that alphabet. Picture names: short concrete nouns, the noun first. '
                     'Conversation prompts are open invitations, never quiz questions. Coloring paints: 12 common color names.')
        if code in NO_LETTER_GRID:
            extra = 'Picture names: short concrete nouns, the noun first. Conversation prompts are open invitations, never quiz questions.'
        work['content'] = content
    items = [(p, v) for p, v in units(work) if (only is None or p in only) and not (kind == 'play' and (is_play_identifier(p) or is_play_held(p)))]
    chunk, size, chunks = {}, 0, []
    for path, v in items:
        k = '/'.join(map(str, path))
        s = len(json.dumps(v, ensure_ascii=False))
        if size + s > 5000 and chunk:
            chunks.append(chunk)
            chunk, size = {}, 0
        chunk[k] = v
        size += s
    if chunk:
        chunks.append(chunk)
    paths = {'/'.join(map(str, p)): p for p, _ in items}
    for ch in chunks if items else []:
        res = translate_chunk(lang, ch, cats, extra)
        for k, v in res.items():
            set_path(work, paths[k], v)
    target = I18N / kind / f'{code}.json'
    tmp = target.with_suffix('.tmp')
    tmp.write_text(json.dumps(work, ensure_ascii=False, indent=2) + '\n')
    tmp.replace(target)
    return target


# ---------------------------------------------------------------- guides

def guide_done(code: str, rel: str) -> bool:
    t = GUIDES_I18N / code / rel
    if not t.exists():
        return False
    en = (GUIDES / rel).read_text().split('---', 2)[-1].strip()
    txt = t.read_text()
    return txt.split('---', 2)[-1].strip() != en and not guide_problems((GUIDES / rel).read_text(), txt)


def translate_guide(lang: dict, rel: str) -> str:
    code = lang['code']
    src = (GUIDES / rel).read_text()
    upd = re.search(r'^updated:\s*(\S+)', src, re.M).group(1)
    base = (f'{RULES}\nTranslate this markdown guide from English into {lang["english"]} ({lang["native"]}). '
            'Translate the frontmatter values of title, seoTitle, description, summary, keyPoints, faq (q and a) where the English file has them, and the whole body. Never add a frontmatter key the English file does not have. Keep the `sources` list completely unchanged, character for character. '
            'Keep every other frontmatter key and value exactly (section, order, updated, relatedGames, related, health, sources url/publisher), the same YAML structure, the same number of keyPoints and FAQ entries, the same heading levels and the same link targets in the same order. '
            'Keep every list exactly as it is: the same number of items in each list, numbered lists stay numbered (1. 2. 3.) and bulleted lists stay bulleted (-), and never merge, split or drop an item. '
            f'Add the line `translatedFrom: {upd}` after the `updated:` line. Keep title/seoTitle under about 60 characters and description under about 160. '
            'Return ONLY the full translated file starting with ---, no code fence, no commentary.\n\n')
    last = ''
    for attempt in range(3):
        out = agy(base + src + (f'\n\nYour previous answer failed these checks, fix them:\n{last}' if last else ''), timeout=1500).strip()
        out = re.sub(r'^```\w*\n|\n```$', '', out)
        if not out.startswith('---'):
            last = 'file must start with ---'
            continue
        target = GUIDES_I18N / code / rel
        tmp = target.with_name('.tmp-' + target.name)
        tmp.parent.mkdir(parents=True, exist_ok=True)
        tmp.write_text(out + '\n')
        rel_slug = rel[:-3]
        r = subprocess.run([sys.executable, str(SITE / 'scripts/check-guide-translation.py'), code, rel_slug, '--file', str(tmp)],
                           capture_output=True, text=True) if False else None
        problems = guide_problems(src, out)
        if not problems:
            tmp.replace(target)
            return str(target)
        tmp.unlink(missing_ok=True)
        last = problems
    raise RuntimeError(f'{code}/{rel}: {last}')


def number_tokens(text: str) -> list[str]:
    values = []
    # Thousands groups read as one number whatever the separator ("1,972", "1.972", "1 972" with a
    # space or no-break space, "1'972"), as the site's structure test reads them (normalizeDigits).
    text = re.sub(r"(?<!\d)\d{1,3}(?:[.,\u00a0\u202f' ’]\d{3}(?!\d))+", lambda m: re.sub(r'\D', '', m.group()), text)
    for token in re.findall(r'\d+(?:[,.]\d+)*', text):
        value = ''.join(str(int(ch)) for ch in token if ch.isdecimal())
        if value:
            values.append(value)
    return sorted(values)


# The numbers src/lib/translation-structure.ts treats as country facts (LOCALE_FACT_NUMBERS).
LOCALE_FACT_NUMBERS = ('911', '112', '999', '119', '988')
EMERGENCY_NUMBERS = {'000', '101', '102', '108', '110', '111', '112', '119', '190', '191', '192', '193', '911', '988', '995', '999'}


def visible_number_tokens(text: str) -> list[str]:
    visible = re.sub(r'\]\([^)]*\)', ']', text)
    visible = re.sub(r'https?://\S+', '', visible)
    return number_tokens(visible)


def added_number_values(source: str, translated: str) -> list[str]:
    remaining = number_tokens(source)
    added = []
    for value in number_tokens(translated):
        if value in remaining:
            remaining.remove(value)
        else:
            added.append(value)
    return added


def unsafe_number_additions(source: str, translated: str) -> bool:
    added = added_number_values(source, translated)
    if not added:
        return False
    if any(value not in EMERGENCY_NUMBERS for value in added):
        return True
    source_emergency = [value for value in visible_number_tokens(source) if value in EMERGENCY_NUMBERS]
    translated_emergency = [value for value in visible_number_tokens(translated) if value in EMERGENCY_NUMBERS]
    return not source_emergency or len(translated_emergency) > len(source_emergency)


_SCRIPTS = ('HEBREW', 'ARABIC', 'CYRILLIC', 'GREEK', 'DEVANAGARI', 'BENGALI', 'GURMUKHI', 'GUJARATI', 'ORIYA', 'TAMIL', 'TELUGU',
            'KANNADA', 'MALAYALAM', 'SINHALA', 'THAI', 'LAO', 'TIBETAN', 'MYANMAR', 'GEORGIAN', 'ARMENIAN', 'ETHIOPIC', 'KHMER',
            'THAANA', 'SYRIAC')


def _script(ch: str) -> str | None:
    import unicodedata
    if not unicodedata.category(ch).startswith('L'):
        return None
    if ch.isascii():
        return 'ascii'
    name = unicodedata.name(ch, '')
    return next((s for s in _SCRIPTS if name.startswith(s)), None)


def mixed_script_words(src: str, out: str) -> list[str]:
    """Words where ASCII letters touch letters of another script ("праверanыя", "פastel", the Cyrillic
    "а" in "Tacа"): a model slipping between alphabets. An English word from the source with a native
    suffix attached ("Medicineలో") is allowed."""
    english = {w.lower() for w in re.findall(r'[A-Za-z]+', src)}
    text = re.sub(r'https?://\S+', '', re.sub(r'\]\([^)]*\)', ']', out))
    bad = []
    for word in re.findall(r'\S+', text):
        kinds = [_script(c) for c in word]
        if len({k for k in kinds if k not in (None, 'ascii')}) > 1:  # two non-Latin alphabets in one word
            bad.append(word)
            continue
        touching = any('ascii' in (a, b) and a != b and None not in (a, b) for a, b in zip(kinds, kinds[1:]))
        # A short run ("a", "i") is always an English word, so only longer runs can be a name with a suffix.
        # Short lowercase runs ("a", "i") are always English words, so they cannot excuse a mix;
        # acronyms ("AP") and names with an apostrophe ("Alzheimer's") are checked whole.
        runs = re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", word)
        if touching and any((len(r) < 3 and r.islower()) or r.split("'")[0].lower() not in english for r in runs):
            bad.append(word)
    return bad


def frontmatter_prose(fm: dict) -> str:
    """The translated words in a guide's frontmatter (titles, summary, key points, FAQ),
    the same fields the site's structure test reads numbers from."""
    parts = [str(fm.get(k) or '') for k in ('title', 'seoTitle', 'description', 'summary')]
    parts += [str(p) for p in fm.get('keyPoints') or []]
    for pair in fm.get('faq') or []:
        if isinstance(pair, dict):
            parts += [str(pair.get('q') or ''), str(pair.get('a') or '')]
    return '\n'.join(parts)


def guide_problems(src: str, out: str) -> str:
    import yaml
    try:
        fa = yaml.safe_load(src.split('---', 2)[1])
        fb = yaml.safe_load(out.split('---', 2)[1])
    except Exception as e:  # noqa: BLE001
        return f'frontmatter YAML invalid: {e}'
    errs = []
    for k in ('section', 'order', 'updated', 'sources', 'relatedGames', 'related', 'health'):
        if fa.get(k) != fb.get(k):
            errs.append(f'{k} changed')
    if str(fb.get('translatedFrom')) != str(fa['updated']):
        errs.append('translatedFrom wrong')
    for k in ('keyPoints', 'faq'):
        if len(fa.get(k, [])) != len(fb.get(k, [])):
            errs.append(f'{k} count differs')
    link = re.compile(r'\]\(([^)\s]+)[^)]*\)|href="([^"]+)"')
    ba, bb = src.split('---', 2)[2], out.split('---', 2)[2]
    if [a or b for a, b in link.findall(ba)] != [a or b for a, b in link.findall(bb)]:
        errs.append('link targets differ or reordered')
    h = re.compile(r'^(#{2,6})\s', re.M)
    if h.findall(ba) != h.findall(bb):
        errs.append('heading levels differ')
    if unsafe_number_additions(ba, bb):
        errs.append('numbers added that are absent from the English source')
    # Every number must survive as digits (phone numbers, years, counts), as the site's
    # structure test (L10N-006) requires: a dropped "116 123" is a wrong helpline.
    from collections import Counter
    na = Counter(visible_number_tokens(ba + '\n' + frontmatter_prose(fa)))
    nb = Counter(visible_number_tokens(bb + '\n' + frontmatter_prose(fb)))
    # Emergency and crisis numbers are country facts: "911" may become the reader's "112", as the
    # site's structure test allows (LOCALE_FACT_NUMBERS), but none may be added or dropped.
    la = sum(na.pop(n, 0) for n in LOCALE_FACT_NUMBERS)
    lb = sum(nb.pop(n, 0) for n in LOCALE_FACT_NUMBERS)
    if la != lb:
        errs.append(f'emergency numbers: English has {la}, the translation has {lb}; swap one for the local number, never add or drop')
    if na != nb:
        errs.append(f'numbers differ from English (missing {sorted((na - nb).elements())}, extra {sorted((nb - na).elements())})')
    # Lengths the guidesI18n schema in src/content.config.ts allows (JavaScript string length: UTF-16 units).
    for key, low, high in (('title', 1, 140), ('seoTitle', 1, 80), ('description', 30, 360), ('summary', 30, 800)):
        if key in fb:
            n = len(str(fb[key]).encode('utf-16-le')) // 2
            if not low <= n <= high:
                errs.append(f'{key} is {n} characters; the site allows {low}-{high}')
    mixed = mixed_script_words(src, out)
    if mixed:
        errs.append(f'letters from two alphabets in one word (retype in one script): {" ".join(mixed[:8])}')
    errs += structure_mismatches(src, out)
    return '; '.join(dict.fromkeys(errs))


def structure_mismatches(src: str, out: str) -> list[str]:
    """The site's own structure test (L10N-006) on this pair, through scripts/check-structure.ts,
    so a translation that drops a list item or adds a frontmatter key is never kept."""
    with tempfile.TemporaryDirectory() as d:
        en, tr = Path(d, 'en.md'), Path(d, 'tr.md')
        en.write_text(src, encoding='utf-8')
        tr.write_text(out, encoding='utf-8')
        try:
            r = subprocess.run(
                ['node', '--experimental-strip-types', '--no-warnings', str(SITE / 'scripts' / 'check-structure.ts'), str(en), str(tr)],
                capture_output=True, text=True, timeout=60, cwd=SITE,
            )
            line = next((x for x in r.stdout.splitlines() if x.startswith('{')), '')
            return [f'structure {m}' for m in json.loads(line)['mismatches']] if line else [f'structure check failed: {r.stderr.strip()[:200]}']
        except (subprocess.SubprocessError, OSError, ValueError, KeyError) as e:
            return [f'structure check failed: {e}']


# ---------------------------------------------------------------- orchestration

def json_done(kind: str, code: str) -> bool:
    p = I18N / kind / f'{code}.json'
    if not p.exists():
        return False
    if kind == 'play':
        return True
    en = json.loads((I18N / kind / 'en.json').read_text())
    try:
        t = json.loads(p.read_text())
    except Exception:  # noqa: BLE001
        return False
    es, ts = [v for _, v in units(en) if isinstance(v, str) and len(v) > 3], []
    for path, v in units(en):
        if isinstance(v, str) and len(v) > 3:
            try:
                ts.append(get_path(t, path) == v)
            except Exception:  # noqa: BLE001
                ts.append(True)
    return sum(ts) / max(1, len(ts)) < 0.3


def guide_paths(selected: list[str] | None = None) -> list[str]:
    available = sorted(p.relative_to(GUIDES).as_posix() for p in GUIDES.glob('**/*.md'))
    if not selected:
        return available
    result = []
    for raw in selected:
        value = raw.strip().replace('\\', '/')
        if not value:
            continue
        if value.startswith('/') or '..' in Path(value).parts:
            raise ValueError(f'invalid guide path: {raw}')
        rel = value if value.endswith('.md') else value + '.md'
        if rel not in available:
            raise ValueError(f'unknown guide path: {raw}')
        if rel not in result:
            result.append(rel)
    return result


def changed_units(kind: str, ref: str) -> set:
    """Paths of strings in en.json that are new or different since `ref`."""
    old = subprocess.run(['git', 'show', f'{ref}:site/src/i18n/{kind}/en.json'], capture_output=True, text=True, cwd=SITE.parent)
    before = dict(units(json.loads(old.stdout))) if old.returncode == 0 else {}
    now = dict(units(json.loads((I18N / kind / 'en.json').read_text())))
    return {p for p, v in now.items() if before.get(p) != v}


def changed_guides(ref: str) -> list[str]:
    """Live English guides changed since `ref` (retired guides are skipped)."""
    out = subprocess.run(['git', 'diff', '--name-only', ref, 'HEAD', '--', 'site/src/content/guides'],
                         capture_output=True, text=True, cwd=SITE.parent, check=True).stdout.split()
    retired = set(re.findall(r"^  '([a-z0-9-]+/[a-z0-9-]+)':", (SITE / 'src/lib/retired-guides.ts').read_text(), re.M))
    rels = [f.removeprefix('site/src/content/guides/') for f in out]
    return [r for r in rels if (GUIDES / r).exists() and r.removesuffix('.md') not in retired]


def pending(kinds, codes, guides: list[str] | None = None):
    todo = []
    rels = guide_paths(guides) if 'guides' in kinds else []
    for code in codes:
        for k in kinds:
            if k == 'guides':
                if code not in ENGLISH_GUIDES:
                    todo += [('guides', code, r) for r in rels if not guide_done(code, r)]
            elif not json_done(k, code):
                todo.append((k, code, None))
    return todo


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['status', 'run'])
    ap.add_argument('--kinds', default='ui,games,play,guides')
    ap.add_argument('--langs', default='')
    ap.add_argument('--jobs', type=int, default=5, help='parallel tasks, capped at 5')
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--guides', default='', help='comma-separated guide paths (section/slug); only these guides are considered')
    ap.add_argument('--free-only', action='store_true', help='use only free contributor/free-tier translation backends')
    ap.add_argument('--backends', default='haiku', help='comma-separated: haiku (default), agy, opencode')
    ap.add_argument('--changed-since', default='', help='git ref: refresh only English strings and guides changed since then')
    ap.add_argument('--progress', default='', help='file recording finished refresh tasks (required with --changed-since)')
    a = ap.parse_args()
    if a.changed_since and not a.progress:
        ap.error('--changed-since needs --progress')
    configure_backends([b.strip() for b in a.backends.split(',') if b.strip()])
    if a.free_only:
        configure_free_only()
    meta = locale_codes()
    try:
        requested_codes = a.langs.split(',') if a.langs else [lang['code'] for lang in languages()]
    except ValueError as error:
        ap.error(str(error))
    requested_codes = list(dict.fromkeys(code.strip() for code in requested_codes if code.strip()))
    unknown_codes = sorted(set(requested_codes) - set(meta))
    if unknown_codes:
        ap.error(f'no locale metadata for language codes: {", ".join(unknown_codes)}')
    codes = [code for code in requested_codes if code != 'en']
    kinds = a.kinds.split(',')
    selected_guides = [guide.strip() for guide in a.guides.split(',') if guide.strip()]
    if selected_guides and 'guides' not in kinds:
        ap.error('--guides requires guides in --kinds')
    only_units = {}
    progress_file = Path(a.progress) if a.progress else None
    def on_disk() -> set:
        try:
            return set(json.loads(progress_file.read_text())) if progress_file and progress_file.exists() else set()
        except ValueError:
            return set()

    finished = on_disk()
    if a.changed_since:
        only_units = {k: changed_units(k, a.changed_since) for k in kinds if k != 'guides'}
        rels = guide_paths(selected_guides) if selected_guides else changed_guides(a.changed_since)
        todo = []
        for c in codes:  # language order from --langs, so the biggest languages can go first
            for k in kinds:
                if k == 'guides':
                    if c not in ENGLISH_GUIDES:
                        todo += [('guides', c, r) for r in rels if f'guides|{c}|{r}' not in finished]
                elif only_units.get(k) and f'{k}|{c}|' not in finished:
                    todo.append((k, c, None))
    else:
        try:
            todo = pending(kinds, codes, selected_guides or None)
        except ValueError as error:
            ap.error(str(error))
    by = {}
    for k, c, r in todo:
        by.setdefault(k, set()).add(c)
    print({k: (len(v), sum(1 for t in todo if t[0] == k)) for k, v in by.items()}, 'languages/tasks; total tasks', len(todo))
    if a.cmd == 'status':
        return
    if a.limit:
        todo = todo[:a.limit]
    cats = {}

    lang_ok: dict[str, int] = {}
    lang_bad: dict[str, int] = {}

    def work(t):
        k, c, r = t
        # Circuit breaker: a language that fails 3 times with no success yet this run (for example
        # a liturgical language the model declines to write) is skipped, so it stops burning quota.
        with lock:
            if lang_bad.get(c, 0) >= 3 and not lang_ok.get(c, 0):
                raise RuntimeError(f'skipped {c}: 3 failures and no success this run')
        lang = {'code': c, 'english': meta[c]['english'], 'native': meta[c]['native']}
        if progress_file and f'{k}|{c}|{r or ""}' in on_disk():
            return t, 'already done'  # finished by another translator since this run started
        try:
            if k == 'guides':
                res = t, translate_guide(lang, r)
            else:
                with lock:
                    if c not in cats:
                        cats[c] = plural_cats(meta[c]['bcp47'])
                res = t, str(translate_json(k, lang, cats[c], only_units.get(k) if a.changed_since else None))
        except Exception:
            with lock:
                lang_bad[c] = lang_bad.get(c, 0) + 1
            raise
        with lock:
            lang_ok[c] = lang_ok.get(c, 0) + 1
        return res

    threading.Thread(target=health_check_loop, daemon=True).start()
    done = 0
    with ThreadPoolExecutor(min(a.jobs, MAX_JOBS)) as ex:
        futs = [ex.submit(work, t) for t in todo]
        for f in as_completed(futs):
            try:
                t, p = f.result()
                done += 1
                print(f'[{done}/{len(todo)}] ok {t[0]} {t[1]} {t[2] or ""}', flush=True)
                if progress_file and p != 'already done':
                    with lock:
                        # Add only this task to what is on disk now: other translators add their own
                        # tasks, and a reviewer may remove one to have it redone.
                        progress_file.write_text(json.dumps(sorted(on_disk() | {f'{t[0]}|{t[1]}|{t[2] or ""}'})))
            except Exception as e:  # noqa: BLE001
                print('FAIL', str(e)[:200], flush=True)


if __name__ == '__main__':
    main()
