"""The tally in docs/specs/COMPLETION.md is derived from the index, so it cannot be mistyped."""

from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import spec_tally  # noqa: E402


def rows(*items: tuple[str, str, str]) -> list[dict[str, str]]:
    return [{"id": i, "phase": p, "status": s} for i, p, s in items]


class TallyTest(unittest.TestCase):
    def test_counts_by_phase_and_status_with_zeros_present(self) -> None:
        counts = spec_tally.tally(rows(("A-1", "S1", "exists"), ("A-2", "S2", "new"), ("A-3", "S2", "new")))
        self.assertEqual(counts["S1"], {"exists": 1, "partial": 0, "new": 0})
        self.assertEqual(counts["S2"], {"exists": 0, "partial": 0, "new": 2})
        self.assertEqual(counts["S4"], {"exists": 0, "partial": 0, "new": 0})

    def test_renders_a_table_with_row_and_column_totals(self) -> None:
        table = spec_tally.render_table(spec_tally.tally(rows(("A-1", "S1", "exists"), ("A-2", "S2", "partial"))))
        self.assertIn("| S1 | 1 | 0 | 0 | 1 |", table)
        self.assertIn("| S2 | 0 | 1 | 0 | 1 |", table)
        self.assertIn("| **All** | **1** | **1** | **0** | **2** |", table)

    def test_refuses_an_unknown_status_or_phase_instead_of_skipping_it(self) -> None:
        for bad in (("A-1", "S1", "?"), ("A-1", "S9", "new"), ("A-1", "S1", "done")):
            with tempfile.TemporaryDirectory() as tmp:
                path = Path(tmp) / "index.tsv"
                path.write_text("id\tpriority\tphase\tstatus\tfile\ttitle\n" + f"{bad[0]}\tP1\t{bad[1]}\t{bad[2]}\tf.md\tT\n", encoding="utf-8")
                with self.assertRaises(ValueError):
                    spec_tally.read_index(path)

    def test_rewrites_only_the_heading_and_table(self) -> None:
        before = (
            "intro\n\n### Global index (`global/id-index.tsv`, 1 items)\n\n"
            "| Phase | exists | partial | new | total |\n| --- | --- | --- | --- | --- |\n| S1 | 9 | 9 | 9 | 27 |\n| **All** | **9** | **9** | **9** | **27** |\n\n"
            "At the start: 55 exists.\n"
        )
        after = spec_tally.apply(before, rows(("A-1", "S1", "exists"), ("A-2", "S2", "new")))
        self.assertIn("### Global index (`global/id-index.tsv`, 2 items)", after)
        self.assertIn("| S1 | 1 | 0 | 0 | 1 |", after)
        self.assertNotIn("| S1 | 9 | 9 | 9 | 27 |", after)
        self.assertTrue(after.startswith("intro\n"))
        self.assertTrue(after.endswith("At the start: 55 exists.\n"))

    def test_applying_twice_changes_nothing(self) -> None:
        md = spec_tally.COMPLETION.read_text(encoding="utf-8")
        data = spec_tally.read_index()
        once = spec_tally.apply(md, data)
        self.assertEqual(spec_tally.apply(once, data), once)

    def test_refuses_a_file_with_no_tally_table(self) -> None:
        with self.assertRaises(ValueError):
            spec_tally.apply("# Nothing here\n", rows(("A-1", "S1", "new")))


class RealTrackerTest(unittest.TestCase):
    def test_every_index_row_has_a_known_phase_and_status(self) -> None:
        self.assertGreater(len(spec_tally.read_index()), 500)

    def test_the_tally_in_completion_md_matches_the_index(self) -> None:
        current = spec_tally.COMPLETION.read_text(encoding="utf-8")
        expected = spec_tally.apply(current, spec_tally.read_index())
        self.assertEqual(
            current,
            expected,
            "The tally in docs/specs/COMPLETION.md differs from docs/specs/global/id-index.tsv. "
            "Run `python3 scripts/spec_tally.py --write`.",
        )


if __name__ == "__main__":
    unittest.main()
