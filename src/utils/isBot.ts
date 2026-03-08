/**
 * A regex pattern matching the User-Agent strings of common web crawlers and bots.
 *
 * This list covers major search engine crawlers (Googlebot, Bingbot, etc.) as well as
 * generic headless browser and bot indicators.
 */
const BOT_USER_AGENT_PATTERN =
	/bot|crawl|spider|slurp|mediapartners|facebookexternalhit|ia_archiver|google-structured-data|pinterest|whatsapp|twitterbot|linkedinbot|embedly|quora|outbrain|rogerbot|bufferbot|duckduckbot|semrushbot|ahrefsbot|mj12bot|dotbot|archive\.org|baidu/i;

/**
 * Detects whether the current visitor is likely a bot or web crawler.
 *
 * Uses heuristics including `navigator.webdriver` and User-Agent string matching
 * against known bot signatures.
 *
 * This check is used to suppress non-essential UI (like Welcome dialogs) for
 * automated visitors to improve SEO and prevent unwanted interactions.
 * **Note: This is not a security-critical check.**
 *
 * @returns {boolean} `true` if the visitor is likely a bot, `false` otherwise.
 *
 * @example
 * if (isBot()) {
 *   console.log("Welcome dialog suppressed for crawler.");
 * }
 */
export function isBot(): boolean {
	if (navigator.webdriver) {
		return true;
	}

	return BOT_USER_AGENT_PATTERN.test(navigator.userAgent);
}
