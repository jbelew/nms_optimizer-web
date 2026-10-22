/**
 * @file Markdown processor for SSG.
 * Converts markdown to HTML with semantic inline formatting for Static SEO Fallback blocks.
 *
 * @category Utilities
 */

import { marked } from "marked";

/**
 * Creates a configured `marked` compiler function for Static SEO Fallback markdown rendering.
 *
 * @remarks
 * Configures custom `marked` block and inline renderers that emit clean semantic HTML
 * (`<h1>`–`<h3>` with `section-*` IDs, lists, blockquotes, tables, and `<noscript>`-wrapped
 * lazy images so the browser preload scanner does not fetch fallback images when JS is enabled).
 *
 * @returns {(markdownContent: string) => string} Compiler function that converts a markdown string to an HTML string.
 *
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
	// Custom renderer
	const renderer = new marked.Renderer();

	// Manual ID generation to avoid marked-gfm-heading-id issues
	const getSlug = (text) => {
		return text
			.toLowerCase()
			.replace(/[^\w\s-]/g, "")
			.replace(/\s+/g, "-");
	};

	// Override heading to add IDs
	renderer.heading = (token) => {
		const slug = getSlug(token.text);
		const id = `section-${slug}`;
		// Use marked.parseInline to process inline markdown like **bold**
		const html = marked.parseInline(token.text);

		return `<h${token.depth} id="${id}">${html}</h${token.depth}>\n`;
	};

	// Override paragraph
	renderer.paragraph = (token) => {
		// Use marked.parseInline to process inline markdown like **bold**, *italic*, etc.
		const html = marked.parseInline(token.text);

		return `<p>${html}</p>\n`;
	};

	// Override list
	renderer.list = (token) => {
		const tag = token.ordered ? "ol" : "ul";

		return `<${tag}>\n${token.items
			.map((item) => {
				// Process inline markdown in list items
				const html = marked.parseInline(item.text);

				return `<li>${html}</li>`;
			})
			.join("\n")}\n</${tag}>\n`;
	};

	// Override blockquote
	renderer.blockquote = (token) => {
		return `<blockquote>\n${token.text}</blockquote>\n`;
	};

	// Override code block
	renderer.codeblock = (token) => {
		return `<pre><code class="language-${token.lang || ""}">${token.text}</code></pre>\n`;
	};

	// Override link
	renderer.link = (token) => {
		const isInternal =
			(token.href.startsWith("/") && !token.href.startsWith("//"))
			|| token.href.startsWith("#")
			|| token.href === "https://nms-optimizer.app"
			|| token.href.startsWith("https://nms-optimizer.app/");
		const targetAttr = isInternal ? "" : ' target="_blank" rel="noopener noreferrer"';

		return `<a href="${token.href}"${targetAttr}>${token.text}</a>`;
	};

	// Override image
	renderer.image = (token) => {
		return `<noscript><img src="${token.href}" alt="${token.text}" title="${token.title || ""}" loading="lazy" decoding="async" /></noscript>`;
	};

	// Override hr
	renderer.hr = () => {
		return "<hr />\n";
	};

	// Override table
	renderer.table = (token) => {
		let header = "<thead><tr>";
		token.header.forEach((cell) => {
			const align = cell.align ? ` style="text-align: ${cell.align};"` : "";
			header += `<th${align}>${cell.text}</th>`;
		});
		header += "</tr></thead>";

		let body = "<tbody>";
		token.rows.forEach((row) => {
			body += "<tr>";
			row.forEach((cell) => {
				const align = cell.align ? ` style="text-align: ${cell.align};"` : "";
				body += `<td${align}>${cell.text}</td>`;
			});
			body += "</tr>";
		});
		body += "</tbody>";

		return `<table>${header}${body}</table>\n`;
	};

	// Set options
	marked.setOptions({
		breaks: true,
		renderer,
	});

	return (markdownContent) => {
		try {
			const html = marked(markdownContent);

			return html;
		} catch (error) {
			console.error("Error processing markdown:", error);

			return `<p>Error processing markdown</p>`;
		}
	};
}
