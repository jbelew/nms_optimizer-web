import * as actualFsPromises from "node:fs/promises";
import { beforeEach, describe, expect, it, mock, vi } from "bun:test";

// Mock node:fs/promises globally while preserving unmocked exports (lstat, constants, stat, etc.)
const fsMock = {
	...actualFsPromises,
	mkdir: vi.fn().mockResolvedValue(undefined),
	readFile: vi.fn().mockResolvedValue("# Content"),
	writeFile: vi.fn().mockResolvedValue(undefined),
};

mock.module("node:fs/promises", () => ({
	...fsMock,
	default: fsMock,
}));

describe("generate-ssg.mjs", () => {
	let generateSsgModule;

	beforeEach(async () => {
		// Dynamic import to ensure mocks are applied
		generateSsgModule = await import("./generate-ssg.mjs");
		vi.clearAllMocks();
		// Reset default implementation
		fsMock.readFile.mockResolvedValue("# Content");
	});

	describe("extractSsgTemplate", () => {
		it("extracts header from source HTML", async () => {
			const sourceHtml = `
                <html>
                <body>
                <div class="ssg-fallback" data-ssg-template>
                    <header class="app-header-static">Header Content</header>
                </div>
                </body>
                </html>
            `;
			const { ssgHeader } = await generateSsgModule.extractSsgTemplate(sourceHtml);
			expect(ssgHeader).toBe('<header class="app-header-static">Header Content</header>');
		});

		it("returns empty string if template not found", async () => {
			const { ssgHeader } = await generateSsgModule.extractSsgTemplate("<html></html>");
			expect(ssgHeader).toBe("");
		});
	});

	describe("generateSeoTags", () => {
		const baseUrl = "https://nms-optimizer.app";
		const t = vi.fn((key) => key);

		it("generates tags for the root path in English", () => {
			const tags = generateSsgModule.generateSeoTags("/", "en", baseUrl, t);

			expect(tags).toContain('<link rel="canonical" href="https://nms-optimizer.app/" />');
			expect(tags).toContain(
				'<meta property="og:url" content="https://nms-optimizer.app/" />',
			);
			expect(tags).toContain(
				'<link rel="alternate" hreflang="en" href="https://nms-optimizer.app/" />',
			);
			expect(tags).toContain(
				'<link rel="alternate" hreflang="es" href="https://nms-optimizer.app/es/" />',
			);
			expect(tags).toContain(
				'<link rel="alternate" hreflang="x-default" href="https://nms-optimizer.app/" />',
			);
		});
	});

	describe("generateNavigationLinks", () => {
		const t = vi.fn((key) => key);

		it("generates links with correct prefixes for English", () => {
			const html = generateSsgModule.generateNavigationLinks("en", "about", t);
			expect(html).toContain('href="/about/"');
			expect(html).toContain('href="/"');
		});

		it("generates links with correct prefixes for Spanish", () => {
			const html = generateSsgModule.generateNavigationLinks("es", "about", t);
			expect(html).toContain('href="/es/about/"');
			expect(html).toContain('href="/es/"');
		});
	});

	describe("readMarkdownFile", () => {
		it("returns content if file exists", async () => {
			fsMock.readFile.mockResolvedValue("# Mocked Content");
			const content = await generateSsgModule.readMarkdownFile("en", "home");
			expect(content).toBe("# Mocked Content");
		});

		it("returns null if file does not exist", async () => {
			fsMock.readFile.mockRejectedValue(new Error("File not found"));
			const content = await generateSsgModule.readMarkdownFile("en", "non-existent");
			expect(content).toBeNull();
		});
	});

	describe("generatePage", () => {
		const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <title>Original Title</title>
    <meta name="description" content="Original Description" />
    <meta name="keywords" content="original, keywords" />
</head>
<body>
    <div id="root"></div>
</body>
</html>`;
		const baseUrl = "https://nms-optimizer.app";
		const mdProcessor = vi.fn((md) => `<div>${md}</div>`);
		const t = vi.fn((key, options) => {
			const translations = {
				"appHeader.subTitle": "Localized Header <1>ML/RUST</1>",
				appName: "NMS Optimizer",
				"seo.appDescription": "App Description",
				"seo.mainPageTitle": "Home Title",
				"seo.nav.home": "Home Nav",
			};

			return translations[key] || options?.defaultValue || key;
		});

		it("correctly replaces the language attribute", async () => {
			const result = await generateSsgModule.generatePage(
				indexHtml,
				"es",
				"",
				baseUrl,
				mdProcessor,
				t,
			);
			expect(result).toContain('<html lang="es"');
		});

		it("updates metadata for the root page", async () => {
			const result = await generateSsgModule.generatePage(
				indexHtml,
				"en",
				"",
				baseUrl,
				mdProcessor,
				t,
			);
			expect(result).toContain("<title>Home Title | NMS Optimizer</title>");
			expect(result).toContain("<h1>Home Title</h1>");
			expect(result).toContain('<meta name="description" content="App Description"');
		});

		it("injects SEO tags", async () => {
			const result = await generateSsgModule.generatePage(
				indexHtml,
				"en",
				"",
				baseUrl,
				mdProcessor,
				t,
			);
			expect(result).toContain('<link rel="canonical" href="https://nms-optimizer.app/"');
		});

		it("injects markdown content into ssg-fallback block", async () => {
			const result = await generateSsgModule.generatePage(
				indexHtml,
				"en",
				"",
				baseUrl,
				mdProcessor,
				t,
			);
			expect(result).toContain('class="ssg-fallback"');
			expect(result).not.toContain("<noscript>");
		});

		it("strips existing body noscript blocks while preserving data-vpss-background-noscript in head", async () => {
			const indexWithNoscript = indexHtml
				.replace(
					"</head>",
					'<noscript data-vpss-background-noscript=""><style>body{}</style></noscript></head>',
				)
				.replace("</body>", "<noscript>Old content</noscript></body>");
			const result = await generateSsgModule.generatePage(
				indexWithNoscript,
				"en",
				"",
				baseUrl,
				mdProcessor,
				t,
			);
			expect(result).not.toContain("Old content");
			expect(result).toContain('data-vpss-background-noscript=""');
		});

		it("injects content after root div", async () => {
			const result = await generateSsgModule.generatePage(
				indexHtml,
				"en",
				"",
				baseUrl,
				mdProcessor,
				t,
				"",
			);
			expect(result).toContain('<div id="root"></div>\n\t\t<div class="ssg-fallback">');
		});

		it("renders formatted title in head and clean topic in H1 heading for instructions", async () => {
			const tClean = vi.fn((key, options) => {
				if (key === "seo.instructionsPageTitle") {
					return "How to Optimize Your Tech Layout";
				}

				if (key === "appName") {
					return "NMS Optimizer";
				}

				return options?.defaultValue || key;
			});
			const result = await generateSsgModule.generatePage(
				indexHtml,
				"en",
				"instructions",
				baseUrl,
				mdProcessor,
				tClean,
			);
			expect(result).toContain(
				"<title>How to Optimize Your Tech Layout | NMS Optimizer</title>",
			);
			expect(result).toContain("<h1>How to Optimize Your Tech Layout</h1>");
			expect(result).not.toContain(
				"<h1>How to Optimize Your Tech Layout | NMS Optimizer</h1>",
			);
		});

		it("handles legacy un-migrated titles by extracting clean heading", async () => {
			const tLegacy = vi.fn((key, options) => {
				if (key === "seo.instructionsPageTitle") {
					return "How to Optimize Your Tech Layout | NMS Optimizer";
				}

				if (key === "appName") {
					return "NMS Optimizer";
				}

				return options?.defaultValue || key;
			});
			const result = await generateSsgModule.generatePage(
				indexHtml,
				"en",
				"instructions",
				baseUrl,
				mdProcessor,
				tLegacy,
			);
			expect(result).toContain(
				"<title>How to Optimize Your Tech Layout | NMS Optimizer</title>",
			);
			expect(result).toContain("<h1>How to Optimize Your Tech Layout</h1>");
		});
	});

	describe("createMarkdownProcessor", () => {
		it("wraps markdown images in <noscript> to prevent preload scanner fetches when JS is enabled", async () => {
			const { createMarkdownProcessor } = await import("./markdown-processor.mjs");
			const processMarkdown = createMarkdownProcessor();
			const html = processMarkdown("![Alt text](/assets/img/screenshots/screenshot.webp)");

			expect(html).toContain(
				'<noscript><img src="/assets/img/screenshots/screenshot.webp" alt="Alt text" title="" loading="lazy" decoding="async" /></noscript>',
			);
		});

		it("parses inline markdown inside blockquotes and nested lists", async () => {
			const { createMarkdownProcessor } = await import("./markdown-processor.mjs");
			const processMarkdown = createMarkdownProcessor();
			const html = processMarkdown(
				"> 💡 **Note:**\n> **Slot Restrictions** apply.\n\n1. **Find**:\n    - `translation.json`\n    - `*.md`",
			);

			expect(html).toContain(
				"<blockquote>\n<p>💡 <strong>Note:</strong><br><strong>Slot Restrictions</strong> apply.</p>\n</blockquote>",
			);
			expect(html).toContain(
				"<ul>\n<li><code>translation.json</code></li>\n<li><code>*.md</code></li>\n</ul>",
			);
		});

		it("strips <radix-icon> tags and renders [youtube:id] embeds", async () => {
			const { createMarkdownProcessor } = await import("./markdown-processor.mjs");
			const processMarkdown = createMarkdownProcessor();
			const html = processMarkdown(
				'Select with the <radix-icon name="GearIcon" size="20" color="var(--accent-11)"></radix-icon> button.\n\n[youtube:dQw4w9WgXcQ]',
			);

			expect(html).not.toContain("radix-icon");
			expect(html).toContain("<p>Select with the button.</p>");
			expect(html).toContain('src="https://www.youtube.com/embed/dQw4w9WgXcQ"');
		});
	});
});
