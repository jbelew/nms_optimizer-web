import unittest

from scripts.ralph.adapters import FakeCommandRunnerAdapter
from scripts.ralph.gate import VerificationGate, distill_gate_output, strip_ansi


class TestGate(unittest.TestCase):
    def test_strip_ansi(self):
        colored = "\x1b[31mError:\x1b[0m \x1b[1mCritical failure\x1b[0m"
        self.assertEqual(strip_ansi(colored), "Error: Critical failure")

    def test_distill_gate_output_filters_passing_tests(self):
        raw = """
EXECUTE > test
✓ test 1 passed [10ms]
✓ test 2 passed [5ms]
PASS src/test.ts
Error: Expected 1 to equal 2
  at src/test.ts:42
"""
        distilled = distill_gate_output(raw)
        self.assertNotIn("✓ test 1", distilled)
        self.assertNotIn("✓ test 2", distilled)
        self.assertNotIn("PASS src/test.ts", distilled)
        self.assertIn("Error: Expected 1 to equal 2", distilled)
        self.assertIn("at src/test.ts:42", distilled)

    def test_distill_gate_output_truncates_cascades(self):
        long_output = "\n".join([f"Compiler error line {i}" for i in range(150)])
        distilled = distill_gate_output(long_output, max_lines=50)
        self.assertIn("Compiler error line 0", distilled)
        self.assertIn("Compiler error line 49", distilled)
        self.assertNotIn("Compiler error line 50", distilled)
        self.assertIn("[100 lines truncated to save context tokens]", distilled)

    def test_verify_success(self):
        runner = FakeCommandRunnerAdapter()
        runner.set_response("bunx lefthook run pre-commit", 0, stdout="All checks passed")
        gate = VerificationGate(runner=runner)

        result = gate.verify()
        self.assertTrue(result.passed)
        self.assertEqual(result.exit_code, 0)
        self.assertIn("All checks passed", result.output)
        self.assertEqual(result.distilled_output, "")

    def test_verify_failure_produces_distilled_output(self):
        runner = FakeCommandRunnerAdapter()
        runner.set_response(
            "bunx lefthook run pre-commit",
            1,
            stdout="\x1b[32m✓ 10 tests passed\x1b[0m\n\x1b[31mError in file.ts: line 10\x1b[0m",
            stderr="",
        )
        gate = VerificationGate(runner=runner)

        result = gate.verify()
        self.assertFalse(result.passed)
        self.assertEqual(result.exit_code, 1)
        self.assertNotIn("✓ 10 tests passed", result.distilled_output)
        self.assertIn("Error in file.ts: line 10", result.distilled_output)
        self.assertNotIn("\x1b[31m", result.distilled_output)


if __name__ == "__main__":
    unittest.main()
