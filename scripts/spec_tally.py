#!/usr/bin/env python3
"""Counts the global spec index and keeps the tally in docs/specs/COMPLETION.md equal to it.

The index (docs/specs/global/id-index.tsv) is the record: one row per item with a phase (S1 to S4) and a
status (exists, partial or new). The tally table in COMPLETION.md is derived from it, never typed by hand.

Usage:
    python3 scripts/spec_tally.py            print the tally table
    python3 scripts/spec_tally.py --check    exit 1 when COMPLETION.md differs from the index
    python3 scripts/spec_tally.py --write    rewrite the table in COMPLETION.md from the index

After a merge conflict in the tally, run --write instead of choosing a side.
"""

from __future__ import annotations

import csv
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "docs/specs/global/id-index.tsv"
COMPLETION = ROOT / "docs/specs/COMPLETION.md"

PHASES = ("S1", "S2", "S3", "S4")
STATUSES = ("exists", "partial", "new")

# The heading line and table that COMPLETION.md keeps for the global index.
HEADING = re.compile(r"^### Global index \(`global/id-index\.tsv`, [\d,]+ items\)$", re.MULTILINE)
TABLE = re.compile(r"^\| Phase \| exists \| partial \| new \| total \|\n(?:\|.*\|\n)+", re.MULTILINE)


def read_index(path: Path = INDEX) -> list[dict[str, str]]:
    """Every row of the index. A phase or status outside the known values is an error, never skipped."""
    with path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle, delimiter="\t"))
    for row in rows:
        if row["phase"] not in PHASES:
            raise ValueError(f"{row['id']}: unknown phase {row['phase']!r}")
        if row["status"] not in STATUSES:
            raise ValueError(f"{row['id']}: unknown status {row['status']!r}")
    return rows


def tally(rows: list[dict[str, str]]) -> dict[str, dict[str, int]]:
    """Counts by phase and status, with every phase and status present even when zero."""
    counts = {phase: {status: 0 for status in STATUSES} for phase in PHASES}
    for row in rows:
        counts[row["phase"]][row["status"]] += 1
    return counts


def render_table(counts: dict[str, dict[str, int]]) -> str:
    lines = ["| Phase | exists | partial | new | total |", "| --- | --- | --- | --- | --- |"]
    for phase in PHASES:
        c = counts[phase]
        lines.append(f"| {phase} | {c['exists']} | {c['partial']} | {c['new']} | {sum(c.values())} |")
    totals = {status: sum(counts[phase][status] for phase in PHASES) for status in STATUSES}
    lines.append(
        f"| **All** | **{totals['exists']}** | **{totals['partial']}** | **{totals['new']}** | **{sum(totals.values())}** |"
    )
    return "\n".join(lines) + "\n"


def render_heading(total: int) -> str:
    return f"### Global index (`global/id-index.tsv`, {total} items)"


def apply(markdown: str, rows: list[dict[str, str]]) -> str:
    """The markdown with its global index heading and table rebuilt from the rows."""
    if not HEADING.search(markdown) or not TABLE.search(markdown):
        raise ValueError("COMPLETION.md has no global index heading and tally table to update")
    updated = HEADING.sub(render_heading(len(rows)), markdown, count=1)
    return TABLE.sub(lambda _m: render_table(tally(rows)), updated, count=1)


def main(argv: list[str]) -> int:
    rows = read_index()
    if "--check" in argv or "--write" in argv:
        current = COMPLETION.read_text(encoding="utf-8")
        expected = apply(current, rows)
        if "--write" in argv:
            if expected != current:
                COMPLETION.write_text(expected, encoding="utf-8")
                print("Rewrote the tally in docs/specs/COMPLETION.md")
            return 0
        if expected != current:
            print("The tally in docs/specs/COMPLETION.md is out of date: run `python3 scripts/spec_tally.py --write`", file=sys.stderr)
            return 1
        return 0
    print(render_heading(len(rows)))
    print()
    print(render_table(tally(rows)), end="")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
