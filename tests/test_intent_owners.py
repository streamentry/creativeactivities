"""Every hub has one intent owner (or is listed as held or awaiting a decision) (SEO-008)."""
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/specs/global/intent-owners.md'
HUBS = ROOT / 'site/src/content/hubs'
PAGES = ROOT / 'site/src/pages'
GUIDES = ROOT / 'site/src/content/guides'
CARDS = ROOT / 'site/src/content/activity-cards'
DECISION = 'maintainer decision'


def section(text, heading, level='##'):
    """Lines under `heading`, up to the next heading of the same or higher level."""
    lines = text.splitlines()
    start = lines.index(f'{level} {heading}')
    body = []
    for line in lines[start + 1:]:
        if re.match(rf'^#{{1,{len(level) - 1}}} ', line) or line.startswith(f'{level} '):
            break
        body.append(line)
    return body


def hub_ids():
    return sorted(p.relative_to(HUBS).with_suffix('').as_posix()
                  for p in HUBS.rglob('*.md'))


def hub_path(hub_id):
    return f'/{hub_id}/'


def is_held(hub_id):
    text = (HUBS / f'{hub_id}.md').read_text(encoding='utf-8')
    return re.search(r'^indexable:\s*false\s*$', text, re.M) is not None


def path_resolves(path):
    """True when a route path has a page, hub, guide or activity card behind it."""
    if path == '/':
        return (PAGES / 'index.astro').is_file()
    rel = path.strip('/')
    candidates = [PAGES / f'{rel}.astro', PAGES / rel / 'index.astro',
                  HUBS / f'{rel}.md', GUIDES / f'{rel}.md']
    if rel.startswith('activity/') and rel.count('/') == 1:
        candidates.append(CARDS / f'{rel.split("/")[1]}.md')
    return any(c.is_file() for c in candidates)


def table_rows(text):
    rows = []
    for line in section(text, 'Intent table'):
        if not line.startswith('|') or set(line) <= set('|- '):
            continue
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        if cells[0] == 'Intent':
            continue
        rows.append(cells)
    return rows


def bullet_paths(lines):
    return [m.group(1) for line in lines
            if (m := re.match(r'^- `(/[^`]*)`', line))]


class IntentOwnerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text = DOC.read_text(encoding='utf-8')
        cls.rows = table_rows(cls.text)
        cls.held = bullet_paths(section(cls.text, 'Held from search', level='###'))
        cls.awaiting = bullet_paths(section(cls.text, 'Awaiting a maintainer decision', level='###'))

    def test_table_rows_have_five_cells(self):
        self.assertGreaterEqual(len(self.rows), 20)
        for cells in self.rows:
            with self.subTest(intent=cells[0]):
                self.assertEqual(len(cells), 5)

    def test_every_owner_is_a_path_that_exists_or_a_decision(self):
        for cells in self.rows:
            owner = cells[1]
            with self.subTest(intent=cells[0]):
                if owner == DECISION:
                    continue
                self.assertRegex(owner, r'^`(/[^`]*)`$')
                self.assertTrue(path_resolves(owner.strip('`')), owner)

    def test_every_backticked_route_in_the_document_exists(self):
        for path in sorted({p for p in re.findall(r'`(/[^`\s]*)`', self.text) if '<' not in p}):
            with self.subTest(path=path):
                self.assertTrue(path_resolves(path), path)

    def test_no_intent_is_listed_twice(self):
        intents = [cells[0] for cells in self.rows]
        self.assertEqual(len(intents), len(set(intents)))

    def test_every_hub_has_one_owner_row_or_is_listed_as_held_or_awaiting(self):
        owners = [cells[1].strip('`') for cells in self.rows if cells[1] != DECISION]
        ids = hub_ids()
        self.assertGreaterEqual(len(ids), 10)
        for hub in ids:
            path = hub_path(hub)
            count = owners.count(path)
            with self.subTest(hub=hub):
                self.assertLessEqual(count, 1, f'{path} owns {count} rows')
                if count == 1:
                    self.assertNotIn(path, self.held + self.awaiting)
                else:
                    self.assertIn(path, self.held + self.awaiting, f'{path} has no owner row or listing')

    def test_held_list_matches_the_indexable_flag(self):
        held_ids = {p.strip('/') for p in self.held}
        self.assertEqual(sorted(held_ids), sorted(h for h in hub_ids() if is_held(h)))
        for path in self.held:
            with self.subTest(path=path):
                self.assertTrue(path_resolves(path), path)

    def test_awaiting_hubs_are_not_held_and_have_no_owner_row(self):
        owners = [cells[1].strip('`') for cells in self.rows]
        for path in self.awaiting:
            with self.subTest(path=path):
                hub = path.strip('/')
                self.assertIn(hub, hub_ids())
                self.assertFalse(is_held(hub), f'{path} is held; list it under Held from search')
                self.assertNotIn(path, owners)

    def test_held_hubs_have_no_owner_row(self):
        owners = [cells[1].strip('`') for cells in self.rows]
        for path in self.held:
            with self.subTest(path=path):
                self.assertNotIn(path, owners)


if __name__ == '__main__':
    unittest.main()
