import type { Plugin, IndexHtmlTransformResult, HtmlTagDescriptor } from 'vite';

export default function deferStylesheetsPlugin(): Plugin {
	const pluginName = 'vite-plugin-defer-stylesheets';

	return {
		name: pluginName,
		apply: 'build',
		// 'enforce: post' runs it late. We want it to run before critical CSS is generated
		// if critical CSS generation depends on the final link structure.
		// However, critical CSS usually works by rendering the page headless, so initial attributes might not matter as much
		// as the actual CSS content. Let's try 'post' first. If critical CSS is extracted from an unmodified DOM,
		// then this plugin modifying links afterwards is fine.
		enforce: 'post',

		async transformIndexHtml(html: string, ctx): Promise<IndexHtmlTransformResult> {
			// Only apply to the main entry HTML after bundling, or if no bundle (dev server, but apply:'build' prevents this)
			if (!ctx.bundle && ctx.server) {
                 return html; // Not for dev server if apply is 'build'
            }
            // If apply is 'build', ctx.bundle should exist unless it's a public/index.html copy before bundling.
            // We are interested in the post-bundle HTML.

			const tags: HtmlTagDescriptor[] = [];
			const noscriptFallbackHrefs: string[] = [];

			let modifiedHtml = html;
			// Regex to find <link ... rel="stylesheet" ... href="..." ...>
			// It captures: 1: attributes before href, 2: href value, 3: attributes after href
			const linkRegex = /<link\s+((?:[^>]*?\s+)?rel="stylesheet"\s+[^>]*?)href="([^"]+)"([^>]*)>/gi;

			let match;
			const replacements: { originalTag: string; newTag: string; href: string }[] = [];

			while ((match = linkRegex.exec(html)) !== null) {
				const originalTag = match[0];
				const preHrefAttributes = match[1].replace(/\s*rel="stylesheet"\s*/i, '').trim(); // Other attributes before href
				const href = match[2];
				const postHrefAttributes = match[3].trim(); // Other attributes after href

				// Skip data URIs and links that are already print media (common critical CSS defer pattern)
				if (href.startsWith('data:') || originalTag.includes('media="print"')) {
					continue;
				}

				// Avoid processing links inside <noscript> tags. This is a simple check.
				const preMatchHtml = html.substring(0, match.index);
				if ((preMatchHtml.match(/<noscript/g) || []).length > (preMatchHtml.match(/<\/noscript>/g) || []).length) {
					continue;
				}

				// Preserve all other attributes
				let otherAttributes = preHrefAttributes ? preHrefAttributes + ' ' : '';
				otherAttributes += postHrefAttributes ? postHrefAttributes : '';
				otherAttributes = otherAttributes.trim();


				const newTag = `<link ${otherAttributes} rel="stylesheet" href="${href}" media="print" onload="this.media='all'">`;
				replacements.push({ originalTag, newTag, href });
			}

			if (replacements.length === 0 && !html.includes("<!-- Defer Stylesheets: No links to defer -->")) { // Avoid re-processing if already done by HMR
                // No specific logging here if no links are found, or it could be noisy.
                 // Add a marker comment if no links found to defer, to prevent reprocessing in HMR if HTML doesn't change
                if (ctx.server) { // Only add comment in dev for HMR signaling
                    modifiedHtml += "\n<!-- Defer Stylesheets: No links to defer -->";
                }
			}

			for (const rep of replacements) {
				modifiedHtml = modifiedHtml.replace(rep.originalTag, rep.newTag);
				noscriptFallbackHrefs.push(rep.href);
			}

			if (noscriptFallbackHrefs.length > 0) {
				const noscriptLinksHtml = noscriptFallbackHrefs
					.map(href => `<link rel="stylesheet" href="${href}">`)
					.join('');

				tags.push({
					tag: 'noscript',
					children: noscriptLinksHtml,
					injectTo: 'head', // Inject into <head>
				});
                console.log(`[${pluginName}] Deferred ${noscriptFallbackHrefs.length} stylesheets and prepared noscript fallbacks.`);
			}

			// Ensure existing script/modulepreload tags from previous runs (HMR) are not duplicated if we return tags.
			// If we only modify HTML string, that's fine. If we return tags, Vite merges them.
			// For this case, returning modified HTML and new tags for <noscript> is appropriate.
			return {
				html: modifiedHtml,
				tags: tags,
			};
		},
	};
}
