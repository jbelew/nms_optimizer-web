import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
    generateSeoTags, 
    generateNavigationLinks, 
    PAGE_TO_MARKDOWN_MAPPING,
    readMarkdownFile,
    generatePage,
    extractSsgTemplate
} from "./generate-ssg.mjs";

// Hoisted mock
vi.mock("fs", async (importOriginal) => {
    const actual = await importOriginal();

    return {
        ...actual,
        default: {
            ...actual.default,
            existsSync: vi.fn(),
            readFileSync: vi.fn(),
            mkdirSync: vi.fn(),
            writeFileSync: vi.fn(),
        }
    };
});

describe("generate-ssg.mjs", () => {
    describe("extractSsgTemplate", () => {
        it("extracts styles and header from source HTML", () => {
            const sourceHtml = `
                <html>
                <body>
                <noscript data-ssg-template>
                    <main>
                        <header class="app-header-static">Header Content</header>
                    </main>
                    <style>
                        .test { color: red; }
                        body { background: black; }
                    </style>
                </noscript>
                </body>
                </html>
            `;
            const { ssgStyles, ssgHeader } = extractSsgTemplate(sourceHtml);
            expect(ssgStyles).toContain(".test { color: red; }");
            expect(ssgStyles).toContain("body { background: black; }");
            expect(ssgHeader).toBe('<header class="app-header-static">Header Content</header>');
        });

        it("returns empty strings if template not found", () => {
            const { ssgStyles, ssgHeader } = extractSsgTemplate("<html></html>");
            expect(ssgStyles).toBe("");
            expect(ssgHeader).toBe("");
        });

        it("handles attribute variations (like those from JSDOM)", () => {
            const sourceHtml = '<noscript data-ssg-template=""><style>.test{}</style></noscript>';
            const { ssgStyles } = extractSsgTemplate(sourceHtml);
            expect(ssgStyles).toBe(".test{}");
        });
    });

    describe("initI18n", () => {
        it("initializes i18next instance", async () => {
            const { initI18n } = await import("./generate-ssg.mjs");
            const i18n = await initI18n();
            expect(i18n).toBeDefined();
            expect(typeof i18n.getFixedT).toBe("function");
        });
    });

    describe("generateSeoTags", () => {
        const baseUrl = "https://nms-optimizer.app";

        it("generates tags for the root path in English", () => {
            const tags = generateSeoTags("/", "en", baseUrl);
            
            expect(tags).toContain('<link rel="canonical" href="https://nms-optimizer.app/" />');
            expect(tags).toContain('<meta property="og:url" content="https://nms-optimizer.app/" />');
            expect(tags).toContain('<link rel="alternate" hreflang="en" href="https://nms-optimizer.app/" />');
            expect(tags).toContain('<link rel="alternate" hreflang="es" href="https://nms-optimizer.app/es/" />');
            expect(tags).toContain('<link rel="alternate" hreflang="x-default" href="https://nms-optimizer.app/" />');
        });

        it("generates tags for a subpage in Spanish", () => {
            const tags = generateSeoTags("/about/", "es", baseUrl);
            
            expect(tags).toContain('<link rel="canonical" href="https://nms-optimizer.app/es/about/" />');
            expect(tags).toContain('<link rel="alternate" hreflang="en" href="https://nms-optimizer.app/about/" />');
            expect(tags).toContain('<link rel="alternate" hreflang="es" href="https://nms-optimizer.app/es/about/" />');
        });
    });

    describe("generateNavigationLinks", () => {
        const t = vi.fn((key) => key);

        it("generates links with correct prefixes for English", () => {
            const html = generateNavigationLinks("en", "about", t);
            expect(html).toContain('href="/about/"');
            expect(html).toContain('href="/"');
        });

        it("generates links with correct prefixes for other languages", () => {
            const html = generateNavigationLinks("es", "about", t);
            expect(html).toContain('href="/es/about/"');
            expect(html).toContain('href="/es"');
        });

        it("marks the current page as active", () => {
            const html = generateNavigationLinks("en", "about", t);
            expect(html).toContain('<li aria-current="page"><a href="/about/">');
        });
    });

    describe("PAGE_TO_MARKDOWN_MAPPING", () => {
        it("contains correct mappings", () => {
            expect(PAGE_TO_MARKDOWN_MAPPING["translation"]).toBe("translation-request");
            expect(PAGE_TO_MARKDOWN_MAPPING[""]).toBe("home");
        });
    });

    describe("readMarkdownFile", () => {
        it("returns content if file exists", async () => {
            const fs = await import("fs");
            fs.default.existsSync.mockReturnValue(true);
            fs.default.readFileSync.mockReturnValue("# Markdown Content");

            const content = readMarkdownFile("en", "home");
            expect(content).toBe("# Markdown Content");
        });

        it("returns null if file does not exist", async () => {
            const fs = await import("fs");
            fs.default.existsSync.mockReturnValue(false);

            const content = readMarkdownFile("en", "non-existent");
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
    <meta property="og:title" content="Original OG Title" />
    <meta property="og:description" content="Original OG Description" />
    <meta property="og:image:alt" content="Original Image Alt" />
    <meta name="twitter:title" content="Original Twitter Title" />
    <meta name="twitter:description" content="Original Twitter Description" />
    <meta name="twitter:image:alt" content="Original Twitter Alt" />
</head>
<body>
    <div id="root"></div>
</body>
</html>`;
        const baseUrl = "https://nms-optimizer.app";
        const mdProcessor = vi.fn((md) => {
            if (md.startsWith("# ")) {
                const title = md.slice(2);
                const slug = title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

                return `<h1 id="section-${slug}">${title}</h1>`;
            }

            return `<div>${md}</div>`;
        });
        const t = vi.fn((key, options) => {
            // Simulate i18next: if it doesn't find the key in the loaded namespaces, it returns the key.
            const translations = {
                "appName": "NMS Optimizer",
                "seo.mainPageTitle": "Home Title",
                "seo.appDescription": "App Description",
                "faq.name": "FAQ Name",
                "faq.questions.adjacencyBonus.name": "Adjacency Question",
                "faq.questions.adjacencyBonus.answer": "Adjacency Answer",
                "seo.nav.home": "Home Nav",
                "appHeader.subTitle": "Localized Header <1>ML/RUST</1>"
            };

            return translations[key] || options?.defaultValue || key;
        });

        beforeEach(async () => {
            vi.clearAllMocks();
            const fs = await import("fs");
            fs.default.existsSync.mockReturnValue(true);
            fs.default.readFileSync.mockReturnValue("# Content");
        });

        it("correctly replaces the language attribute", () => {
            const result = generatePage(indexHtml, "es", "", baseUrl, mdProcessor, t);
            expect(result).toContain('<html lang="es"');
        });

        it("updates metadata for the root page", () => {
            const result = generatePage(indexHtml, "en", "", baseUrl, mdProcessor, t);
            expect(result).toContain("<title>Home Title</title>");
            // JSDOM might not include the trailing slash for meta tags in its serialization
            expect(result).toMatch(/<meta name="description" content="App Description"\/?>/);
        });

        it("injects SEO tags", () => {
            const result = generatePage(indexHtml, "en", "", baseUrl, mdProcessor, t);
            expect(result).toMatch(/<link rel="canonical" href="https:\/\/nms-optimizer\.app\/"\/?>/);
            expect(result).toMatch(/<link rel="alternate" hreflang="es" href="https:\/\/nms-optimizer\.app\/es\/"\/?>/);
        });

        it("injects markdown content into noscript block with localized header", () => {
            const result = generatePage(indexHtml, "en", "", baseUrl, mdProcessor, t);
            expect(result).toContain("<noscript>");
            expect(result).toContain('<h2 class="app-header-static__title">Localized Header <span style="color: #4ccce6">ML/RUST</span></h2>');
            expect(result).toContain("<main>");
            expect(result).toContain("</noscript>");
        });

        it("injects ssgStyles into the noscript block", () => {
            const ssgStyles = ".test-css { color: red; }";
            const result = generatePage(indexHtml, "en", "", baseUrl, mdProcessor, t, ssgStyles);
            expect(result).toContain(".test-css { color: red; }");
        });

        it("injects correct localized JSON-LD schema", () => {
            const result = generatePage(indexHtml, "es", "", baseUrl, mdProcessor, t);
            expect(result).toContain('"@id":"https://nms-optimizer.app/es/#software"');
            expect(result).toContain('"url":"https://nms-optimizer.app/es/"');
        });

        it("handles pages without specific metadata (fixed title behavior)", () => {
            const result = generatePage(indexHtml, "en", "unknown", baseUrl, mdProcessor, t);
            // Now <title> IS updated to appName even if metadata lookup fails
            expect(result).toContain("<title>NMS Optimizer</title>");
            // Should contain real H1 tag, not encoded
            expect(result).toContain("<h1>NMS Optimizer</h1>");
        });

        it("strips existing noscript blocks before injecting new one", () => {
            const indexWithNoscript = indexHtml.replace('</body>', '<noscript>Old content</noscript></body>');
            const result = generatePage(indexWithNoscript, "en", "", baseUrl, mdProcessor, t);
            expect(result).not.toContain("Old content");
            expect(result).toContain("<noscript>");
        });

        it("cleans up old SEO tags and JSON-LD", () => {
            const indexWithOldTags = indexHtml.replace('</head>', 
                '<link rel="canonical" href="old" /><meta property="og:url" content="old" /><script type="application/ld+json">{}</script></head>');
            const result = generatePage(indexWithOldTags, "en", "", baseUrl, mdProcessor, t);
            expect(result).not.toContain('href="old"');
            expect(result).not.toContain('content="old"');
            // Check that new tags were injected
            expect(result).toContain('https://nms-optimizer.app/');
        });

        it("injects root div if missing", () => {
            const indexNoRoot = '<html><body></body></html>';
            const result = generatePage(indexNoRoot, "en", "", baseUrl, mdProcessor, t, "", "");
            expect(result).toContain('<div id="root"></div>');
        });

        it("handles metadata with different attribute order (should now correctly replace)", () => {
            const indexMixedOrder = `<html><head>
                <meta content="Old Description" name="description" />
                <title>Old</title>
            </head></html>`;
            const result = generatePage(indexMixedOrder, "en", "", baseUrl, mdProcessor, t);
            
            // JSDOM preserves the order if it finds the element, or uses its own order if it creates it.
            // Our refactored updateMetadata uses querySelector to find and update existing ones.
            expect(result).toMatch(/<meta content="App Description" name="description"\/?>/);
            expect(result).not.toContain("Old Description");
        });
    });
});
