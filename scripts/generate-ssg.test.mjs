import { describe, it, expect, vi, beforeEach, mock } from "bun:test";

// Mock node:fs/promises globally with implementations
const fsMock = {
    readFile: vi.fn().mockResolvedValue("# Content"),
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
};

mock.module("node:fs/promises", () => ({
    ...fsMock,
    default: fsMock
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
        it("extracts styles and header from source HTML", async () => {
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
            const { ssgStyles, ssgHeader } = await generateSsgModule.extractSsgTemplate(sourceHtml);
            expect(ssgStyles).toContain(".test { color: red; }");
            expect(ssgStyles).toContain("body { background: black; }");
            expect(ssgHeader).toBe('<header class="app-header-static">Header Content</header>');
        });

        it("returns empty strings if template not found", async () => {
            const { ssgStyles, ssgHeader } = await generateSsgModule.extractSsgTemplate("<html></html>");
            expect(ssgStyles).toBe("");
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
                "appName": "NMS Optimizer",
                "seo.mainPageTitle": "Home Title",
                "seo.appDescription": "App Description",
                "seo.nav.home": "Home Nav",
                "appHeader.subTitle": "Localized Header <1>ML/RUST</1>"
            };

            return translations[key] || options?.defaultValue || key;
        });

        it("correctly replaces the language attribute", async () => {
            const result = await generateSsgModule.generatePage(indexHtml, "es", "", baseUrl, mdProcessor, t);
            expect(result).toContain('<html lang="es"');
        });

        it("updates metadata for the root page", async () => {
            const result = await generateSsgModule.generatePage(indexHtml, "en", "", baseUrl, mdProcessor, t);
            expect(result).toContain("<title>Home Title</title>");
            expect(result).toContain('<meta name="description" content="App Description"');
        });

        it("injects SEO tags", async () => {
            const result = await generateSsgModule.generatePage(indexHtml, "en", "", baseUrl, mdProcessor, t);
            expect(result).toContain('<link rel="canonical" href="https://nms-optimizer.app/"');
        });

        it("injects markdown content into noscript block", async () => {
            const result = await generateSsgModule.generatePage(indexHtml, "en", "", baseUrl, mdProcessor, t);
            expect(result).toContain("<noscript>");
            expect(result).toContain("<main>");
        });

        it("strips existing noscript blocks", async () => {
            const indexWithNoscript = indexHtml.replace('</body>', '<noscript>Old content</noscript></body>');
            const result = await generateSsgModule.generatePage(indexWithNoscript, "en", "", baseUrl, mdProcessor, t);
            expect(result).not.toContain("Old content");
            expect(result).toContain("<noscript>");
        });

        it("injects content after root div", async () => {
            const result = await generateSsgModule.generatePage(indexHtml, "en", "", baseUrl, mdProcessor, t, "", "");
            expect(result).toContain('<div id="root"></div><noscript>');
        });
    });
});
