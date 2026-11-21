"""Every shipped asset is covered by the rights register (GM-025)."""
import hashlib
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTER = json.loads(
    (ROOT / 'docs/specs/asset-provenance.json').read_text(encoding='utf-8'))
GROUPS = REGISTER['groups']
SITE_IMAGES = REGISTER['site_images']
SITE_ROOT = ROOT / 'site/public'
STATUSES = {'unreviewed', 'reviewed', 'license_text_bundled', 'not_shipped'}


# Files the operating system adds to folders. Git ignores them and they are
# not shipped, so the register does not list them.
OS_METADATA = {'.DS_Store', 'Thumbs.db', 'desktop.ini'}


def real_files(folder: Path):
    return [p for p in folder.rglob('*')
            if p.is_file() and p.name not in OS_METADATA]


def shipped_paths() -> set[str]:
    pubspec = (ROOT / 'pubspec.yaml').read_text(encoding='utf-8')
    paths = set(re.findall(r'^\s+- (assets/\S+)\s*$', pubspec, re.M))
    paths |= set(re.findall(r'asset:\s*(assets/\S+)', pubspec))
    paths |= set(re.findall(r'image_path:\s*"(assets/[^"]+)"', pubspec))
    paths |= set(re.findall(r'^\s+image:\s*(assets/\S+)', pubspec, re.M))
    return paths


def covered(path: str) -> bool:
    for group in GROUPS:
        for entry in group['paths']:
            if path == entry or path.startswith(entry):
                return True
    return False


class AssetProvenanceTests(unittest.TestCase):
    def test_recorded_site_image_hashes_match_the_files(self):
        # Drawn pictures are generated at build time (site/src/data/pictures.ts) and are
        # checked against their rendered output in site/src/lib/asset-provenance.test.ts.
        checked = 0
        for image in SITE_IMAGES:
            if image['kind'] == 'drawn-svg':
                continue
            target = SITE_ROOT / image['url'].lstrip('/')
            with self.subTest(image=image['id']):
                self.assertTrue(target.is_file(), image['url'])
                digest = hashlib.sha256(target.read_bytes()).hexdigest()
                self.assertEqual(image.get('sha256'), digest)
                checked += 1
        self.assertGreater(checked, 100)

    def test_every_site_image_file_on_disk_has_a_record(self):
        recorded = {image['url'] for image in SITE_IMAGES}
        files = [f'/illustrations/{p.name}'
                 for p in (SITE_ROOT / 'illustrations').glob('*.webp')]
        og_dir = SITE_ROOT / 'og'
        files += [f'/og/{p.relative_to(og_dir).as_posix()}'
                  for p in og_dir.rglob('*.png')]
        self.assertTrue(files)
        self.assertEqual([f for f in files if f not in recorded], [])

    def test_site_image_alt_and_surfaces_are_consistent(self):
        for image in SITE_IMAGES:
            with self.subTest(image=image['id']):
                self.assertRegex(image.get('sha256') or '', r'^[0-9a-f]{64}$')
                self.assertIn('alt', image)
                self.assertIn('surfaces', image)
                if image['alt'] == '':
                    self.assertIs(image.get('decorative'), True)
                elif isinstance(image['alt'], str):
                    self.assertIs(image.get('decorative'), False)
                    self.assertTrue(image['alt'].strip())
                self.assertIsInstance(image['surfaces'], list)

    def test_every_declared_asset_is_in_the_register(self):
        paths = shipped_paths()
        self.assertTrue(paths)
        uncovered = []
        for path in sorted(paths):
            target = ROOT / path
            members = ([p.relative_to(ROOT).as_posix()
                        for p in real_files(target)]
                       if target.is_dir() else [path])
            self.assertTrue(members, f'{path} declares no files')
            uncovered += [m for m in members if not covered(m)]
        self.assertEqual(uncovered, [])

    def test_every_file_on_disk_is_covered(self):
        files = [p.relative_to(ROOT).as_posix()
                 for p in real_files(ROOT / 'assets')]
        # Native launcher and splash art checked into the platform projects.
        for base in ('ios/Runner/Assets.xcassets', 'android/app/src'):
            files += [
                p.relative_to(ROOT).as_posix()
                for p in real_files(ROOT / base)
                if p.suffix in ('.png', '.jpg', '.webp')
            ]
        self.assertEqual([p for p in files if not covered(p)], [])

    def test_registered_paths_exist(self):
        for group in GROUPS:
            for entry in group['paths']:
                with self.subTest(group=group['id'], path=entry):
                    self.assertTrue((ROOT / entry).exists())

    def test_statuses_are_known_and_gaps_are_named(self):
        for group in GROUPS:
            with self.subTest(group=group['id']):
                self.assertIn(group['rights_status'], STATUSES)
                if group['rights_status'] == 'unreviewed':
                    self.assertTrue(group['missing'])
                if group['rights_status'] == 'license_text_bundled':
                    self.assertTrue((ROOT / group['license_file']).is_file())

    def test_image_count_matches_files_and_source_register(self):
        group = next(g for g in GROUPS if g['id'] == 'catalog-images')
        files = list((ROOT / 'assets/images/catalog').glob('*'))
        sources = json.loads(
            (ROOT / group['register']).read_text(encoding='utf-8'))['images']
        self.assertEqual(group['count'], len(files))
        self.assertEqual(group['count'], len(sources))

    def _release_errors(self, register):
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            'release_metadata', ROOT / 'scripts/release_metadata.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        data = json.loads(
            (ROOT / 'metadata/app-store.en-US.json').read_text(encoding='utf-8'))
        status = json.loads(
            (ROOT / 'docs/specs/release-status.json').read_text(encoding='utf-8'))
        import tempfile
        import shutil
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'docs/specs').mkdir(parents=True)
            (root / 'docs/specs/asset-provenance.json').write_text(
                json.dumps(register), encoding='utf-8')
            return module.validate(data, status, release=True, root=root)

    def test_release_check_refuses_every_unreviewed_group(self):
        errors = self._release_errors(REGISTER)
        for group in GROUPS:
            if group['rights_status'] == 'unreviewed':
                self.assertTrue(
                    any(f'asset rights unreviewed: {group["id"]}' in e
                        for e in errors), group['id'])
        self.assertFalse(any('font-roboto' in e and 'unreviewed' in e
                             for e in errors))

    def test_a_reviewed_or_bundled_group_cannot_still_list_gaps(self):
        register = {'groups': [
            {'id': 'a', 'paths': ['x'], 'rights_status': 'reviewed',
             'missing': ['review date']},
            {'id': 'b', 'paths': ['y'], 'rights_status': 'license_text_bundled',
             'missing': ['source']},
        ]}
        errors = self._release_errors(register)
        self.assertTrue(any('asset rights incomplete: a' in e for e in errors))
        self.assertTrue(any('asset rights incomplete: b' in e for e in errors))

    def test_not_shipped_cannot_hide_real_files_and_empty_is_refused(self):
        errors = self._release_errors({'groups': [
            {'id': 'c', 'paths': ['assets/x.png'], 'rights_status': 'not_shipped'},
        ]})
        self.assertTrue(any('not shipped but lists files: c' in e for e in errors))
        errors = self._release_errors({'groups': []})
        self.assertTrue(any('no groups' in e for e in errors))

    def test_fully_reviewed_register_passes_the_rights_check(self):
        errors = self._release_errors({'groups': [
            {'id': 'a', 'paths': ['x'], 'rights_status': 'reviewed', 'missing': []},
            {'id': 'n', 'paths': [], 'rights_status': 'not_shipped'},
        ]})
        self.assertFalse(any('asset rights' in e or 'provenance' in e
                             for e in errors))


if __name__ == '__main__':
    unittest.main()
