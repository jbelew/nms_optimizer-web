#!/usr/bin/env python3
"""
CLI utility to query and report external referrers, acquisition channels,
campaign parameters (utm_*, ref), and inbound Shared Grid links from the
GA4 BigQuery export (including server-side ad-blocker fallback events).
"""

import argparse
import os
import sys
from pathlib import Path

try:
    from google.cloud import bigquery
    from google.oauth2 import service_account
except ImportError:
    print(
        "❌ Error: Required Google Cloud BigQuery libraries not found in current Python environment.\n"
        "Please run this script using the virtual environment:\n"
        "  ./venv/bin/python scripts/report-referrers.py\n"
        "or via Bun:\n"
        "  bun run perf:referrers"
    )
    sys.exit(1)

DEFAULT_PROJECT_ID = "cosmic-inkwell-467922-v5"
DEFAULT_DATASET_ID = "analytics_484727815"
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
DEFAULT_KEY_PATH = PROJECT_ROOT / ".gemini" / "analytics-key.json"
SELF_REFERRER_REGEX = (
    r"^https?://((www|dev)\\.)?(nms-optimizer\\.(app|ca)|"
    r"nms-optimizer-web[^/]*\\.(pages\\.dev|herokuapp\\.com)|"
    r"localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0)"
)

# ANSI color codes for terminal formatting
GREEN = "\033[92m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


def get_bigquery_client(key_path: Path, project_id: str) -> bigquery.Client:
    """Initializes an authenticated BigQuery client."""
    env_creds = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    resolved_path = Path(env_creds) if env_creds else key_path

    if not resolved_path.exists():
        print(f"❌ Error: Service account key not found at {resolved_path}")
        sys.exit(1)

    credentials = service_account.Credentials.from_service_account_file(str(resolved_path))
    return bigquery.Client(credentials=credentials, project=project_id)


def print_external_referrers(client: bigquery.Client, table_glob: str, days: int, limit: int) -> None:
    """Queries and prints external referrers across both client and server transports."""
    print(f"{BOLD}=== Top External Referrers (Client + Server Fallback) ==={RESET}")

    query = f"""
    WITH page_views AS (
      SELECT
        user_pseudo_id,
        COALESCE(
          (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'tracking_source'),
          'client'
        ) AS tracking_source,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_referrer') AS page_referrer
      FROM `{table_glob}`
      WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY))
        AND event_name = 'page_view'
    )
    SELECT
      page_referrer,
      CASE
        WHEN REGEXP_CONTAINS(page_referrer, r'reddit\\.com|com\\.reddit\\.frontpage') THEN 'Reddit'
        WHEN REGEXP_CONTAINS(page_referrer, r'chatgpt\\.com|perplexity\\.ai|claude\\.ai|copilot\\.microsoft\\.com|gemini\\.google\\.com') THEN 'AI Assistant'
        WHEN REGEXP_CONTAINS(page_referrer, r'google\\.|bing\\.com|duckduckgo\\.com|search\\.brave\\.com|yahoo\\.|yandex\\.|ecosia\\.org|startpage\\.com|qwant\\.com|baidu\\.com') THEN 'Organic Search'
        WHEN REGEXP_CONTAINS(page_referrer, r'youtube\\.com|youtu\\.be|twitch\\.tv|steamcommunity\\.com|discord\\.com|facebook\\.com|t\\.co|x\\.com') THEN 'Social / Community'
        WHEN REGEXP_CONTAINS(page_referrer, r'github\\.com|nomanssky\\.fandom\\.com') THEN 'Docs / Wiki / Code'
        ELSE 'Other Referral'
      END AS channel_group,
      COUNT(*) AS page_views,
      COUNT(DISTINCT user_pseudo_id) AS unique_users,
      COUNTIF(tracking_source = 'client') AS client_views,
      COUNTIF(tracking_source = 'server') AS server_views
    FROM page_views
    WHERE page_referrer IS NOT NULL
      AND page_referrer != ''
      AND NOT REGEXP_CONTAINS(page_referrer, '{SELF_REFERRER_REGEX}')
    GROUP BY page_referrer, channel_group
    ORDER BY page_views DESC
    LIMIT @limit
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("days", "INT64", days),
            bigquery.ScalarQueryParameter("limit", "INT64", limit),
        ]
    )

    rows = list(client.query(query, job_config=job_config).result())
    if not rows:
        print("No external referrers found for the selected timeframe.\n")
        return

    header = (
        f"{'Referrer URL':<48} | {'Channel':<18} | {'Views':>7} | "
        f"{'Users':>7} | {'Client':>7} | {'Server':>7}"
    )
    print(header)
    print("-" * len(header))

    for row in rows:
        ref_display = (
            row.page_referrer[:45] + "..."
            if len(row.page_referrer) > 48
            else row.page_referrer
        )
        print(
            f"{ref_display:<48} | {row.channel_group:<18} | {row.page_views:>7,d} | "
            f"{row.unique_users:>7,d} | {row.client_views:>7,d} | {row.server_views:>7,d}"
        )
    print()


def print_full_path_referrers(client: bigquery.Client, table_glob: str, days: int) -> None:
    """Prints referrers that retained a non-root path or app URI beyond the origin."""
    print(f"{BOLD}=== Referrers with Specific Path / App Intent Detail ==={RESET}")

    query = f"""
    WITH page_views AS (
      SELECT
        user_pseudo_id,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_referrer') AS page_referrer
      FROM `{table_glob}`
      WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY))
        AND event_name = 'page_view'
    )
    SELECT
      page_referrer,
      COUNT(*) AS page_views,
      COUNT(DISTINCT user_pseudo_id) AS unique_users
    FROM page_views
    WHERE page_referrer IS NOT NULL
      AND page_referrer != ''
      AND NOT REGEXP_CONTAINS(page_referrer, '{SELF_REFERRER_REGEX}')
      AND (
        STARTS_WITH(page_referrer, 'android-app://')
        OR REGEXP_CONTAINS(page_referrer, r'^https?://[^/]+/.+')
      )
    GROUP BY page_referrer
    ORDER BY page_views DESC
    LIMIT 15
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("days", "INT64", days)]
    )

    rows = list(client.query(query, job_config=job_config).result())
    if not rows:
        print("No path-level or app-intent referrers recorded in this window.\n")
        return

    header = f"{'Full Referrer URI':<68} | {'Views':>7} | {'Users':>7}"
    print(header)
    print("-" * len(header))
    for row in rows:
        ref_display = (
            row.page_referrer[:65] + "..."
            if len(row.page_referrer) > 68
            else row.page_referrer
        )
        print(f"{ref_display:<68} | {row.page_views:>7,d} | {row.unique_users:>7,d}")
    print()


def print_campaign_and_shared_grid_stats(client: bigquery.Client, table_glob: str, days: int) -> None:
    """Prints explicit campaign parameters (utm_*, ref) and inbound Shared Grid (?grid=) traffic."""
    print(f"{BOLD}=== Campaign Parameters (utm_*, ref) & Shared Grid Links ==={RESET}")

    campaign_query = f"""
    WITH tagged_views AS (
      SELECT
        user_pseudo_id,
        COALESCE(
          (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_source'),
          REGEXP_EXTRACT((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location'), r'[?&]utm_source=([^&#]+)')
        ) AS utm_source,
        COALESCE(
          (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_medium'),
          REGEXP_EXTRACT((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location'), r'[?&]utm_medium=([^&#]+)')
        ) AS utm_medium,
        COALESCE(
          (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'utm_campaign'),
          REGEXP_EXTRACT((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location'), r'[?&]utm_campaign=([^&#]+)')
        ) AS utm_campaign,
        COALESCE(
          (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'ref'),
          REGEXP_EXTRACT((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location'), r'[?&]ref=([^&#]+)')
        ) AS ref_param
      FROM `{table_glob}`
      WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY))
        AND event_name = 'page_view'
    )
    SELECT
      COALESCE(utm_source, '(none)') AS utm_source,
      COALESCE(utm_medium, '(none)') AS utm_medium,
      COALESCE(utm_campaign, '(none)') AS utm_campaign,
      COALESCE(ref_param, '(none)') AS ref_param,
      COUNT(*) AS page_views,
      COUNT(DISTINCT user_pseudo_id) AS unique_users
    FROM tagged_views
    WHERE utm_source IS NOT NULL
       OR utm_medium IS NOT NULL
       OR utm_campaign IS NOT NULL
       OR ref_param IS NOT NULL
    GROUP BY 1, 2, 3, 4
    ORDER BY page_views DESC
    LIMIT 15
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("days", "INT64", days)]
    )

    campaign_rows = list(client.query(campaign_query, job_config=job_config).result())
    if campaign_rows:
        header = (
            f"{'utm_source':<18} | {'utm_medium':<16} | {'utm_campaign':<22} | "
            f"{'ref':<16} | {'Views':>7} | {'Users':>7}"
        )
        print(header)
        print("-" * len(header))
        for row in campaign_rows:
            print(
                f"{row.utm_source[:18]:<18} | {row.utm_medium[:16]:<16} | "
                f"{row.utm_campaign[:22]:<22} | {row.ref_param[:16]:<16} | "
                f"{row.page_views:>7,d} | {row.unique_users:>7,d}"
            )
        print()
    else:
        print(
            f"{YELLOW}No explicit ?utm_* or ?ref= campaign tags recorded yet in the last {days} days.{RESET}\n"
        )

    shared_grid_query = f"""
    WITH shared_loads AS (
      SELECT
        user_pseudo_id,
        COALESCE(
          REGEXP_EXTRACT((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location'), r'[?&]platform=([^&#]+)'),
          'unknown'
        ) AS platform,
        CASE
          WHEN (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_referrer') IS NULL
            OR (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_referrer') = ''
            THEN '(direct / shared link)'
          WHEN REGEXP_CONTAINS((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_referrer'), r'nms-optimizer\\.(app|ca)')
            THEN '(internal navigation)'
          ELSE (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_referrer')
        END AS referrer_source
      FROM `{table_glob}`
      WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY))
        AND event_name = 'page_view'
        AND REGEXP_CONTAINS(
          (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location'),
          r'[?&]grid='
        )
    )
    SELECT
      platform,
      referrer_source,
      COUNT(*) AS shared_grid_views,
      COUNT(DISTINCT user_pseudo_id) AS unique_users
    FROM shared_loads
    WHERE referrer_source != '(internal navigation)'
    GROUP BY platform, referrer_source
    ORDER BY shared_grid_views DESC
    LIMIT 15
    """

    shared_rows = list(client.query(shared_grid_query, job_config=job_config).result())
    if shared_rows:
        print(f"{BOLD}=== Inbound Shared Grid (?grid=) Views by Platform & Referrer ==={RESET}")
        header = f"{'Platform':<16} | {'Referrer Source':<44} | {'Views':>7} | {'Users':>7}"
        print(header)
        print("-" * len(header))
        for row in shared_rows:
            ref_display = (
                row.referrer_source[:41] + "..."
                if len(row.referrer_source) > 44
                else row.referrer_source
            )
            print(
                f"{row.platform[:16]:<16} | {ref_display:<44} | "
                f"{row.shared_grid_views:>7,d} | {row.unique_users:>7,d}"
            )
        print()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Report GA4 BigQuery external referrers, acquisition channels, and campaign parameters."
    )
    parser.add_argument(
        "--days",
        type=int,
        default=30,
        help="Number of days to look back (default: 30)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=25,
        help="Maximum rows to display in the top referrers table (default: 25)",
    )
    parser.add_argument(
        "--project",
        type=str,
        default=DEFAULT_PROJECT_ID,
        help=f"GCP Project ID (default: {DEFAULT_PROJECT_ID})",
    )
    parser.add_argument(
        "--dataset",
        type=str,
        default=DEFAULT_DATASET_ID,
        help=f"BigQuery Dataset ID (default: {DEFAULT_DATASET_ID})",
    )
    parser.add_argument(
        "--key",
        type=Path,
        default=DEFAULT_KEY_PATH,
        help="Path to service account JSON key",
    )
    args = parser.parse_args()

    client = get_bigquery_client(args.key, args.project)
    table_glob = f"{args.project}.{args.dataset}.events_*"

    print(f"\n{CYAN}{BOLD}📊 NMS Optimizer — BigQuery Referrer & Acquisition Report{RESET}")
    print(f"Dataset:   {args.project}.{args.dataset}")
    print(f"Timeframe: Last {args.days} days\n")

    print_external_referrers(client, table_glob, args.days, args.limit)
    print_full_path_referrers(client, table_glob, args.days)
    print_campaign_and_shared_grid_stats(client, table_glob, args.days)


if __name__ == "__main__":
    main()
