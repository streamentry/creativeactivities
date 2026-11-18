#!/usr/bin/env python3
"""Translation defect log and release gate (L10N-025).

    python3 scripts/l10n_defects.py               # validate the log, print a summary
    python3 scripts/l10n_defects.py --release es  # exit 1 if es has an open safety or claim defect

The log is docs/l10n/defects.csv; how to add a row is in
docs/engineering/native-review.md ("Logging a defect"). Counts are internal
release gates, never a quality badge. Standard library only. This never
publishes anything.
"""
import argparse
import csv
import datetime
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOG_RELATIVE = 'docs/l10n/defects.csv'
STATUS_RELATIVE = 'docs/specs/release-status.json'
COLUMNS = ['id', 'language', 'severity', 'location', 'summary', 'found_by',
           'found_on', 'status', 'fixed_in', 'closed_on']
SEVERITIES = ('safety', 'claim', 'factual', 'meaning', 'style')
BLOCKING = ('safety', 'claim')
STATUSES = ('open', 'closed')
DATE_PATTERN = re.compile(r'\d{4}-\d{2}-\d{2}')
LINE_SUFFIX = re.compile(r':(\d+)$')


def parse_date(value):
    """Return a date for a strict YYYY-MM-DD string, else None."""
    if not DATE_PATTERN.fullmatch(value or ''):
        return None
    try:
        return datetime.date.fromisoformat(value)
    except ValueError:
        return None


def read_status(root=ROOT):
    """Language code -> entry, from localization.languages in release-status.json."""
    data = json.loads((root / STATUS_RELATIVE).read_text(encoding='utf-8'))
    return data.get('localization', {}).get('languages', {})


def read_log(root=ROOT):
    """Return (records, errors). Each record is (line number, row dict)."""
    try:
        with (root / LOG_RELATIVE).open(encoding='utf-8', newline='') as handle:
            table = list(csv.reader(handle))
    except (OSError, UnicodeDecodeError) as error:
        return [], [f'cannot read {LOG_RELATIVE}: {error}']
    if not table or table[0] != COLUMNS:
        return [], [f'{LOG_RELATIVE}: header row must be {",".join(COLUMNS)}']
    records, errors = [], []
    for number, cells in enumerate(table[1:], start=2):
        if not cells:
            continue
        if len(cells) != len(COLUMNS):
            errors.append(f'line {number}: expected {len(COLUMNS)} columns, found {len(cells)}')
            continue
        records.append((number, dict(zip(COLUMNS, cells))))
    return records, errors


def location_problem(root, location):
    """Return a problem with a repository path, optionally ending in :line, or None."""
    match = LINE_SUFFIX.search(location)
    path_text = location[:match.start()] if match else location
    if not path_text:
        return 'location is empty'
    path = Path(path_text)
    target = (root / path).resolve()
    if path.is_absolute() or not target.is_relative_to(root.resolve()):
        return f'location {location!r} must be a path inside the repository'
    if not target.exists():
        return f'location path does not exist: {path_text}'
    if not target.is_file():
        return f'location is not a file: {path_text}'
    if match:
        count = len(target.read_text(encoding='utf-8', errors='replace').splitlines())
        line = int(match.group(1))
        if not 1 <= line <= count:
            return f'location line {line} is outside {path_text} ({count} lines)'
    return None


def record_problems(root, languages, number, row, seen_ids):
    """Return the validation errors for one row. Each starts with the row id."""
    label = row['id'] or f'line {number}'
    problems = []

    def add(message):
        problems.append(f'{label}: {message}')

    if not row['id'] or any(char.isspace() for char in row['id']):
        add('id must be non-empty and contain no spaces')
    elif row['id'] in seen_ids:
        add('duplicate id')
    else:
        seen_ids.add(row['id'])
    if row['language'] not in languages:
        add(f'language {row["language"]!r} is not in {STATUS_RELATIVE} localization.languages')
    if row['severity'] not in SEVERITIES:
        add(f'severity must be one of {", ".join(SEVERITIES)}')
    problem = location_problem(root, row['location'])
    if problem:
        add(problem)
    for field in ('summary', 'found_by'):
        if not row[field].strip():
            add(f'{field} is empty')
    found = parse_date(row['found_on'])
    if found is None:
        add('found_on must be a date as YYYY-MM-DD')
    if row['status'] not in STATUSES:
        add('status must be open or closed')
    elif row['status'] == 'open':
        if row['fixed_in'] or row['closed_on']:
            add('an open defect must leave fixed_in and closed_on empty')
    else:
        if not row['fixed_in'].strip():
            add('a closed defect needs fixed_in (a commit, PR or file)')
        closed = parse_date(row['closed_on'])
        if closed is None:
            add('closed_on must be a date as YYYY-MM-DD')
        elif found and closed < found:
            add('closed_on is before found_on')
    return problems


def load(root=ROOT):
    """Return (records, languages, errors) for the log and status file under root."""
    records, errors = read_log(root)
    try:
        languages = read_status(root)
    except (OSError, ValueError) as error:
        return records, {}, errors + [f'cannot read {STATUS_RELATIVE}: {error}']
    seen_ids = set()
    for number, row in records:
        errors.extend(record_problems(root, languages, number, row, seen_ids))
    return records, languages, errors


def check(root=ROOT):
    """Every validation error in the log. An empty list means the log is valid."""
    return load(root)[2]


def open_blockers(records, language):
    """Open safety or claim rows for one language."""
    return [row for _, row in records
            if row['language'] == language and row['status'] == 'open'
            and row['severity'] in BLOCKING]


def release_blockers(root=ROOT, language=None):
    """Errors that stop a release.

    The log must be valid. Open safety or claim defects block `language` when
    it is given, otherwise every language marked reviewed in release-status.json.
    """
    records, languages, errors = load(root)
    if language is None:
        targets = [code for code, entry in languages.items()
                   if entry.get('status') == 'reviewed']
    else:
        targets = [language]
        if language not in languages:
            errors.append(f'{language}: not in the language list')
    for code in targets:
        blockers = open_blockers(records, code)
        if blockers:
            names = '; '.join(f'{row["id"]} ({row["severity"]}, {row["location"]})'
                              for row in blockers)
            errors.append(f'{code}: {len(blockers)} open safety or claim defect(s) '
                          f'block the release: {names}')
    return errors


def summarize(records, languages):
    """Per-language counts: open safety, open claim, open other, found after reviewed.

    "Found after reviewed" counts defects found after the date a language was
    marked reviewed. It is None when the language is not reviewed or has no date.
    Only languages with a defect row or a reviewed status appear.
    """
    codes = {row['language'] for _, row in records}
    codes |= {code for code, entry in languages.items() if entry.get('status') == 'reviewed'}
    summary = {}
    for code in sorted(codes):
        entry = languages.get(code, {})
        reviewed = entry.get('status') == 'reviewed'
        reviewed_on = parse_date(entry.get('date')) if reviewed else None
        counts = {'reviewed': reviewed, 'open_safety': 0, 'open_claim': 0,
                  'open_other': 0,
                  'after_reviewed': None if reviewed_on is None else 0}
        for _, row in records:
            if row['language'] != code:
                continue
            if row['status'] == 'open':
                if row['severity'] == 'safety':
                    counts['open_safety'] += 1
                elif row['severity'] == 'claim':
                    counts['open_claim'] += 1
                else:
                    counts['open_other'] += 1
            found = parse_date(row['found_on'])
            if reviewed_on and found and found > reviewed_on:
                counts['after_reviewed'] += 1
        summary[code] = counts
    return summary


def format_summary(summary):
    if not summary:
        return 'No defects logged and no language is reviewed.'
    lines = [f'{"language":<10}{"reviewed":<10}{"open safety":>13}{"open claim":>12}'
             f'{"open other":>12}{"after reviewed":>16}']
    for code, counts in summary.items():
        after = '-' if counts['after_reviewed'] is None else str(counts['after_reviewed'])
        lines.append(f'{code:<10}{"yes" if counts["reviewed"] else "no":<10}'
                     f'{counts["open_safety"]:>13}{counts["open_claim"]:>12}'
                     f'{counts["open_other"]:>12}{after:>16}')
    return '\n'.join(lines)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--release', metavar='LANG',
                        help='exit 1 if LANG has an open safety or claim defect')
    args = parser.parse_args(argv)
    if args.release:
        errors = release_blockers(ROOT, args.release)
        for error in errors:
            print(f'ERROR: {error}')
        if errors:
            return 1
        print(f'No open safety or claim defects for {args.release}.')
        return 0
    records, languages, errors = load(ROOT)
    for error in errors:
        print(f'ERROR: {error}')
    if errors:
        return 1
    print(format_summary(summarize(records, languages)))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
