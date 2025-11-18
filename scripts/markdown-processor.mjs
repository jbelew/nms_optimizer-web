/**
 * @file Markdown processor for SSG
 * Converts markdown to HTML with proper inline formatting
 */

import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";

// Configure marked with GFM extensions
marked.use(gfmHeadingId());

/**
 * Creates a markdown processor function
 * @returns {Function} Function that converts markdown string to HTML string
 */
export function createMarkdownProcessor() {
	// Custom renderer
	const renderer = new marked.Renderer();

	// Override heading to add IDs
	renderer.heading = (token) => {
		const id = token.id || `section-${token.depth}`;
		const className =
			token.depth === 2
				? 'text-base sm:text-lg mb-3'
				: token.depth === 3
					? 'text-sm sm:text-base'
					: '';
		// Use marked.parseInline to process inline markdown like **bold**
		const html = marked.parseInline(token.text);
		return `<h${token.depth} id="${id}" class="${className}">${html}</h${token.depth}>\n`;
	};

	// Override paragraph
	renderer.paragraph = (token) => {
		// Use marked.parseInline to process inline markdown like **bold**, *italic*, etc.
		const html = marked.parseInline(token.text);
		return `<p class="text-sm sm:text-base mb-2">${html}</p>\n`;
	};

	// Override list
	renderer.list = (token) => {
		const tag = token.ordered ? 'ol' : 'ul';
		const listClass = token.ordered ? 'list-decimal' : 'list-disc';
		return `<${tag} class="${listClass} pl-6 mb-2">\n${token.items.map((item) => {
			// Process inline markdown in list items
			const html = marked.parseInline(item.text);
			return `<li class="mb-1">${html}</li>`;
		}).join('\n')}\n</${tag}>\n`;
	};

	// Override blockquote
	renderer.blockquote = (token) => {
		return `<blockquote style="margin-top: 0.5rem; margin-bottom: 0.5rem; border-left: 4px solid; padding-left: 1rem;">\n${token.text}</blockquote>\n`;
	};

	// Override code block
	renderer.codeblock = (token) => {
		return `<pre style="background-color: #1e293b; padding: 1rem; border-radius: 0.25rem; overflow-x: auto;"><code class="language-${token.lang || ''}">${token.text}</code></pre>\n`;
	};

	// Override link
	renderer.link = (token) => {
		return `<a href="${token.href}" target="_blank" rel="noopener noreferrer" style="color: #0ba5e9; text-decoration: underline;">${token.text}</a>`;
	};

	// Override image
	renderer.image = (token) => {
		return `<img src="${token.href}" alt="${token.text}" title="${token.title || ''}" style="max-width: 100%;" />`;
	};

	// Override hr
	renderer.hr = () => {
		return '<hr style="border: none; border-top: 1px solid #444; margin: 1rem 0;" />\n';
	};

	// Override table
	renderer.table = (token) => {
		let header = '<thead><tr>';
		token.header.forEach((cell) => {
			const align = cell.align ? ` style="text-align: ${cell.align};"` : '';
			header += `<th${align}>${cell.text}</th>`;
		});
		header += '</tr></thead>';

		let body = '<tbody>';
		token.rows.forEach((row) => {
			body += '<tr>';
			row.forEach((cell) => {
				const align = cell.align ? ` style="text-align: ${cell.align};"` : '';
				body += `<td${align}>${cell.text}</td>`;
			});
			body += '</tr>';
		});
		body += '</tbody>';

		return `<table style="width: 100%; border-collapse: collapse; border: 1px solid #444;">${header}${body}</table>\n`;
	};

	// Set options
	marked.setOptions({
		renderer,
		breaks: true,
	});

	return (markdownContent) => {
		try {
			const html = marked(markdownContent);
			return html;
		} catch (error) {
			console.error('Error processing markdown:', error);
			return `<p>Error processing markdown</p>`;
		}
	};
}
