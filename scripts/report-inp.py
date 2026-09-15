#!/usr/bin/env python3
"""
CLI utility to query and report Google Analytics 4 INP performance metrics.

Queries the GA4 Data API using the local service account credentials,
reporting high-level device averages and detailed interaction-target
attribution breakdowns (input delay, processing duration, presentation delay).
"""

import argparse
import os
import sys
from pathlib import Path
from typing import Optional

try:
    from google.oauth2 import service_account
    from google.analytics.data_v1beta import BetaAnalyticsDataClient
    from google.analytics.data_v1beta.types import (
        DateRange,
        Dimension,
        Metric,
        OrderBy,
        RunReportRequest,
        Filter,
        FilterExpression,
        FilterExpressionList,
    )
except ImportError:
    print(
        "❌ Error: Required Google Analytics libraries not found in current Python environment.\n"
        "Please run this script using the virtual environment:\n"
        "  ./venv/bin/python scripts/report-inp.py\n"
        "or via Bun:\n"
        "  bun run perf:inp"
    )
    sys.exit(1)

DEFAULT_PROPERTY_ID = "484727815"
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
DEFAULT_KEY_PATH = PROJECT_ROOT / ".gemini" / "analytics-key.json"

# ANSI color codes for terminal formatting
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


def format_status(val_ms: float) -> str:
    """Format millisecond latency with Core Web Vitals rating colors."""
    if val_ms <= 0:
        return f"{val_ms:.0f}ms"
    if val_ms <= 200:
        return f"{GREEN}{val_ms:.0f}ms (Good){RESET}"
    if val_ms <= 500:
        return f"{YELLOW}{val_ms:.0f}ms (Needs Imp){RESET}"
    return f"{RED}{val_ms:.0f}ms (Poor){RESET}"


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Report Google Analytics 4 INP (Interaction to Next Paint) attribution data."
    )
    parser.add_argument(
        "--days",
        type=int,
        default=7,
        help="Number of days to analyze (default: 7)",
    )
    parser.add_argument(
        "--device",
        choices=["all", "mobile", "desktop", "tablet"],
        default="all",
        help="Filter by device category (default: all)",
    )
    parser.add_argument(
        "--property",
        default=DEFAULT_PROPERTY_ID,
        help=f"GA4 Property ID (default: {DEFAULT_PROPERTY_ID})",
    )
    parser.add_argument(
        "--credentials",
        type=Path,
        default=DEFAULT_KEY_PATH,
        help=f"Path to service account JSON key (default: {DEFAULT_KEY_PATH})",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=25,
        help="Maximum interaction targets to display (default: 25)",
    )
    return parser.parse_args()


def create_client(key_path: Path) -> BetaAnalyticsDataClient:
    if not key_path.exists():
        print(f"❌ Error: Service account key not found at: {key_path}")
        sys.exit(1)

    credentials = service_account.Credentials.from_service_account_file(
        str(key_path),
        scopes=["https://www.googleapis.com/auth/analytics.readonly"],
    )
    return BetaAnalyticsDataClient(credentials=credentials)


def get_base_inp_filter(device_filter: str) -> FilterExpression:
    """Constructs the base dimension filter for INP events."""
    metric_filter = Filter(
        field_name="customEvent:metric_name",
        string_filter=Filter.StringFilter(value="INP"),
    )

    if device_filter == "all":
        return FilterExpression(filter=metric_filter)

    device_cond = Filter(
        field_name="deviceCategory",
        string_filter=Filter.StringFilter(value=device_filter),
    )
    return FilterExpression(
        and_group=FilterExpressionList(
            expressions=[
                FilterExpression(filter=metric_filter),
                FilterExpression(filter=device_cond),
            ]
        )
    )


def report_device_summary(
    client: BetaAnalyticsDataClient,
    property_id: str,
    days: int,
    device_filter: str,
) -> None:
    """Queries and prints high-level INP summary grouped by device category."""
    print(f"\n{BOLD}{CYAN}📊 INP Overview by Device Category (Last {days} days){RESET}\n")

    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="deviceCategory")],
        metrics=[
            Metric(name="eventCount"),
            Metric(name="averageCustomEvent:value"),
            Metric(name="averageCustomEvent:input_delay"),
            Metric(name="averageCustomEvent:processing_duration"),
            Metric(name="averageCustomEvent:presentation_delay"),
        ],
        date_ranges=[DateRange(start_date=f"{days}daysAgo", end_date="today")],
        dimension_filter=get_base_inp_filter(device_filter),
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="eventCount"), desc=True)],
    )

    response = client.run_report(request)

    if not response.rows:
        print("  No INP data recorded in this period.")
        return

    header = (
        f"{'Device':<10} | {'Interactions':<12} | {'Avg INP':<22} | "
        f"{'Input Delay':<12} | {'Processing':<12} | {'Presentation':<12}"
    )
    print(header)
    print("-" * 88)

    for row in response.rows:
        device = row.dimension_values[0].value
        count = int(row.metric_values[0].value)
        avg_val = float(row.metric_values[1].value) if row.metric_values[1].value else 0.0
        avg_input = float(row.metric_values[2].value) if row.metric_values[2].value else 0.0
        avg_proc = float(row.metric_values[3].value) if row.metric_values[3].value else 0.0
        avg_pres = float(row.metric_values[4].value) if row.metric_values[4].value else 0.0

        status_str = format_status(avg_val)
        # Pad formatting considering ANSI escape codes
        plain_len = len(f"{avg_val:.0f}ms (Needs Imp)") if 200 < avg_val <= 500 else len(f"{avg_val:.0f}ms (Good)")
        extra_padding = " " * max(0, 22 - plain_len)

        print(
            f"{device:<10} | {count:<12} | {status_str}{extra_padding} | "
            f"{avg_input:<10.0f}ms | {avg_proc:<10.0f}ms | {avg_pres:<10.0f}ms"
        )


def report_target_breakdown(
    client: BetaAnalyticsDataClient,
    property_id: str,
    days: int,
    device_filter: str,
    limit: int,
) -> None:
    """Queries and prints detailed breakdown by interaction target selector."""
    print(f"\n{BOLD}{CYAN}🎯 INP Attribution by Interaction Target (Top {limit}){RESET}\n")

    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[
            Dimension(name="deviceCategory"),
            Dimension(name="customEvent:interaction_target"),
            Dimension(name="customEvent:interaction_type"),
        ],
        metrics=[
            Metric(name="eventCount"),
            Metric(name="averageCustomEvent:value"),
            Metric(name="averageCustomEvent:input_delay"),
            Metric(name="averageCustomEvent:processing_duration"),
            Metric(name="averageCustomEvent:presentation_delay"),
        ],
        date_ranges=[DateRange(start_date=f"{days}daysAgo", end_date="today")],
        dimension_filter=get_base_inp_filter(device_filter),
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="eventCount"), desc=True)],
        limit=limit,
    )

    response = client.run_report(request)

    if not response.rows:
        print("  No target element data available yet.")
        return

    header = (
        f"{'Device':<8} | {'Type':<7} | {'Interactions':<12} | {'Avg INP':<22} | "
        f"{'Input':<8} | {'Proc':<8} | {'Pres':<8} | {'Target Element Selector'}"
    )
    print(header)
    print("-" * 110)

    has_attributed_rows = False
    for row in response.rows:
        device = row.dimension_values[0].value
        target = row.dimension_values[1].value or "(not set / prior to attribution deploy)"
        itype = row.dimension_values[2].value or "-"
        count = int(row.metric_values[0].value)
        avg_val = float(row.metric_values[1].value) if row.metric_values[1].value else 0.0
        avg_input = float(row.metric_values[2].value) if row.metric_values[2].value else 0.0
        avg_proc = float(row.metric_values[3].value) if row.metric_values[3].value else 0.0
        avg_pres = float(row.metric_values[4].value) if row.metric_values[4].value else 0.0

        if target != "(not set / prior to attribution deploy)":
            has_attributed_rows = True

        status_str = format_status(avg_val)
        plain_len = len(f"{avg_val:.0f}ms (Needs Imp)") if 200 < avg_val <= 500 else len(f"{avg_val:.0f}ms (Good)")
        extra_padding = " " * max(0, 22 - plain_len)

        print(
            f"{device:<8} | {itype:<7} | {count:<12} | {status_str}{extra_padding} | "
            f"{avg_input:<6.0f}ms | {avg_proc:<6.0f}ms | {avg_pres:<6.0f}ms | {target}"
        )

    if not has_attributed_rows:
        print(
            f"\n💡 {YELLOW}Note:{RESET} Rows showing '(not set)' reflect traffic recorded before deploying\n"
            "web-vitals/attribution. As users interact with the newly deployed build, this table\n"
            "will automatically populate with exact DOM elements and subpart timings."
        )


def main() -> None:
    args = parse_arguments()
    client = create_client(args.credentials)

    print(f"{BOLD}Google Analytics 4 — Real User INP Telemetry{RESET}")
    print(f"Property: properties/{args.property} | Range: Last {args.days} days | Device: {args.device}")

    try:
        report_device_summary(client, args.property, args.days, args.device)
        report_target_breakdown(client, args.property, args.days, args.device, args.limit)
    except Exception as err:
        print(f"\n❌ Error querying GA4 Data API: {err}")
        sys.exit(1)


if __name__ == "__main__":
    main()
