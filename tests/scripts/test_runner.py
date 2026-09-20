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

    def _create_runner(
        self,
        issues,
        agent_succeeds=True,
        cmd_runner=None,
    ):
        issue_adapter = FakeIssueTrackerAdapter(issues)
        lifecycle = IssueLifecycle(issue_adapter)
        cmd_runner = cmd_runner or FakeCommandRunnerAdapter()
        agent_adapter = FakeAgentRunnerAdapter(should_succeed=agent_succeeds)
        agent = AgentClient(agent_adapter)
        gate = MockGate([VerificationResult(passed=True, output="OK", exit_code=0)])
        runner = TaskRunner(
            lifecycle=lifecycle,
            gate=gate,
            agent=agent,
            cmd_runner=cmd_runner,
        )
        return runner, issue_adapter, gate, cmd_runner

    def test_run_commit_failure(self):
        issues = [
            {
                "number": 53,
                "title": "fix: commit error",
                "body": "Some task",
                "labels": ["ready-for-agent"],
            }
        ]
        cmd_runner = FakeCommandRunnerAdapter()
        cmd_runner.set_response("git diff --cached --quiet", 1)
        cmd_runner.set_response("git commit", 1, stderr="error: failed to commit")

        runner, issue_adapter, _, _ = self._create_runner(issues, cmd_runner=cmd_runner)

        exit_code = runner.run(issue_number=53)
        self.assertEqual(exit_code, 1)
        self.assertNotIn(53, issue_adapter.closed_issues)

    def test_run_initial_agent_failure(self):
        issues = [
            {
                "number": 54,
                "title": "fix: agent crash",
                "body": "Some task",
                "labels": ["ready-for-agent"],
            }
        ]
        runner, issue_adapter, gate, _ = self._create_runner(issues, agent_succeeds=False)

        exit_code = runner.run(issue_number=54)
        self.assertEqual(exit_code, 1)
        self.assertEqual(gate.call_count, 0)
        self.assertNotIn(54, issue_adapter.closed_issues)

    def test_run_no_staged_changes_to_commit(self):
        issues = [
            {
                "number": 55,
                "title": "fix: clean tree no changes",
                "body": "Some task",
                "labels": ["ready-for-agent"],
            }
        ]
        # Default response has exit code 0 for git diff --cached --quiet (no staged changes)
        runner, issue_adapter, gate, _ = self._create_runner(issues)

        exit_code = runner.run(issue_number=55)
        self.assertEqual(exit_code, 1)
        self.assertEqual(gate.call_count, 1)
        self.assertNotIn(55, issue_adapter.closed_issues)

    def test_parse_issue_number(self):
        from scripts.ralph_runner import parse_issue_number

        self.assertEqual(parse_issue_number("773"), 773)
        self.assertEqual(parse_issue_number("#773"), 773)

    def test_cli_agent_adapter_build_cmd_defaults(self):
        from scripts.ralph.adapters import CliAgentRunnerAdapter

        adapter = CliAgentRunnerAdapter(project_dir="/tmp/test")
        cmd_initial = adapter.build_cmd("implement issue", continue_session=False, effort="high")
        self.assertIn("--model=gemini-3.8-flash", cmd_initial)
        self.assertIn("--effort=high", cmd_initial)
        self.assertNotIn("--continue", cmd_initial)

        cmd_remediate = adapter.build_cmd("fix error", continue_session=True, effort="low")
        self.assertIn("--model=gemini-3.8-flash", cmd_remediate)
        self.assertIn("--effort=low", cmd_remediate)
        self.assertIn("--continue", cmd_remediate)

    def test_cli_agent_adapter_build_cmd_model_overrides(self):
        from scripts.ralph.adapters import CliAgentRunnerAdapter

        adapter = CliAgentRunnerAdapter(project_dir="/tmp/test")
        # Model with baked-in effort should not get --effort added
        cmd_baked = adapter.build_cmd(
            "implement issue",
            effort="high",
            extra_args=['--model="Gemini 3.8 Flash (High)"'],
        )
        self.assertNotIn("--effort=high", cmd_baked)
        self.assertNotIn("--model=gemini-3.8-flash", cmd_baked)

        # Base model without baked-in effort should receive --effort
        cmd_base = adapter.build_cmd(
            "implement issue",
            effort="high",
            extra_args=["--model=gemini-3.7-flash"],
        )
        self.assertIn("--effort=high", cmd_base)

        # Explicit effort override in extra_args should not get duplicate --effort
        cmd_effort_override = adapter.build_cmd(
            "implement issue",
            effort="high",
            extra_args=["--effort=medium"],
        )
        self.assertNotIn("--effort=high", cmd_effort_override)
        self.assertIn("--effort=medium", cmd_effort_override)


if __name__ == "__main__":
    unittest.main()
