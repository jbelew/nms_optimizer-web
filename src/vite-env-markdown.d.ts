/**
 * Virtual module declaration for the pre-bundled markdown content.
 *
 * This module is generated at build time and contains all localized markdown
 * files (About, Instructions, etc.) to enable rapid client-side rendering.
 */
declare module "virtual:markdown-bundle" {
	/** Dictionary of markdown content keyed by language and filename. */
	export const markdownBundle: Record<string, Record<string, string>>;
	/**
	 * Retrieves a specific markdown file's content.
	 *
	 * @param {string} lang - The ISO language code.
	 * @param {string} fileName - The identifier of the markdown file.
	 * @returns {string} The raw markdown content.
	 * @example Content retrieval
	 * ```ts
	 * const content = getMarkdown("en", "ABOUT");
	 * ```
	 */
	export function getMarkdown(lang: string, fileName: string): string;
}
