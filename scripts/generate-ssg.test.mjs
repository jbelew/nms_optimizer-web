import { beforeEach, describe, expect, it, mock, vi } from "bun:test";

// Mock node:fs/promises globally with implementations
const fsMock = {
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
                <main class="ssg-fallback" data-ssg-template>
                    <header class="app-header-static">Header Content</header>
                </main>
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
			expect(tags).toContain('<meta property="og:url" content="https://nms-optimizer.app/" />');
			expect(tags).toContain('<link rel="alternate" hreflang="en" href="https://nms-optimizer.app/" />');
			expect(tags).toContain('<link rel="alternate" hreflang="es" href="https://nms-optimizer.app/es/" />');
			expect(tags).toContain('<link rel="alternate" hreflang="x-default" href="https://nms-optimizer.app/" />');
		});
	});

	describe("generateNavigationLinks", () => {
		const t = vi.fn((key) => key);

		it("generates links with correct prefixes for English", () => {
			const html = generateSsgModule.generateNavigationLinks("en", "about", t);
			expect(html).toContain('href="/about/"');
			expect(html).toContain('href="/"');
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
				t
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
				t
			);
			expect(result).toContain("<title>Home Title</title>");
			expect(result).toContain('<meta name="description" content="App Description"');
		});

		it("injects SEO tags", async () => {
			const result = await generateSsgModule.generatePage(
				indexHtml,
				"en",
				"",
				baseUrl,
				mdProcessor,
				t
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
				t
			);
			expect(result).toContain('class="ssg-fallback"');
			expect(result).not.toContain("<noscript>");
		});

		it("strips existing noscript blocks", async () => {
			const indexWithNoscript = indexHtml.replace(
				"</body>",
				"<noscript>Old content</noscript></body>"
			);
			const result = await generateSsgModule.generatePage(
				indexWithNoscript,
				"en",
				"",
				baseUrl,
				mdProcessor,
				t
			);
			expect(result).not.toContain("Old content");
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
				""
			);
			expect(result).toContain('<div id="root"></div>\n\t\t<main class="ssg-fallback">');
		});
	});
});
