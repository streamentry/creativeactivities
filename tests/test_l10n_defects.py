"""Translation defect log, validation and release gate (L10N-025)."""
import json
import shutil
import tempfile
import unittest
from pathlib import Path

from scripts import l10n_defects

ROOT = Path(__file__).resolve().parents[1]
HEADER = ','.join(l10n_defects.COLUMNS)
SOURCE = 'docs/engineering/native-review.md'
UNREVIEWED = {'status': 'unreviewed', 'reviewer': None, 'evidence': None, 'date': None}
REVIEWED = {'status': 'reviewed', 'reviewer': 'Reviewer A', 'evidence': 'docs/x.md',
            'date': '2026-10-01'}


def make_row(**fields):
    values = {'id': 'DEF-001', 'language': 'es', 'severity': 'safety',
              'location': SOURCE + ':3', 'summary': 'Wrong dosing words',
              'found_by': 'reviewer-a', 'found_on': '2026-11-02', 'status': 'open',
              'fixed_in': '', 'closed_on': ''}
    values.update(fields)
    return ','.join(values[column] for column in l10n_defects.COLUMNS)


class TempRepo(unittest.TestCase):
    def make_root(self, lines=(), languages=None):
        root = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, root, True)
        (root / 'docs/engineering').mkdir(parents=True)
        (root / 'docs/specs').mkdir(parents=True)
        (root / 'docs/l10n').mkdir(parents=True)
        (root / SOURCE).write_text('\n'.join(f'line {n}' for n in range(1, 6)) + '\n',
                                   encoding='utf-8')
        if languages is None:
            languages = {'es': dict(UNREVIEWED), 'vi': dict(UNREVIEWED)}
        status = {'localization': {'languages': languages}}
        (root / 'docs/specs/release-status.json').write_text(json.dumps(status),
                                                             encoding='utf-8')
        self.write_log(root, [HEADER, *lines])
        return root

    def write_log(self, root, lines):
        (root / 'docs/l10n/defects.csv').write_text('\n'.join(lines) + '\n', encoding='utf-8')


class LogValidationTests(TempRepo):
    def test_header_only_log_passes(self):
        self.assertEqual(l10n_defects.check(self.make_root()), [])

    def test_valid_closed_row_passes(self):
        root = self.make_root([make_row(status='closed', fixed_in='PR 12',
                                        closed_on='2026-11-05')])
        self.assertEqual(l10n_defects.check(root), [])

    def test_website_language_can_be_logged(self):
        root = self.make_root([make_row(language='ha', severity='meaning')])
        (root / 'site/src/i18n/ui').mkdir(parents=True)
        (root / 'site/src/i18n/ui/ha.json').write_text('{}', encoding='utf-8')
        self.assertEqual(l10n_defects.check(root), [])

    def test_code_in_neither_list_is_an_error(self):
        root = self.make_root([make_row(language='xx')])
        self.assertTrue(any('xx' in error for error in l10n_defects.check(root)))

    def test_real_repository_log_validates(self):
        self.assertEqual(l10n_defects.check(ROOT), [])
        self.assertEqual(l10n_defects.release_blockers(ROOT), [])

    def test_wrong_header_fails(self):
        root = self.make_root()
        self.write_log(root, ['id,language,severity'])
        self.assertTrue(any('header' in e for e in l10n_defects.check(root)))

    def test_wrong_column_count_fails(self):
        root = self.make_root(['DEF-001,es,safety'])
        self.assertTrue(any('expected 10 columns' in e for e in l10n_defects.check(root)))

    def test_each_rule_fails_with_row_id(self):
        cases = {
            'unknown language': ({'language': 'xx'}, 'not in'),
            'bad severity': ({'severity': 'urgent'}, 'severity must be'),
            'bad status': ({'status': 'done'}, 'status must be'),
            'bad found_on': ({'found_on': '02/11/2026'}, 'found_on must be'),
            'impossible date': ({'found_on': '2026-02-30'}, 'found_on must be'),
            'empty summary': ({'summary': ''}, 'summary is empty'),
            'empty found_by': ({'found_by': ' '}, 'found_by is empty'),
            'missing file': ({'location': 'docs/nope.md'}, 'does not exist'),
            'line past end': ({'location': SOURCE + ':99'}, 'outside'),
            'path outside repo': ({'location': '../outside.md'}, 'inside the repository'),
            'absolute path': ({'location': '/etc/hosts'}, 'inside the repository'),
            'open with fixed_in': ({'fixed_in': 'abc123'}, 'must leave fixed_in'),
            'closed without fixed_in': ({'status': 'closed', 'closed_on': '2026-11-05'},
                                        'needs fixed_in'),
            'closed without closed_on': ({'status': 'closed', 'fixed_in': 'PR 12'},
                                         'closed_on must be'),
            'closed before found': ({'status': 'closed', 'fixed_in': 'PR 12',
                                     'closed_on': '2026-10-01'}, 'before found_on'),
        }
        for name, (fields, expected) in cases.items():
            with self.subTest(case=name):
                root = self.make_root([make_row(**fields)])
                problems = l10n_defects.check(root)
                self.assertTrue(any(expected in p for p in problems), problems)
                self.assertTrue(all(p.startswith('DEF-001: ') for p in problems), problems)

    def test_duplicate_id_fails(self):
        root = self.make_root([make_row(), make_row(severity='style')])
        self.assertTrue(any('duplicate id' in e for e in l10n_defects.check(root)))

    def test_empty_id_fails(self):
        root = self.make_root([make_row(id='')])
        self.assertTrue(any('id must be' in e for e in l10n_defects.check(root)))


class ReleaseGateTests(TempRepo):
    def test_open_safety_blocks_named_language(self):
        root = self.make_root([make_row(severity='safety')])
        problems = l10n_defects.release_blockers(root, 'es')
        self.assertTrue(any('DEF-001' in p for p in problems), problems)

    def test_open_claim_blocks_named_language(self):
        root = self.make_root([make_row(severity='claim')])
        self.assertTrue(l10n_defects.release_blockers(root, 'es'))

    def test_closed_safety_does_not_block(self):
        root = self.make_root([make_row(severity='safety', status='closed', fixed_in='PR 12',
                                        closed_on='2026-11-05')])
        self.assertEqual(l10n_defects.release_blockers(root, 'es'), [])

    def test_style_meaning_and_factual_do_not_block(self):
        root = self.make_root([make_row(id='DEF-001', severity='style'),
                               make_row(id='DEF-002', severity='meaning'),
                               make_row(id='DEF-003', severity='factual')])
        self.assertEqual(l10n_defects.release_blockers(root, 'es'), [])

    def test_other_language_is_not_blocked(self):
        root = self.make_root([make_row(language='vi', severity='safety')])
        self.assertEqual(l10n_defects.release_blockers(root, 'es'), [])

    def test_reviewed_language_with_open_blocker_stops_release(self):
        root = self.make_root([make_row(severity='claim')],
                              languages={'es': dict(REVIEWED), 'vi': dict(UNREVIEWED)})
        problems = l10n_defects.release_blockers(root)
        self.assertTrue(any(p.startswith('es:') for p in problems), problems)

    def test_unreviewed_language_with_open_blocker_does_not_stop_release(self):
        root = self.make_root([make_row(severity='safety')],
                              languages={'es': dict(UNREVIEWED)})
        self.assertEqual(l10n_defects.release_blockers(root), [])

    def test_unknown_language_is_an_error(self):
        root = self.make_root()
        self.assertTrue(l10n_defects.release_blockers(root, 'xx'))

    def test_invalid_log_stops_release(self):
        root = self.make_root([make_row(severity='urgent')])
        self.assertTrue(l10n_defects.release_blockers(root, 'es'))


class SummaryTests(TempRepo):
    def test_counts_and_found_after_reviewed(self):
        root = self.make_root([
            make_row(id='DEF-001', severity='safety', found_on='2026-11-02'),
            make_row(id='DEF-002', severity='claim', found_on='2026-09-15'),
            make_row(id='DEF-003', severity='style', found_on='2026-11-03'),
            make_row(id='DEF-004', severity='factual', status='closed', fixed_in='PR 3',
                     closed_on='2026-11-04', found_on='2026-11-01'),
        ], languages={'es': dict(REVIEWED), 'vi': dict(UNREVIEWED)})
        records, languages, errors = l10n_defects.load(root)
        self.assertEqual(errors, [])
        counts = l10n_defects.summarize(records, languages)['es']
        self.assertEqual(counts['open_safety'], 1)
        self.assertEqual(counts['open_claim'], 1)
        self.assertEqual(counts['open_other'], 1)
        self.assertEqual(counts['after_reviewed'], 3)

    def test_found_after_reviewed_splits_by_calendar_quarter(self):
        root = self.make_root([
            make_row(id='DEF-001', found_on='2026-10-01'),
            make_row(id='DEF-002', found_on='2026-12-31'),
            make_row(id='DEF-003', found_on='2027-01-01'),
            make_row(id='DEF-004', found_on='2026-09-30'),
            make_row(id='DEF-005', language='vi', found_on='2027-02-10'),
        ], languages={'es': dict(REVIEWED), 'vi': dict(UNREVIEWED)})
        records, languages, errors = l10n_defects.load(root)
        self.assertEqual(errors, [])
        summary = l10n_defects.summarize(records, languages)
        # DEF-001 is found on the review date itself, which is not after it, so it is not counted.
        self.assertEqual(summary['es']['after_reviewed'], 2)
        self.assertEqual(summary['es']['after_reviewed_by_quarter'], {'2026-Q4': 1, '2027-Q1': 1})
        self.assertIsNone(summary['vi']['after_reviewed_by_quarter'])
        self.assertIsNone(summary['vi']['after_reviewed'])

    def test_quarter_labels(self):
        self.assertEqual(l10n_defects.quarter_of(l10n_defects.datetime.date(2026, 1, 1)), '2026-Q1')
        self.assertEqual(l10n_defects.quarter_of(l10n_defects.datetime.date(2026, 3, 31)), '2026-Q1')
        self.assertEqual(l10n_defects.quarter_of(l10n_defects.datetime.date(2026, 4, 1)), '2026-Q2')
        self.assertEqual(l10n_defects.quarter_of(l10n_defects.datetime.date(2026, 12, 31)), '2026-Q4')

    def test_quarter_table_leaves_unreviewed_languages_blank(self):
        root = self.make_root([make_row(found_on='2026-11-02'),
                               make_row(id='DEF-002', language='vi', found_on='2026-11-03')],
                              languages={'es': dict(REVIEWED), 'vi': dict(UNREVIEWED)})
        records, languages, _ = l10n_defects.load(root)
        text = l10n_defects.format_summary(l10n_defects.summarize(records, languages))
        lines = text.splitlines()
        header = next(i for i, line in enumerate(lines) if line.startswith('Found after reviewed'))
        es_row = next(line for line in lines[header:] if line.startswith('es'))
        vi_row = next(line for line in lines[header:] if line.startswith('vi'))
        self.assertTrue(es_row.endswith('1'))
        self.assertEqual(vi_row.strip(), 'vi')

    def test_empty_log_summary(self):
        root = self.make_root()
        records, languages, _ = l10n_defects.load(root)
        self.assertEqual(l10n_defects.summarize(records, languages), {})


if __name__ == '__main__':
    unittest.main()
