"""Tests for the per-language translation inventory (L10N-001)."""
import csv
import json
import tempfile
import unittest
from pathlib import Path

from scripts import l10n_inventory

ROOT = Path(__file__).resolve().parents[1]


class PlaceholderCounterTests(unittest.TestCase):
    def test_counts_spaced_and_trailing_ellipses(self):
        values = ['Loading ...', 'Wait...', 'Fine', 'Read ... more']
        self.assertEqual(l10n_inventory.count_placeholders(values), 3)

    def test_fixture_directory_counts_per_surface(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            ui = root / l10n_inventory.SITE_JSON_RELATIVE['ui']
            ui.mkdir(parents=True)
            (ui / 'en.json').write_text(json.dumps({
                '_note': 'ignored, not a string to translate ...',
                'a': 'Loading ...', 'b': 'Wait...', 'c': 'Fine',
            }), encoding='utf-8')
            (ui / 'xx.json').write_text(json.dumps({
                '_note': 'ignored ...', 'a': 'Carica ...', 'b': 'Attendi...', 'c': 'Bene',
            }), encoding='utf-8')
            rows = {row['code']: row for row in l10n_inventory.build_rows(root)}
            self.assertEqual(rows['xx']['placeholders']['ui'], 2)
            self.assertEqual(rows['en']['placeholders']['ui'], 2)
            self.assertEqual(rows['xx']['keys']['ui'],
                             {'present': 3, 'total': 3, 'file': True})


class ReviewedListTests(unittest.TestCase):
    def test_reads_reviewed_languages_constant(self):
        text = "export const REVIEWED_LANGUAGES: readonly string[] = ['es', 'fr'];"
        self.assertEqual(l10n_inventory.parse_reviewed_languages(text), ['es', 'fr'])

    def test_absent_constant_returns_none(self):
        self.assertIsNone(l10n_inventory.parse_reviewed_languages(
            "export const FOUR_TOGETHER_REVIEWED: readonly string[] = ['en'];"))


class RealRepositoryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows = l10n_inventory.build_rows(ROOT)
        cls.by_code = {row['code']: row for row in cls.rows}

    def test_every_csv_code_appears_in_table(self):
        with (ROOT / 'docs/languages.csv').open(encoding='utf-8', newline='') as handle:
            csv_codes = {row[0].strip() for row in list(csv.reader(handle))[1:] if row}
        self.assertLessEqual(csv_codes, set(self.by_code))

    def test_english_is_complete_on_every_surface(self):
        english = self.by_code['en']
        for surface in ('app', 'ui', 'games', 'play'):
            cell = english['keys'][surface]
            self.assertTrue(cell['file'], surface)
            self.assertEqual(cell['present'], cell['total'], surface)
        self.assertTrue(english['store'])
        self.assertEqual(english['guides']['present'], english['guides']['total'])
        self.assertTrue(english['guides']['total'] > 0)

    def test_rendered_table_has_one_line_per_row(self):
        table = l10n_inventory.render_table(self.rows).splitlines()
        self.assertEqual(len(table), len(self.rows) + 2)
        self.assertTrue(table[0].startswith('| Code | Language |'))


if __name__ == '__main__':
    unittest.main()
