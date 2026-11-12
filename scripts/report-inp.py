#!/usr/bin/env python3
"""
CLI utility to query and report Core Web Vitals (default: INP) from the GA4 BigQuery export.

Aligns with ADR-0003:
- Deduplicates daily (`events_*`) and intraday (`events_intraday_*`) table overlap.
- Filters to production traffic (`nms-optimizer.app`, `www.nms-optimizer.app`, and
  production server-relayed Measurement Protocol events).
- Partitions by `(user_pseudo_id, metric_name, metric_instance_key)` using cumulative
  latest-snapshot resolution for `v8.4.3+` INP/LCP/FCP/TTFB and delta summation for CLS
  and legacy pre-`v8.4.3` INP.
- Reports true `p50`, `p75`, `p90`, and `% > Good` alongside a 28-day Google Search /
  CrUX Readiness Banner (`Android + Chrome` mobile vs. `Desktop + Chrome`).
"""

import argparse
import os
import re
import sys
from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

try:
    from google.cloud import bigquery
    from google.oauth2 import service_account
except ImportError:
    print(
        "❌ Error: Required Google Cloud BigQuery libraries not found in current Python environment.\n"
        "Please run this script using the virtual environment:\n"
        "  ./venv/bin/python scripts/report-inp.py\n"
        "or via Bun:\n"
        "  bun run perf:inp"
    )
    sys.exit(1)

DEFAULT_PROJECT_ID = "cosmic-inkwell-467922-v5"
DEFAULT_DATASET_ID = "analytics_484727815"
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
DEFAULT_KEY_PATH = PROJECT_ROOT / ".gemini" / "analytics-key.json"

NON_PROD_HOST_REGEX = (
    r"^https?://(localhost|127\.0\.0\.1|0\.0\.0\.0|([^/?#:]+\.)?(pages\.dev|herokuapp\.com))([:/?#]|$)"
)
SAFE_SQL_TOKEN_RE = re.compile(r"^[A-Za-z0-9_.\-]+$")

# ANSI color codes for terminal formatting
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

METRIC_THRESHOLDS: dict[str, tuple[float, float]] = {
    "INP": (200.0, 500.0),
    "LCP": (2500.0, 4000.0),
    "CLS": (100.0, 250.0),
    "FCP": (1800.0, 3000.0),
    "TTFB": (800.0, 1800.0),
}

ANSI_ESCAPE_RE = re.compile(r"\x1b\[[0-9;]*m")


@dataclass(frozen=True)
class ReportContext:
    """Shared BigQuery reporting context for Core Web Vitals queries."""

    client: bigquery.Client
    dataset_fqn: str
    days: int
    device_filter: str
    metric_name: str = "INP"
    version_filter: Optional[str] = None

    @property
    def good_threshold(self) -> float:
        return METRIC_THRESHOLDS.get(self.metric_name, (200.0, 500.0))[0]


def format_status(val_ms: float, metric_name: str = "INP") -> str:
    """Format metric value with Core Web Vitals rating colors."""
    good_max, needs_imp_max = METRIC_THRESHOLDS.get(metric_name, (200.0, 500.0))
    unit = "" if metric_name == "CLS" else "ms"
    if val_ms <= 0:
        return f"{val_ms:.0f}{unit}"
    if val_ms <= good_max:
        return f"{GREEN}{val_ms:.0f}{unit} (Good){RESET}"
    if val_ms <= needs_imp_max:
        return f"{YELLOW}{val_ms:.0f}{unit} (Needs Imp){RESET}"
    return f"{RED}{val_ms:.0f}{unit} (Poor){RESET}"


def format_padded_status(val_ms: float, metric_name: str = "INP", width: int = 21) -> str:
    """Format status string padded to a fixed visible column width."""
    status_str = format_status(val_ms, metric_name)
    plain_len = len(ANSI_ESCAPE_RE.sub("", status_str))
    extra_padding = " " * max(0, width - plain_len)
    return f"{status_str}{extra_padding}"


def format_ms(val_ms: Optional[float], metric_name: str = "INP") -> str:
    """Format a positive millisecond timing (or raw CLS score*1000) or '-' when unavailable."""
    if val_ms is None or val_ms <= 0:
        return "-"
    unit = "" if metric_name == "CLS" else "ms"
    return f"{val_ms:.0f}{unit}"


def normalize_version(version: Optional[str]) -> Optional[str]:
    """Normalize a version string to match GA4 app_version format (e.g. 'v8.10.0')."""
    if not version:
        return None
    trimmed = version.strip()
    if not trimmed:
        return None
    if not SAFE_SQL_TOKEN_RE.match(trimmed):
        raise ValueError(f"Invalid version filter: {trimmed}")
    if trimmed[0].isdigit():
        return f"v{trimmed}"
    return trimmed


def parse_semver_key(version_str: str) -> tuple[int, ...]:
    """Parse a version string like 'v8.10.0' into a sortable integer tuple."""
    cleaned = version_str.lstrip("vV")
    nums: list[int] = []
    for part in cleaned.split("."):
        try:
            nums.append(int(part))
        except ValueError:
            nums.append(-1)
    return tuple(nums)


def parse_arguments(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    """Parse CLI options for BigQuery Core Web Vitals reporting."""
    parser = argparse.ArgumentParser(
        description="Report deduplicated BigQuery Core Web Vitals (INP) percentiles and CrUX cohorts."
    )
    parser.add_argument(
        "--days",
        type=int,
        default=7,
        help="Number of days to analyze in breakdown tables (default: 7)",
    )
    parser.add_argument(
        "--device",
        choices=["all", "crux-mobile", "crux-desktop", "mobile", "desktop", "tablet"],
        default="all",
        help="Filter by device or CrUX browser cohort (default: all)",
    )
    parser.add_argument(
        "--version",
        default=None,
        help="Filter by app version, e.g. v8.10.0 or 8.10.0 (default: all versions)",
    )
    parser.add_argument(
        "--project",
        default=DEFAULT_PROJECT_ID,
        help=f"Google Cloud project ID (default: {DEFAULT_PROJECT_ID})",
    )
    parser.add_argument(
        "--dataset",
        default=DEFAULT_DATASET_ID,
        help=f"BigQuery GA4 dataset ID (default: {DEFAULT_DATASET_ID})",
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
    parser.add_argument(
        "--metric",
        choices=["INP", "LCP", "CLS", "FCP", "TTFB"],
        default="INP",
        help="Core Web Vital metric to query (default: INP)",
    )
    return parser.parse_args(argv)


def create_bigquery_client(key_path: Path, project_id: str) -> bigquery.Client:
    """Initialize an authenticated BigQuery client."""
    env_creds = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    resolved_path = Path(env_creds) if env_creds else key_path

    if not resolved_path.exists():
        print(f"❌ Error: Service account key not found at: {resolved_path}")
        sys.exit(1)

    credentials = service_account.Credentials.from_service_account_file(str(resolved_path))
    return bigquery.Client(credentials=credentials, project=project_id)


def build_cohort_predicate(device_filter: str) -> str:
    """Return SQL predicate for the requested device or CrUX browser cohort."""
    if device_filter == "all":
        return "TRUE"
    if device_filter == "crux-mobile":
        return "device_category = 'mobile' AND os = 'Android' AND browser = 'Chrome'"
    if device_filter == "crux-desktop":
        return "device_category = 'desktop' AND browser = 'Chrome'"
    if device_filter in {"mobile", "desktop", "tablet"}:
        return f"device_category = '{device_filter}'"
    raise ValueError(f"Unsupported device filter: {device_filter}")


def build_deduped_vitals_cte(
    dataset_fqn: str,
    device_filter: str = "all",
    version_filter: Optional[str] = None,
    metric_name: str = "INP",
    days_expr: str = "@days",
) -> str:
    """
    Construct the ADR-0003 deduplicated BigQuery CTE (`deduped_vitals`) for a Web Vital metric.

    Deduplicates daily and intraday shard overlap, restricts to production hostnames,
    resolves `v8.4.3+` snapshot instances to their latest chronological event while
    summing incremental deltas for `CLS` and pre-`v8.4.3` `INP`, and applies optional
    device/CrUX and release version filters.
    """
    if not SAFE_SQL_TOKEN_RE.match(dataset_fqn):
        raise ValueError(f"Invalid dataset identifier: {dataset_fqn}")
    if metric_name not in METRIC_THRESHOLDS:
        raise ValueError(f"Unsupported metric: {metric_name}")

    normalized_ver = normalize_version(version_filter)
    cohort_sql = build_cohort_predicate(device_filter)
    version_sql = f"AND app_version = '{normalized_ver}'" if normalized_ver else ""

    return f"""
    WITH raw_source_unioned AS (
      SELECT
        event_timestamp,
        user_pseudo_id,
        device.category AS device_category,
        COALESCE(device.operating_system, '') AS os,
        COALESCE(device.web_info.browser, '') AS browser,
        device.web_info.hostname AS hostname,
        event_params
      FROM `{dataset_fqn}.events_*`
      WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL {days_expr} DAY))
          AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
        AND event_name = 'performance_metric'

      UNION ALL

      SELECT
        event_timestamp,
        user_pseudo_id,
        device.category AS device_category,
        COALESCE(device.operating_system, '') AS os,
        COALESCE(device.web_info.browser, '') AS browser,
        device.web_info.hostname AS hostname,
        event_params
      FROM `{dataset_fqn}.events_intraday_*`
      WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL {days_expr} DAY))
          AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
        AND event_name = 'performance_metric'
    ),
    raw_source AS (
      SELECT DISTINCT
        event_timestamp,
        user_pseudo_id,
        device_category,
        os,
        browser,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'metric_name') AS metric_name,
        COALESCE(
          (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'metric_id'),
          (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'label')
        ) AS metric_id,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'app_version') AS app_version,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'interaction_target') AS interaction_target,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'interaction_type') AS interaction_type,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'load_state') AS load_state,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') AS page_location,
        COALESCE(
          (SELECT COALESCE(value.int_value, value.double_value, SAFE_CAST(value.string_value AS FLOAT64))
           FROM UNNEST(event_params) WHERE key = 'metric_value'),
          (SELECT COALESCE(value.int_value, value.double_value, SAFE_CAST(value.string_value AS FLOAT64))
           FROM UNNEST(event_params) WHERE key = 'value')
        ) AS event_value,
        (SELECT COALESCE(value.int_value, value.double_value, SAFE_CAST(value.string_value AS FLOAT64))
         FROM UNNEST(event_params) WHERE key = 'input_delay') AS input_delay,
        (SELECT COALESCE(value.int_value, value.double_value, SAFE_CAST(value.string_value AS FLOAT64))
         FROM UNNEST(event_params) WHERE key = 'processing_duration') AS processing_duration,
        (SELECT COALESCE(value.int_value, value.double_value, SAFE_CAST(value.string_value AS FLOAT64))
         FROM UNNEST(event_params) WHERE key = 'presentation_delay') AS presentation_delay
      FROM raw_source_unioned
      WHERE LOWER(COALESCE(hostname, '')) IN ('', 'nms-optimizer.app', 'www.nms-optimizer.app')
    ),
    grouped_instances AS (
      SELECT
        metric_name,
        ARRAY_AGG(device_category IGNORE NULLS ORDER BY event_timestamp DESC LIMIT 1)[SAFE_OFFSET(0)] AS device_category,
        ARRAY_AGG(os IGNORE NULLS ORDER BY event_timestamp DESC LIMIT 1)[SAFE_OFFSET(0)] AS os,
        ARRAY_AGG(browser IGNORE NULLS ORDER BY event_timestamp DESC LIMIT 1)[SAFE_OFFSET(0)] AS browser,
        ARRAY_AGG(app_version IGNORE NULLS ORDER BY event_timestamp DESC LIMIT 1)[SAFE_OFFSET(0)] AS app_version,
        ARRAY_AGG(interaction_target IGNORE NULLS ORDER BY event_timestamp DESC LIMIT 1)[SAFE_OFFSET(0)] AS interaction_target,
        ARRAY_AGG(interaction_type IGNORE NULLS ORDER BY event_timestamp DESC LIMIT 1)[SAFE_OFFSET(0)] AS interaction_type,
        ARRAY_AGG(load_state IGNORE NULLS ORDER BY event_timestamp DESC LIMIT 1)[SAFE_OFFSET(0)] AS load_state,
        SUM(event_value) AS delta_sum,
        ARRAY_AGG(event_value IGNORE NULLS ORDER BY event_timestamp DESC LIMIT 1)[SAFE_OFFSET(0)] AS latest_value,
        ARRAY_AGG(input_delay IGNORE NULLS ORDER BY event_timestamp DESC LIMIT 1)[SAFE_OFFSET(0)] AS input_delay,
        ARRAY_AGG(processing_duration IGNORE NULLS ORDER BY event_timestamp DESC LIMIT 1)[SAFE_OFFSET(0)] AS processing_duration,
        ARRAY_AGG(presentation_delay IGNORE NULLS ORDER BY event_timestamp DESC LIMIT 1)[SAFE_OFFSET(0)] AS presentation_delay
      FROM raw_source
      WHERE metric_name = '{metric_name}'
        AND event_value IS NOT NULL
        AND (
          page_location IS NULL
          OR page_location = ''
          OR NOT REGEXP_CONTAINS(LOWER(page_location), r'{NON_PROD_HOST_REGEX}')
        )
      GROUP BY
        user_pseudo_id,
        metric_name,
        IF(
          metric_id IS NOT NULL AND REGEXP_CONTAINS(metric_id, r'^v\\d+-\\d+-\\d+$'),
          metric_id,
          CAST(event_timestamp AS STRING)
        )
    ),
    deduped_vitals AS (
      SELECT
        device_category,
        os,
        browser,
        app_version,
        interaction_target,
        interaction_type,
        load_state,
        CASE
          WHEN metric_name = 'CLS' THEN delta_sum
          WHEN metric_name = 'INP' AND REGEXP_CONTAINS(
            COALESCE(app_version, ''),
            r'^[vV]?([0-7]\\.\\d+\\.\\d+|8\\.[0-3]\\.\\d+|8\\.4\\.[0-2])($|[^0-9.])'
          ) THEN delta_sum
          ELSE latest_value
        END AS metric_value,
        input_delay,
        processing_duration,
        presentation_delay
      FROM grouped_instances
      WHERE {cohort_sql}
        {version_sql}
    )
    """


def run_query(
    ctx: ReportContext, sql: str, days_override: Optional[int] = None
) -> list[bigquery.table.Row]:
    """Execute a parameterized BigQuery query with `@days` and `@good_max` bound."""
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("days", "INT64", days_override or ctx.days),
            bigquery.ScalarQueryParameter("good_max", "FLOAT64", ctx.good_threshold),
        ]
    )
    return list(ctx.client.query(sql, job_config=job_config).result())


def report_crux_banner(ctx: ReportContext) -> None:
    """Print 28-day Google Search Console / CrUX cohort readiness banner."""
    cte = build_deduped_vitals_cte(
        ctx.dataset_fqn,
        device_filter="all",
        version_filter=ctx.version_filter,
        metric_name=ctx.metric_name,
        days_expr="28",
    )
    good_label = f">{ctx.good_threshold:.0f}{'ms' if ctx.metric_name != 'CLS' else ''}"
    sql = f"""
    {cte}
    SELECT
      CASE
        WHEN device_category = 'mobile' AND os = 'Android' AND browser = 'Chrome'
          THEN 'CrUX Mobile (Android Chrome)'
        WHEN device_category = 'desktop' AND browser = 'Chrome'
          THEN 'CrUX Desktop (Chrome)'
        WHEN device_category = 'mobile' AND os = 'iOS'
          THEN 'iOS WebKit (Non-CrUX Mobile)'
        ELSE NULL
      END AS cohort,
      COUNT(*) AS visits,
      APPROX_QUANTILES(metric_value, 100)[OFFSET(50)] AS p50,
      APPROX_QUANTILES(metric_value, 100)[OFFSET(75)] AS p75,
      APPROX_QUANTILES(metric_value, 100)[OFFSET(90)] AS p90,
      ROUND(COUNTIF(metric_value > @good_max) * 100.0 / COUNT(*), 1) AS pct_over,
      AVG(input_delay) AS avg_in,
      AVG(processing_duration) AS avg_proc,
      AVG(presentation_delay) AS avg_pres
    FROM deduped_vitals
    WHERE metric_value > 0
    GROUP BY cohort
    HAVING cohort IS NOT NULL
    ORDER BY
      CASE cohort
        WHEN 'CrUX Mobile (Android Chrome)' THEN 1
        WHEN 'CrUX Desktop (Chrome)' THEN 2
        ELSE 3
      END
    """
    rows = run_query(ctx, sql, days_override=28)
    print(f"\n{BOLD}{CYAN}🚦 Google Search / CrUX Readiness (28-Day Rolling Window){RESET}\n")
    if not rows:
        print("  No production telemetry recorded in the last 28 days.")
        return

    header = (
        f"{'Cohort':<30} | {'Visits':<7} | {'p50':<7} | {f'p75 {ctx.metric_name}':<21} | "
        f"{'p90':<7} | {good_label:<7} | {'Input':<7} | {'Proc':<7} | {'Pres':<7}"
    )
    print(header)
    print("-" * 116)
    for row in rows:
        p75_str = format_padded_status(float(row.p75 or 0), ctx.metric_name)
        p50_str = format_ms(row.p50, ctx.metric_name)
        p90_str = format_ms(row.p90, ctx.metric_name)
        pct_str = f"{row.pct_over:.1f}%"
        in_str = format_ms(row.avg_in) if ctx.metric_name == "INP" else "-"
        proc_str = format_ms(row.avg_proc) if ctx.metric_name == "INP" else "-"
        pres_str = format_ms(row.avg_pres) if ctx.metric_name == "INP" else "-"
        print(
            f"{row.cohort:<30} | {row.visits:<7} | {p50_str:<7} | {p75_str} | "
            f"{p90_str:<7} | {pct_str:<7} | {in_str:<7} | {proc_str:<7} | {pres_str:<7}"
        )


def report_device_summary(ctx: ReportContext) -> None:
    """Print high-level percentile summary grouped by device category."""
    cte = build_deduped_vitals_cte(
        ctx.dataset_fqn,
        device_filter=ctx.device_filter,
        version_filter=ctx.version_filter,
        metric_name=ctx.metric_name,
    )
    good_label = f">{ctx.good_threshold:.0f}{'ms' if ctx.metric_name != 'CLS' else ''}"
    sql = f"""
    {cte}
    SELECT
      COALESCE(device_category, '(unknown)') AS device_category,
      COUNT(*) AS visits,
      APPROX_QUANTILES(metric_value, 100)[OFFSET(50)] AS p50,
      APPROX_QUANTILES(metric_value, 100)[OFFSET(75)] AS p75,
      APPROX_QUANTILES(metric_value, 100)[OFFSET(90)] AS p90,
      ROUND(COUNTIF(metric_value > @good_max) * 100.0 / COUNT(*), 1) AS pct_over,
      AVG(input_delay) AS avg_in,
      AVG(processing_duration) AS avg_proc,
      AVG(presentation_delay) AS avg_pres
    FROM deduped_vitals
    WHERE metric_value > 0
    GROUP BY device_category
    ORDER BY visits DESC
    """
    rows = run_query(ctx, sql)
    print(f"\n{BOLD}{CYAN}📊 {ctx.metric_name} Overview by Device Category (Last {ctx.days} days){RESET}\n")
    if not rows:
        print(f"  No {ctx.metric_name} data recorded in this period.")
        return

    header = (
        f"{'Device':<10} | {'Visits':<8} | {'p50':<7} | {f'p75 {ctx.metric_name}':<21} | "
        f"{'p90':<7} | {good_label:<7} | {'Input':<7} | {'Proc':<7} | {'Pres':<7}"
    )
    print(header)
    print("-" * 98)
    for row in rows:
        p75_str = format_padded_status(float(row.p75 or 0), ctx.metric_name)
        print(
            f"{row.device_category:<10} | {row.visits:<8} | {format_ms(row.p50, ctx.metric_name):<7} | "
            f"{p75_str} | {format_ms(row.p90, ctx.metric_name):<7} | {f'{row.pct_over:.1f}%':<7} | "
            f"{(format_ms(row.avg_in) if ctx.metric_name == 'INP' else '-'):<7} | "
            f"{(format_ms(row.avg_proc) if ctx.metric_name == 'INP' else '-'):<7} | "
            f"{(format_ms(row.avg_pres) if ctx.metric_name == 'INP' else '-'):<7}"
        )


def report_version_summary(ctx: ReportContext) -> None:
    """Print percentile breakdown grouped by app_version and device category."""
    cte = build_deduped_vitals_cte(
        ctx.dataset_fqn,
        device_filter=ctx.device_filter,
        version_filter=ctx.version_filter,
        metric_name=ctx.metric_name,
    )
    good_label = f">{ctx.good_threshold:.0f}{'ms' if ctx.metric_name != 'CLS' else ''}"
    sql = f"""
    {cte}
    SELECT
      COALESCE(app_version, '(not set)') AS app_version,
      COALESCE(device_category, '(unknown)') AS device_category,
      COUNT(*) AS visits,
      APPROX_QUANTILES(metric_value, 100)[OFFSET(50)] AS p50,
      APPROX_QUANTILES(metric_value, 100)[OFFSET(75)] AS p75,
      APPROX_QUANTILES(metric_value, 100)[OFFSET(90)] AS p90,
      ROUND(COUNTIF(metric_value > @good_max) * 100.0 / COUNT(*), 1) AS pct_over,
      AVG(input_delay) AS avg_in,
      AVG(processing_duration) AS avg_proc,
      AVG(presentation_delay) AS avg_pres
    FROM deduped_vitals
    WHERE metric_value > 0
    GROUP BY app_version, device_category
    """
    rows = run_query(ctx, sql)
    print(f"\n{BOLD}{CYAN}📦 {ctx.metric_name} Breakdown by App Version (Last {ctx.days} days){RESET}\n")
    if not rows:
        print(f"  No versioned {ctx.metric_name} data recorded in this period.")
        return

    sorted_rows = sorted(
        rows,
        key=lambda r: (parse_semver_key(r.app_version if r.app_version != "(not set)" else "0.0.0"), int(r.visits)),
        reverse=True,
    )
    header = (
        f"{'Version':<10} | {'Device':<10} | {'Visits':<7} | {'p50':<7} | "
        f"{f'p75 {ctx.metric_name}':<21} | {'p90':<7} | {good_label:<7} | {'Input':<7} | {'Proc':<7} | {'Pres':<7}"
    )
    print(header)
    print("-" * 110)
    for row in sorted_rows:
        p75_str = format_padded_status(float(row.p75 or 0), ctx.metric_name)
        print(
            f"{row.app_version:<10} | {row.device_category:<10} | {row.visits:<7} | "
            f"{format_ms(row.p50, ctx.metric_name):<7} | {p75_str} | "
            f"{format_ms(row.p90, ctx.metric_name):<7} | {f'{row.pct_over:.1f}%':<7} | "
            f"{(format_ms(row.avg_in) if ctx.metric_name == 'INP' else '-'):<7} | "
            f"{(format_ms(row.avg_proc) if ctx.metric_name == 'INP' else '-'):<7} | "
            f"{(format_ms(row.avg_pres) if ctx.metric_name == 'INP' else '-'):<7}"
        )


def report_target_breakdown(ctx: ReportContext, limit: int) -> None:
    """Print target element attribution ordered by slow-visit impact (`count > threshold`)."""
    cte = build_deduped_vitals_cte(
        ctx.dataset_fqn,
        device_filter=ctx.device_filter,
        version_filter=ctx.version_filter,
        metric_name=ctx.metric_name,
    )
    secondary_col = "interaction_type" if ctx.metric_name == "INP" else "load_state"
    secondary_label = "Type" if ctx.metric_name == "INP" else "LoadState"
    good_label = f">{ctx.good_threshold:.0f}{'ms' if ctx.metric_name != 'CLS' else ''}"

    sql = f"""
    {cte}
    SELECT
      COALESCE(device_category, '(unknown)') AS device_category,
      COALESCE(NULLIF(interaction_target, ''), '(not set)') AS target,
      COALESCE(NULLIF({secondary_col}, ''), '-') AS secondary_val,
      COUNT(*) AS visits,
      COUNTIF(metric_value > @good_max) AS slow_visits,
      ROUND(COUNTIF(metric_value > @good_max) * 100.0 / COUNT(*), 1) AS pct_over,
      APPROX_QUANTILES(metric_value, 100)[OFFSET(50)] AS p50,
      APPROX_QUANTILES(metric_value, 100)[OFFSET(75)] AS p75,
      COALESCE(AVG(IF(metric_value > @good_max, input_delay, NULL)), AVG(input_delay)) AS avg_in,
      COALESCE(AVG(IF(metric_value > @good_max, processing_duration, NULL)), AVG(processing_duration)) AS avg_proc,
      COALESCE(AVG(IF(metric_value > @good_max, presentation_delay, NULL)), AVG(presentation_delay)) AS avg_pres
    FROM deduped_vitals
    WHERE metric_value > 0
    GROUP BY device_category, target, secondary_val
    ORDER BY slow_visits DESC, visits DESC
    LIMIT {int(limit)}
    """
    rows = run_query(ctx, sql)
    print(
        f"\n{BOLD}{CYAN}🎯 {ctx.metric_name} Attribution by Target — Ranked by Slow Visits ({good_label}) (Top {limit}){RESET}\n"
    )
    if not rows:
        print("  No target element data available in this period.")
        return

    header = (
        f"{'Device':<8} | {secondary_label:<9} | {'Visits':<6} | {good_label:<12} | "
        f"{'p50':<6} | {f'p75 {ctx.metric_name}':<21} | {'Input':<6} | {'Proc':<6} | {'Pres':<6} | {'Target Element Selector'}"
    )
    print(header)
    print("-" * 124)
    for row in rows:
        p75_str = format_padded_status(float(row.p75 or 0), ctx.metric_name)
        slow_str = f"{row.slow_visits} ({row.pct_over:.0f}%)"
        print(
            f"{row.device_category:<8} | {row.secondary_val:<9} | {row.visits:<6} | {slow_str:<12} | "
            f"{format_ms(row.p50, ctx.metric_name):<6} | {p75_str} | "
            f"{(format_ms(row.avg_in) if ctx.metric_name == 'INP' else '-'):<6} | "
            f"{(format_ms(row.avg_proc) if ctx.metric_name == 'INP' else '-'):<6} | "
            f"{(format_ms(row.avg_pres) if ctx.metric_name == 'INP' else '-'):<6} | {row.target}"
        )


def main(argv: Optional[Sequence[str]] = None) -> None:
    """Entry point for CLI execution."""
    args = parse_arguments(argv)
    client = create_bigquery_client(args.credentials, args.project)
    dataset_fqn = f"{args.project}.{args.dataset}"
    ctx = ReportContext(
        client=client,
        dataset_fqn=dataset_fqn,
        days=args.days,
        device_filter=args.device,
        metric_name=args.metric,
        version_filter=args.version,
    )
    ver_label = normalize_version(args.version) or "all"

    print(f"{BOLD}BigQuery — Deduplicated Real User {ctx.metric_name} Telemetry (ADR-0003){RESET}")
    print(
        f"Dataset: {ctx.dataset_fqn} | Metric: {ctx.metric_name} | Range: Last {ctx.days} days | "
        f"Cohort: {ctx.device_filter} | Version: {ver_label}"
    )

    try:
        report_crux_banner(ctx)
        report_device_summary(ctx)
        report_version_summary(ctx)
        report_target_breakdown(ctx, args.limit)
    except Exception as err:
        print(f"\n❌ Error querying BigQuery: {err}")
        sys.exit(1)


if __name__ == "__main__":
    main()
