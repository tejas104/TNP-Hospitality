"""Regression mutations run in scratch copies; no application checks or dispatch."""
from pathlib import Path
import shutil
import tempfile
import unittest
from bootstrap_policy import validate_policy

ROOT = Path(__file__).resolve().parents[2]


class PolicyRegression(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="tnp-policy-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        shutil.copytree(ROOT / "docs", self.root / "docs")
        shutil.copyfile(ROOT / "TNP-START-HERE.md", self.root / "TNP-START-HERE.md")

    def mutate(self, name, before, after):
        p = self.root / name
        text = p.read_text(encoding="utf-8")
        self.assertIn(before, text)
        p.write_text(text.replace(before, after), encoding="utf-8")

    def rejected(self, text):
        self.assertTrue(any(text in x for x in validate_policy(self.root)), validate_policy(self.root))

    def test_current_policy(self):
        self.assertEqual([], validate_policy(self.root))

    def test_old_phase_dependency(self):
        self.mutate("docs/tasks/TNP-A-01.md", "Dependencies: TNP-FOUND-01.", "Dependencies: TNP-S1.")
        self.rejected("Initial consumer must depend")

    def test_unknown_foundation_name(self):
        self.mutate("docs/tasks/TNP-D-01.md", "Dependencies: TNP-FOUND-01.", "Dependencies: TNP-FOUND-99.")
        self.rejected("Missing dependency task: TNP-FOUND-99")

    def test_missing_foundation(self):
        (self.root / "docs/tasks/TNP-FOUND-01.md").unlink()
        self.rejected("Foundation milestone missing")

    def test_phase_dispatch(self):
        self.mutate("docs/tasks/TNP-S1.md", "Dispatchable: NO;", "Dispatchable: YES;")
        self.rejected("Phase must be non-dispatchable")

    def test_stale_candidate(self):
        self.mutate("docs/STATUS.md", "tnp-bootstrap-review-04", "tnp-bootstrap-review-03")
        self.rejected("Active candidate/model/milestone marker mismatch")

    def test_stale_reviewer(self):
        self.mutate("docs/INTEGRATION.md", "independent Sol", "independent Astra")
        self.rejected("Obsolete live reviewer")

    def test_cycle(self):
        self.mutate("docs/tasks/TNP-FOUND-01.md", "Dependencies: TNP-BOOT-01.", "Dependencies: TNP-A-01.")
        self.rejected("Dependency cycle")

    def test_i01_stale_dependency(self):
        self.mutate("docs/contracts/I01-INTEGRATED-PREVIEW.md", "Dependencies: integrated TNP-FOUND-01,", "Dependencies: integrated S0, S1,")
        self.rejected("I01 must depend")

    def test_policy_wrong_model(self):
        self.mutate("docs/OPERATING-POLICY.json", '"architecture_reviewer": "Sol"', '"architecture_reviewer": "Astra"')
        self.rejected("user-approved Sonnet/Sol")


if __name__ == "__main__":
    unittest.main(verbosity=2)
