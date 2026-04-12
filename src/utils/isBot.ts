/**
 * Utility module for bot and crawler detection.
 *
 * @remarks
 * This module provides functions to identify automated visitors such as search
 * engine crawlers and social media scrapers.
 *
 * @see {@link isBot}
 *
 * @category Utilities
 */

/**
 * A regex pattern matching the User-Agent strings of common web crawlers and bots.
 *
 * @remarks
 * This list covers major search engine crawlers (Googlebot, Bingbot, etc.) as well as
 * generic headless browser and bot indicators.
 *
 * @category Utilities
 */
const BOT_USER_AGENT_PATTERN =
	/bot|crawl|spider|slurp|mediapartners|facebookexternalhit|ia_archiver|google|lighthouse|chrome-lighthouse|pingdom|uptime|speedcurve|headless|phantom|webdriver|pinterest|whatsapp|twitterbot|linkedinbot|embedly|quora|outbrain|rogerbot|bufferbot|duckduckbot|semrushbot|ahrefsbot|mj12bot|dotbot|archive\.org|baidu/i;

/**
 * Detects whether the current visitor is likely a bot or web crawler.
 *
 * @remarks
 * Uses heuristics including `navigator.webdriver`, the `.is-bot` CSS class on
 * the document root, and User-Agent string matching against known bot signatures.
 *
 * This check is used to suppress non-essential UI (like Welcome dialogs) for
 * automated visitors to improve SEO and prevent unwanted interactions.
 * **Note: This is not a security-critical check.**
 *
 * @returns {boolean} `true` if the visitor is likely a bot, false otherwise.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * if (isBot()) {
 *   console.log("Welcome dialog suppressed for crawler.");
 * }
 * // returns true if bot
 * ```
 */
export function isBot(): boolean {
	// 1. Explicit webdriver flag
	if (navigator.webdriver) {
		return true;
	}

	// 2. Class added by index.html early bot detection script
	if (typeof document !== "undefined" && document.documentElement?.classList.contains("is-bot")) {
		return true;
	}

	// 3. User-Agent pattern matching
	return BOT_USER_AGENT_PATTERN.test(navigator.userAgent);
}
