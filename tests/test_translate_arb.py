"""Placeholder, ICU and brand protection for machine-filled ARB files (no network)."""
import json
import re
import unittest

from scripts import translate_arb as t


def tag_translator(texts, tl):
    """Fake service: prefixes each text so changes are visible, keeps placeholders."""
    return [f'[{tl}] {text}' for text in texts]


class ParseAndRenderTests(unittest.TestCase):
    def test_plain_placeholder_message_keeps_placeholders(self):
        english = '{name} went into the {basket} basket.'
        nodes = t.parse_message(english)
        raws = t.segments(nodes)
        self.assertEqual(raws, [english])
        out = t.render(nodes, t.translate_raw_segments(raws, 'fr', tag_translator))
        self.assertEqual(out, '[fr] {name} went into the {basket} basket.')

    def test_plural_keeps_keywords_selectors_and_placeholder_names(self):
        english = '{count, plural, =1{One photo} other{{count} photos}}'
        nodes = t.parse_message(english)
        self.assertEqual(t.segments(nodes), ['One photo', '{count} photos'])
        out = t.render(nodes, t.translate_raw_segments(t.segments(nodes), 'de', tag_translator))
        self.assertEqual(out, '{count, plural, =1{[de] One photo} other{[de] {count} photos}}')

    def test_select_branches_are_translated_separately(self):
        english = '{gender, select, female{She is} other{They are} } here'
        nodes = t.parse_message(english)
        out = t.render(nodes, t.translate_raw_segments(t.segments(nodes), 'es', tag_translator))
        self.assertEqual(out, '{gender, select, female{[es] She is} other{[es] They are}} [es] here')

    def test_numbers_only_and_placeholder_only_runs_are_not_sent(self):
        nodes = t.parse_message('{count}')
        self.assertEqual(t.segments(nodes), [])
        self.assertEqual(t.render(nodes, {}), '{count}')

    def test_apostrophe_in_icu_message_is_refused(self):
        with self.assertRaises(t.UnsafeMessage):
            t.parse_message("{n, plural, other{Don't go {n}}}")

    def test_unbalanced_and_unknown_braces_are_refused(self):
        for bad in ['{name', 'name}', '{name, number}', '{a, plural, other}']:
            with self.subTest(bad=bad), self.assertRaises(t.UnsafeMessage):
                t.parse_message(bad)


class SafetyTests(unittest.TestCase):
    def test_translation_that_drops_a_placeholder_is_rejected(self):
        def drops(texts, tl):
            return ['Plan {0}' for _ in texts]  # loses the {1} marker
        english = '{name} is in {basket}'
        out = t.translate_raw_segments([english], 'fr', drops)
        self.assertEqual(out, {})

    def test_translation_that_loses_every_marker_is_rejected(self):
        def loses(texts, tl):
            return [re.sub(r'\{[^{}]*\}|⟦\d+⟧', 'X', x) for x in texts]
        out = t.translate_raw_segments(['Hi {name}'], 'fr', loses)
        self.assertEqual(out, {})

    def test_segment_is_retried_with_letter_markers_when_digits_fail(self):
        def digits_break(texts, tl):
            return [x if '{0}' not in x else 'broken' for x in texts]
        out = t.translate_raw_segments(['Hi {name}'], 'fr', digits_break)
        self.assertEqual(out['Hi {name}'], 'Hi {name}')
        self.assertEqual(
            t.translate_raw_segments(['Hi {name}'], 'fr', lambda xs, tl: ['ok ' + x for x in xs]),
            {'Hi {name}': 'ok Hi {name}'})

    def test_translated_placeholder_name_is_restored_from_source(self):
        out = t.translate_raw_segments(['{name} is chosen.'], 'fr', lambda xs, tl: ['{0} est choisi.' for _ in xs])
        self.assertEqual(out['{name} is chosen.'], '{name} est choisi.')

    def test_failed_service_chunk_leaves_segment_out(self):
        out = t.translate_raw_segments(['Hello'], 'fr', lambda texts, tl: [None] * len(texts))
        self.assertEqual(out, {})

    def test_brand_name_is_sent_as_marker_and_restored(self):
        sent = []

        def capture(texts, tl):
            sent.extend(texts)
            return list(texts)

        out = t.translate_raw_segments(['Open Creative Activities today'], 'fr', capture)
        self.assertEqual(sent, ['Open {0} today'])
        self.assertEqual(out['Open Creative Activities today'], 'Open Creative Activities today')

    def test_whitespace_around_segment_is_kept(self):
        out = t.translate_raw_segments([' went home '], 'fr', tag_translator)
        self.assertEqual(out[' went home '], ' [fr] went home ')


class FillLocaleTests(unittest.TestCase):
    EN = {
        '@@locale': 'en',
        'hello': 'Hello {name}',
        'kept': 'Already here',
        'count': '{count, plural, =1{One} other{{count} more}}',
        'fancy': "{n, plural, other{Don't stop {n}}}",
        'after': 'Last',
    }

    def test_only_missing_keys_are_filled_and_existing_translations_kept(self):
        existing = {'@@locale': 'fr', 'kept': 'Déjà là', 'after': 'Dernier'}
        catalog, filled, left = t.fill_locale(self.EN, existing, 'fr', 'fr', tag_translator)
        self.assertEqual(catalog['kept'], 'Déjà là')
        self.assertEqual(catalog['after'], 'Dernier')
        self.assertEqual(catalog['hello'], '[fr] Hello {name}')
        self.assertEqual(catalog['count'], '{count, plural, =1{[fr] One} other{[fr] {count} more}}')
        self.assertEqual(catalog['fancy'], "{n, plural, other{Don't stop {n}}}")  # refused
        self.assertEqual([item.split(':', 1)[0] for item in left], ['fancy'])
        self.assertEqual(sorted(filled), ['count', 'hello'])

    def test_output_uses_english_key_order_and_no_metadata(self):
        existing = {'@@locale': 'fr', 'after': 'Dernier', 'kept': 'Déjà là'}
        catalog, _, _ = t.fill_locale(self.EN, existing, 'fr', 'fr', tag_translator)
        self.assertEqual(list(catalog), ['@@locale', 'hello', 'kept', 'count', 'fancy', 'after'])
        self.assertFalse(any(k.startswith('@') and k != '@@locale' for k in catalog))

    def test_failed_segment_keeps_whole_key_in_english(self):
        existing = {'@@locale': 'fr'}
        def drop_all(texts, tl):
            return [None for _ in texts]
        catalog, filled, left = t.fill_locale(self.EN, existing, 'fr', 'fr', drop_all)
        self.assertEqual(catalog['hello'], 'Hello {name}')
        self.assertNotIn('hello', filled)
        self.assertIn('hello', ' '.join(left))

    def test_service_codes_map_app_locales(self):
        self.assertEqual(t.service_code('nb'), 'no')
        self.assertEqual(t.service_code('pt_BR'), 'pt')
        self.assertEqual(t.service_code('zh_Hant'), 'zh-TW')
        self.assertEqual(t.service_code('fil'), 'tl')
        self.assertEqual(t.service_code('fr'), 'fr')

    def test_dump_matches_arb_formatting(self):
        text = t.dump({'@@locale': 'fr', 'a': 'é'})
        self.assertEqual(text, json.dumps({'@@locale': 'fr', 'a': 'é'}, indent=2, ensure_ascii=False) + '\n')


if __name__ == '__main__':
    unittest.main()
