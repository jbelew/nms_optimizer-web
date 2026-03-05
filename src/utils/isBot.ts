/**
 * A regex pattern matching the User-Agent strings of common web crawlers and bots.
 * This list covers major search engine crawlers (Googlebot, Bingbot, etc.) as well as
 * generic headless browser and bot indicators.
 */
const BOT_USER_AGENT_PATTERN =
	/bot|crawl|spider|slurp|mediapartners|facebookexternalhit|ia_archiver|google-structured-data|pinterest|whatsapp|twitterbot|linkedinbot|embedly|quora|outbrain|rogerbot|bufferbot|duckduckbot|semrushbot|ahrefsbot|mj12bot|dotbot|archive\.org|baidu/i;

/**
 * Detects whether the current visitor is likely a bot or web crawler.
 *
 * Uses two heuristics:
 * 1. `navigator.webdriver` — set to `true` by WebDriver-controlled browsers (e.g.,
 *    Selenium, Puppeteer in automation mode), which crawlers sometimes use.
 * 2. User-Agent string matching against a list of known bot/crawler signatures.
 *
 * This check is intentionally client-side only; it runs in the browser at render time.
 * It is not security-critical — its sole purpose is to suppress UI-only dialogs
 * (e.g., the Welcome dialog) for automated visitors to improve SEO rendering.
 *
 * @returns {boolean} `true` if the visitor is likely a bot, `false` otherwise.
 */
export function isBot(): boolean {
	if (navigator.webdriver) {
		return true;
	}

	return BOT_USER_AGENT_PATTERN.test(navigator.userAgent);
}
