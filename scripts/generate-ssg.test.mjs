import fs from "node:fs";
import * as actualFsPromises from "node:fs/promises";
import path from "node:path";

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

		it("injects SEO tags including alternate text/markdown discoverability link without duplicates", async () => {
			const htmlWithStaleMarkdownLink = indexHtml.replace(
				"</head>",
				'    <link rel="alternate" type="text/markdown" href="https://nms-optimizer.app/stale/index.md" />\n</head>',
			);
			const rootResult = await generateSsgModule.generatePage(
				htmlWithStaleMarkdownLink,
				"en",
				"",
				baseUrl,
				mdProcessor,
				t,
			);
			expect(rootResult).toContain('<link rel="canonical" href="https://nms-optimizer.app/"');
			expect(rootResult).toContain(
				'<link rel="alternate" type="text/markdown" href="https://nms-optimizer.app/index.md" />',
			);
			expect(rootResult).not.toContain("stale/index.md");

			const localizedDialogResult = await generateSsgModule.generatePage(
				htmlWithStaleMarkdownLink,
				"es",
				"instructions",
				baseUrl,
				mdProcessor,
				t,
			);
			expect(localizedDialogResult).toContain(
				'<link rel="alternate" type="text/markdown" href="https://nms-optimizer.app/es/instructions/index.md" />',
			);
			expect(
				localizedDialogResult.match(/rel="alternate"\s+type="text\/markdown"/g),
			).toHaveLength(1);
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

	describe("generateAgentMarkdown", () => {
		const baseUrl = "https://nms-optimizer.app";

		it("synthesizes YAML frontmatter with escaped scalars, normalized H1 heading, localized navigation, and no JSON-LD", async () => {
			fsMock.readFile.mockResolvedValue(
				"# Legacy Heading: Old Brand Suffix\n\nBody prose about community localization.",
			);
			const t = vi.fn((key, options) => {
				const translations = {
					appName: "NMS Optimizer",
					"seo.nav.about": "About",
					"seo.nav.changelog": "Changelog",
					"seo.nav.home": "Home",
					"seo.nav.instructions": "Instructions",
					"seo.nav.privacy": "Privacy",
					"seo.nav.title": "Navigation",
					"seo.nav.translation": "Translate",
					"seo.nav.userstats": "Community Stats",
					"seo.navDescriptions.about": "How it works and technical details",
					"seo.navDescriptions.changelog": "Latest updates and new features",
					"seo.navDescriptions.home": "Use the Tech Layout & Adjacency Bonus Calculator",
					"seo.navDescriptions.instructions": "Complete guide for using the app",
					"seo.navDescriptions.privacy": "Our commitment to your data privacy",
					"seo.navDescriptions.translation": "Contribute to community localization",
					"seo.navDescriptions.userstats": "Popular technologies and builds",
					"seo.translationDescription":
						'Contribute to the "No Man\'s Sky" community:\nhelp translate the optimizer.',
					"seo.translationPageTitle": "Help Translate NMS Optimizer: Join the Team",
				};

				return translations[key] ?? options?.defaultValue ?? key;
			});

			const md = await generateSsgModule.generateAgentMarkdown(
				"en",
				"translation",
				baseUrl,
				t,
			);

			expect(md).not.toBeNull();
			expect(md.startsWith("---\n")).toBe(true);
			expect(md).toContain(
				'title: "Help Translate NMS Optimizer: Join the Team | NMS Optimizer"\n',
			);
			expect(md).toContain(
				'description: "Contribute to the \\"No Man\'s Sky\\" community: help translate the optimizer."\n',
			);
			expect(md).toContain('url: "https://nms-optimizer.app/translation/"\n');
			expect(md).toContain('lang: "en"\n');
			expect(md).toContain(
				'image: "https://nms-optimizer.app/assets/img/screenshots/screenshot.webp"\n',
			);
			expect(md).toContain(
				"---\n\n# Help Translate NMS Optimizer: Join the Team\n\nBody prose about community localization.",
			);
			expect(md).not.toContain(
				"# Help Translate NMS Optimizer: Join the Team | NMS Optimizer",
			);
			expect(md).not.toContain("Legacy Heading");
			expect(md).toContain(
				"## Navigation\n\n- [Home](https://nms-optimizer.app/) - Use the Tech Layout & Adjacency Bonus Calculator",
			);
			expect(md).toContain(
				"- [Translate](https://nms-optimizer.app/translation/) - Contribute to community localization",
			);
			expect(md).not.toContain("application/ld+json");
			expect(md).not.toContain("https://schema.org");
		});

		it("prepends clean H1 heading when absent without mutating hash comments inside fenced code blocks", async () => {
			fsMock.readFile.mockResolvedValue(
				"## Overview\n\nIntro paragraph.\n\n```bash\n# keep this shell comment\nbun run build\n```",
			);
			const t = vi.fn((key, options) => {
				if (key === "appName") return "NMS Optimizer";
				if (key === "seo.aboutPageTitle") return "About the Optimization Algorithms";

				return options?.defaultValue ?? key;
			});

			const md = await generateSsgModule.generateAgentMarkdown("en", "about", baseUrl, t);

			expect(md).toContain(
				"---\n\n# About the Optimization Algorithms\n\n## Overview\n\nIntro paragraph.\n\n```bash\n# keep this shell comment\nbun run build\n```",
			);
		});

		it("returns null for missing markdown sources, client-only routes, and Docker-excluded userstats", async () => {
			const t = vi.fn((key, options) => options?.defaultValue ?? key);

			// Client-only performance Routed Dialog must return null even if fs mock has a default value
			expect(
				await generateSsgModule.generateAgentMarkdown("en", "performance", baseUrl, t),
			).toBeNull();

			// Docker build excludes userstats both as a standalone Agent Markdown Document and from navigation
			const prevViteDocker = process.env.VITE_DOCKER;
			process.env.VITE_DOCKER = "true";

			try {
				expect(
					await generateSsgModule.generateAgentMarkdown("en", "userstats", baseUrl, t),
				).toBeNull();
				const aboutDockerMd = await generateSsgModule.generateAgentMarkdown(
					"en",
					"about",
					baseUrl,
					t,
				);
				expect(aboutDockerMd).not.toContain("/userstats/");
			} finally {
				if (prevViteDocker === undefined) {
					delete process.env.VITE_DOCKER;
				} else {
					process.env.VITE_DOCKER = prevViteDocker;
				}
			}

			// Missing markdown file returns null
			fsMock.readFile.mockRejectedValue(new Error("ENOENT"));
			expect(
				await generateSsgModule.generateAgentMarkdown("en", "nonexistent", baseUrl, t),
			).toBeNull();
		});

		it("strips <radix-icon> tags while preserving list indentation, converts [youtube:id] shortcodes to Markdown links, and expands root-relative URLs", async () => {
			fsMock.readFile.mockResolvedValue(
				[
					"# NMS Optimizer Instructions: Modules & Supercharged Slots",
					"",
					"![Hero Screenshot](/assets/img/screenshots/screenshot.webp)",
					"",
					'- Select a **Platform Type** with the <radix-icon name="GearIcon" size="20" color="var(--accent-11)"></radix-icon> button.',
					'    - <radix-icon name="FileIcon" size="20"></radix-icon> **Load** — Open a saved `.nms` **Build File** from disk.',
					'    - Nested inline <radix-icon name="Share1Icon" /> action.',
					"",
					"Visit the [optimizer](/), read the [instructions](/instructions/), jump to [#details](#details), or check [GitHub](https://github.com/jbelew/nms_optimizer-web).",
					"",
					"Keep inline code `[raw](/do-not-expand)` and `[youtube:doNotConvert]` intact.",
					"",
					"[youtube:nGbHf9fQmds]",
				].join("\n"),
			);
			const t = vi.fn((key, options) => {
				if (key === "appName") return "NMS Optimizer";
				if (key === "seo.instructionsPageTitle") return "How to Optimize Your Tech Layout";

				return options?.defaultValue ?? key;
			});

			const md = await generateSsgModule.generateAgentMarkdown(
				"en",
				"instructions",
				baseUrl,
				t,
			);

			expect(md).not.toContain("radix-icon");
			expect(md).toContain("- Select a **Platform Type** with the button.");
			expect(md).toContain("    - **Load** — Open a saved `.nms` **Build File** from disk.");
			expect(md).toContain("    - Nested inline action.");
			expect(md).toContain(
				"![Hero Screenshot](https://nms-optimizer.app/assets/img/screenshots/screenshot.webp)",
			);
			expect(md).toContain(
				"Visit the [optimizer](https://nms-optimizer.app/), read the [instructions](https://nms-optimizer.app/instructions/), jump to [#details](#details), or check [GitHub](https://github.com/jbelew/nms_optimizer-web).",
			);
			expect(md).toContain(
				"Keep inline code `[raw](/do-not-expand)` and `[youtube:doNotConvert]` intact.",
			);
			expect(md).toContain("[YouTube Video](https://www.youtube.com/watch?v=nGbHf9fQmds)");
			expect(md).not.toContain("\n[youtube:nGbHf9fQmds]");
			expect(md).not.toContain("<iframe");
		});

		it("retains localized YAML frontmatter, top heading, and navigation links when markdown body falls back to English", async () => {
			const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

			try {
				fsMock.readFile.mockImplementation(async (filePath) => {
					if (String(filePath).includes("/es/changelog.md")) {
						throw new Error("ENOENT");
					}

					if (String(filePath).includes("/en/changelog.md")) {
						return "# NMS Optimizer Changelog\n\n## Version 8.7\n\n- Added space warnings.\n\n[youtube:nGbHf9fQmds]";
					}

					throw new Error(`Unexpected path: ${filePath}`);
				});

				const tEs = vi.fn((key, options) => {
					const esTranslations = {
						appName: "NMS Optimizer",
						"seo.changelogDescription":
							"Mantente al día con las últimas funciones y mejoras de NMS Optimizer.",
						"seo.changelogPageTitle": "Últimas funciones y actualizaciones",
						"seo.nav.about": "Acerca de",
						"seo.nav.changelog": "Cambios",
						"seo.nav.home": "Inicio",
						"seo.nav.instructions": "Instrucciones",
						"seo.nav.privacy": "Privacidad",
						"seo.nav.title": "Navegación",
						"seo.nav.translation": "Traducir",
						"seo.nav.userstats": "Estadísticas",
						"seo.navDescriptions.changelog":
							"Últimas actualizaciones y nuevas funciones",
						"seo.navDescriptions.home":
							"Usa la calculadora de diseños tecnológicos y bonos de adyacencia",
					};

					return esTranslations[key] ?? options?.defaultValue ?? key;
				});

				const md = await generateSsgModule.generateAgentMarkdown(
					"es",
					"changelog",
					baseUrl,
					tEs,
				);

				expect(md).not.toBeNull();
				expect(md).toContain(
					'title: "Últimas funciones y actualizaciones | NMS Optimizer"\n',
				);
				expect(md).toContain(
					'description: "Mantente al día con las últimas funciones y mejoras de NMS Optimizer."\n',
				);
				expect(md).toContain('url: "https://nms-optimizer.app/es/changelog/"\n');
				expect(md).toContain('lang: "es"\n');
				expect(md).toContain(
					"# Últimas funciones y actualizaciones\n\n## Version 8.7\n\n- Added space warnings.\n\n[YouTube Video](https://www.youtube.com/watch?v=nGbHf9fQmds)",
				);
				expect(md).toContain(
					"## Navegación\n\n- [Inicio](https://nms-optimizer.app/es/) - Usa la calculadora de diseños tecnológicos y bonos de adyacencia",
				);
				expect(md).toContain(
					"- [Cambios](https://nms-optimizer.app/es/changelog/) - Últimas actualizaciones y nuevas funciones",
				);
			} finally {
				infoSpy.mockRestore();
			}
		});
	});

	describe("generateSsg", () => {
		it("writes standalone index.md Agent Markdown Documents alongside index.html for all 42 public routes and respects Docker userstats exclusion", async () => {
			const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			try {
				fsMock.readFile.mockImplementation(async (filePath) => {
					const pathStr = String(filePath);

					if (pathStr.endsWith("index.html")) {
						return '<!doctype html><html lang="en"><head><title>App</title></head><body><div id="root"></div></body></html>';
					}

					return "# Source Heading\n\nBody prose.";
				});

				await generateSsgModule.generateSsg();

				const writtenPaths = fsMock.writeFile.mock.calls.map(([targetPath]) =>
					String(targetPath),
				);
				const htmlWrites = writtenPaths.filter((p) => p.endsWith("/index.html"));
				const mdWrites = writtenPaths.filter((p) => p.endsWith("/index.md"));

				expect(htmlWrites).toHaveLength(42);
				expect(mdWrites).toHaveLength(42);
				expect(mdWrites.some((p) => p.endsWith("/dist/index.md"))).toBe(true);
				expect(mdWrites.some((p) => p.endsWith("/dist/es/instructions/index.md"))).toBe(
					true,
				);
				expect(mdWrites.some((p) => p.endsWith("/dist/userstats/index.md"))).toBe(true);

				// Verify Docker build exclusion for userstats
				vi.clearAllMocks();
				const prevViteDocker = process.env.VITE_DOCKER;
				process.env.VITE_DOCKER = "true";

				try {
					await generateSsgModule.generateSsg();
				} finally {
					if (prevViteDocker === undefined) {
						delete process.env.VITE_DOCKER;
					} else {
						process.env.VITE_DOCKER = prevViteDocker;
					}
				}

				const dockerWrittenPaths = fsMock.writeFile.mock.calls.map(([targetPath]) =>
					String(targetPath),
				);
				const dockerMdWrites = dockerWrittenPaths.filter((p) => p.endsWith("/index.md"));
				expect(dockerMdWrites).toHaveLength(36);
				expect(dockerWrittenPaths.some((p) => p.includes("/userstats/"))).toBe(false);
			} finally {
				logSpy.mockRestore();
			}
		});
	});

	describe("static CDN configuration & discoverability artifacts", () => {
		const parseStaticHeaderRules = () => {
			const headersContent = fs.readFileSync(path.resolve("public/_headers"), "utf-8");
			const rules = new Map();
			let currentRule = null;

			for (const rawLine of headersContent.split("\n")) {
				const trimmed = rawLine.trim();

				if (!trimmed || trimmed.startsWith("#")) {
					continue;
				}

				if (!rawLine.startsWith(" ") && !rawLine.startsWith("\t")) {
					currentRule = trimmed;
					rules.set(currentRule, []);
				} else if (currentRule) {
					rules.get(currentRule).push(trimmed);
				}
			}

			return rules;
		};

		it("configures /*.md static headers (with detached Cache-Control), _routes.json exclusion, and canonical llms.txt Agent Markdown Document links", () => {
			const rules = parseStaticHeaderRules();
			const mdDirectives = rules.get("/*.md") ?? [];
			const detachIdx = mdDirectives.indexOf("! Cache-Control");
			const cacheControlIdx = mdDirectives.indexOf(
				"Cache-Control: no-cache, must-revalidate, max-age=0",
			);

			expect(detachIdx).toBeGreaterThanOrEqual(0);
			expect(cacheControlIdx).toBeGreaterThan(detachIdx);
			expect(mdDirectives).toContain("Content-Type: text/markdown; charset=utf-8");
			expect(mdDirectives).toContain("Content-Signal: ai-train=no, search=yes, ai-input=no");

			for (const [rulePath, directives] of rules.entries()) {
				if (rulePath === "/*.md") {
					continue;
				}

				expect(
					directives.some((directive) =>
						directive.toLowerCase().startsWith("content-signal:"),
					),
				).toBe(false);
			}

			const routesConfig = JSON.parse(
				fs.readFileSync(path.resolve("public/_routes.json"), "utf-8"),
			);
			expect(routesConfig.exclude).toContain("/*.md");

			const llmsTxt = fs.readFileSync(path.resolve("public/llms.txt"), "utf-8");
			expect(llmsTxt).toContain("https://nms-optimizer.app/index.md");
			expect(llmsTxt).toContain("https://nms-optimizer.app/instructions/index.md");
			expect(llmsTxt).toContain("https://nms-optimizer.app/about/index.md");
			expect(llmsTxt).toContain("https://nms-optimizer.app/changelog/index.md");
			expect(llmsTxt).toContain("https://nms-optimizer.app/userstats/index.md");
			expect(llmsTxt).toContain("https://nms-optimizer.app/translation/index.md");
			expect(llmsTxt).toContain("https://nms-optimizer.app/privacy/index.md");
			expect(llmsTxt).not.toContain("/assets/locales/");
			expect(llmsTxt).toContain("Accept: text/markdown");

			for (const locale of ["en", "es", "fr", "de", "pt", "it"]) {
				expect(llmsTxt).toMatch(new RegExp(`\\b${locale}\\b`));
			}
		});

		it("declares search-only Content-Signal preferences across every RFC 9309 User-agent group in robots.txt aligned with /*.md static headers", () => {
			const rules = parseStaticHeaderRules();
			const mdContentSignalLine = (rules.get("/*.md") ?? []).find((line) =>
				line.toLowerCase().startsWith("content-signal:"),
			);

			expect(mdContentSignalLine).toBe(
				"Content-Signal: ai-train=no, search=yes, ai-input=no",
			);

			const expectedContentSignal = mdContentSignalLine
				?.slice("Content-Signal:".length)
				.trim();
			const robotsContent = fs.readFileSync(path.resolve("public/robots.txt"), "utf-8");
			const groups = [];
			const sitemaps = [];
			const ungroupedDirectives = [];
			let currentGroup = null;

			for (const rawLine of robotsContent.split(/\r?\n/)) {
				const cleanLine = rawLine.replace(/#.*$/, "").trim();

				if (!cleanLine) {
					continue;
				}

				const colonIdx = cleanLine.indexOf(":");
				expect(colonIdx).toBeGreaterThan(0);

				const field = cleanLine.slice(0, colonIdx).trim().toLowerCase();
				const value = cleanLine.slice(colonIdx + 1).trim();

				if (field === "user-agent") {
					if (!currentGroup || currentGroup.directives.length > 0) {
						currentGroup = { directives: [], userAgents: [value] };
						groups.push(currentGroup);
					} else {
						currentGroup.userAgents.push(value);
					}

					continue;
				}

				if (field === "sitemap") {
					sitemaps.push(value);
					continue;
				}

				if (!currentGroup) {
					ungroupedDirectives.push({ field, value });
					continue;
				}

				currentGroup.directives.push({ field, value });
			}

			expect(ungroupedDirectives).toEqual([]);
			expect(sitemaps).toEqual(["https://nms-optimizer.app/sitemap.xml"]);
			expect(groups.map((group) => group.userAgents)).toEqual([
				["*"],
				["Googlebot"],
				["Bingbot"],
				["GPTBot"],
				["ChatGPT-User"],
				["PerplexityBot"],
				["ClaudeBot"],
				["anthropic-ai"],
			]);

			for (const group of groups) {
				const contentSignals = group.directives
					.filter((directive) => directive.field === "content-signal")
					.map((directive) => directive.value);
				const allows = group.directives
					.filter((directive) => directive.field === "allow")
					.map((directive) => directive.value);
				const disallows = group.directives
					.filter((directive) => directive.field === "disallow")
					.map((directive) => directive.value);

				expect(contentSignals).toEqual(["ai-train=no, search=yes, ai-input=no"]);
				expect(contentSignals[0]).toBe(expectedContentSignal);
				expect(allows).toEqual(["/"]);
				expect(disallows).toEqual([
					"/performance",
					"/performance/",
					"/*/performance",
					"/*/performance/",
				]);
			}

			const wildcardCrawlDelay = groups[0].directives
				.filter((directive) => directive.field === "crawl-delay")
				.map((directive) => directive.value);

			expect(wildcardCrawlDelay).toEqual(["1"]);
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
