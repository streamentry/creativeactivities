"""Regression tests for translation backend failures in site/scripts/agy_translate.py."""

import importlib.util
import io
import tempfile
from pathlib import Path
import unittest
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "site/scripts/agy_translate.py"
SPEC = importlib.util.spec_from_file_location("agy_translate", MODULE_PATH)
agy_translate = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(agy_translate)


class FakeProcess:
    def __init__(self, events: list[dict[str, object]]) -> None:
        self.stdout = io.StringIO("\n".join(agy_translate.json.dumps(event) for event in events))
        self.returncode: int | None = 0

    def kill(self) -> None:
        self.returncode = -9

    def wait(self) -> int:
        return self.returncode or 0

    def poll(self) -> int | None:
        return self.returncode


class AgyTranslateTests(unittest.TestCase):
    def test_free_only_backend_pool_excludes_paid_models(self) -> None:
        original = (
            agy_translate.BACKENDS,
            agy_translate.FALLBACKS,
            agy_translate.ALL_BACKENDS,
        )
        try:
            agy_translate.configure_free_only()
            self.assertEqual(agy_translate.BACKENDS, ['iceman', 'dsfree', 'glmfree'])
            self.assertEqual(agy_translate.FALLBACKS, [])
            self.assertEqual(agy_translate.ALL_BACKENDS, ['iceman', 'dsfree', 'glmfree'])
        finally:
            (
                agy_translate.BACKENDS,
                agy_translate.FALLBACKS,
                agy_translate.ALL_BACKENDS,
            ) = original

    def test_number_validation_rejects_added_values_even_if_source_has_a_year(self) -> None:
        source = 'The guide was published in 2021; contact local urgent services.'
        translated = 'The guide was published in 2021; call local urgent services at 112.'
        self.assertTrue(agy_translate.unsafe_number_additions(source, translated))

    def test_number_validation_allows_localizing_an_explicit_emergency_number(self) -> None:
        source = 'Call 911 if there is immediate danger.'
        translated = 'Call 112 if there is immediate danger.'
        self.assertFalse(agy_translate.unsafe_number_additions(source, translated))

    def test_refresh_translates_strings_the_language_does_not_have_yet(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            i18n = Path(tmp)
            (i18n / 'ui').mkdir()
            en = {'kept': 'Hello there', 'changed': 'New wording', 'missing': 'Added later'}
            (i18n / 'ui' / 'en.json').write_text(agy_translate.json.dumps(en))
            (i18n / 'ui' / 'xx.json').write_text(agy_translate.json.dumps({'kept': 'XX hello', 'changed': 'XX old'}))
            sent: list[dict] = []

            def fake_chunk(lang, chunk, cats, extra):
                sent.append(dict(chunk))
                return {k: f'XX {v}' for k, v in chunk.items()}

            with patch.object(agy_translate, 'I18N', i18n), patch.object(agy_translate, 'translate_chunk', fake_chunk):
                agy_translate.translate_json('ui', {'code': 'xx', 'english': 'X', 'native': 'X'}, ['other'], {('changed',)})
            out = agy_translate.json.loads((i18n / 'ui' / 'xx.json').read_text())
        self.assertEqual(out, {'kept': 'XX hello', 'changed': 'XX New wording', 'missing': 'XX Added later'})
        self.assertEqual(set().union(*sent), {'changed', 'missing'})

    def test_play_identifiers_are_never_sent_for_translation(self) -> None:
        self.assertTrue(agy_translate.is_play_identifier(('content', 'conversation', 'cards', 8, 'picture')))
        self.assertTrue(agy_translate.is_play_identifier(('content', 'conversation', 'cards', 8, 'theme')))
        self.assertTrue(agy_translate.is_play_identifier(('content', 'wordSearch', 'themes', 0, 'value')))
        self.assertFalse(agy_translate.is_play_identifier(('content', 'conversation', 'cards', 8, 'prompt')))
        self.assertFalse(agy_translate.is_play_identifier(('content', 'wordSearch', 'themes', 0, 'label')))
        self.assertFalse(agy_translate.is_play_identifier(('ui', 'coloring', 'value')))
        with tempfile.TemporaryDirectory() as tmp:
            i18n = Path(tmp)
            (i18n / 'play').mkdir()
            en = {'content': {'conversation': {'cards': [{'theme': 'food', 'picture': 'bread', 'prompt': 'What smell do you love?'}]}}}
            (i18n / 'play' / 'en.json').write_text(agy_translate.json.dumps(en))
            sent: list[dict] = []

            def fake_chunk(lang, chunk, cats, extra):
                sent.append(dict(chunk))
                return {k: f'XX {v}' for k, v in chunk.items()}

            with patch.object(agy_translate, 'I18N', i18n), patch.object(agy_translate, 'translate_chunk', fake_chunk):
                agy_translate.translate_json('play', {'code': 'xx', 'english': 'X', 'native': 'X'}, ['other'])
            out = agy_translate.json.loads((i18n / 'play' / 'xx.json').read_text())
        self.assertEqual(out['content']['conversation']['cards'], [{'theme': 'food', 'picture': 'bread', 'prompt': 'XX What smell do you love?'}])
        self.assertEqual(set().union(*sent), {'content/conversation/cards/0/prompt'})

    def test_play_held_strings_are_not_machine_written(self) -> None:
        self.assertTrue(agy_translate.is_play_held(('illustrations', 'apple')))
        self.assertTrue(agy_translate.is_play_held(('ui', 'photoPairs', 'consent')))
        self.assertFalse(agy_translate.is_play_held(('pictures', 'apple')))
        self.assertFalse(agy_translate.is_play_held(('ui', 'picturePairs', 'next')))
        with tempfile.TemporaryDirectory() as tmp:
            i18n = Path(tmp)
            (i18n / 'play').mkdir()
            en = {'illustrations': {'apple': 'Apple'}, 'ui': {'photoPairs': {'consent': 'Only add photos you may share.'}, 'x': {'next': 'Next'}}}
            (i18n / 'play' / 'en.json').write_text(agy_translate.json.dumps(en))
            sent: list[dict] = []

            def fake_chunk(lang, chunk, cats, extra):
                sent.append(dict(chunk))
                return {k: f'XX {v}' for k, v in chunk.items()}

            with patch.object(agy_translate, 'I18N', i18n), patch.object(agy_translate, 'translate_chunk', fake_chunk):
                agy_translate.translate_json('play', {'code': 'xx', 'english': 'X', 'native': 'X'}, ['other'])
        self.assertEqual(set().union(*sent), {'ui/x/next'})

    def test_quota_retry_discards_partial_opencode_translation(self) -> None:
        process = FakeProcess(
            [
                {"type": "text", "part": {"text": "partial translation"}},
                {
                    "type": "retry",
                    "error": {"message": "rate limit exceeded"},
                    "timestamp": 0,
                    "nextRetryAt": 5000,
                },
            ]
        )

        with (
            patch.object(agy_translate.subprocess, "Popen", return_value=process),
            patch.object(agy_translate.threading, "Timer"),
        ):
            with self.assertRaises(agy_translate.BackendError) as error:
                agy_translate._run_opencode(["opencode"], str(ROOT), 10)

        self.assertEqual(error.exception.kind, "quota")
        self.assertIn("retry in 5s", str(error.exception))


    def test_language_catalog_has_190_unique_codes_including_south_azerbaijani(self) -> None:
        codes = [language['code'] for language in agy_translate.languages()]
        self.assertEqual(len(codes), 190)
        self.assertEqual(len(set(codes)), 190)
        self.assertIn('en', codes)
        self.assertIn('azb', codes)
        self.assertEqual(codes.count('az'), 1)

    def test_language_catalog_covers_every_site_language_including_regional_variants(self) -> None:
        codes = {language['code'] for language in agy_translate.languages()}
        self.assertEqual(set(agy_translate.locale_codes()) - codes, set())
        for code in ('pt-BR', 'pt-PT', 'zh-Hans', 'zh-Hant', 'fil'):
            self.assertIn(code, codes)

    def test_language_catalog_rejects_duplicate_codes(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            csv_path = Path(tmp) / 'languages.csv'
            csv_path.write_text(
                'Locale code,639-2/T,639-2/B,Language name,Native name\n'
                'aa,aar,aar,Afar,Afaraf\n'
                'aa,aa,aa,Duplicate,Duplicate\n',
                encoding='utf-8',
            )
            with patch.object(agy_translate, 'CSV', csv_path):
                with self.assertRaisesRegex(ValueError, 'duplicate language code.*aa'):
                    agy_translate.languages()

    def test_pending_can_select_one_guide_by_slug(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            guides = Path(tmp) / 'guides'
            (guides / 'caregiving').mkdir(parents=True)
            (guides / 'caregiving/one.md').write_text('one', encoding='utf-8')
            (guides / 'caregiving/two.md').write_text('two', encoding='utf-8')
            with (
                patch.object(agy_translate, 'GUIDES', guides),
                patch.object(agy_translate, 'guide_done', return_value=False),
            ):
                tasks = agy_translate.pending(['guides'], ['es'], ['caregiving/one'])
            self.assertEqual(tasks, [('guides', 'es', 'caregiving/one.md')])

    def test_guide_selection_rejects_unknown_or_parent_paths(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            guides = Path(tmp) / 'guides'
            (guides / 'caregiving').mkdir(parents=True)
            (guides / 'caregiving/one.md').write_text('one', encoding='utf-8')
            with patch.object(agy_translate, 'GUIDES', guides):
                with self.assertRaisesRegex(ValueError, 'unknown guide path'):
                    agy_translate.guide_paths(['caregiving/missing'])
                with self.assertRaisesRegex(ValueError, 'invalid guide path'):
                    agy_translate.guide_paths(['../secret'])


if __name__ == "__main__":
    unittest.main()
