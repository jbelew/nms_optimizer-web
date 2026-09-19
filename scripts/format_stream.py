#!/usr/bin/env python3
"""
Format NDJSON stream from `agy --output-format stream-json` into human-readable terminal output.
"""

import json
import sys
from typing import Any, Dict

CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
GRAY = "\033[90m"
BOLD = "\033[1m"
RESET = "\033[0m"


def format_tool_detail(tool_name: str, params: Dict[str, Any]) -> str:
    """Extract a concise, human-readable summary of tool arguments."""
    if not params:
        return ""
    if tool_name == "run_command":
        cmd = params.get("CommandLine", "")
        return f"\033[93m{cmd}\033[0m"
    if tool_name in ("view_file", "replace_file_content", "write_to_file"):
        path = params.get("AbsolutePath") or params.get("TargetFile") or ""
        return path
    if tool_name == "grep_search":
        query = params.get("Query", "")
        path = params.get("SearchPath", "")
        return f"query='{query}' in {path}"
    if tool_name == "find_by_name":
        pattern = params.get("Pattern", "")
        dir_path = params.get("SearchDirectory", "")
        return f"pattern='{pattern}' in {dir_path}"
    if tool_name == "ask_question":
        return "Prompting user for decision..."
    if tool_name == "send_message":
        recip = params.get("Recipient", "")
        return f"to={recip}"

    # Default fallback: show first short string parameter
    for k, v in params.items():
        if isinstance(v, str) and len(v) < 100:
            return f"{k}={v}"
    return ""


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(line_buffering=True)

    is_streaming_text = False
    success = True

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            data = json.loads(line)
        except json.JSONDecodeError:
            # Print non-JSON lines directly
            print(line)
            continue

        event = data.get("event")

        if event == "init":
            conv_id = data.get("conversation_id", "")
            print(f"{GRAY}🚀 Session initialized (Conversation ID: {conv_id}){RESET}")

        elif event == "step_update":
            update = data.get("step_update", {})
            step_type = update.get("step_type")
            state = update.get("state")

            if step_type == "tool":
                if is_streaming_text:
                    print()
                    is_streaming_text = False

                tool_name = update.get("tool_name") or update.get("tool_info", {}).get("name", "tool")
                tool_info = update.get("tool_info", {})
                params = tool_info.get("parameters", {})

                if state == "ACTIVE":
                    detail = format_tool_detail(tool_name, params)
                    print(f"{CYAN}🔧 [{tool_name}]{RESET} {detail}")
                elif state == "DONE":
                    dur = update.get("duration_seconds", 0)
                    print(f"   {GRAY}↳ completed in {dur:.2f}s{RESET}")

            elif step_type == "agent_response":
                text_delta = update.get("text_delta")
                if text_delta:
                    if not is_streaming_text:
                        print(f"{BOLD}💬 Agent:{RESET} ", end="")
                        is_streaming_text = True
                    print(text_delta, end="", flush=True)
                elif state == "DONE" and not is_streaming_text:
                    dur = update.get("duration_seconds", 0)
                    thinking = update.get("usage", {}).get("thinking_tokens", 0)
                    if thinking > 0:
                        print(f"{GRAY}🤖 Thinking... ({dur:.1f}s, {thinking} tokens){RESET}")

        elif event == "result":
            if is_streaming_text:
                print()
                is_streaming_text = False

            res = data.get("result", {})
            status = res.get("status", "UNKNOWN")
            dur = res.get("duration_seconds", 0)
            usage = res.get("usage", {})
            total_tokens = usage.get("total_tokens", 0)

            if status == "SUCCESS":
                print(f"\n{GREEN}{BOLD}✅ Session completed successfully in {dur:.1f}s (Tokens: {total_tokens:,}){RESET}")
            else:
                success = False
                print(f"\n{RED}{BOLD}❌ Session finished with status '{status}' in {dur:.1f}s{RESET}")

    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()
