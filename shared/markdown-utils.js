/**
 * @file Shared markdown parsing and URL classification utilities for client dialogs and SSG.
 *
 * @category Utilities
 */

import { TARGET_HOST } from "./config.js";

/**
 * Allowed feature policy permissions for embedded markdown iframes and YouTube players.
 */
export const MARKDOWN_IFRAME_ALLOW =
	"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";

/**
 * Sandbox policy tokens for embedded markdown iframes and YouTube players.
 */
export const MARKDOWN_IFRAME_SANDBOX =
	"allow-scripts allow-same-origin allow-popups allow-presentation";

/**
 * Extracts a YouTube video ID from a `[youtube:videoId]` markdown shortcode string.
 *
 * @remarks
 * Returns the matched video identifier when the input contains a `[youtube:...]` shortcode,
 * or `null` when no shortcode is present.
 *
 * @param {string} text - Raw paragraph text to inspect.
 * @returns {string | null} Extracted YouTube video ID, or `null` if not matched.
 *
 * @category Utilities
 *
 * @example
 * ```js
 * extractYouTubeVideoId("[youtube:dQw4w9WgXcQ]");
 * // returns "dQw4w9WgXcQ"
 * ```
 */
export function extractYouTubeVideoId(text) {
	if (typeof text !== "string") return null;
	const match = text.match(/\[youtube:([^\]]+)\]/);

	return match ? match[1] : null;
}

/**
 * Determines whether a markdown link URL points to an internal route or the canonical origin.
 *
 * @remarks
 * Treats hash anchors (`#...`), root-relative paths (`/...`), and URLs matching `baseOrigin`
 * or {@link TARGET_HOST} (including subdomains) as internal links.
 *
 * @param {string | undefined} href - Link destination URL to classify.
 * @param {string} [baseOrigin] - Optional runtime origin URL (defaults to `https://nms-optimizer.app`).
 * @returns {boolean} `true` if the link is internal, `false` if external.
 *
 * @see {@link TARGET_HOST}
 *
 * @category Utilities
 *
 * @example
 * ```js
 * isInternalMarkdownUrl("/about/");
 * // returns true
 * ```
 */
export function isInternalMarkdownUrl(href, baseOrigin = `https://${TARGET_HOST}`) {
	if (typeof href !== "string") return false;
	if (href.startsWith("#")) return true;
	if (href.startsWith("/") && !href.startsWith("//")) return true;

	try {
		const parsed = new URL(href, baseOrigin);

		return (
			parsed.origin === baseOrigin
			|| parsed.hostname === TARGET_HOST
			|| parsed.hostname.endsWith(`.${TARGET_HOST}`)
		);
	} catch {
		return false;
	}
}
