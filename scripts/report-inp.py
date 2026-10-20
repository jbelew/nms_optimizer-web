#!/usr/bin/env python3
"""
CLI utility to query and report Google Analytics 4 INP performance metrics.

Queries the GA4 Data API using the local service account credentials,
reporting high-level device averages, release version breakdowns, and detailed
interaction-target attribution breakdowns (input delay, processing duration,
presentation delay).
"""

import argparse
import sys
from dataclasses import dataclass
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


@dataclass(frozen=True)
class SubpartStats:
    """Aggregated INP attribution subpart timings in milliseconds."""

    input_delay: float = 0.0
    processing_duration: float = 0.0
    presentation_delay: float = 0.0

    @property
    def total(self) -> float:
        return self.input_delay + self.processing_duration + self.presentation_delay


@dataclass(frozen=True)
class ReportContext:
    """Shared GA4 query context for INP reporting sections."""

    client: BetaAnalyticsDataClient
    property_id: str
    days: int
    device_filter: str
    version_filter: Optional[str] = None

    @property
    def property_path(self) -> str:
        return f"properties/{self.property_id}"

    @property
    def date_ranges(self) -> list[DateRange]:
        return [DateRange(start_date=f"{self.days}daysAgo", end_date="today")]

    @property
    def base_filter(self) -> FilterExpression:
        return get_base_inp_filter(self.device_filter, self.version_filter)


def format_status(val_ms: float) -> str:
    """Format millisecond latency with Core Web Vitals rating colors."""
    if val_ms <= 0:
        return f"{val_ms:.0f}ms"
    if val_ms <= 200:
        return f"{GREEN}{val_ms:.0f}ms (Good){RESET}"
    if val_ms <= 500:
        return f"{YELLOW}{val_ms:.0f}ms (Needs Imp){RESET}"
    return f"{RED}{val_ms:.0f}ms (Poor){RESET}"


def format_padded_status(val_ms: float, width: int = 22) -> str:
    """Format status string padded to a fixed visible column width."""
    status_str = format_status(val_ms)
    if val_ms <= 0:
        plain_len = len(f"{val_ms:.0f}ms")
    elif val_ms <= 200:
        plain_len = len(f"{val_ms:.0f}ms (Good)")
    elif val_ms <= 500:
        plain_len = len(f"{val_ms:.0f}ms (Needs Imp)")
    else:
        plain_len = len(f"{val_ms:.0f}ms (Poor)")
    extra_padding = " " * max(0, width - plain_len)
    return f"{status_str}{extra_padding}"


def format_ms(val_ms: float) -> str:
    """Format a positive millisecond timing or '-' when zero/unavailable."""
    return f"{val_ms:.0f}ms" if val_ms > 0 else "-"


def resolve_effective_inp(avg_val: float, sub: Optional[SubpartStats]) -> tuple[float, str, str, str]:
    """
    Resolve effective INP latency and formatted subpart strings.

    When historical multi-report sessions emitted non-positive delta values,
    falls back to the sum of positive attribution subparts.
    """
    if not sub:
        return avg_val, "-", "-", "-"

    effective_avg = avg_val if avg_val > 0 or sub.total <= 0 else sub.total
    return (
        effective_avg,
        format_ms(sub.input_delay),
        format_ms(sub.processing_duration),
        format_ms(sub.presentation_delay),
    )


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
        "--version",
        default=None,
        help="Filter by app version, e.g. v8.4.2 or 8.4.2 (default: all versions)",
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


def normalize_version(version: Optional[str]) -> Optional[str]:
    """Normalize a version string to match GA4 app_version format (e.g. 'v8.4.2')."""
    if not version:
        return None
    trimmed = version.strip()
    if not trimmed:
        return None
    if trimmed[0].isdigit():
        return f"v{trimmed}"
    return trimmed


def parse_semver_key(version_str: str) -> tuple:
    """Parse a version string like 'v8.4.2' into a sortable tuple."""
    cleaned = version_str.lstrip("vV")
    parts = cleaned.split(".")
    nums = []
    for p in parts:
        try:
            nums.append(int(p))
        except ValueError:
            nums.append(-1)
    return tuple(nums)


def get_base_inp_filter(
    device_filter: str, version_filter: Optional[str] = None
) -> FilterExpression:
    """Constructs the base dimension filter for INP events."""
    expressions = [
        FilterExpression(
            filter=Filter(
                field_name="customEvent:metric_name",
                string_filter=Filter.StringFilter(value="INP"),
            )
        )
    ]

    if device_filter != "all":
        expressions.append(
            FilterExpression(
                filter=Filter(
                    field_name="deviceCategory",
                    string_filter=Filter.StringFilter(value=device_filter),
                )
            )
        )

    normalized_ver = normalize_version(version_filter)
    if normalized_ver:
        expressions.append(
            FilterExpression(
                filter=Filter(
                    field_name="customEvent:app_version",
                    string_filter=Filter.StringFilter(value=normalized_ver),
                )
            )
        )

    if len(expressions) == 1:
        return expressions[0]

    return FilterExpression(
        and_group=FilterExpressionList(expressions=expressions)
    )


def fetch_subpart_map(
    ctx: ReportContext, dimension_names: list[str]
) -> dict[str, SubpartStats]:
    """Query custom attribution subpart metrics keyed by colon-joined dimension values."""
    subparts: dict[str, SubpartStats] = {}
    try:
        sub_req = RunReportRequest(
            property=ctx.property_path,
            dimensions=[Dimension(name=name) for name in dimension_names],
            metrics=[
                Metric(name="averageCustomEvent:input_delay"),
                Metric(name="averageCustomEvent:processing_duration"),
                Metric(name="averageCustomEvent:presentation_delay"),
            ],
            date_ranges=ctx.date_ranges,
            dimension_filter=ctx.base_filter,
        )
        sub_resp = ctx.client.run_report(sub_req)
        for row in sub_resp.rows:
            key = ":".join(d.value for d in row.dimension_values)
            subparts[key] = SubpartStats(
                input_delay=float(row.metric_values[0].value) if row.metric_values[0].value else 0.0,
                processing_duration=float(row.metric_values[1].value) if row.metric_values[1].value else 0.0,
                presentation_delay=float(row.metric_values[2].value) if row.metric_values[2].value else 0.0,
            )
    except Exception:
        pass
    return subparts


def report_device_summary(ctx: ReportContext) -> None:
    """Queries and prints high-level INP summary grouped by device category."""
    print(f"\n{BOLD}{CYAN}📊 INP Overview by Device Category (Last {ctx.days} days){RESET}\n")

    overview_req = RunReportRequest(
        property=ctx.property_path,
        dimensions=[Dimension(name="deviceCategory")],
        metrics=[
            Metric(name="eventCount"),
            Metric(name="averageCustomEvent:value"),
        ],
        date_ranges=ctx.date_ranges,
        dimension_filter=ctx.base_filter,
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="eventCount"), desc=True)],
    )
    overview_resp = ctx.client.run_report(overview_req)

    if not overview_resp.rows:
        print("  No INP data recorded in this period.")
        return

    subpart_data = fetch_subpart_map(ctx, ["deviceCategory"])

    header = (
        f"{'Device':<10} | {'Interactions':<12} | {'Avg INP':<22} | "
        f"{'Input Delay':<12} | {'Processing':<12} | {'Presentation':<12}"
    )
    print(header)
    print("-" * 88)

    for row in overview_resp.rows:
        device = row.dimension_values[0].value
        count = int(row.metric_values[0].value)
        raw_avg = float(row.metric_values[1].value) if row.metric_values[1].value else 0.0

        avg_val, input_str, proc_str, pres_str = resolve_effective_inp(
            raw_avg, subpart_data.get(device)
        )
        padded_status = format_padded_status(avg_val)

        print(
            f"{device:<10} | {count:<12} | {padded_status} | "
            f"{input_str:<12} | {proc_str:<12} | {pres_str:<12}"
        )


def report_version_summary(ctx: ReportContext) -> None:
    """Queries and prints INP summary grouped by app_version and device category."""
    print(f"\n{BOLD}{CYAN}📦 INP Breakdown by App Version (Last {ctx.days} days){RESET}\n")

    dimensions = ["customEvent:app_version", "deviceCategory"]
    req = RunReportRequest(
        property=ctx.property_path,
        dimensions=[Dimension(name=name) for name in dimensions],
        metrics=[
            Metric(name="eventCount"),
            Metric(name="averageCustomEvent:value"),
        ],
        date_ranges=ctx.date_ranges,
        dimension_filter=ctx.base_filter,
    )
    resp = ctx.client.run_report(req)

    if not resp.rows:
        print("  No versioned INP data recorded in this period.")
        return

    subpart_data = fetch_subpart_map(ctx, dimensions)

    header = (
        f"{'Version':<10} | {'Device':<10} | {'Interactions':<12} | {'Avg INP':<22} | "
        f"{'Input Delay':<12} | {'Processing':<12} | {'Presentation':<12}"
    )
    print(header)
    print("-" * 101)

    sorted_rows = sorted(
        resp.rows,
        key=lambda r: (
            parse_semver_key(r.dimension_values[0].value or "0.0.0"),
            int(r.metric_values[0].value),
        ),
        reverse=True,
    )

    for row in sorted_rows:
        raw_ver = row.dimension_values[0].value
        ver = raw_ver or "(not set)"
        device = row.dimension_values[1].value
        count = int(row.metric_values[0].value)
        raw_avg = float(row.metric_values[1].value) if row.metric_values[1].value else 0.0

        avg_val, input_str, proc_str, pres_str = resolve_effective_inp(
            raw_avg, subpart_data.get(f"{raw_ver}:{device}")
        )
        padded_status = format_padded_status(avg_val)

        print(
            f"{ver:<10} | {device:<10} | {count:<12} | {padded_status} | "
            f"{input_str:<12} | {proc_str:<12} | {pres_str:<12}"
        )


def report_target_breakdown(ctx: ReportContext, limit: int) -> None:
    """Queries and prints detailed breakdown by interaction target selector."""
    print(f"\n{BOLD}{CYAN}🎯 INP Attribution by Interaction Target (Top {limit}){RESET}\n")

    dimensions = [
        "deviceCategory",
        "customEvent:interaction_target",
        "customEvent:interaction_type",
    ]
    request = RunReportRequest(
        property=ctx.property_path,
        dimensions=[Dimension(name=name) for name in dimensions],
        metrics=[
            Metric(name="eventCount"),
            Metric(name="averageCustomEvent:value"),
        ],
        date_ranges=ctx.date_ranges,
        dimension_filter=ctx.base_filter,
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="eventCount"), desc=True)],
        limit=limit,
    )

    response = ctx.client.run_report(request)

    if not response.rows:
        print("  No target element data available yet.")
        return

    target_subparts = fetch_subpart_map(ctx, dimensions)

    header = (
        f"{'Device':<8} | {'Type':<8} | {'Interactions':<12} | {'Avg INP':<22} | "
        f"{'Input':<8} | {'Proc':<8} | {'Pres':<8} | {'Target Element Selector'}"
    )
    print(header)
    print("-" * 112)

    has_attributed_rows = False
    for row in response.rows:
        device = row.dimension_values[0].value
        raw_target = row.dimension_values[1].value
        target = raw_target if raw_target else "(not set / prior to attribution deploy)"
        raw_itype = row.dimension_values[2].value
        itype = raw_itype or "-"
        count = int(row.metric_values[0].value)
        raw_avg = float(row.metric_values[1].value) if row.metric_values[1].value else 0.0

        avg_val, input_str, proc_str, pres_str = resolve_effective_inp(
            raw_avg, target_subparts.get(f"{device}:{raw_target}:{raw_itype}")
        )

        if raw_target:
            has_attributed_rows = True

        padded_status = format_padded_status(avg_val)

        print(
            f"{device:<8} | {itype:<8} | {count:<12} | {padded_status} | "
            f"{input_str:<8} | {proc_str:<8} | {pres_str:<8} | {target}"
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
    ctx = ReportContext(
        client=client,
        property_id=args.property,
        days=args.days,
        device_filter=args.device,
        version_filter=args.version,
    )
    ver_label = normalize_version(args.version) or "all"

    print(f"{BOLD}Google Analytics 4 — Real User INP Telemetry{RESET}")
    print(
        f"Property: {ctx.property_path} | Range: Last {ctx.days} days | "
        f"Device: {ctx.device_filter} | Version: {ver_label}"
    )

    try:
        report_device_summary(ctx)
        report_version_summary(ctx)
        report_target_breakdown(ctx, args.limit)
    except Exception as err:
        print(f"\n❌ Error querying GA4 Data API: {err}")
        sys.exit(1)


if __name__ == "__main__":
    main()
