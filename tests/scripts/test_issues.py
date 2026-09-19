import unittest

from scripts.ralph.adapters import FakeIssueTrackerAdapter
from scripts.ralph.issues import (
    IssueLifecycle,
    check_all_tasks,
    extract_blockers,
    extract_parent_issue,
)


class TestIssues(unittest.TestCase):
    def test_extract_blockers(self):
        body = """
## Summary
Some issue summary

## Blocked by
- #101
- Blocked by #102 and #103

## Next Steps
- #999 should not be a blocker
"""
        blockers = extract_blockers(body)
        self.assertEqual(blockers, [101, 102, 103])

    def test_extract_parent_issue(self):
        body1 = "Part of #738\n\nSome description"
        self.assertEqual(extract_parent_issue(body1), 738)

        body2 = "Parent: #456\nDetails..."
        self.assertEqual(extract_parent_issue(body2), 456)

        body3 = "Parent issue:\n#123"
        self.assertEqual(extract_parent_issue(body3), 123)

        body4 = "No parent specified here"
        self.assertIsNone(extract_parent_issue(body4))

    def test_check_all_tasks(self):
        body = """
## Acceptance Criteria
- [ ] Task 1
- [x] Task 2
- [ ] Task 3
"""
        updated = check_all_tasks(body)
        self.assertNotIn("- [ ]", updated)
        self.assertEqual(updated.count("- [x]"), 3)

    def test_promote_and_demote_issues(self):
        initial = [
            {"number": 1, "title": "Spec: Main feature", "body": "", "labels": ["ready-for-agent"]},
            {"number": 2, "title": "Blocked task", "body": "## Blocked by\n#3", "labels": ["ready-for-agent"]},
            {"number": 3, "title": "Unblocked task", "body": "", "labels": []},
            {"number": 717, "title": "Special untracked issue", "body": "", "labels": ["ready-for-agent"]},
        ]
        adapter = FakeIssueTrackerAdapter(initial)
        lifecycle = IssueLifecycle(adapter)

        updated = lifecycle.promote_all(log_output=False)
        self.assertIn(1, updated)  # demoted because spec
        self.assertIn(2, updated)  # demoted because #3 is open
        self.assertIn(3, updated)  # promoted because unblocked

        # Check issue #3 now has ready-for-agent
        issue_3 = adapter.get_issue(3)
        self.assertTrue(any(l.get("name") == "ready-for-agent" for l in issue_3.get("labels", [])))

        # Check issue #1 and #2 had ready-for-agent removed
        issue_1 = adapter.get_issue(1)
        self.assertFalse(any(l.get("name") == "ready-for-agent" for l in issue_1.get("labels", [])))

    def test_get_issue_context_with_parent_spec(self):
        initial = [
            {"number": 10, "title": "Epic Spec", "body": "Spec specifications and details."},
            {
                "number": 11,
                "title": "Subtask",
                "body": "Part of #10\nSubtask body",
                "comments": ["Context comment 1", "Context comment 2"],
            },
        ]
        adapter = FakeIssueTrackerAdapter(initial)
        lifecycle = IssueLifecycle(adapter)

        issue = lifecycle.get_issue_context(11)
        self.assertIsNotNone(issue)
        self.assertEqual(issue.number, 11)
        self.assertEqual(issue.parent_number, 10)
        self.assertIn("### Parent Spec #10: Epic Spec", issue.parent_spec)
        self.assertEqual(len(issue.comments), 2)

    def test_claim_and_complete(self):
        initial = [
            {
                "number": 20,
                "title": "Task with checklist",
                "body": "- [ ] Step 1\n- [ ] Step 2",
                "labels": [{"name": "ready-for-agent"}],
            }
        ]
        adapter = FakeIssueTrackerAdapter(initial)
        lifecycle = IssueLifecycle(adapter)

        lifecycle.claim(20, assignee="@me")
        self.assertIn("@me", adapter.get_issue(20).get("assignees", []))

        lifecycle.complete(20, comment="All steps done.")
        self.assertIn(20, adapter.closed_issues)
        self.assertEqual(adapter.closed_issues[20], "All steps done.")
        self.assertNotIn("- [ ]", adapter.get_issue(20)["body"])


if __name__ == "__main__":
    unittest.main()
