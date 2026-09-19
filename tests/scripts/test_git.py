import unittest

from scripts.ralph.adapters import FakeCommandRunnerAdapter
from scripts.ralph.git import commit, format_commit_message, has_staged_changes, stage_all


class TestGit(unittest.TestCase):
    def test_format_commit_message_short_title(self):
        title = "feat: add supercharged slot calculation"
        msg = format_commit_message(title, 42, max_header=95)
        self.assertEqual(msg, "feat: add supercharged slot calculation (#42)")

    def test_format_commit_message_long_title_truncated_at_word_boundary(self):
        title = (
            "fix: ensure the responsive mobile navigation drawer closes cleanly "
            "when switching tabs and scrolling through the full inventory grid view"
        )
        msg = format_commit_message(title, 123, max_header=95)
        header = msg.split("\n\n")[0]
        self.assertLessEqual(len(header), 95)
        self.assertTrue(header.endswith("... (#123)"))
        self.assertIn(title, msg)

    def test_format_commit_message_exact_max_header(self):
        suffix = " (#1)"
        needed_title_len = 95 - len(suffix)
        title = "a" * needed_title_len
        msg = format_commit_message(title, 1, max_header=95)
        self.assertEqual(msg, f"{title}{suffix}")

    def test_stage_all(self):
        runner = FakeCommandRunnerAdapter()
        runner.set_response("git add .", 0)
        self.assertTrue(stage_all(runner))
        self.assertEqual(runner.recorded_commands[0][0], ["git", "add", "."])

    def test_has_staged_changes(self):
        runner = FakeCommandRunnerAdapter()
        # git diff --cached --quiet returns 1 when there ARE staged changes
        runner.set_response("git diff --cached --quiet", 1)
        self.assertTrue(has_staged_changes(runner))

        # git diff --cached --quiet returns 0 when clean
        runner.set_response("git diff --cached --quiet", 0)
        self.assertFalse(has_staged_changes(runner))

    def test_commit(self):
        runner = FakeCommandRunnerAdapter()
        runner.set_response("git commit -m test message", 0)
        self.assertTrue(commit("test message", runner))
        self.assertEqual(runner.recorded_commands[0][0], ["git", "commit", "-m", "test message"])


if __name__ == "__main__":
    unittest.main()
