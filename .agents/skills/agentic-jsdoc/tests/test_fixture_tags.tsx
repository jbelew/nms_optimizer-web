// @ts-nocheck
// TEST FIXTURE — Load agentic-jsdoc skill, then ask: "Review the JSDoc in this file."
// See test_fixture_tags.expects.md for expected findings.

import { useEffect } from "react";

// ── Deprecated without migration path ──────────────────────────────

/**
 * Fetches the user's legacy profile data.
 *
 * @deprecated
 * @param {string} userId - The user's unique identifier.
 * @returns {Promise<object>} The raw profile object.
 * @category Utilities
 *
 * @example
 * const profile = await fetchLegacyProfile("u-123");
 * // returns { name: "Atlas", role: "admin" }
 */
export async function fetchLegacyProfile(userId: string): Promise<object> {
  return fetch(`/api/legacy/users/${userId}`).then((r) => r.json());
}

// ── Missing @throws on a function that throws ──────────────────────

/**
 * Parses a JSON config string into a typed configuration object.
 *
 * @param {string} raw - The raw JSON string to parse.
 * @returns {Record<string, unknown>} The parsed configuration.
 * @category Utilities
 *
 * @example
 * const config = parseConfig('{"debug": true}');
 * // returns { debug: true }
 */
export function parseConfig(raw: string): Record<string, unknown> {
  const parsed = JSON.parse(raw);
  if (typeof parsed !== "object" || parsed === null) {
    throw new TypeError("Config must be a JSON object");
  }
  return parsed as Record<string, unknown>;
}

// ── Vague types ({any}, {*}) ───────────────────────────────────────

/**
 * Merges two data sources into a single result.
 *
 * @param {any} primary - The primary data source.
 * @param {*} secondary - The fallback data source.
 * @returns {any} The merged result.
 * @category Utilities
 *
 * @example
 * const merged = mergeSources(apiData, cacheData);
 * // returns merged dataset
 */
export function mergeSources(primary: unknown, secondary: unknown): unknown {
  return { ...Object(primary), ...Object(secondary) };
}

// ── Hook returning void without explicit @returns ──────────────────

/**
 * Logs page views to the analytics service on mount.
 *
 * @param {string} pageName - The name of the page to track.
 * @category Hooks
 *
 * @example
 * usePageView("dashboard");
 */
export function usePageView(pageName: string) {
  useEffect(() => {
    fetch(`/api/analytics/view?page=${pageName}`, { method: "POST" });
  }, [pageName]);
}

// ── @example without output comment ────────────────────────────────

/**
 * Formats a Unix timestamp into a human-readable date string.
 *
 * @param {number} timestamp - The Unix timestamp in milliseconds.
 * @returns {string} The formatted date string.
 * @category Utilities
 *
 * @example
 * const formatted = formatDate(1700000000000);
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US");
}
