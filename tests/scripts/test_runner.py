import unittest

from scripts.ralph.adapters import (
    FakeAgentRunnerAdapter,
    FakeCommandRunnerAdapter,
    FakeIssueTrackerAdapter,
)
from scripts.ralph.agent import AgentClient
from scripts.ralph.gate import VerificationGate, VerificationResult
from scripts.ralph.issues import IssueLifecycle
from scripts.ralph.runner import TaskRunner


class MockGate:
    def __init__(self, sequence):
        self.sequence = list(sequence)
        self.call_count = 0

    def verify(self):
        self.call_count += 1
        if self.sequence:
            return self.sequence.pop(0)
        return VerificationResult(passed=True, output="Default pass", exit_code=0)


class TestRunner(unittest.TestCase):
    def test_run_explicit_issue_success(self):
        issues = [
            {
                "number": 50,
                "title": "feat: test issue",
                "body": "- [ ] implement feature",
                "labels": ["ready-for-agent"],
            }
        ]
        issue_adapter = FakeIssueTrackerAdapter(issues)
        lifecycle = IssueLifecycle(issue_adapter)

        cmd_runner = FakeCommandRunnerAdapter()
        cmd_runner.set_response("git diff --cached --quiet", 1)  # Staged changes exist
        cmd_runner.set_response("git commit", 0)

        agent_adapter = FakeAgentRunnerAdapter(should_succeed=True)
        agent = AgentClient(agent_adapter)

        gate = MockGate([VerificationResult(passed=True, output="OK", exit_code=0)])

        runner = TaskRunner(
            lifecycle=lifecycle,
            gate=gate,
            agent=agent,
            cmd_runner=cmd_runner,
        )

        exit_code = runner.run(issue_number=50)
        self.assertEqual(exit_code, 0)
        self.assertEqual(gate.call_count, 1)
        self.assertEqual(len(agent_adapter.recorded_runs), 1)
        self.assertFalse(agent_adapter.recorded_runs[0]["continue_session"])
        self.assertEqual(agent_adapter.recorded_runs[0]["effort"], "high")
        self.assertIn(50, issue_adapter.closed_issues)

    def test_run_with_verification_retry(self):
        issues = [
            {
                "number": 51,
                "title": "fix: bug in calculation",
                "body": "Fix the bug",
                "labels": ["ready-for-agent"],
            }
        ]
        issue_adapter = FakeIssueTrackerAdapter(issues)
        lifecycle = IssueLifecycle(issue_adapter)

        cmd_runner = FakeCommandRunnerAdapter()
        cmd_runner.set_response("git diff --cached --quiet", 1)
        cmd_runner.set_response("git commit", 0)

        agent_adapter = FakeAgentRunnerAdapter(should_succeed=True)
        agent = AgentClient(agent_adapter)

        gate = MockGate([
            VerificationResult(
                passed=False,
                output="Raw verbose output\n✓ 10 tests passed",
                exit_code=1,
                distilled_output="Distilled failure error",
            ),
            VerificationResult(passed=True, output="Clean", exit_code=0),
        ])

        runner = TaskRunner(
            lifecycle=lifecycle,
            gate=gate,
            agent=agent,
            cmd_runner=cmd_runner,
        )

        exit_code = runner.run(issue_number=51, max_retries=3)
        self.assertEqual(exit_code, 0)
        self.assertEqual(gate.call_count, 2)
        self.assertEqual(len(agent_adapter.recorded_runs), 2)
        # Initial run should be high effort
        self.assertEqual(agent_adapter.recorded_runs[0]["effort"], "high")
        # Second run should be remediation (continue_session=True) with low effort
        self.assertTrue(agent_adapter.recorded_runs[1]["continue_session"])
        self.assertEqual(agent_adapter.recorded_runs[1]["effort"], "low")
        # Distilled output should be sent in prompt, not raw verbose output
        self.assertIn("Distilled failure error", agent_adapter.recorded_runs[1]["prompt"])
        self.assertNotIn("✓ 10 tests passed", agent_adapter.recorded_runs[1]["prompt"])

    def test_run_gate_max_retries_exceeded(self):
        issues = [
            {
                "number": 52,
                "title": "refactor: broken gate",
                "body": "Some task",
                "labels": ["ready-for-agent"],
            }
        ]
        issue_adapter = FakeIssueTrackerAdapter(issues)
        lifecycle = IssueLifecycle(issue_adapter)

        cmd_runner = FakeCommandRunnerAdapter()
        agent_adapter = FakeAgentRunnerAdapter(should_succeed=True)
        agent = AgentClient(agent_adapter)

        gate = MockGate([
            VerificationResult(passed=False, output="Fail 1", exit_code=1, distilled_output="Fail 1"),
            VerificationResult(passed=False, output="Fail 2", exit_code=1, distilled_output="Fail 2"),
        ])

        runner = TaskRunner(
            lifecycle=lifecycle,
            gate=gate,
            agent=agent,
            cmd_runner=cmd_runner,
        )

        exit_code = runner.run(issue_number=52, max_retries=2)
        self.assertEqual(exit_code, 1)
        self.assertEqual(gate.call_count, 2)
        self.assertNotIn(52, issue_adapter.closed_issues)

    def test_run_no_ready_issues(self):
        issue_adapter = FakeIssueTrackerAdapter([])
        lifecycle = IssueLifecycle(issue_adapter)
        runner = TaskRunner(lifecycle=lifecycle)

        exit_code = runner.run(issue_number=None)
        self.assertEqual(exit_code, 0)


if __name__ == "__main__":
    unittest.main()
