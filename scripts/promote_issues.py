#!/usr/bin/env python3
import json
import re
import subprocess
import sys

def log(msg):
    print(msg, file=sys.stderr)

def run_command(cmd):
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if result.returncode != 0:
        log(f"Error running command {' '.join(cmd)}: {result.stderr}")
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
    log("Checking for unblocked issues to promote/demote...")
    
    # Get all open issues with their number, title, body, and labels
    cmd = ["gh", "issue", "list", "--state", "open", "--json", "number,title,body,labels", "--limit", "100"]
    output = run_command(cmd)
    if not output:
        sys.exit(1)

    try:
        open_issues = json.loads(output)
    except json.JSONDecodeError as e:
        log(f"Failed to parse issues JSON: {e}")
        sys.exit(1)

    # Sort issues by number ascending to ensure stable chronological processing order
    open_issues.sort(key=lambda x: x["number"])

    open_issue_numbers = {issue["number"] for issue in open_issues}
    promoted_any = False
    updated_issues = []

    for issue in open_issues:
        number = issue["number"]
        title = issue.get("title") or ""
        body = issue.get("body") or ""
        labels = [l["name"] for l in issue.get("labels", [])]

        is_spec = title.lower().startswith("spec:") or number == 717
        blockers = extract_blockers(body)
        active_blockers = [b for b in blockers if b in open_issue_numbers]

        # Determine if it should have the ready-for-agent label
        should_have_label = not is_spec and not active_blockers and number != 717
        has_label = "ready-for-agent" in labels

        if has_label and not should_have_label:
            reason = "is a spec issue" if is_spec else f"is blocked by open issues: {active_blockers}"
            log(f"Issue #{number} ({title}) should not be ready (reason: {reason}). Removing 'ready-for-agent'...")
            edit_cmd = ["gh", "issue", "edit", str(number), "--remove-label", "ready-for-agent"]
            if run_command(edit_cmd) is not None:
                labels = [l for l in labels if l != "ready-for-agent"]
                promoted_any = True
        elif not has_label and should_have_label:
            log(f"Issue #{number} ({title}) is unblocked. Promoting to 'ready-for-agent'...")
            edit_cmd = ["gh", "issue", "edit", str(number), "--add-label", "ready-for-agent"]
            if run_command(edit_cmd) is not None:
                labels.append("ready-for-agent")
                promoted_any = True
        elif not should_have_label:
            # It doesn't have the label and shouldn't have it (e.g. it remains blocked)
            if active_blockers:
                log(f"Issue #{number} ({title}) remains blocked by: {active_blockers}")

        issue["labels"] = [{"name": name} for name in labels]
        updated_issues.append(issue)

    if not promoted_any:
        log("No label updates needed.")

    if "--next" in sys.argv:
        # Find the first open issue that has 'ready-for-agent' label
        next_issue = None
        for issue in updated_issues:
            labels = [l["name"] for l in issue["labels"]]
            if "ready-for-agent" in labels:
                next_issue = issue
                break
        
        if next_issue:
            out = {
                "number": next_issue["number"],
                "title": next_issue["title"],
                "body": next_issue.get("body") or ""
            }
            print(json.dumps(out))
        else:
            print("null")

if __name__ == "__main__":
    main()
