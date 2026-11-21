"""The launch gate table is generated from the records and stays in step (L10N-002, L10N-003)."""
import json
from pathlib import Path
import unittest

from scripts import launch_gates as gates

ROOT = Path(__file__).resolve().parents[1]
STATUS = json.loads((ROOT / 'docs/specs/release-status.json').read_text(encoding='utf-8'))
LANGUAGES = STATUS['localization']['languages']
LOCALES_TEXT = gates.LOCALES_TS.read_text(encoding='utf-8')
NAMES = gates.english_names(LOCALES_TEXT)


class ReviewedLanguagesTests(unittest.TestCase):
    def test_reviewed_list_is_english_plus_reviewed_status(self):
        reviewed = [code for code, entry in LANGUAGES.items() if entry.get('status') == 'reviewed']
        self.assertEqual(sorted(gates.reviewed_languages(LOCALES_TEXT)), sorted(['en', *reviewed]))

    def test_reviewed_list_names_only_known_locales(self):
        for code in gates.reviewed_languages(LOCALES_TEXT):
            with self.subTest(language=code):
                self.assertIn(code, NAMES)

    def test_no_language_is_held_from_index_today(self):
        self.assertEqual(gates.held_from_index(LOCALES_TEXT), set())


class LaunchOrderTests(unittest.TestCase):
    def setUp(self):
        self.order = gates.launch_order(gates.REVIEW_GUIDE.read_text(encoding='utf-8'), NAMES)

    def test_order_has_fifty_unique_known_languages(self):
        self.assertEqual(len(self.order), 50)
        self.assertEqual(len(set(self.order)), 50)
        for code in self.order:
            with self.subTest(language=code):
                self.assertIn(code, NAMES)

    def test_first_nineteen_match_the_status_file_order(self):
        self.assertEqual(self.order[:19], list(LANGUAGES)[:19])

    def test_every_ordered_language_has_a_store_listing_file(self):
        for code in self.order:
            with self.subTest(language=code):
                self.assertTrue((gates.STORE_DIR / f'{code}.json').exists())


class GateTableTests(unittest.TestCase):
    def setUp(self):
        self.rows, self.outside = gates.build_rows()

    def test_one_row_per_launch_language_in_order(self):
        self.assertEqual(len(self.rows), 50)
        self.assertEqual([r['number'] for r in self.rows], [str(i) for i in range(1, 51)])

    def test_no_row_claims_a_reviewer_or_review_that_is_not_recorded(self):
        for row in self.rows:
            with self.subTest(language=row['code']):
                entry = LANGUAGES.get(row['code'], {})
                self.assertEqual(row['reviewer'] == 'yes', bool(entry.get('reviewer')))
                self.assertEqual(row['reviewed'] == 'yes', row['code'] in gates.reviewed_languages(LOCALES_TEXT))

    def test_outside_the_order_lists_the_rest_of_the_status_file(self):
        ordered = {r['code'] for r in self.rows}
        self.assertEqual(sorted(self.outside + sorted(ordered)), sorted(LANGUAGES))

    def test_committed_table_matches_the_generator(self):
        text = gates.render(self.rows, self.outside)
        self.assertEqual(gates.OUTPUT.read_text(encoding='utf-8'), text,
                         'run python3 scripts/launch_gates.py --write')

    def test_spend_gate_is_a_maintainer_decision_on_every_row(self):
        self.assertEqual(gates.render(self.rows, self.outside).count('| maintainer decision |'), 50)


if __name__ == '__main__':
    unittest.main()
