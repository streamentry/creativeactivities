#!/usr/bin/env python3
"""Print the image rights report from docs/specs/asset-provenance.json (PLAT-003).

Stdlib only. Lists every website image record (site_images) and every shipped
asset group (groups) by rights_status, and counts the records that have no
recorded creator or license, or are still unreviewed. A text is counted as
missing when it is empty or says "not recorded" or "not yet".
"""
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTER = ROOT / 'docs/specs/asset-provenance.json'
MISSING_MARKERS = ('not recorded', 'not yet')


def missing(text) -> bool:
    if not text or not str(text).strip():
        return True
    lowered = str(text).lower()
    return any(marker in lowered for marker in MISSING_MARKERS)


def report(register: dict) -> str:
    lines = []
    images = register.get('site_images', [])
    lines.append(f'Website images: {len(images)} records')
    lines.append('  by rights_status:')
    for status, n in sorted(Counter(i.get('rights_status') for i in images).items()):
        lines.append(f'    {status}: {n}')
    lines.append('  by kind:')
    for kind, n in sorted(Counter(i.get('kind') for i in images).items()):
        lines.append(f'    {kind}: {n}')
    lines.append(f'  missing creator: {sum(missing(i.get("creator")) for i in images)}')
    lines.append(f'  missing license: {sum(missing(i.get("licence")) for i in images)}')
    lines.append(f'  unreviewed: {sum(i.get("rights_status") == "unreviewed" for i in images)}')
    lines.append(f'  with sha256: {sum(bool(i.get("sha256")) for i in images)}')
    lines.append(f'  with alt text (including decorative ""): {sum(i.get("alt") is not None for i in images)}')
    groups = register.get('groups', [])
    lines.append('')
    lines.append(f'Shipped asset groups: {len(groups)}')
    for status, n in sorted(Counter(g.get('rights_status') for g in groups).items()):
        lines.append(f'    {status}: {n}')
    for group in groups:
        lines.append(f'  {group["id"]}: {group.get("rights_status")}')
    return '\n'.join(lines)


def main() -> None:
    print(report(json.loads(REGISTER.read_text(encoding='utf-8'))))


if __name__ == '__main__':
    main()
