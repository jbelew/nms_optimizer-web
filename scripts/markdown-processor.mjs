/**
 * @file Markdown processor for SSG.
 * Converts markdown to HTML with semantic formatting for Static SEO Fallback blocks.
 *
 * @category Utilities
 */

import { Marked } from "marked";

import {
	extractYouTubeVideoId,
	isInternalMarkdownUrl,
	MARKDOWN_IFRAME_ALLOW,
	MARKDOWN_IFRAME_SANDBOX,
} from "../shared/markdown-utils.js";

/**
 * Creates a configured `Marked` compiler function for Static SEO Fallback markdown rendering.
 *
 * @remarks
 * Relies on `Marked`'s built-in recursive GFM token renderers for blockquotes, nested lists,
 * code blocks, tables, `<del>`, and `<hr>`, while customizing headings (`section-*` IDs),
 * paragraphs (`[youtube:id]` embed support), links (`target="_blank"` on external URLs),
 * and `<noscript>`-wrapped lazy images so the browser preload scanner does not fetch
 * fallback images when JavaScript is enabled.
 *
 * @returns {(markdownContent: string) => string} Compiler function that converts a markdown string to an HTML string.
 *
 * @see {@link extractYouTubeVideoId}
 * @see {@link getSlug}
 * @see {@link isInternalMarkdownUrl}
 * @see {@link stripRadixIconTags}
 * @see {@link ./generate-ssg.test.mjs Unit Tests}
 *
 * @category Utilities
 *
 * @example
 * ```js
 * const compileMarkdown = createMarkdownProcessor();
 * const html = compileMarkdown("## Overview");
 * // returns '<h2 id="section-overview">Overview</h2>\n'
 * ```
 */
export function createMarkdownProcessor() {
	const instance = new Marked({
		breaks: true,
		gfm: true,
		renderer: {
			heading(token) {
				const slug = getSlug(token.text);
				const id = `section-${slug}`;
				const html = this.parser.parseInline(token.tokens);

				return `<h${token.depth} id="${id}">${html}</h${token.depth}>\n`;
			},
			image(token) {
				return `<noscript><img src="${token.href}" alt="${token.text}" title="${token.title || ""}" loading="lazy" decoding="async" /></noscript>`;
			},
			link(token) {
				const html = this.parser.parseInline(token.tokens);
				const targetAttr =
					isInternalMarkdownUrl(token.href) ? "" : (
						' target="_blank" rel="noopener noreferrer"'
					);

				return `<a href="${token.href}"${targetAttr}>${html}</a>`;
			},
			paragraph(token) {
				const videoId = extractYouTubeVideoId(token.text.trim());

				if (videoId) {
					return `<iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube Video" width="100%" height="400" loading="lazy" sandbox="${MARKDOWN_IFRAME_SANDBOX}" allow="${MARKDOWN_IFRAME_ALLOW}" allowfullscreen style="border:0;border-radius:6px"></iframe>\n`;
				}

				const html = this.parser.parseInline(token.tokens);

				return `<p>${html}</p>\n`;
			},
		},
	});

	return (markdownContent) => {
		try {
			const sanitized = stripRadixIconTags(markdownContent);

			return instance.parse(sanitized);
		} catch (error) {
			console.error("Error processing markdown:", error);

			return `<p>Error processing markdown</p>`;
		}
	};
}

/**
 * Generates a URL-safe section slug from heading text.
 *
 * @remarks
 * Lowercases the heading text, strips non-word punctuation, and collapses whitespace into hyphens.
 *
 * @param {string} text - Raw heading text.
 * @returns {string} Normalized lowercase hyphenated slug.
 *
 * @category Utilities
 *
 * @example
 * ```js
 * getSlug("Getting Started!");
 * // returns "getting-started"
 * ```
 */
function getSlug(text) {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-");
}

/**
 * Strips custom `<radix-icon>` tags from raw markdown before SSG compilation,
 * collapsing surrounding whitespace while preserving leading line indentation.
 *
 * @remarks
 * Prevents non-standard `<radix-icon>` custom elements from appearing in Static SEO Fallback HTML
 * while keeping 4-space nested list indentation intact.
 *
 * @param {string} markdown - Raw markdown content.
 * @returns {string} Sanitized markdown content without `<radix-icon>` tags.
 *
 * @category Utilities
 *
 * @example
 * ```js
 * stripRadixIconTags('Click <radix-icon name="GearIcon"></radix-icon> button.');
 * // returns "Click button."
 * ```
 */
function stripRadixIconTags(markdown) {
	return markdown
		.replace(/<radix-icon\b[^>]*?(?:\/>|>[\s\S]*?<\/radix-icon>)/gi, "")
		.replace(/([^\S\r\n]){2,}/g, (match, _space, offset, str) => {
			const lineStart = str.lastIndexOf("\n", offset - 1) + 1;

			return offset === lineStart ? match : " ";
		})
		.replace(/ +([.,;:!?])/g, "$1")
		.replace(/^(\s*[-*+]\s+) +/gm, "$1");
}
