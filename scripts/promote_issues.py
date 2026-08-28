#!/usr/bin/env python3
import json
import re
import subprocess
import sys

def run_command(cmd):
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if result.returncode != 0:
        print(f"Error running command {' '.join(cmd)}: {result.stderr}", file=sys.stderr)
        return None
    return result.stdout

def extract_blockers(body):
    lines = body.splitlines()
    in_blocked_section = False
    blockers = []
    for line in lines:
        line_strip = line.strip()
        if not line_strip:
            continue
        # Check if we hit a new section header (ignoring the Blocked by header itself)
        if line_strip.startswith("##") or line_strip.startswith("#"):
            if "blocked by" in line_strip.lower():
                in_blocked_section = True
                continue
            else:
                in_blocked_section = False
        if in_blocked_section:
            # Extract issue numbers
            matches = re.findall(r"#(\d+)", line_strip)
            for m in matches:
                blockers.append(int(m))
    return blockers

def main():
    print("Checking for unblocked issues to promote...")
    
    # Get all open issues with their number, body, and labels
    cmd = ["gh", "issue", "list", "--state", "open", "--json", "number,body,labels", "--limit", "100"]
    output = run_command(cmd)
    if not output:
        sys.exit(1)

    try:
        open_issues = json.loads(output)
    except json.JSONDecodeError as e:
        print(f"Failed to parse issues JSON: {e}", file=sys.stderr)
        sys.exit(1)

    open_issue_numbers = {issue["number"] for issue in open_issues}
    promoted_any = False

    for issue in open_issues:
        number = issue["number"]
        body = issue.get("body") or ""
        labels = [l["name"] for l in issue.get("labels", [])]

        if "ready-for-agent" in labels:
            continue

        blockers = extract_blockers(body)

        # If it's not blocked by any currently open issue, it is unblocked
        active_blockers = [b for b in blockers if b in open_issue_numbers]

        if blockers and not active_blockers:
            print(f"Issue #{number} is no longer blocked (blockers {blockers} are closed). Promoting to 'ready-for-agent'...")
            edit_cmd = ["gh", "issue", "edit", str(number), "--add-label", "ready-for-agent"]
            if run_command(edit_cmd) is not None:
                promoted_any = True
        elif not blockers:
            # No blockers specified and not labeled yet
            # (Skip parent issue #717 which shouldn't be picked up by agents)
            if number == 717:
                continue
            print(f"Issue #{number} has no blockers. Promoting to 'ready-for-agent'...")
            edit_cmd = ["gh", "issue", "edit", str(number), "--add-label", "ready-for-agent"]
            if run_command(edit_cmd) is not None:
                promoted_any = True
        else:
            print(f"Issue #{number} remains blocked by open issues: {active_blockers}")

    if not promoted_any:
        print("No new issues promoted.")

if __name__ == "__main__":
    main()
